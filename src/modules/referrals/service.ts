import crypto from 'crypto';
import type { PoolConnection } from 'mysql2/promise';
import { z } from 'zod';
import { pool } from '../../lib/mysql';

export const referralSettingsSchema = z.object({
  enabled: z.boolean(),
  referrerReward: z.number().finite().min(0).max(10000).multipleOf(0.01),
  friendReward: z.number().finite().min(0).max(10000).multipleOf(0.01),
  minimumFirstOrder: z.number().finite().min(0).max(100000).multipleOf(0.01),
  minimumRedemptionOrder: z.number().finite().min(0).max(100000).multipleOf(0.01),
  rewardValidityDays: z.number().int().min(1).max(365),
  shareUrl: z.string().trim().max(500).refine(value => !value || /^https:\/\//.test(value), 'Use an HTTPS app download URL.'),
}).superRefine((value, context) => {
  if (value.enabled && (value.referrerReward <= 0 || value.minimumFirstOrder <= 0 ||
      value.minimumRedemptionOrder <= Math.max(value.referrerReward, value.friendReward))) {
    context.addIssue({ code: 'custom', message: 'Set a positive inviter reward and first-order minimum. Redemption minimum must exceed both reward amounts.' });
  }
});
export type ReferralSettings = z.infer<typeof referralSettingsSchema>;
const decode = (value: any) => typeof value === 'string' ? JSON.parse(value) : value;
const paise = (value: number) => Math.round(value * 100);
const code = (prefix: string) => prefix + crypto.randomBytes(8).toString('hex').toUpperCase();

function database() {
  if (!pool) throw new Error('Referral service is unavailable. Please try later.');
  return pool;
}

export async function getReferralSettings(): Promise<ReferralSettings | null> {
  const [rows]: any = await database().query('SELECT settings FROM referral_settings WHERE id = 1');
  return rows[0] ? referralSettingsSchema.parse(decode(rows[0].settings)) : null;
}

export async function saveReferralSettings(settings: ReferralSettings) {
  const connection = await database().getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('INSERT INTO referral_settings (id, settings, updated_at) VALUES (1, ?, UTC_TIMESTAMP(3)) ON DUPLICATE KEY UPDATE settings = VALUES(settings), updated_at = VALUES(updated_at)', [JSON.stringify(settings)]);
    await connection.query('INSERT INTO referral_settings_audit (id, settings, created_at) VALUES (?, ?, UTC_TIMESTAMP(3))', [crypto.randomUUID(), JSON.stringify(settings)]);
    await connection.commit();
    return settings;
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
}

export async function applyReferral(customerId: string, inviteCode: string) {
  const connection = await database().getConnection();
  try {
    await connection.beginTransaction();
    // Order creation takes this same customer lock, preventing registration after an order.
    const [customers]: any = await connection.query('SELECT id, phone FROM customers WHERE id = ? FOR UPDATE', [customerId]);
    if (!customers[0]) throw new Error('Please sign in with a registered customer account.');
    const [settingRows]: any = await connection.query('SELECT settings FROM referral_settings WHERE id = 1');
    const settings = settingRows[0] ? referralSettingsSchema.parse(decode(settingRows[0].settings)) : null;
    if (!settings?.enabled) throw new Error('The referral program is not currently accepting invites.');
    const [owners]: any = await connection.query('SELECT rc.customer_id, c.phone FROM referral_codes rc JOIN customers c ON c.id = rc.customer_id WHERE rc.code = ?', [inviteCode]);
    if (!owners[0]) throw new Error('That invite code was not found.');
    const digits = (phone: string) => String(phone).replace(/\D/g, '').slice(-10);
    if (owners[0].customer_id === customerId || digits(owners[0].phone) === digits(customers[0].phone)) throw new Error('You cannot use your own referral code.');
    const [existing]: any = await connection.query('SELECT id FROM referrals WHERE invitee_id = ?', [customerId]);
    if (existing.length) throw new Error('An invite code has already been applied to your account.');
    const [orders]: any = await connection.query('SELECT id FROM orders WHERE customer_id = ? LIMIT 1', [customerId]);
    if (orders.length) throw new Error('Apply an invite code before placing your first order.');
    await connection.query('INSERT INTO referrals (id, referrer_id, invitee_id, code, status, terms, created_at) VALUES (?, ?, ?, ?, ?, ?, UTC_TIMESTAMP(3))',
      [crypto.randomUUID(), owners[0].customer_id, customerId, inviteCode, 'PENDING', JSON.stringify(settings)]);
    await connection.commit();
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
}

export async function reconcileReferrals() {
  const db = database();
  // Restores coupons from cancelled/failed orders, including after an app restart.
  await db.query(`UPDATE referral_rewards r JOIN orders o ON o.id = r.used_order_id
    SET r.status = 'AVAILABLE', r.used_order_id = NULL
    WHERE r.status = 'RESERVED' AND o.payment_status <> 'PAID'
      AND (o.current_status = 'CANCELLED' OR o.payment_status = 'FAILED')`);
  await db.query(`UPDATE referral_rewards r JOIN orders o ON o.id = r.used_order_id
    SET r.status = 'REDEEMED' WHERE r.status = 'RESERVED' AND o.payment_status = 'PAID'`);
  await db.query(`UPDATE referrals f JOIN orders o ON o.id = f.qualifying_order_id
    SET f.status = 'REVERSED', f.reason = 'Qualifying order cancelled or refunded'
    WHERE f.status = 'QUALIFIED' AND (o.current_status = 'CANCELLED' OR o.payment_status = 'REFUNDED')`);
  await db.query(`UPDATE referral_rewards r JOIN referrals f ON f.id = r.referral_id
    SET r.status = 'VOID' WHERE f.status = 'REVERSED' AND r.status = 'AVAILABLE'`);
  const [pending]: any = await db.query(`SELECT DISTINCT f.id, f.created_at FROM referrals f
    JOIN orders o ON o.customer_id = f.invitee_id
    WHERE f.status = 'PENDING' AND o.payment_status = 'PAID' AND o.current_status IN ('DELIVERED', 'COMPLETED')
    ORDER BY f.created_at`);
  for (const candidate of pending) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const [rows]: any = await connection.query('SELECT * FROM referrals WHERE id = ? FOR UPDATE', [candidate.id]);
      const referral = rows[0];
      if (!referral || referral.status !== 'PENDING') { await connection.commit(); continue; }
      const [orders]: any = await connection.query(`SELECT * FROM orders WHERE customer_id = ? AND current_status <> 'CANCELLED'
        ORDER BY created_at, id LIMIT 1`, [referral.invitee_id]);
      const order = orders[0];
      if (!order || !['DELIVERED', 'COMPLETED'].includes(order.current_status) || order.payment_status !== 'PAID') {
        await connection.commit(); continue;
      }
      const terms = referralSettingsSchema.parse(decode(referral.terms));
      if (paise(Number(order.total_amount)) < paise(terms.minimumFirstOrder)) {
        await connection.query("UPDATE referrals SET status = 'INELIGIBLE', reason = 'First order was below the agreed minimum' WHERE id = ?", [referral.id]);
        await connection.commit(); continue;
      }
      for (const [customerId, amount] of [[referral.referrer_id, terms.referrerReward], [referral.invitee_id, terms.friendReward]] as [string, number][]) {
        if (amount <= 0) continue;
        await connection.query(`INSERT INTO referral_rewards (id, referral_id, customer_id, code, amount_paise, min_order_paise, status, expires_at, created_at)
          VALUES (?, ?, ?, ?, ?, ?, 'AVAILABLE', DATE_ADD(UTC_TIMESTAMP(3), INTERVAL ? DAY), UTC_TIMESTAMP(3))`,
          [crypto.randomUUID(), referral.id, customerId, code('RWD'), paise(amount), paise(terms.minimumRedemptionOrder), terms.rewardValidityDays]);
      }
      await connection.query("UPDATE referrals SET status = 'QUALIFIED', qualifying_order_id = ?, qualified_at = UTC_TIMESTAMP(3) WHERE id = ?", [order.id, referral.id]);
      await connection.commit();
    } catch (error) { await connection.rollback(); throw error; }
    finally { connection.release(); }
  }
}

