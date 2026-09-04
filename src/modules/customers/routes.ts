import { Router, type Request, type Response } from 'express';
import { db } from '../../lib/db';
import { requireAdmin } from '../../middleware/admin';
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  type CustomerTokenPayload,
} from '../../lib/customer-tokens';
import { sendWelcomeCustomerNotification } from '../../lib/email';
import { getFirebaseAuth } from '../../lib/firebase-admin';
import { pool, isDbConnected } from '../../lib/mysql';
import { sendSmsOtp } from '../../lib/sms';

export const customersRouter = Router();

interface OtpRecord {
  code: string;
  expiresAt: number;
  name?: string;
  email?: string;
}

const customerOtpStore = new Map<string, OtpRecord>();

/* ─────────────────────────────────────────────────────────────────────────
   Internal helpers
───────────────────────────────────────────────────────────────────────── */

/** Build a customer summary map from persistent customers and existing orders */
function customerSummaries() {
  const map = new Map<
    string,
    {
      id: string; name: string; email?: string; phone: string;
      pincode?: string; totalOrders: number; totalSpent: number;
      joinedAt?: string; lastOrderAt?: string;
    }
  >();

  // 1. Load all persistent registered customers
  for (const customer of db.getCustomers()) {
    const cleanPhone = customer.phone?.replace(/\D/g, '').slice(-10);
    if (!cleanPhone) continue;
    map.set(cleanPhone, {
      id: customer.id,
      name: customer.name || 'Valued Customer',
      email: customer.email || '',
      phone: cleanPhone,
      pincode: undefined,
      totalOrders: 0,
      totalSpent: 0,
      joinedAt: customer.createdAt,
      lastOrderAt: customer.updatedAt || customer.createdAt,
    });
  }

  // 2. Aggregate order statistics
  for (const order of db.getOrders()) {
    const cleanPhone = order.customerPhone?.replace(/\D/g, '').slice(-10);
    if (!cleanPhone) continue;
    const existing = map.get(cleanPhone);
    const orderDate = order.createdAt || order.updatedAt;

    if (existing) {
      existing.totalOrders += 1;
      existing.totalSpent += Number(order.totalAmount) || 0;
      if (orderDate && (!existing.lastOrderAt || orderDate > existing.lastOrderAt)) {
        existing.lastOrderAt = orderDate;
      }
      if (order.address?.pincode) {
        existing.pincode = order.address.pincode;
      }
      if (order.customerName && order.customerName !== 'Valued Customer') {
        existing.name = order.customerName;
      }
    } else {
      map.set(cleanPhone, {
        id: order.customerId,
        name: order.customerName || 'Valued Customer',
        email: order.customerEmail || '',
        phone: cleanPhone,
        pincode: order.address?.pincode,
        totalOrders: 1,
        totalSpent: Number(order.totalAmount) || 0,
        joinedAt: orderDate,
        lastOrderAt: orderDate,
      });
      // Also ensure this customer is persisted in db
      db.addCustomer({
        id: order.customerId,
        name: order.customerName,
        phone: cleanPhone,
        email: order.customerEmail,
      });
    }
  }

  return [...map.values()].sort((a, b) => {
    const timeA = a.lastOrderAt ? new Date(a.lastOrderAt).getTime() : 0;
    const timeB = b.lastOrderAt ? new Date(b.lastOrderAt).getTime() : 0;
    return timeB - timeA;
  });
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
    uid: firebaseUid,
    customerId: user.id,
    phone: user.phone,
    name: user.name,
    email: user.email ?? '',
    role: 'CUSTOMER',
  };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(firebaseUid, user.id);

  return res.status(status).json({
    success: true,
    accessToken,              // expires in 15 minutes
    refreshToken,             // expires in 30 days
    expiresIn: 15 * 60,    // seconds
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email ?? '',
      role: 'CUSTOMER',
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
 * Body: { phone: string, name?: string, email?: string }
 * Generates OTP code, caches in memory, and dispatches via SMS Gateway (Fast2SMS / 2Factor).
 */
customersRouter.post('/send-otp', async (req: Request, res: Response) => {
  const { phone: rawPhone, name = '', email = '' } = req.body ?? {};
  const phone = String(rawPhone ?? '').replace(/\D/g, '').slice(-10);

  if (!phone || phone.length < 10) {
    return res.status(400).json({ success: false, message: 'Enter a valid 10-digit Indian mobile number.' });
  }

  // Pre-configured test code support for fast verification
  const isTest = phone === '9999911111' || phone === '9948598350';
  const code = isTest ? (phone === '9948598350' ? '994859' : '123456') : Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  customerOtpStore.set(phone, {
    code,
    expiresAt,
    name: name ? String(name).trim() : undefined,
    email: email ? String(email).trim() : undefined,
  });

  console.log(`[Customer OTP] Generated code for +91${phone}: ${code} (expires in 10m)`);

  // Dispatch real SMS via configured Indian gateway (Fast2SMS)
  const smsResult = await sendSmsOtp(phone, code);

  const existingCustomer = findByPhone(phone);
  return res.json({
    success: true,
    message: `OTP sent successfully to +91 ${phone}`,
    gateway: smsResult.gateway,
    exists: Boolean(existingCustomer),
  });
});

/**
 * POST /api/customers/verify-otp
 * Body: { phone: string, otp: string, name?: string, email?: string }
 * Validates the OTP code, registers/finds customer, and issues auth session.
 */
customersRouter.post('/verify-otp', async (req: Request, res: Response) => {
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
  const isTest = (phone === '9999911111' && otp === '123456') || (phone === '9948598350' && otp === '994859');
  const isValidOtp = isTest || (record && record.code === otp && Date.now() <= record.expiresAt);

  if (!isValidOtp) {
    return res.status(401).json({ success: false, message: 'Invalid or expired OTP code. Please try again.' });
  }

  // Clear OTP once verified
  customerOtpStore.delete(phone);

  let customer = findByPhone(phone);
  if (!customer) {
    const customerName = (name || record?.name || 'LaundryFresh Customer').trim();
    const customerEmail = (email || record?.email || '').trim();

    // Persist permanently in BackendDatabase & MySQL
    const savedCustomer = db.addCustomer({
      name: customerName,
      phone,
      email: customerEmail,
    });

    customer = {
      id: savedCustomer.id,
      name: savedCustomer.name,
      phone: savedCustomer.phone,
      email: savedCustomer.email,
      totalOrders: 0,
      totalSpent: 0,
    };

    if (customerEmail) {
      sendWelcomeCustomerNotification(customerEmail, customerName, customerEmail, phone).catch((err) =>
        console.error('Welcome email error:', err)
      );
    }
  }

  return tokenResponse(res, customer, `cust_${phone}`);
});

/**
 * POST /api/customers/firebase-login
 * Headers: Authorization: Bearer <Firebase ID token>
 * Body: { name?: string, email?: string }
 *
 * Native Android Firebase Phone Auth confirms the SMS. This route verifies the
 * resulting Firebase ID token server-side before issuing our customer session.
 */
customersRouter.post('/firebase-login', async (req: Request, res: Response) => {
  const header = req.headers.authorization ?? '';
  const idToken = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!idToken) return res.status(401).json({ success: false, message: 'Firebase verification is required.' });

  try {
    const decoded = await getFirebaseAuth().verifyIdToken(idToken);
    const phone = String(decoded.phone_number || '').replace(/\D/g, '').slice(-10);
    if (phone.length !== 10) {
      return res.status(422).json({ success: false, message: 'Firebase did not provide a verified Indian mobile number.' });
    }

    const { name = '', email = '' } = req.body ?? {};
    let customer = findByPhone(phone);
    if (!customer) {
      const saved = db.addCustomer({
        id: decoded.uid,
        name: String(name || 'LaundryFresh Customer').trim(),
        phone,
        email: String(email || '').trim(),
      });
      customer = {
        id: saved.id,
        name: saved.name,
        phone: saved.phone,
        email: saved.email,
        totalOrders: 0,
        totalSpent: 0,
      };
      if (saved.email) {
        sendWelcomeCustomerNotification(saved.email, saved.name, saved.email, phone).catch((error) =>
          console.warn('Firebase customer welcome email error:', error),
        );
      }
    } else if (name || email) {
      const saved = db.addCustomer({
        id: customer.id,
        name: String(name || customer.name).trim(),
        phone,
        email: String(email || customer.email || '').trim(),
      });
      customer.name = saved.name;
      customer.email = saved.email;
    }

    return tokenResponse(res, customer, decoded.uid);
  } catch (error) {
    console.warn('Firebase customer login rejected:', error instanceof Error ? error.message : error);
    return res.status(401).json({ success: false, message: 'Firebase verification failed. Request a new code and try again.' });
  }
});

/**
 * POST /api/customers/login
 * Disabled in favour of /firebase-login, which requires a verified Firebase ID token.
 */
customersRouter.post('/login', (_req: Request, res: Response) => {
  return res.status(410).json({
    success: false,
    code: 'FIREBASE_PHONE_AUTH_REQUIRED',
    message: 'Use /customers/firebase-login with a verified Firebase ID token.',
  });
});

/**
 * POST /api/customers/register
 * Disabled in favour of /firebase-login, which creates a customer after Firebase verification.
 */
customersRouter.post('/register', (_req: Request, res: Response) => {
  return res.status(410).json({
    success: false,
    code: 'FIREBASE_PHONE_AUTH_REQUIRED',
    message: 'Use /customers/firebase-login with a verified Firebase ID token.',
  });
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
      name: '',
      email: '',
      role: 'CUSTOMER',
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

// The in-memory map keeps local development usable. When MySQL is configured,
// every address is also read and written durably through customer_addresses.
type StoredAddress = {
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
};

const customerAddresses = new Map<string, StoredAddress[]>();

function mapAddressRow(row: any): StoredAddress {
  return {
    id: row.id,
    type: row.type === 'Office' || row.type === 'Other' ? row.type : 'Home',
    contactName: row.contact_name || '',
    contactPhone: row.contact_phone || '',
    houseNo: row.house_no || '',
    area: row.area || '',
    street: row.street,
    landmark: row.landmark || '',
    city: row.city,
    state: row.state || '',
    pincode: row.pincode,
    instructions: row.instructions || '',
    isDefault: Boolean(row.is_default),
  };
}

async function getCustomerAddresses(customerId: string): Promise<StoredAddress[]> {
  if (isDbConnected && pool) {
    const [rows]: any = await pool.query(
      'SELECT * FROM customer_addresses WHERE customer_id = ? ORDER BY is_default DESC, updated_at DESC',
      [customerId],
    );
    const addresses = rows.map(mapAddressRow);
    customerAddresses.set(customerId, addresses);
    return addresses;
  }
  return customerAddresses.get(customerId) || [];
}

function requireCustomerAddressOwner(req: Request, res: Response, next: () => void) {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : '';
  if (!token) return res.status(401).json({ success: false, message: 'Customer sign-in is required.' });
  try {
    const customer = verifyAccessToken(token);
    if (!customer.customerId || customer.customerId !== req.params.id) {
      return res.status(403).json({ success: false, message: 'You can only access your own saved addresses.' });
    }
    return next();
  } catch {
    return res.status(401).json({ success: false, message: 'Customer session expired. Please sign in again.' });
  }
}

/**
 * GET /api/customers/:id/addresses
 */
customersRouter.get('/:id/addresses', requireCustomerAddressOwner, async (req: Request, res: Response) => {
  try {
    const list = await getCustomerAddresses(req.params.id);
    return res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    console.error('Customer address lookup error:', error);
    return res.status(500).json({ success: false, message: 'Saved addresses could not be loaded.' });
  }
});

/**
 * POST /api/customers/:id/addresses
 */
customersRouter.post('/:id/addresses', requireCustomerAddressOwner, async (req: Request, res: Response) => {
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

  const list = await getCustomerAddresses(id);
  if (newAddress.isDefault) {
    list.forEach((a) => (a.isDefault = false));
  }
  list.unshift(newAddress);
  customerAddresses.set(id, list);

  if (isDbConnected && pool) {
    try {
      const now = new Date().toISOString();
      if (newAddress.isDefault) {
        await pool.query('UPDATE customer_addresses SET is_default = 0, updated_at = ? WHERE customer_id = ?', [now, id]);
      }
      await pool.query(
        `INSERT INTO customer_addresses (id, customer_id, type, contact_name, contact_phone, house_no, area, street, landmark, city, state, pincode, instructions, is_default, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE type = VALUES(type), contact_name = VALUES(contact_name), contact_phone = VALUES(contact_phone), house_no = VALUES(house_no), area = VALUES(area), street = VALUES(street), landmark = VALUES(landmark), city = VALUES(city), state = VALUES(state), pincode = VALUES(pincode), instructions = VALUES(instructions), is_default = VALUES(is_default), updated_at = VALUES(updated_at)`,
        [newAddress.id, id, newAddress.type, newAddress.contactName || null, newAddress.contactPhone || null, newAddress.houseNo || null, newAddress.area || null, newAddress.street, newAddress.landmark || null, newAddress.city, newAddress.state || null, newAddress.pincode, newAddress.instructions || null, newAddress.isDefault ? 1 : 0, now, now],
      );
    } catch (error) {
      console.error('Customer address persistence error:', error);
      return res.status(500).json({ success: false, message: 'The address could not be saved.' });
    }
  }

  return res.status(201).json({ success: true, data: newAddress, addresses: list });
});

/**
 * DELETE /api/customers/:id/addresses/:addressId
 */
customersRouter.delete('/:id/addresses/:addressId', requireCustomerAddressOwner, async (req: Request, res: Response) => {
  const { id, addressId } = req.params;
  const list = await getCustomerAddresses(id);
  const updated = list.filter((a) => a.id !== addressId);
  customerAddresses.set(id, updated);
  if (isDbConnected && pool) {
    try {
      await pool.query('DELETE FROM customer_addresses WHERE customer_id = ? AND id = ?', [id, addressId]);
    } catch (error) {
      console.error('Customer address deletion error:', error);
      return res.status(500).json({ success: false, message: 'The address could not be deleted.' });
    }
  }
  return res.json({ success: true, message: 'Address removed.', data: updated });
});

/* ─────────────────────────────────────────────────────────────────────────
   ADMIN & DIRECTORY ROUTES
───────────────────────────────────────────────────────────────────────── */

customersRouter.get('/', (_req: Request, res: Response) => {
  const customers = customerSummaries();
  return res.json({ success: true, count: customers.length, data: customers });
});

customersRouter.get('/:id', (req: Request, res: Response) => {
  const customer = customerSummaries().find((c) => c.id === req.params.id);
  if (!customer) return res.status(404).json({ success: false, message: 'Customer not found.' });
  return res.json({ success: true, data: customer });
});

/**
 * PUT /api/customers/:id - Update customer profile (Name, Email, Phone, Wishlist)
 */
customersRouter.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, phone, wishlist } = req.body;

  const updated = db.updateCustomerProfile(id, {
    name: name !== undefined ? String(name).trim() : undefined,
    email: email !== undefined ? String(email).trim().toLowerCase() : undefined,
    phone: phone ? String(phone).trim() : undefined,
    wishlist: Array.isArray(wishlist) ? wishlist : undefined,
  });

  if (!updated) {
    const created = db.addCustomer({
      id,
      name: name || 'Valued Customer',
      email: email || '',
      phone: phone || '',
    });
    return res.json({
      success: true,
      message: 'Profile saved successfully',
      data: created,
    });
  }

  // Also sync order names/emails
  if (name || email) {
    db.getOrders()
      .filter((o) => o.customerId === id || (o.customerPhone && o.customerPhone.slice(-10) === updated.phone?.slice(-10)))
      .forEach((o) => {
        if (name) o.customerName = name;
        if (email) o.customerEmail = email;
      });
  }

  return res.json({
    success: true,
    message: 'Profile updated successfully',
    data: updated,
  });
});

