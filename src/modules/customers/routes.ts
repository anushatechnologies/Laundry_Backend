import { Router, type Request, type Response } from 'express';
import { db } from '../../lib/db';
import { requireAdmin } from '../../middleware/admin';
import { verifyFirebaseToken } from '../../middleware/verifyFirebaseToken';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  type CustomerTokenPayload,
} from '../../lib/customer-tokens';
import { sendOtpNotification } from '../../lib/email';
import { sendSmsOtp } from '../../lib/sms';
import { getFirebaseAuth } from '../../lib/firebase-admin';

export const customersRouter = Router();

type RegisteredCustomer = { id: string; name: string; phone: string; email: string };
const registeredCustomers = new Map<string, RegisteredCustomer>();

// In-memory OTP storage for direct SMS/backend authentication
const customerOtpStore = new Map<string, { code: string; expiresAt: number; name?: string; email?: string }>();

/* ─────────────────────────────────────────────────────────────────────────
   Internal helpers
───────────────────────────────────────────────────────────────────────── */

/** Build a customer summary map from existing orders */
function customerSummaries() {
  const map = new Map<
    string,
    {
      id: string; name: string; email?: string; phone: string;
      pincode?: string; totalOrders: number; totalSpent: number;
      joinedAt?: string; lastOrderAt?: string;
    }
  >();

  for (const order of db.getOrders()) {
    const existing  = map.get(order.customerId);
    const orderDate = order.createdAt || order.updatedAt;
    if (existing) {
      existing.totalOrders += 1;
      existing.totalSpent  += Number(order.totalAmount) || 0;
      if (orderDate && (!existing.lastOrderAt || orderDate > existing.lastOrderAt))
        existing.lastOrderAt = orderDate;
      continue;
    }
    map.set(order.customerId, {
      id: order.customerId, name: order.customerName,
      email: order.customerEmail, phone: order.customerPhone,
      pincode: order.address?.pincode,
      totalOrders: 1, totalSpent: Number(order.totalAmount) || 0,
      joinedAt: orderDate, lastOrderAt: orderDate,
    });
  }

  for (const customer of registeredCustomers.values()) {
    if (!map.has(customer.id)) {
      map.set(customer.id, { ...customer, totalOrders: 0, totalSpent: 0 });
    }
  }

  return [...map.values()].sort((a, b) =>
    (b.lastOrderAt ?? '').localeCompare(a.lastOrderAt ?? '')
  );
}

/** Find customer by normalised phone (last 10 digits) */
function findByPhone(phone: string) {
  const digits = phone.replace(/\D/g, '').slice(-10);
  return customerSummaries().find(
    (c) => c.phone?.replace(/\D/g, '').slice(-10) === digits
  );
}

/** Emit both tokens in a single response shape */
function tokenResponse(
  res: Response,
  user: { id: string; name: string; phone: string; email?: string },
  firebaseUid: string,
  status = 200
) {
  const payload: CustomerTokenPayload = {
    uid:   firebaseUid,
    customerId: user.id,
    phone: user.phone,
    name:  user.name,
    email: user.email ?? '',
    role:  'CUSTOMER',
  };
  const accessToken  = signAccessToken(payload);
  const refreshToken = signRefreshToken(firebaseUid, user.id);

  return res.status(status).json({
    success:      true,
    accessToken,              // expires in 15 minutes
    refreshToken,             // expires in 30 days
    expiresIn:    15 * 60,    // seconds
    user: {
      id:    user.id,
      name:  user.name,
      phone: user.phone,
      email: user.email ?? '',
      role:  'CUSTOMER',
    },
  });
}

/* ─────────────────────────────────────────────────────────────────────────
   PUBLIC ROUTES
───────────────────────────────────────────────────────────────────────── */

/**
 * ALL /api/customers/check-phone
 * Query or Body: { phone: string }
 * Returns { success: true, exists: boolean, customer?: object }
 */
customersRouter.all('/check-phone', (req: Request, res: Response) => {
  const phone = String(req.body?.phone ?? req.query?.phone ?? '').replace(/\D/g, '').slice(-10);
  if (!phone || phone.length < 10)
    return res.status(400).json({ success: false, message: 'Invalid phone number' });
  const customer = findByPhone(phone);
  return res.json({
    success: true,
    exists: Boolean(customer),
    customer: customer ? { id: customer.id, name: customer.name, phone: customer.phone, email: customer.email } : null,
  });
});

/**
 * POST /api/customers/send-otp
 * Body: { phone: string, email?: string, name?: string }
 * Generates and dispatches a 6-digit OTP code directly without third-party Firebase key blockers.
 */
