import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { verifyAccessToken } from '../../lib/customer-tokens';
import { requireConfiguredAdmin } from '../../middleware/admin';
import {
  applyReferral,
  detectReferralFromIp,
  getAdminReferrals,
  getReferralSettings,
  getReferralSummary,
  referralSettingsSchema,
  saveReferralSettings,
  trackReferralClick,
} from './service';

const router = Router();

// Public: Get dynamic referral program settings (used by mobile app for guests and users)
router.get('/config', async (req: Request, res: Response) => {
  try {
    const settings = await getReferralSettings();
    return res.json({
      success: true,
      enabled: settings.enabled,
      referrerReward: settings.referrerReward,
      friendReward: settings.friendReward,
      minimumFirstOrder: settings.minimumFirstOrder,
      shareUrl: settings.shareUrl || 'https://laundry.anushatechnologies.com/api/referrals/click',
    });
  } catch (error) {
    return res.json({
      success: true,
      enabled: true,
      referrerReward: 100,
      friendReward: 50,
      minimumFirstOrder: 0,
      shareUrl: 'https://laundry.anushatechnologies.com/api/referrals/click',
    });
  }
});

// Public: Handle referral link click (records IP and redirects directly to APK download)
router.get('/click/:code', async (req: Request, res: Response) => {
  try {
    const code = req.params.code?.trim().toUpperCase();
    const rawIp = req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket.remoteAddress || '';
    const ip = rawIp.replace(/^::ffff:/, '');
    if (code && ip) {
      await trackReferralClick(ip, code, req.headers['user-agent']);
    }
    const settings = await getReferralSettings().catch(() => null);
    const downloadUrl = (settings?.shareUrl && settings.shareUrl.endsWith('.apk'))
      ? settings.shareUrl
      : 'https://laundry.anushatechnologies.com/api/app-release/latest.apk';
    return res.redirect(downloadUrl);
  } catch (err) {
    return res.redirect('https://laundry.anushatechnologies.com/api/app-release/latest.apk');
  }
});

// Public: Mobile app checks if current device IP recently clicked a referral link (deferred deep linking)
router.get('/detect-install', async (req, res) => {
  try {
    const rawIp = req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket.remoteAddress || '';
    const ip = rawIp.replace(/^::ffff:/, '');
    const result = await detectReferralFromIp(ip);
    if (result) {
      res.json({ success: true, detected: true, referralCode: result.code, bonus: result.bonus });
    } else {
      res.json({ success: true, detected: false });
    }
  } catch (error) {
    res.json({ success: true, detected: false });
  }
});

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
  const parsed = z.object({ code: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{4,20}$/) }).safeParse(req.body);
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
