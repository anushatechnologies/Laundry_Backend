import { Router, Request, Response } from 'express';
import { pool, isDbConnected } from '../../lib/mysql';

export const auditRouter = Router();

// Master Audit Logs In-Memory Fallback
const MASTER_AUDIT_LOGS = [
  {
    id: 'AUD-901',
    timestamp: '2026-08-27 13:04:12',
    userId: 'stf-super-01',
    userName: 'Venkat (Super Admin)',
    userEmail: 'venkat@anushatechnologies.com',
    userRole: 'SUPER_ADMIN',
    module: 'SUPER_ADMIN_RBAC',
    action: 'SUPER_ADMIN_LOGIN',
    details: 'Super Admin logged in from Rajahmundry Central Hub management console.',
    ipAddress: '182.74.12.9',
    riskLevel: 'INFO',
    payloadDiff: {
      session: 'SUCCESS_AUTHENTICATED',
      device: 'Chrome 128 (Windows 11)',
      ip: '182.74.12.9',
    },
  },
  {
    id: 'AUD-902',
    timestamp: '2026-08-27 12:45:00',
    userId: 'stf-super-01',
    userName: 'Venkat (Super Admin)',
    userEmail: 'venkat@anushatechnologies.com',
    userRole: 'SUPER_ADMIN',
    module: 'STAFF_MANAGEMENT',
    action: 'STAFF_PERMISSIONS_UPDATED',
    details: 'Granted Orders & Reports full write permissions to Priya Sharma (Kakinada Store Manager).',
    ipAddress: '182.74.12.9',
    riskLevel: 'HIGH_RISK',
    payloadDiff: {
      previousRole: 'LAUNDRY_STAFF',
      updatedRole: 'HUB_MANAGER',
      newPermissions: ['ORDERS', 'INVENTORY', 'REPORTS'],
    },
  },
  {
    id: 'AUD-903',
    timestamp: '2026-08-27 11:30:15',
    userId: 'stf-2',
    userName: 'Priya Sharma',
    userEmail: 'priya.ops@laundryfresh.com',
    userRole: 'HUB_MANAGER',
    module: 'INVENTORY',
    action: 'INVENTORY_RESTOCKED',
    details: 'Restocked Eco Bio Enzyme Liquid Detergent by +100 LITERS. PO Batch #2026-AUG-27.',
    ipAddress: '182.74.88.42',
    riskLevel: 'INFO',
    payloadDiff: {
      itemId: 'inv-1',
      previousStock: 80,
      newStock: 180,
      costPerLiter: 140,
    },
  },
  {
    id: 'AUD-904',
    timestamp: '2026-08-27 10:15:30',
    userId: 'stf-super-01',
    userName: 'Venkat (Super Admin)',
    userEmail: 'venkat@anushatechnologies.com',
    userRole: 'SUPER_ADMIN',
    module: 'PRICING_ENGINE',
    action: 'PRICE_MATRIX_CHANGED',
    details: 'Updated Silk Saree Dry Cleaning base rate from ₹220 to ₹250 INR per piece.',
    ipAddress: '182.74.12.9',
    riskLevel: 'HIGH_RISK',
    payloadDiff: {
      serviceId: 'srv-dry-saree',
      oldPrice: 220,
      newPrice: 250,
    },
  },
];

// GET /api/audit — Fetch audit log trail
auditRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { module, riskLevel, search } = req.query;

    let logs = [...MASTER_AUDIT_LOGS];

    if (isDbConnected && pool) {
      try {
        const [rows]: any = await pool.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100');
        if (rows.length > 0) {
          const dbLogs = rows.map((r: any) => ({
            id: r.id,
            timestamp: r.created_at ? new Date(r.created_at).toISOString().replace('T', ' ').slice(0, 19) : new Date().toISOString(),
            userId: r.actor_id,
            userName: r.actor_email?.split('@')[0] || 'Admin',
            userEmail: r.actor_email,
            userRole: r.actor_role,
            module: r.resource_type || 'GENERAL',
            action: r.action,
            details: `${r.action} on ${r.resource_type || 'resource'} #${r.resource_id || ''}`,
            ipAddress: r.ip_address || '127.0.0.1',
            riskLevel: 'INFO',
            payloadDiff: typeof r.payload_after === 'string' ? JSON.parse(r.payload_after) : (r.payload_after || {}),
          }));
          logs = [...dbLogs, ...MASTER_AUDIT_LOGS];
        }
      } catch (e) {
        console.error('Error fetching audit logs from MySQL:', e);
      }
    }

    let filtered = logs;

    if (module && module !== 'ALL') {
      filtered = filtered.filter((log) => log.module === module);
    }
    if (riskLevel && riskLevel !== 'ALL') {
      filtered = filtered.filter((log) => log.riskLevel === riskLevel);
    }
    if (search) {
      const q = (search as string).toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.details.toLowerCase().includes(q) ||
          log.userName.toLowerCase().includes(q) ||
          log.action.toLowerCase().includes(q) ||
          log.id.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      count: filtered.length,
      data: filtered,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/audit — Create audit log event
auditRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { userName, userEmail, userRole, module, action, details, riskLevel, payloadDiff } = req.body;

    const newLog = {
      id: `AUD-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userId: req.body.userId || 'stf-super-01',
      userName: userName || 'Venkat (Super Admin)',
      userEmail: userEmail || 'venkat@anushatechnologies.com',
      userRole: userRole || 'SUPER_ADMIN',
      module: module || 'GENERAL',
      action: action || 'ACTION_PERFORMED',
      details: details || 'Administrative change executed.',
      ipAddress: req.ip || '127.0.0.1',
      riskLevel: riskLevel || 'INFO',
      payloadDiff: payloadDiff || {},
    };

    MASTER_AUDIT_LOGS.unshift(newLog);

    if (isDbConnected && pool) {
      pool.query(
        'INSERT INTO audit_logs (id, actor_id, actor_email, actor_role, action, resource_type, resource_id, payload_before, payload_after, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [newLog.id, newLog.userId, newLog.userEmail, newLog.userRole, newLog.action, newLog.module, req.body.resourceId || newLog.id, JSON.stringify(req.body.payloadBefore || {}), JSON.stringify(newLog.payloadDiff), newLog.ipAddress]
      ).catch((err) => console.error('Error logging audit to MySQL:', err));
    }

    res.json({ success: true, message: 'Audit event logged', data: newLog });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default auditRouter;
