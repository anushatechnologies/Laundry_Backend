import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { verifyAccessToken } from '../../lib/customer-tokens';
import { requireConfiguredAdmin } from '../../middleware/admin';
import { applyReferral, getAdminReferrals, getReferralSummary, referralSettingsSchema, saveReferralSettings } from './service';

const router = Router();
export function referralCustomer(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : '';
    const identity = verifyAccessToken(token);
    if (!identity.customerId) throw new Error('Sign in required.');
    res.locals.customerId = identity.customerId;
    next();
  } catch { res.status(401).json({ success: false, message: 'Please sign in to use referrals.' }); }
}
router.get('/me', referralCustomer, async (_req, res) => {
  try { res.json({ success: true, data: await getReferralSummary(res.locals.customerId) }); }
  catch (error) {
    console.error('Referral summary unavailable:', error);
    res.status(503).json({ success: false, message: 'Referrals are unavailable. Please try again later.' });
  }
});
router.post('/apply', referralCustomer, async (req, res) => {
  const parsed = z.object({ code: z.string().trim().toUpperCase().regex(/^LF[A-F0-9]{16}$/) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Enter a valid invite code.' });
  try {
    await applyReferral(res.locals.customerId, parsed.data.code);
    res.json({ success: true, data: await getReferralSummary(res.locals.customerId) });
  } catch (error: any) {
    console.error('Referral application rejected:', error);
    res.status(error.code ? 503 : 409).json({ success: false, message: error.code ? 'Unable to save your invite. Please try later.' : error.message });
  }
});
router.get('/admin', requireConfiguredAdmin, async (_req, res) => {
  try { res.json({ success: true, data: await getAdminReferrals() }); }
  catch (error) {
    console.error('Referral admin unavailable:', error);
    res.status(503).json({ success: false, message: 'Unable to load referral records. Check the database migration.' });
  }
});
router.put('/admin/settings', requireConfiguredAdmin, async (req, res) => {
  const parsed = referralSettingsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues.map(issue => issue.message).join(' ') });
  try { res.json({ success: true, data: await saveReferralSettings(parsed.data) }); }
  catch (error) {
    console.error('Referral settings save failed:', error);
    res.status(503).json({ success: false, message: 'Settings could not be saved.' });
  }
});
export default router;
