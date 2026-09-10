import crypto from 'crypto';
import type { PoolConnection } from 'mysql2/promise';
import Razorpay from 'razorpay';
import { pool } from '../../lib/mysql';

export interface WalletTransactionRecord {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  category: 'WELCOME_BONUS' | 'REFERRAL_REWARD' | 'TOPUP_RAZORPAY' | 'ORDER_PAYMENT' | 'DISPUTE_REFUND' | 'CASH_RECHARGE';
  amount: number;
  balanceAfter: number;
  referenceId?: string | null;
  description: string;
  createdAt: string;
}

export interface WalletData {
  customerId: string;
  balance: number;
  rewardPoints: number;
  transactions: WalletTransactionRecord[];
}

function database() {
  if (!pool) throw new Error('Database pool is not ready.');
  return pool;
}

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!keyId || !keySecret || keySecret.includes('your_razorpay_secret')) {
    return null;
  }
  return {
    keyId,
    keySecret,
    client: new Razorpay({ key_id: keyId, key_secret: keySecret }),
  };
}

export async function getOrCreateWallet(customerId: string, conn?: PoolConnection) {
  const db = conn || database();
  const [rows]: any = await db.query(
    'SELECT * FROM wallets WHERE customer_id = ?' + (conn ? ' FOR UPDATE' : ''),
    [customerId]
  );

  if (rows[0]) {
    return {
      id: rows[0].id as string,
      customerId: rows[0].customer_id as string,
      balance: Number(rows[0].balance),
      rewardPoints: Number(rows[0].reward_points || 0),
    };
  }

  const newId = crypto.randomUUID();
  await db.query(
    `INSERT INTO wallets (id, customer_id, balance, reward_points, created_at, updated_at)
     VALUES (?, ?, 0.00, 0, UTC_TIMESTAMP(3), UTC_TIMESTAMP(3))
     ON DUPLICATE KEY UPDATE updated_at = UTC_TIMESTAMP(3)`,
    [newId, customerId]
  );

  return {
    id: newId,
    customerId,
    balance: 0,
    rewardPoints: 0,
  };
}

export async function getWallet(customerId: string): Promise<WalletData> {
  const wallet = await getOrCreateWallet(customerId);
  const db = database();

  const [txRows]: any = await db.query(
    `SELECT id, type, category, amount, balance_after AS balanceAfter, reference_id AS referenceId,
            description, created_at AS createdAt
     FROM wallet_transactions
     WHERE customer_id = ?
     ORDER BY created_at DESC
     LIMIT 50`,
    [customerId]
  );

  return {
    customerId,
    balance: wallet.balance,
    rewardPoints: wallet.rewardPoints,
    transactions: txRows.map((r: any) => ({
      ...r,
      amount: Number(r.amount),
      balanceAfter: Number(r.balanceAfter),
      createdAt: typeof r.createdAt === 'string' ? r.createdAt : new Date(r.createdAt).toISOString(),
    })),
  };
}

export async function creditWallet(
  customerId: string,
  amount: number,
  category: WalletTransactionRecord['category'],
  description: string,
  referenceId?: string | null,
  existingConn?: PoolConnection,
) {
  if (amount <= 0) throw new Error('Credit amount must be greater than zero.');
  const db = database();
  const connection = existingConn || (await db.getConnection());
  const shouldManageTx = !existingConn;

  try {
    if (shouldManageTx) await connection.beginTransaction();

    const wallet = await getOrCreateWallet(customerId, connection);
    const newBalance = Number((wallet.balance + amount).toFixed(2));
    const txId = crypto.randomUUID();

    await connection.query(
      'UPDATE wallets SET balance = ?, updated_at = UTC_TIMESTAMP(3) WHERE id = ?',
      [newBalance, wallet.id]
    );

    await connection.query(
      `INSERT INTO wallet_transactions
       (id, wallet_id, customer_id, type, category, amount, balance_after, reference_id, description, created_at)
       VALUES (?, ?, ?, 'CREDIT', ?, ?, ?, ?, ?, UTC_TIMESTAMP(3))`,
      [txId, wallet.id, customerId, category, amount, newBalance, referenceId || null, description]
    );

    if (shouldManageTx) await connection.commit();

    return {
      success: true,
      balance: newBalance,
      transactionId: txId,
    };
  } catch (error) {
    if (shouldManageTx) await connection.rollback();
    throw error;
  } finally {
    if (shouldManageTx) connection.release();
  }
}