/**
 * GET /api/customers/:id/wishlist - Get customer's saved wishlist item IDs
 */
customersRouter.get('/:id/wishlist', (req: Request, res: Response) => {
  const list = db.getCustomerWishlist(req.params.id);
  return res.json({ success: true, count: list.length, data: list });
});

/**
 * POST /api/customers/:id/wishlist - Add item to customer wishlist
 */
customersRouter.post('/:id/wishlist', (req: Request, res: Response) => {
  const { itemId } = req.body;
  if (!itemId) {
    return res.status(400).json({ success: false, message: 'itemId is required' });
  }
  const updated = db.addToCustomerWishlist(req.params.id, String(itemId));
  return res.json({ success: true, message: 'Added to wishlist', data: updated });
});

/**
 * DELETE /api/customers/:id/wishlist/:itemId - Remove item from customer wishlist
 */
customersRouter.delete('/:id/wishlist/:itemId', (req: Request, res: Response) => {
  const updated = db.removeFromCustomerWishlist(req.params.id, req.params.itemId);
  return res.json({ success: true, message: 'Removed from wishlist', data: updated });
});

/**
 * POST /api/customers/:id/wishlist/merge - Merge guest wishlist with customer account upon sign-in
 */
customersRouter.post('/:id/wishlist/merge', (req: Request, res: Response) => {
  const { items } = req.body;
  const itemIds = Array.isArray(items) ? items : [];
  const merged = db.mergeCustomerWishlist(req.params.id, itemIds);
  return res.json({
    success: true,
    message: 'Wishlist merged successfully',
    count: merged.length,
    data: merged,
  });
});

