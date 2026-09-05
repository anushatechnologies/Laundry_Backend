import type { Pool } from 'mysql2/promise';

// Empty tables only. Campaign terms are saved explicitly by an administrator.
export async function createReferralTables(database: Pick<Pool, 'query'>) {
  const tables = [
    `CREATE TABLE IF NOT EXISTS referral_settings (
      id INT PRIMARY KEY, settings JSON NOT NULL, updated_at DATETIME(3) NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS referral_settings_audit (
      id VARCHAR(36) PRIMARY KEY, settings JSON NOT NULL, created_at DATETIME(3) NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS referral_codes (
      customer_id VARCHAR(255) PRIMARY KEY, code VARCHAR(24) NOT NULL UNIQUE,
      created_at DATETIME(3) NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS referrals (
      id VARCHAR(36) PRIMARY KEY, referrer_id VARCHAR(255) NOT NULL,
      invitee_id VARCHAR(255) NOT NULL UNIQUE, code VARCHAR(24) NOT NULL,
      status VARCHAR(24) NOT NULL, terms JSON NOT NULL,
      qualifying_order_id VARCHAR(255) UNIQUE, reason VARCHAR(255),
      created_at DATETIME(3) NOT NULL, qualified_at DATETIME(3),
      INDEX referrals_referrer_idx (referrer_id), INDEX referrals_status_idx (status))`,
    `CREATE TABLE IF NOT EXISTS referral_rewards (
      id VARCHAR(36) PRIMARY KEY, referral_id VARCHAR(36) NOT NULL,
      customer_id VARCHAR(255) NOT NULL, code VARCHAR(32) NOT NULL UNIQUE,
      amount_paise INT NOT NULL, min_order_paise INT NOT NULL,
      status VARCHAR(24) NOT NULL, used_order_id VARCHAR(255),
      expires_at DATETIME(3) NOT NULL, created_at DATETIME(3) NOT NULL,
      UNIQUE KEY referral_reward_beneficiary (referral_id, customer_id),
      INDEX referral_rewards_customer_idx (customer_id))`,
  ];
  for (const sql of tables) await database.query(sql);
}