export async function debitWallet(
  customerId: string,
  amount: number,
  description: string,
  referenceId?: string | null,
  existingConn?: PoolConnection,
) {
  if (amount <= 0) throw new Error('Debit amount must be greater than zero.');
  const db = database();
  const connection = existingConn || (await db.getConnection());
  const shouldManageTx = !existingConn;

  try {
    if (shouldManageTx) await connection.beginTransaction();

    const wallet = await getOrCreateWallet(customerId, connection);
    if (wallet.balance < amount) {
      throw new Error(`Insufficient wallet balance. Current: INR ${wallet.balance.toFixed(2)}, Required: INR ${amount.toFixed(2)}`);
    }

    const newBalance = Number((wallet.balance - amount).toFixed(2));
    const txId = crypto.randomUUID();

    await connection.query(
      'UPDATE wallets SET balance = ?, updated_at = UTC_TIMESTAMP(3) WHERE id = ?',
      [newBalance, wallet.id]
    );

    await connection.query(
      `INSERT INTO wallet_transactions
       (id, wallet_id, customer_id, type, category, amount, balance_after, reference_id, description, created_at)
       VALUES (?, ?, ?, 'DEBIT', 'ORDER_PAYMENT', ?, ?, ?, ?, UTC_TIMESTAMP(3))`,
      [txId, wallet.id, customerId, amount, newBalance, referenceId || null, description]
    );

    if (shouldManageTx) await connection.commit();

    return {
      success: true,
      balance: newBalance,
      transactionId: txId,
    };
  } catch (error) {
    if (shouldManageTx) await connection.rollback();
    throw error;
  } finally {
    if (shouldManageTx) connection.release();
  }
}

