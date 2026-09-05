import { pool, isDbConnected } from './mysql';

export type RiskLevel = 'CRITICAL' | 'HIGH_RISK' | 'MEDIUM_RISK' | 'INFO';

export interface AuditEventParams {
  id?: string;
  actorId?: string;
  actorName?: string;
  actorEmail?: string;
  actorRole?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  details: string;
  riskLevel?: RiskLevel;
  payloadBefore?: any;
  payloadAfter?: any;
  ipAddress?: string;
}

export interface StoredAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userRole: string;
  module: string;
  action: string;
  details: string;
  ipAddress: string;
  riskLevel: RiskLevel;
  payloadDiff: Record<string, any>;
}

// In-memory ring buffer for fallback and fast access
const MEMORY_AUDIT_LOGS: StoredAuditLog[] = [];
const MAX_MEMORY_LOGS = 200;

function computeRiskLevel(action: string, explicitRisk?: RiskLevel): RiskLevel {
  if (explicitRisk) return explicitRisk;
  const upper = action.toUpperCase();

  if (
    upper.includes('DELETE') ||
    upper.includes('DROP') ||
    upper.includes('PASSWORD') ||
    upper.includes('ROLE_ESCALATION') ||
    upper.includes('REFUND') ||
    upper.includes('BROADCAST')
  ) {
    return 'CRITICAL';
  }

  if (
    upper.includes('CANCEL') ||
    upper.includes('PRICE') ||
    upper.includes('PERMISSION') ||
    upper.includes('STATUS_CHANGE') ||
    upper.includes('DISCOUNT')
  ) {
    return 'HIGH_RISK';
  }

  if (upper.includes('UPDATE') || upper.includes('EDIT') || upper.includes('ASSIGN')) {
    return 'MEDIUM_RISK';
  }

  return 'INFO';
}

/**
 * Log an audit event across the application.
 * Automatically inserts into MySQL `audit_logs` and keeps memory cache updated.
 */
export async function logAuditEvent(params: AuditEventParams): Promise<StoredAuditLog> {
  const id = params.id || `AUD-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  const now = new Date();
  const timestamp = now.toISOString().replace('T', ' ').slice(0, 19);
  const risk = computeRiskLevel(params.action, params.riskLevel);

  const actorEmail = params.actorEmail || 'system@anushatechnologies.com';
  const actorName = params.actorName || (actorEmail.includes('@') ? actorEmail.split('@')[0] : 'Admin');
  const actorRole = params.actorRole || (params.actorId?.startsWith('cust') ? 'CUSTOMER' : 'SUPER_ADMIN');

  const logEntry: StoredAuditLog = {
    id,
    timestamp,
    userId: params.actorId || 'stf-super-01',
    userName: actorName,
    userEmail: actorEmail,
    userRole: actorRole,
    module: params.resourceType || 'OPERATIONS',
    action: params.action,
    details: params.details,
    ipAddress: params.ipAddress || '127.0.0.1',
    riskLevel: risk,
    payloadDiff: params.payloadAfter || {},
  };

  // Add to memory buffer
  MEMORY_AUDIT_LOGS.unshift(logEntry);
  if (MEMORY_AUDIT_LOGS.length > MAX_MEMORY_LOGS) {
    MEMORY_AUDIT_LOGS.pop();
  }

  // Persist to MySQL RDS
  if (isDbConnected && pool) {
    try {
      await pool.query(
        `INSERT INTO audit_logs (
          id, actor_id, actor_email, actor_role, action,
          resource_type, resource_id, details, risk_level,
          payload_before, payload_after, ip_address, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          details = VALUES(details),
          risk_level = VALUES(risk_level)`,
        [
          id,
          logEntry.userId,
          logEntry.userEmail || null,
          logEntry.userRole,
          logEntry.action,
          logEntry.module,
          params.resourceId || id,
          logEntry.details,
          logEntry.riskLevel,
          params.payloadBefore ? JSON.stringify(params.payloadBefore) : null,
          params.payloadAfter ? JSON.stringify(params.payloadAfter) : null,
          logEntry.ipAddress,
          timestamp,
        ]
      );
    } catch (err: any) {
      console.error('[Audit Logger] Failed to insert audit log into MySQL:', err.message);
    }
  }

  return logEntry;
}

/**
 * Fetch filtered audit logs from MySQL (with memory fallback).
 */
export async function getAuditLogs(options: {
  module?: string;
  riskLevel?: string;
  search?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<{ logs: StoredAuditLog[]; total: number }> {
  const limit = options.limit || 100;
  const offset = options.offset || 0;

  if (isDbConnected && pool) {
    try {
      let query = 'SELECT * FROM audit_logs WHERE 1=1';
      const params: any[] = [];

      if (options.module && options.module !== 'ALL') {
        query += ' AND resource_type = ?';
        params.push(options.module);
      }

      if (options.riskLevel && options.riskLevel !== 'ALL') {
        query += ' AND risk_level = ?';
        params.push(options.riskLevel);
      }

      if (options.search) {
        const q = `%${options.search}%`;
        query += ' AND (action LIKE ? OR details LIKE ? OR actor_email LIKE ? OR actor_role LIKE ? OR id LIKE ?)';
        params.push(q, q, q, q, q);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const [rows]: any = await pool.query(query, params);

      if (rows && rows.length > 0) {
        const formatted: StoredAuditLog[] = rows.map((r: any) => {
          let payload: any = {};
          try {
            payload = typeof r.payload_after === 'string' ? JSON.parse(r.payload_after) : (r.payload_after || {});
          } catch {
            payload = {};
          }

          const createdDate = r.created_at ? new Date(r.created_at) : new Date();
          const timestamp = createdDate.toISOString().replace('T', ' ').slice(0, 19);
          const email = r.actor_email || '';
          const name = email.includes('@') ? email.split('@')[0] : (r.actor_role || 'Operator');

          return {
            id: r.id,
            timestamp,
            userId: r.actor_id || 'system',
            userName: name,
            userEmail: email,
            userRole: r.actor_role || 'STAFF',
            module: r.resource_type || 'GENERAL',
            action: r.action,
            details: r.details || `${r.action} on ${r.resource_type || 'resource'} #${r.resource_id || ''}`,
            ipAddress: r.ip_address || '127.0.0.1',
            riskLevel: (r.risk_level as RiskLevel) || 'INFO',
            payloadDiff: payload,
          };
        });

        return { logs: formatted, total: formatted.length };
      }
    } catch (err: any) {
      console.error('[Audit Logger] Failed to fetch audit logs from MySQL:', err.message);
    }
  }

  // Fallback to memory buffer
  let filtered = [...MEMORY_AUDIT_LOGS];

  if (options.module && options.module !== 'ALL') {
    filtered = filtered.filter((l) => l.module === options.module);
  }
  if (options.riskLevel && options.riskLevel !== 'ALL') {
    filtered = filtered.filter((l) => l.riskLevel === options.riskLevel);
  }
  if (options.search) {
    const q = options.search.toLowerCase();
    filtered = filtered.filter(
      (l) =>
        l.details.toLowerCase().includes(q) ||
        l.userName.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q)
    );
  }

  return {
    logs: filtered.slice(offset, offset + limit),
    total: filtered.length,
  };
}
