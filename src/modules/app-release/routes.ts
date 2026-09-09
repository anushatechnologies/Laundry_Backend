import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { requireConfiguredAdmin } from '../../middleware/admin';
import {
  getLatestAppRelease,
  getAllAppReleases,
  recordAppRelease,
  tryUploadToS3,
} from './service';

const router = Router();

// Public: Get latest release metadata
router.get('/latest', async (_req: Request, res: Response) => {
  try {
    const release = await getLatestAppRelease();
    if (!release) {
      return res.status(404).json({ success: false, message: 'No app releases available yet.' });
    }
    res.json({ success: true, data: release });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Error fetching release info.' });
  }
});

// Public: Direct download stream of LaundryFresh.apk
router.get('/download', async (_req: Request, res: Response) => {
  try {
    const uploadsDir = path.join(process.cwd(), 'public/uploads');
    const apkPath = path.join(uploadsDir, 'LaundryFresh.apk');

    // Also check root workspace fallback
    const rootApkPath = path.join(process.cwd(), '../LaundryFresh.apk');

    const targetPath = fs.existsSync(apkPath)
      ? apkPath
      : fs.existsSync(rootApkPath)
      ? rootApkPath
      : null;

    if (!targetPath) {
      const latest = await getLatestAppRelease();
      if (latest?.fileUrl && latest.fileUrl.startsWith('http')) {
        return res.redirect(latest.fileUrl);
      }
      return res.status(404).json({
        success: false,
        message: 'No APK file uploaded on the server. Please upload an APK via the Admin Panel.',
      });
    }

    const stat = fs.statSync(targetPath);
    res.writeHead(200, {
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Length': stat.size,
      'Content-Disposition': 'attachment; filename="LaundryFresh.apk"',
      'Cache-Control': 'no-cache',
    });

    const readStream = fs.createReadStream(targetPath);
    readStream.pipe(res);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Error streaming APK.' });
  }
});

// Admin: View all release history
router.get('/history', requireConfiguredAdmin, async (_req: Request, res: Response) => {
  try {
    const releases = await getAllAppReleases();
    res.json({ success: true, data: releases });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Error fetching history.' });
  }
});

// Admin: Stream upload APK directly to disk (bypasses Vercel limits, zero memory spikes)
router.post('/upload', requireConfiguredAdmin, async (req: Request, res: Response) => {
  try {
    const versionName =
      (req.headers['x-version-name'] as string) ||
      (req.query.versionName as string) ||
      'v1.0.0';

    const rawVersionCode =
      (req.headers['x-version-code'] as string) ||
      (req.query.versionCode as string) ||
      '1';
    const versionCode = parseInt(rawVersionCode, 10) || 1;

    const rawNotes =
      (req.headers['x-release-notes'] as string) ||
      (req.query.releaseNotes as string) ||
      '';
    const releaseNotes = rawNotes ? decodeURIComponent(rawNotes) : '';

    const isForceUpdate =
      req.headers['x-force-update'] === '1' ||
      req.headers['x-force-update'] === 'true' ||
      req.query.isForceUpdate === 'true';

    const uploadsDir = path.join(process.cwd(), 'public/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const primaryTarget = path.join(uploadsDir, 'LaundryFresh.apk');
    const safeVersion = versionName.replace(/[^a-zA-Z0-9._-]/g, '');
    const versionedTarget = path.join(uploadsDir, `LaundryFresh-${safeVersion}.apk`);

    // Stream incoming raw request bytes directly to disk
    const writeStream = fs.createWriteStream(primaryTarget);

    let bytesWritten = 0;
    req.on('data', (chunk) => {
      bytesWritten += chunk.length;
    });

    req.pipe(writeStream);

    writeStream.on('error', (err) => {
      console.error('[AppRelease] Disk write error:', err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Failed to write APK to server disk.' });
      }
    });

    writeStream.on('finish', async () => {
      if (bytesWritten < 1024 * 100) {
        // Less than 100KB is not a valid Android APK
        if (fs.existsSync(primaryTarget)) {
          fs.unlinkSync(primaryTarget);
        }
        return res.status(400).json({
          success: false,
          message: 'Uploaded file is too small or corrupted to be a valid Android APK.',
        });
      }

      // Copy to versioned target as well
      try {
        fs.copyFileSync(primaryTarget, versionedTarget);
      } catch {
        // Ignore
      }

      // Record release in MySQL
      const release = await recordAppRelease({
        versionName,
        versionCode,
        fileName: 'LaundryFresh.apk',
        fileUrl: '/api/app-release/download',
        fileSizeBytes: bytesWritten,
        releaseNotes,
        isForceUpdate,
      });

      // Background upload to S3 if configured
      void tryUploadToS3(primaryTarget, 'LaundryFresh.apk').catch(() => {});

      console.log(`[AppRelease] New APK uploaded: ${versionName} (${(bytesWritten / (1024 * 1024)).toFixed(2)} MB)`);

      res.json({
        success: true,
        message: `APK ${versionName} successfully uploaded and published!`,
        data: release,
      });
    });
  } catch (err: any) {
    console.error('[AppRelease] Upload handler error:', err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: err?.message || 'Server error uploading APK.' });
    }
  }
});

export default router;
