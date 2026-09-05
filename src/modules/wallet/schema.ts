import type { Pool } from 'mysql2/promise';

export async function createWalletTables(database: Pick<Pool, 'query'>) {
  const tables = [
    `CREATE TABLE IF NOT EXISTS wallets (
      id VARCHAR(36) PRIMARY KEY,
      customer_id VARCHAR(255) NOT NULL UNIQUE,
      balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      reward_points INT NOT NULL DEFAULT 0,
      created_at DATETIME(3) NOT NULL,
      updated_at DATETIME(3) NOT NULL,
      INDEX idx_wallet_customer (customer_id)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS wallet_transactions (
      id VARCHAR(36) PRIMARY KEY,
      wallet_id VARCHAR(36) NOT NULL,
      customer_id VARCHAR(255) NOT NULL,
      type ENUM('CREDIT', 'DEBIT') NOT NULL,
      category ENUM('WELCOME_BONUS', 'REFERRAL_REWARD', 'TOPUP_RAZORPAY', 'ORDER_PAYMENT', 'DISPUTE_REFUND', 'CASH_RECHARGE') NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      balance_after DECIMAL(10, 2) NOT NULL,
      reference_id VARCHAR(255) NULL,
      description VARCHAR(500) NOT NULL,
      created_at DATETIME(3) NOT NULL,
      INDEX idx_wt_customer (customer_id),
      INDEX idx_wt_wallet (wallet_id),
      INDEX idx_wt_created (created_at)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  ];

  for (const sql of tables) {
    await database.query(sql);
  }
}
