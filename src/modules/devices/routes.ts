import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { verifyAccessToken } from '../../lib/customer-tokens';
import { registerMobileDevice, removeMobileDevice } from '../../lib/push';

const router = Router();

const registerSchema = z.object({
  pushToken: z.string().trim().min(20).max(255),
  provider: z.literal('EXPO').default('EXPO'),
  platform: z.enum(['android', 'ios']).default('android'),
});

function customerFromRequest(req: Request, res: Response) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) {
    res.status(401).json({ success: false, message: 'Customer sign-in is required.' });
    return null;
  }
  try {
    const customer = verifyAccessToken(token);
    if (!customer.customerId) {
      res.status(401).json({ success: false, message: 'Customer session is incomplete.' });
      return null;
    }
    return customer;
  } catch {
    res.status(401).json({ success: false, message: 'Customer session expired. Please sign in again.' });
    return null;
  }
}

router.post('/register', async (req: Request, res: Response) => {
  const customer = customerFromRequest(req, res);
  if (!customer) return;
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'A valid device push token is required.' });
  }
  try {
    await registerMobileDevice({
      customerId: customer.customerId!,
      pushToken: parsed.data.pushToken,
      provider: parsed.data.provider,
      platform: parsed.data.platform,
    });
    return res.status(201).json({ success: true, data: { registered: true } });
  } catch (error) {
    console.error('Mobile device registration error:', error);
    return res.status(500).json({ success: false, message: 'The device could not be registered for order updates.' });
  }
});

router.delete('/register', async (req: Request, res: Response) => {
  const customer = customerFromRequest(req, res);
  if (!customer) return;
  const pushToken = String(req.body?.pushToken || '').trim();
  if (!pushToken) return res.status(400).json({ success: false, message: 'A device push token is required.' });
  await removeMobileDevice(customer.customerId!, pushToken);
  return res.json({ success: true, data: { removed: true } });
});

export default router;
