const mysql = require('mysql2/promise');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await conn.beginTransaction();

    const referrerId = 'cust_1787838438207'; // Venkatarao Dama (9948598350)
    const inviteeId = '1Rapk6hTHSUjuJPt9utpauVgQVi2'; // Sai (9398634787)
    const inviteCode = 'LFD7E5EE';

    // 1. Check if referral already exists
    const [existing] = await conn.execute('SELECT id FROM referrals WHERE invitee_id = ?', [inviteeId]);
    if (existing.length > 0) {
      console.log('Referral already exists for Sai:', existing);
    } else {
      // 2. Insert referral record
      const referralId = crypto.randomUUID();
      await conn.execute(
        `INSERT INTO referrals (id, referrer_id, invitee_id, code, status, terms, reason, created_at, qualified_at)
         VALUES (?, ?, ?, ?, 'QUALIFIED', ?, 'Invited by Venkatarao Dama', UTC_TIMESTAMP(3), UTC_TIMESTAMP(3))`,
        [referralId, referrerId, inviteeId, inviteCode, JSON.stringify({ referrerReward: 50, friendReward: 25 })]
      );
      console.log('Inserted referral record:', referralId);
    }

    // 3. Credit Sai (invitee) ₹25 Welcome Bonus
    // Get Sai's wallet
    const [saiWallets] = await conn.execute('SELECT * FROM wallets WHERE customer_id = ?', [inviteeId]);
    let saiWallet = saiWallets[0];
    if (!saiWallet) {
      const wId = crypto.randomUUID();
      await conn.execute('INSERT INTO wallets (id, customer_id, balance, reward_points, created_at, updated_at) VALUES (?, ?, 0, 0, UTC_TIMESTAMP(3), UTC_TIMESTAMP(3))', [wId, inviteeId]);
      saiWallet = { id: wId, balance: '0.00' };
    }
    const saiNewBal = Number((parseFloat(saiWallet.balance) + 25).toFixed(2));
    await conn.execute('UPDATE wallets SET balance = ?, updated_at = UTC_TIMESTAMP(3) WHERE id = ?', [saiNewBal, saiWallet.id]);
    await conn.execute(
      `INSERT INTO wallet_transactions (id, wallet_id, customer_id, type, category, amount, balance_after, reference_id, description, created_at)
       VALUES (?, ?, ?, 'CREDIT', 'WELCOME_BONUS', 25.00, ?, ?, 'Welcome bonus for joining LaundryFresh with invite code LFD7E5EE!', UTC_TIMESTAMP(3))`,
      [crypto.randomUUID(), saiWallet.id, inviteeId, saiNewBal, referrerId]
    );
    console.log(`Sai wallet updated: ${saiWallet.balance} -> ${saiNewBal}`);

    // 4. Credit Venkatarao (referrer) ₹50 Referral Reward
    const [venkatWallets] = await conn.execute('SELECT * FROM wallets WHERE customer_id = ?', [referrerId]);
    const venkatWallet = venkatWallets[0];
    const venkatNewBal = Number((parseFloat(venkatWallet.balance) + 50).toFixed(2));
    await conn.execute('UPDATE wallets SET balance = ?, updated_at = UTC_TIMESTAMP(3) WHERE id = ?', [venkatNewBal, venkatWallet.id]);
    await conn.execute(
      `INSERT INTO wallet_transactions (id, wallet_id, customer_id, type, category, amount, balance_after, reference_id, description, created_at)
       VALUES (?, ?, ?, 'CREDIT', 'REFERRAL_REWARD', 50.00, ?, ?, 'Referral bonus: Friend (+91 9398***787) registered with your invite code LFD7E5EE!', UTC_TIMESTAMP(3))`,
      [crypto.randomUUID(), venkatWallet.id, referrerId, venkatNewBal, inviteeId]
    );
    console.log(`Venkatarao wallet updated: ${venkatWallet.balance} -> ${venkatNewBal}`);

    await conn.commit();
    console.log('SUCCESS! Both Sai and Venkatarao credited successfully.');
  } catch (err) {
    await conn.rollback();
    console.error('Error during credit:', err);
  } finally {
    await conn.end();
  }
}

run();