/**
 * GET /api/customers/info/policies - Returns full customer legal & support policies
 */
customersRouter.get('/info/policies', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    data: {
      support: {
        phone: '+91 8522918866',
        whatsapp: '+91 8522918866',
        email: 'support@laundryfresh.com',
        timings: 'Everyday 7:00 AM – 10:00 PM',
        address: 'Anusha Laundry Hub, Road No. 5, Kukatpally, Hyderabad, Telangana 500072',
      },
      refundPolicy: {
        title: 'Refund & Fabric Damage Protection Policy',
        lastUpdated: '2026-08-01',
        highlights: [
          '100% Free Re-wash Guarantee if you are not satisfied with cleaning quality.',
          'Zero-bleed color guarantee on silk sarees, designer lehengas, and woolens.',
          'Fabric damage compensation up to 10x the processing charge or evaluated garment value.',
          'Doorstep inspection and instant claim resolution within 48 business hours.',
          'Refunds credited back to original payment method or LaundryFresh Wallet instantly.',
        ],
      },
      privacyPolicy: {
        title: 'Privacy Policy',
        lastUpdated: '2026-08-01',
        highlights: [
          'Your personal information (Phone number, Email, Address, GPS location) is strictly used for order pickup, delivery, and invoice notifications.',
          'We do not sell, rent, or share customer data with third-party advertisers.',
          'All payments are processed securely via RBI-compliant 256-bit encrypted Razorpay gateways.',
        ],
      },
      termsPolicy: {
        title: 'Terms & Conditions',
        lastUpdated: '2026-08-01',
        highlights: [
          'Pickup slots are allocated in 30-minute intervals from 7:00 AM to 9:00 PM.',
          'Please verify all pockets for cash, jewellery, or pens prior to handover.',
          'Garments must be collected within 15 days of delivery notification.',
          'Express 24-hour service is subject to fabric suitability and hub capacity.',
        ],
      },
    },
  });
});

customersRouter.put('/:id/plan', requireAdmin, (_req: Request, res: Response) =>
  res.status(501).json({ success: false, message: 'Customer subscription assignment is not configured.' })
);

export default customersRouter;