import { creditWallet } from '../wallet/service';

function maskPhone(phone?: string | null): string {
  if (!phone) return '+91 **********';
  const clean = String(phone).replace(/\D/g, '').slice(-10);
  if (clean.length < 10) return '+91 **********';
  return `+91 ${clean.slice(0, 3)}****${clean.slice(-3)}`;
}

export async function getOrCreateCustomerReferralCode(customerId: string): Promise<string> {
  const db = database();
  const [rows]: any = await db.query('SELECT code FROM referral_codes WHERE customer_id = ?', [customerId]);
  if (rows[0]?.code) return rows[0].code;

  const newCode = 'LF' + crypto.randomBytes(3).toString('hex').toUpperCase();
  await db.query(
    'INSERT INTO referral_codes (customer_id, code, created_at) VALUES (?, ?, UTC_TIMESTAMP(3)) ON DUPLICATE KEY UPDATE customer_id = customer_id',
    [customerId, newCode]
  );
  return newCode;
}

export async function rewardReferralOnRegistration(inviteeId: string, rawCode: string) {
  const inviteCode = String(rawCode || '').trim().toUpperCase();
  if (!inviteCode || !inviteIdRegex(inviteCode)) return null;

  const db = database();
  try {
    // 1. Find referrer
    const [owners]: any = await db.query(
      'SELECT rc.customer_id, c.name, c.phone FROM referral_codes rc JOIN customers c ON c.id = rc.customer_id WHERE rc.code = ?',
      [inviteCode]
    );
    if (!owners[0]) return null;

    const referrerId = owners[0].customer_id;
    if (referrerId === inviteeId) return null;

    // 2. Prevent duplicate referral on same customer
    const [existing]: any = await db.query('SELECT id FROM referrals WHERE invitee_id = ?', [inviteeId]);
    if (existing.length) return null;

    // 3. Fetch invitee details
    const [invitees]: any = await db.query('SELECT name, phone FROM customers WHERE id = ?', [inviteeId]);
    const invitee = invitees[0];
    const masked = maskPhone(invitee?.phone);

    // 4. Credit ₹100 to Referrer's Wallet
    await creditWallet(
      referrerId,
      100,
      'REFERRAL_REWARD',
      `Referral bonus: Friend (${masked}) registered with your invite code ${inviteCode}!`,
      inviteeId
    );

    // 5. Credit ₹50 Welcome Bonus to Invitee's Wallet
    await creditWallet(
      inviteeId,
      50,
      'WELCOME_BONUS',
      `Welcome bonus for joining LaundryFresh with invite code ${inviteCode}!`,
      referrerId
    );

    // 6. Record completed referral
    const referralId = crypto.randomUUID();
    await db.query(
      `INSERT INTO referrals (id, referrer_id, invitee_id, code, status, terms, reason, created_at, qualified_at)
       VALUES (?, ?, ?, ?, 'QUALIFIED', ?, 'Registered with referral code', UTC_TIMESTAMP(3), UTC_TIMESTAMP(3))`,
      [referralId, referrerId, inviteeId, inviteCode, JSON.stringify({ referrerReward: 100, friendReward: 50 })]
    );

    console.log(`[Referrals] Rewarded ₹100 to ${referrerId} and ₹50 to ${inviteeId} via code ${inviteCode}`);
    return { success: true, referrerId, inviteeId };
  } catch (err) {
    console.error('[Referrals] Error rewarding referral on registration:', err);
    return null;
  }
}

