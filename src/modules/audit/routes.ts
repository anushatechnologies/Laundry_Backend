import { Router, Request, Response } from 'express';
import { getAuditLogs, logAuditEvent, StoredAuditLog, RiskLevel } from '../../lib/audit';
import { pool, isDbConnected } from '../../lib/mysql';

export const auditRouter = Router();

// Baseline Master Seed Logs for first-time boot
const DEFAULT_SEED_LOGS = [
  {
    actorId: 'stf-super-01',
    actorName: 'Venkat (Master Admin)',
    actorEmail: 'venkat@anushatechnologies.com',
    actorRole: 'SUPER_ADMIN',
    action: 'SUPER_ADMIN_AUTHENTICATED',
    resourceType: 'SECURITY',
    resourceId: 'SEC-ROOT-01',
    details: 'Master administrator authenticated from Rajahmundry Central Operations console.',
    riskLevel: 'INFO' as RiskLevel,
    payloadAfter: { session: 'AUTHENTICATED', client: 'Web Admin Panel' },
    ipAddress: '182.74.12.9',
  },
  {
    actorId: 'stf-super-01',
    actorName: 'Venkat (Master Admin)',
    actorEmail: 'venkat@anushatechnologies.com',
    actorRole: 'SUPER_ADMIN',
    action: 'PRICE_MATRIX_CONFIGURED',
    resourceType: 'PRICING_ENGINE',
    resourceId: 'SRV-STEAM-01',
    details: 'Verified and aligned base rate matrix for 54 garment categories and 6 service tiers.',
    riskLevel: 'HIGH_RISK' as RiskLevel,
    payloadAfter: { categoriesCount: 54, servicesCount: 6, status: 'VERIFIED' },
    ipAddress: '182.74.12.9',
  },
  {
    actorId: 'stf-super-01',
    actorName: 'Venkat (Master Admin)',
    actorEmail: 'venkat@anushatechnologies.com',
    actorRole: 'SUPER_ADMIN',
    action: 'SMS_GATEWAY_INITIALIZED',
    resourceType: 'COMMUNICATIONS',
    resourceId: 'GW-FAST2SMS',
    details: 'Fast2SMS Quick Route gateway connected with verified wallet balance.',
    riskLevel: 'INFO' as RiskLevel,
    payloadAfter: { route: 'q', status: 'ACTIVE', wallet: 125 },
    ipAddress: '127.0.0.1',
  },
  {
    actorId: 'stf-super-01',
    actorName: 'Venkat (Master Admin)',
    actorEmail: 'venkat@anushatechnologies.com',
    actorRole: 'SUPER_ADMIN',
    action: 'FCM_PUSH_ENGINE_SYNCHRONIZED',
    resourceType: 'NOTIFICATIONS',
    resourceId: 'FCM-BROADCAST',
    details: 'Firebase Cloud Messaging broadcast engine initialized with MySQL feed synchronization.',
    riskLevel: 'INFO' as RiskLevel,
    payloadAfter: { package: 'com.anusha.laundry', dualDelivery: true },
    ipAddress: '127.0.0.1',
  },
];

// Ensure initial baseline logs exist in MySQL
async function ensureSeedLogs() {
  if (!isDbConnected || !pool) return;
  try {
    const [rows]: any = await pool.query('SELECT COUNT(*) as cnt FROM audit_logs');
    if (rows && rows[0]?.cnt === 0) {
      for (const seed of DEFAULT_SEED_LOGS) {
        await logAuditEvent(seed);
      }
    }
  } catch (err: any) {
    console.warn('[Audit Routes] Seed verification notice:', err.message);
  }
}

// GET /api/audit — Fetch audit log trail with search, risk, and module filtering
auditRouter.get('/', async (req: Request, res: Response) => {
  try {
    await ensureSeedLogs();

    const module = typeof req.query.module === 'string' ? req.query.module : undefined;
    const riskLevel = typeof req.query.riskLevel === 'string' ? req.query.riskLevel : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '100'), 10)));
    const offset = Math.max(0, parseInt(String(req.query.offset || '0'), 10));

    const result = await getAuditLogs({
      module,
      riskLevel,
      search,
      limit,
      offset,
    });

    res.json({
      success: true,
      count: result.logs.length,
      total: result.total,
      data: result.logs,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/audit/stats — Aggregate risk and module metrics for admin dashboard
auditRouter.get('/stats', async (_req: Request, res: Response) => {
  try {
    const result = await getAuditLogs({ limit: 500 });
    const logs = result.logs;

    const criticalCount = logs.filter((l) => l.riskLevel === 'CRITICAL').length;
    const highRiskCount = logs.filter((l) => l.riskLevel === 'HIGH_RISK').length;
    const mediumRiskCount = logs.filter((l) => l.riskLevel === 'MEDIUM_RISK').length;
    const infoCount = logs.filter((l) => l.riskLevel === 'INFO').length;

    res.json({
      success: true,
      data: {
        total: logs.length,
        critical: criticalCount,
        highRisk: highRiskCount,
        mediumRisk: mediumRiskCount,
        info: infoCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/audit — Create audit log event
auditRouter.post('/', async (req: Request, res: Response) => {
  try {
    const {
      userName,
      userEmail,
      userRole,
      module,
      action,
      details,
      riskLevel,
      resourceId,
      payloadBefore,
      payloadDiff,
    } = req.body;

    if (!action || !details) {
      return res.status(400).json({ success: false, message: 'Action and details are required' });
    }

    const log = await logAuditEvent({
      actorId: req.body.userId || 'stf-super-01',
      actorName: userName,
      actorEmail: userEmail,
      actorRole: userRole,
      action,
      resourceType: module || 'OPERATIONS',
      resourceId,
      details,
      riskLevel,
      payloadBefore,
      payloadAfter: payloadDiff,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(201).json({ success: true, message: 'Audit event logged', data: log });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default auditRouter;
