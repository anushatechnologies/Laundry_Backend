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