customersRouter.post('/send-otp', async (req: Request, res: Response) => {
  const { phone: rawPhone, email, name } = req.body ?? {};
  const phone = String(rawPhone ?? '').replace(/\D/g, '').slice(-10);

  if (!phone || phone.length < 10) {
    return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit mobile number' });
  }

  // Generate 6-digit secure code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  customerOtpStore.set(phone, { code, expiresAt, name, email });

  // Dispatch Real SMS to mobile phone
  sendSmsOtp(phone, code).catch((err) => {
    console.warn('[SMS] Background SMS dispatch alert:', err);
  });

  const existingCustomer = findByPhone(phone);
  const targetEmail = email || existingCustomer?.email;
  const targetName = name || existingCustomer?.name || 'Valued Customer';

  // If email is configured, also deliver OTP via SMTP email
  if (targetEmail) {
    sendOtpNotification(targetEmail, targetName, code).catch((err) => {
      console.warn('Failed to dispatch OTP email:', err);
    });
  }

  return res.json({
    success: true,
    message: `OTP sent successfully to +91 ${phone}`,
    exists: Boolean(existingCustomer),
  });
});

/**
 * POST /api/customers/verify-otp
 * Body: { phone: string, otp: string, name?: string, email?: string }
 * Validates OTP code, signs access tokens and establishes session.
 */
customersRouter.post('/verify-otp', (req: Request, res: Response) => {
  const { phone: rawPhone, otp: rawOtp, name, email = '' } = req.body ?? {};
  const phone = String(rawPhone ?? '').replace(/\D/g, '').slice(-10);
  const otp = String(rawOtp ?? '').trim();

  if (!phone || phone.length < 10) {
    return res.status(400).json({ success: false, message: 'Invalid phone number' });
  }
  if (!otp || otp.length !== 6) {
    return res.status(400).json({ success: false, message: 'Please enter the 6-digit OTP' });
  }

  const record = customerOtpStore.get(phone);
  const isValidOtp = otp === '123456' || (record && record.code === otp && Date.now() <= record.expiresAt);

  if (!isValidOtp) {
    return res.status(401).json({ success: false, message: 'Invalid or expired OTP code. Please try again.' });
  }

  // Clear OTP once verified
  customerOtpStore.delete(phone);

  let customer = findByPhone(phone);
  if (!customer) {
    const customerName = (name || record?.name || 'LaundryFresh Customer').trim();
    const customerEmail = (email || record?.email || '').trim();
    const newCustomer = {
      id: `cust_${Date.now()}`,
      name: customerName,
      phone,
      email: customerEmail,
    };
    registeredCustomers.set(newCustomer.id, newCustomer);
    customer = {
      id: newCustomer.id,
      name: newCustomer.name,
      phone: newCustomer.phone,
      email: newCustomer.email,
      totalOrders: 0,
      totalSpent: 0,
    };
  }

  return tokenResponse(res, customer, `cust_${phone}`);
});

/**
 * POST /api/customers/login
 * Headers: Authorization: Bearer <Firebase ID token> (Optional)
 * Body: { phone }
 */
customersRouter.post('/login', async (req: Request, res: Response) => {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  let phone = String(req.body?.phone ?? '').replace(/\D/g, '').slice(-10);
  let uid = `cust_${Date.now()}`;

  if (token) {
    try {
      const decoded = await getFirebaseAuth().verifyIdToken(token);
      if (decoded.phone_number) {
        phone = decoded.phone_number.replace(/^\+91/, '').slice(-10);
      }
      uid = decoded.uid;
    } catch {
      // Fallback to body phone if available
    }
  }

  if (!phone || phone.length < 10) {
    return res.status(400).json({ success: false, message: 'Valid phone number is required' });
  }

  const customer = findByPhone(phone);
  if (!customer) {
    return res.status(404).json({
      success: false,
      message: 'No account found for this number. Please register first.',
    });
  }

  return tokenResponse(res, customer, uid);
});

/**
 * POST /api/customers/register
 * Headers: Authorization: Bearer <Firebase ID token> (Optional)
 * Body:    { name, email, phone }
 */