function inviteIdRegex(code: string): boolean {
  return /^[A-Z0-9]{4,24}$/i.test(code);
}

export async function getReferralSummary(customerId: string) {
  const db = database();
  const [customers]: any = await db.query('SELECT id FROM customers WHERE id = ?', [customerId]);
  if (!customers.length) throw new Error('Customer account not found.');

  const personalCode = await getOrCreateCustomerReferralCode(customerId);

  // Fetch friends who registered under this customer's code
  const [friends]: any = await db.query(
    `SELECT f.id, f.code, f.status, f.created_at AS createdAt,
            c.name AS friendName, c.phone AS friendPhone
     FROM referrals f
     JOIN customers c ON c.id = f.invitee_id
     WHERE f.referrer_id = ?
     ORDER BY f.created_at DESC`,
    [customerId]
  );

  const referralCount = friends.length;
  const totalEarned = referralCount * 100;

  const friendsList = friends.map((f: any) => ({
    id: f.id,
    name: f.friendName && f.friendName !== 'LaundryFresh Customer' ? f.friendName : 'Registered Friend',
    phoneMasked: maskPhone(f.friendPhone),
    createdAt: typeof f.createdAt === 'string' ? f.createdAt : new Date(f.createdAt).toISOString(),
    bonusAwarded: 100,
    status: '₹100 Added to Wallet',
  }));

  return {
    code: personalCode,
    rewardAmount: 100,
    friendBonus: 50,
    stats: {
      invited: referralCount,
      qualified: referralCount,
      totalEarned,
    },
    friends: friendsList,
    history: friendsList,
    shareMessage: `Use my invite code ${personalCode} on LaundryFresh to get ₹50 welcome cash in your wallet for premium laundry & dry cleaning! Download now.`,
  };
}