export async function createTopupOrder(customerId: string, amount: number) {
  if (amount < 10 || amount > 50000) {
    throw new Error('Top-up amount must be between INR 10 and INR 50,000.');
  }

  const razorpay = getRazorpayClient();
  if (!razorpay) {
    throw new Error('Online payment gateway is not configured.');
  }

  const amountPaise = Math.round(amount * 100);
  const internalRef = `topup_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  const order = await razorpay.client.orders.create({
    amount: amountPaise,
    currency: 'INR',
    receipt: internalRef.slice(0, 40),
    notes: {
      customerId,
      type: 'WALLET_TOPUP',
      amount: String(amount),
    },
  });

  return {
    orderId: order.id,
    amount: amountPaise,
    amountRupees: amount,
    currency: 'INR',
    key: razorpay.keyId,
    internalRef,
  };
}

export async function verifyTopupPayment(
  customerId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
  amountRupees: number,
) {
  const razorpay = getRazorpayClient();
  if (!razorpay) {
    throw new Error('Online payment gateway is not configured.');
  }

  // 1. Check if already processed
  const db = database();
  const [existing]: any = await db.query(
    'SELECT id FROM wallet_transactions WHERE reference_id = ?',
    [razorpayPaymentId]
  );
  if (existing.length) {
    return getWallet(customerId);
  }

  // 2. Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', razorpay.keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
  const receivedBuffer = Buffer.from(razorpaySignature, 'utf8');

  if (
    expectedBuffer.length !== receivedBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  ) {
    throw new Error('Invalid Razorpay signature. Payment verification failed.');
  }

  // 3. Verify payment from Razorpay API
  let verifiedAmount = amountRupees;
  try {
    const payment = await razorpay.client.payments.fetch(razorpayPaymentId);
    if (payment.status !== 'captured' && payment.status !== 'authorized') {
      throw new Error(`Payment is in ${payment.status} status.`);
    }
    if (payment.amount) {
      verifiedAmount = Number(payment.amount) / 100;
    }
  } catch (fetchErr: any) {
    console.warn('Could not verify amount with Razorpay API, using provided amount:', fetchErr?.message);
  }

  // 4. Credit wallet
  await creditWallet(
    customerId,
    verifiedAmount,
    'TOPUP_RAZORPAY',
    `Added INR ${verifiedAmount.toFixed(2)} via Razorpay (ID: ${razorpayPaymentId})`,
    razorpayPaymentId
  );

  return getWallet(customerId);
}

export async function getAdminWalletOverview() {
  const db = database();

  // 1. Wallets with customer information
  const [wallets]: any = await db.query(`
    SELECT w.id, w.customer_id AS customerId, w.balance, w.reward_points AS rewardPoints,
           w.created_at AS createdAt, w.updated_at AS updatedAt,
           c.name AS customerName, c.phone AS customerPhone, c.email AS customerEmail
    FROM wallets w
    LEFT JOIN customers c ON c.id = w.customer_id
    ORDER BY w.balance DESC, w.updated_at DESC
  `);

  // 2. Recent transactions with customer details
  const [transactions]: any = await db.query(`
    SELECT t.id, t.customer_id AS customerId, t.type, t.category, t.amount,
           t.balance_after AS balanceAfter, t.reference_id AS referenceId,
           t.description, t.created_at AS createdAt,
           c.name AS customerName, c.phone AS customerPhone
    FROM wallet_transactions t
    LEFT JOIN customers c ON c.id = t.customer_id
    ORDER BY t.created_at DESC
    LIMIT 200
  `);

  // 3. Aggregate statistics
  const totalWallets = wallets.length;
  const totalBalance = wallets.reduce((sum: number, w: any) => sum + Number(w.balance || 0), 0);

  const [statsRows]: any = await db.query(`
    SELECT 
      SUM(CASE WHEN type = 'CREDIT' THEN amount ELSE 0 END) AS totalCredited,
      SUM(CASE WHEN type = 'DEBIT' THEN amount ELSE 0 END) AS totalDebited,
      SUM(CASE WHEN category = 'TOPUP_RAZORPAY' THEN amount ELSE 0 END) AS totalTopups,
      SUM(CASE WHEN category IN ('REFERRAL_REWARD', 'WELCOME_BONUS') THEN amount ELSE 0 END) AS totalReferralBonuses
    FROM wallet_transactions
  `);

  const stats = statsRows[0] || {};

  return {
    stats: {
      totalWallets,
      totalBalance: Number(totalBalance.toFixed(2)),
      totalCredited: Number(stats.totalCredited || 0),
      totalDebited: Number(stats.totalDebited || 0),
      totalTopups: Number(stats.totalTopups || 0),
      totalReferralBonuses: Number(stats.totalReferralBonuses || 0),
    },
    wallets: wallets.map((w: any) => ({
      ...w,
      balance: Number(w.balance || 0),
      customerName: w.customerName || 'Customer',
      customerPhone: w.customerPhone || 'N/A',
      createdAt: typeof w.createdAt === 'string' ? w.createdAt : new Date(w.createdAt).toISOString(),
      updatedAt: typeof w.updatedAt === 'string' ? w.updatedAt : new Date(w.updatedAt).toISOString(),
    })),
    transactions: transactions.map((t: any) => ({
      ...t,
      amount: Number(t.amount),
      balanceAfter: Number(t.balanceAfter),
      customerName: t.customerName || 'Customer',
      customerPhone: t.customerPhone || 'N/A',
      createdAt: typeof t.createdAt === 'string' ? t.createdAt : new Date(t.createdAt).toISOString(),
    })),
  };
}

export async function adminAdjustWallet(
  customerId: string,
  amount: number,
  type: 'CREDIT' | 'DEBIT',
  reason: string,
  adminId?: string
) {
  if (amount <= 0) {
    throw new Error('Adjustment amount must be greater than zero.');
  }

  if (type === 'CREDIT') {
    return await creditWallet(
      customerId,
      amount,
      'CASH_RECHARGE',
      reason || 'Administrative credit adjustment',
      adminId || 'admin'
    );
  } else {
    return await debitWallet(
      customerId,
      amount,
      reason || 'Administrative debit adjustment',
      adminId || 'admin'
    );
  }
}

export async function reverseOrderWalletDeduction(
  orderId: string,
  customerId?: string,
  reason?: string
): Promise<{ refunded: boolean; amount: number; message: string }> {
  if (!pool) return { refunded: false, amount: 0, message: 'Database not available.' };
  const db = database();

  const [debits]: any = await db.query(
    'SELECT * FROM wallet_transactions WHERE reference_id = ? AND type = "DEBIT"',
    [orderId]
  );
  if (!debits || debits.length === 0) {
    return { refunded: false, amount: 0, message: 'No wallet debit found for this order.' };
  }

  const [credits]: any = await db.query(
    'SELECT * FROM wallet_transactions WHERE reference_id = ? AND type = "CREDIT"',
    [orderId]
  );

  const totalDebited = debits.reduce((acc: number, d: any) => acc + Number(d.amount), 0);
  const totalCredited = (credits || []).reduce((acc: number, c: any) => acc + Number(c.amount), 0);
  const amountToRefund = Number((totalDebited - totalCredited).toFixed(2));

  if (amountToRefund <= 0) {
    return { refunded: false, amount: 0, message: 'Wallet deduction already reversed.' };
  }

  const custId = customerId || debits[0].customer_id;
  const desc = reason || `Refund: Wallet deduction reversed for cancelled Order #${orderId}`;

  await creditWallet(custId, amountToRefund, 'DISPUTE_REFUND', desc, orderId);
  console.log(`[Wallet] Successfully reversed ₹${amountToRefund} for cancelled/failed Order #${orderId} to customer ${custId}`);

  return { refunded: true, amount: amountToRefund, message: `Successfully refunded ₹${amountToRefund}` };
}