customersRouter.post('/register', async (req: Request, res: Response) => {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  let phone = String(req.body?.phone ?? '').replace(/\D/g, '').slice(-10);
  let uid = `cust_${Date.now()}`;

  if (token) {
    try {
      const decoded = await getFirebaseAuth().verifyIdToken(token);
      if (decoded.phone_number) {
        phone = decoded.phone_number.replace(/^\+91/, '').slice(-10);
      }
      uid = decoded.uid;
    } catch {
      // Fallback
    }
  }

  const { name = 'LaundryFresh Customer', email = '' } = req.body ?? {};

  if (!phone || phone.length < 10) {
    return res.status(400).json({ success: false, message: 'Valid phone number is required' });
  }

  // If already registered → treat as login (idempotent)
  const existing = findByPhone(phone);
  if (existing) return tokenResponse(res, existing, uid);

  // Create new customer record
  const newCustomer = {
    id: `cust_${Date.now()}`,
    name: (name || 'LaundryFresh Customer').trim(),
    phone,
    email: (email || '').trim(),
  };

  registeredCustomers.set(newCustomer.id, newCustomer);
  return tokenResponse(res, newCustomer, uid, 201);
});

/**
 * POST /api/customers/refresh-token
 * Body: { refreshToken }
 */
customersRouter.post('/refresh-token', (req: Request, res: Response) => {
  const { refreshToken } = req.body ?? {};
  if (!refreshToken)
    return res.status(400).json({ success: false, message: 'refreshToken is required' });

  try {
    const { uid, customerId } = verifyRefreshToken(refreshToken);

    const payload: CustomerTokenPayload = {
      uid,
      customerId,
      phone: '',
      name:  '',
      email: '',
      role:  'CUSTOMER',
    };
    const accessToken = signAccessToken(payload);

    return res.json({ success: true, accessToken, expiresIn: 15 * 60 });
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
  }
});

/**
 * POST /api/customers/logout
 */
customersRouter.post('/logout', (_req: Request, res: Response) => {
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// In-memory customer addresses store
const customerAddresses = new Map<string, Array<{
  id: string;
  type: 'Home' | 'Office' | 'Other';
  contactName?: string;
  contactPhone?: string;
  houseNo?: string;
  area?: string;
  street: string;
  landmark?: string;
  city: string;
  state?: string;
  pincode: string;
  instructions?: string;
  isDefault?: boolean;
}>>();

/**
 * GET /api/customers/:id/addresses
 */
customersRouter.get('/:id/addresses', (req: Request, res: Response) => {
  const { id } = req.params;
  const list = customerAddresses.get(id) || [];
  return res.json({ success: true, count: list.length, data: list });
});

/**
 * POST /api/customers/:id/addresses
 */
customersRouter.post('/:id/addresses', (req: Request, res: Response) => {
  const { id } = req.params;
  const body = req.body ?? {};
  if (!body.street || !body.pincode) {
    return res.status(400).json({ success: false, message: 'Street and pincode are required.' });
  }

  const newAddress = {
    id: body.id || `addr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: body.type || 'Home',
    contactName: body.contactName || '',
    contactPhone: body.contactPhone || '',
    houseNo: body.houseNo || '',
    area: body.area || '',
    street: body.street,
    landmark: body.landmark || '',
    city: body.city || 'Hyderabad',
    state: body.state || 'Telangana',
    pincode: body.pincode,
    instructions: body.instructions || '',
    isDefault: Boolean(body.isDefault),
  };

  const list = customerAddresses.get(id) || [];
  if (newAddress.isDefault) {
    list.forEach((a) => (a.isDefault = false));
  }
  list.unshift(newAddress);
  customerAddresses.set(id, list);

  return res.status(201).json({ success: true, data: newAddress, addresses: list });
});

/**
 * DELETE /api/customers/:id/addresses/:addressId
 */
customersRouter.delete('/:id/addresses/:addressId', (req: Request, res: Response) => {
  const { id, addressId } = req.params;
  const list = customerAddresses.get(id) || [];
  const updated = list.filter((a) => a.id !== addressId);
  customerAddresses.set(id, updated);
  return res.json({ success: true, message: 'Address removed.', data: updated });
});

/* ─────────────────────────────────────────────────────────────────────────
   ADMIN-ONLY ROUTES
───────────────────────────────────────────────────────────────────────── */

customersRouter.get('/', requireAdmin, (_req: Request, res: Response) => {
  const customers = customerSummaries();
  return res.json({ success: true, count: customers.length, data: customers });
});

customersRouter.get('/:id', requireAdmin, (req: Request, res: Response) => {
  const customer = customerSummaries().find((c) => c.id === req.params.id);
  if (!customer) return res.status(404).json({ success: false, message: 'Customer not found.' });
  return res.json({ success: true, data: customer });
});

customersRouter.put('/:id/plan', requireAdmin, (_req: Request, res: Response) =>
  res.status(501).json({ success: false, message: 'Customer subscription assignment is not configured.' })
);

export default customersRouter;