export async function referralRewardDiscount(customerId: string, rewardCode: string, itemTotal: number, connection?: PoolConnection, orderId?: string) {
  const db = connection || database();
  const [rows]: any = await db.query(`SELECT r.*, f.status AS referral_status, r.expires_at > UTC_TIMESTAMP(3) AS unexpired,
    o.payment_status AS qualifying_payment_status, o.current_status AS qualifying_order_status
    FROM referral_rewards r JOIN referrals f ON f.id = r.referral_id
    JOIN orders o ON o.id = f.qualifying_order_id
    WHERE r.code = ? AND r.customer_id = ? ${connection ? 'FOR UPDATE' : ''}`, [rewardCode, customerId]);
  const reward = rows[0];
  if (!reward || reward.status !== 'AVAILABLE' || reward.referral_status !== 'QUALIFIED' || !reward.unexpired ||
      reward.qualifying_payment_status !== 'PAID' || !['DELIVERED', 'COMPLETED'].includes(reward.qualifying_order_status)) {
    throw new Error('This reward is unavailable, expired, already used, or belongs to another account.');
  }
  if (!Number.isFinite(itemTotal) || paise(itemTotal) < Number(reward.min_order_paise) || paise(itemTotal) <= Number(reward.amount_paise)) {
    throw new Error(`Reward requires an item subtotal of INR ${Number(reward.min_order_paise) / 100}.`);
  }
  if (connection && orderId) {
    await connection.query("UPDATE referral_rewards SET status = 'RESERVED', used_order_id = ? WHERE id = ?", [orderId, reward.id]);
  }
  return { couponCode: reward.code as string, discountAmount: Number(reward.amount_paise) / 100 };
}

export async function getAdminReferrals() {
  await reconcileReferrals();
  const [referrals]: any = await database().query(`SELECT f.id, f.code, f.status, f.reason, f.created_at AS createdAt,
    f.qualifying_order_id AS orderId, a.name AS referrerName, a.phone AS referrerPhone,
    b.name AS friendName, b.phone AS friendPhone FROM referrals f
    LEFT JOIN customers a ON a.id = f.referrer_id LEFT JOIN customers b ON b.id = f.invitee_id ORDER BY f.created_at DESC`);
  const [rewards]: any = await database().query(`SELECT r.id, r.code, r.amount_paise / 100 AS amount,
    CASE WHEN r.status = 'AVAILABLE' AND r.expires_at <= UTC_TIMESTAMP(3) THEN 'EXPIRED' ELSE r.status END AS status,
    r.expires_at AS expiresAt, r.used_order_id AS orderId, c.name AS customerName, c.phone AS customerPhone,
    f.status AS referralStatus FROM referral_rewards r LEFT JOIN customers c ON c.id = r.customer_id
    JOIN referrals f ON f.id = r.referral_id ORDER BY r.created_at DESC`);
  return { settings: await getReferralSettings(), referrals, rewards: rewards.map((reward: any) => ({ ...reward, amount: Number(reward.amount) })) };
}
