import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { verifyAccessToken } from '../../lib/customer-tokens';
import {
  createTopupOrder,
  getWallet,
  verifyTopupPayment,
} from './service';

const router = Router();

function requireCustomer(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : '';
    const identity = verifyAccessToken(token);
    if (!identity.customerId) throw new Error('Sign in required.');
    res.locals.customerId = identity.customerId;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Please sign in to access your wallet.' });
  }
}

// GET /api/wallet - Get current customer wallet balance and transactions
router.get('/', requireCustomer, async (_req: Request, res: Response) => {
  try {
    const wallet = await getWallet(res.locals.customerId);
    res.json({ success: true, data: wallet });
  } catch (error: any) {
    console.error('Wallet fetch error:', error);
    res.status(500).json({ success: false, message: error.message || 'Could not load wallet.' });
  }
});

// POST /api/wallet/topup/create-order - Create Razorpay order for wallet top-up
router.post('/topup/create-order', requireCustomer, async (req: Request, res: Response) => {
  const schema = z.object({
    amount: z.number().finite().min(10).max(50000),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid top-up amount between ₹10 and ₹50,000.',
    });
  }

  try {
    const order = await createTopupOrder(res.locals.customerId, parsed.data.amount);
    res.json({ success: true, data: order });
  } catch (error: any) {
    console.error('Wallet topup order error:', error);
    res.status(500).json({ success: false, message: error.message || 'Could not initiate top-up.' });
  }
});

// POST /api/wallet/topup/verify - Verify Razorpay payment and credit wallet
router.post('/topup/verify', requireCustomer, async (req: Request, res: Response) => {
  const schema = z.object({
    razorpay_order_id: z.string().trim().min(1),
    razorpay_payment_id: z.string().trim().min(1),
    razorpay_signature: z.string().trim().min(1),
    amount: z.number().finite().min(10),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Invalid payment confirmation data.',
    });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = parsed.data;
    const wallet = await verifyTopupPayment(
      res.locals.customerId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount
    );
    res.json({
      success: true,
      message: `₹${amount.toFixed(2)} added to your wallet successfully!`,
      data: wallet,
    });
  } catch (error: any) {
    console.error('Wallet topup verification error:', error);
    res.status(400).json({ success: false, message: error.message || 'Payment verification failed.' });
  }
});

export default router;
