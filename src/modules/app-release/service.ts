import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { pool } from '../../lib/mysql';

export interface AppRelease {
  id: string;
  versionName: string;
  versionCode: number;
  fileName: string;
  fileUrl: string;
  fileSizeBytes: number;
  releaseNotes?: string;
  isForceUpdate: boolean;
  isActive: boolean;
  createdAt: string;
}

let tableInitialized = false;

export async function ensureAppReleasesTable(): Promise<void> {
  if (tableInitialized || !pool) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS app_releases (
        id VARCHAR(36) PRIMARY KEY,
        version_name VARCHAR(64) NOT NULL,
        version_code INT NOT NULL DEFAULT 1,
        file_name VARCHAR(255) NOT NULL,
        file_url VARCHAR(512) NOT NULL,
        file_size_bytes BIGINT NOT NULL DEFAULT 0,
        release_notes TEXT,
        is_force_update BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP(3)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    tableInitialized = true;
  } catch (err) {
    console.warn('[AppRelease] Failed to verify app_releases table:', err);
  }
}

export async function getLatestAppRelease(): Promise<AppRelease | null> {
  await ensureAppReleasesTable();
  if (pool) {
    try {
      const [rows]: any = await pool.query(
        `SELECT id, version_name AS versionName, version_code AS versionCode,
                file_name AS fileName, file_url AS fileUrl,
                file_size_bytes AS fileSizeBytes, release_notes AS releaseNotes,
                is_force_update AS isForceUpdate, is_active AS isActive,
                created_at AS createdAt
         FROM app_releases
         WHERE is_active = TRUE
         ORDER BY created_at DESC
         LIMIT 1`
      );
      if (rows && rows[0]) {
        return {
          ...rows[0],
          isForceUpdate: Boolean(rows[0].isForceUpdate),
          isActive: Boolean(rows[0].isActive),
          createdAt: typeof rows[0].createdAt === 'string' ? rows[0].createdAt : new Date(rows[0].createdAt).toISOString(),
        };
      }
    } catch (err) {
      console.warn('[AppRelease] Could not query latest release from DB:', err);
    }
  }

  // Fallback: check if physical LaundryFresh.apk exists on disk
  const defaultApkPath = path.join(process.cwd(), 'public/uploads/LaundryFresh.apk');
  if (fs.existsSync(defaultApkPath)) {
    const stat = fs.statSync(defaultApkPath);
    return {
      id: 'default',
      versionName: 'v1.0.12',
      versionCode: 12,
      fileName: 'LaundryFresh.apk',
      fileUrl: '/api/app-release/download',
      fileSizeBytes: stat.size,
      releaseNotes: 'Production Android release with instant referral cash & distance calculation.',
      isForceUpdate: false,
      isActive: true,
      createdAt: stat.mtime.toISOString(),
    };
  }

  return null;
}

export async function getAllAppReleases(): Promise<AppRelease[]> {
  await ensureAppReleasesTable();
  if (!pool) return [];
  try {
    const [rows]: any = await pool.query(
      `SELECT id, version_name AS versionName, version_code AS versionCode,
              file_name AS fileName, file_url AS fileUrl,
              file_size_bytes AS fileSizeBytes, release_notes AS releaseNotes,
              is_force_update AS isForceUpdate, is_active AS isActive,
              created_at AS createdAt
       FROM app_releases
       ORDER BY created_at DESC`
    );
    return (rows || []).map((r: any) => ({
      ...r,
      isForceUpdate: Boolean(r.isForceUpdate),
      isActive: Boolean(r.isActive),
      createdAt: typeof r.createdAt === 'string' ? r.createdAt : new Date(r.createdAt).toISOString(),
    }));
  } catch (err) {
    console.warn('[AppRelease] Could not query release history:', err);
    return [];
  }
}

export async function recordAppRelease(data: {
  versionName: string;
  versionCode: number;
  fileName: string;
  fileUrl: string;
  fileSizeBytes: number;
  releaseNotes?: string;
  isForceUpdate?: boolean;
}): Promise<AppRelease> {
  await ensureAppReleasesTable();
  const id = crypto.randomUUID();
  const release: AppRelease = {
    id,
    versionName: data.versionName || 'v1.0.0',
    versionCode: data.versionCode || 1,
    fileName: data.fileName || 'LaundryFresh.apk',
    fileUrl: data.fileUrl || '/api/app-release/download',
    fileSizeBytes: data.fileSizeBytes || 0,
    releaseNotes: data.releaseNotes || '',
    isForceUpdate: Boolean(data.isForceUpdate),
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  if (pool) {
    try {
      await pool.query(
        `INSERT INTO app_releases
         (id, version_name, version_code, file_name, file_url, file_size_bytes, release_notes, is_force_update, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE, UTC_TIMESTAMP(3))`,
        [
          release.id,
          release.versionName,
          release.versionCode,
          release.fileName,
          release.fileUrl,
          release.fileSizeBytes,
          release.releaseNotes,
          release.isForceUpdate ? 1 : 0,
        ]
      );
    } catch (err) {
      console.warn('[AppRelease] Could not persist release record to DB:', err);
    }
  }

  return release;
}

/**
 * Optional background upload to AWS S3 if credentials are active in .env
 */
export async function tryUploadToS3(filePath: string, s3Key = 'LaundryFresh.apk'): Promise<string | null> {
  const bucket = process.env.AWS_S3_BUCKET_NAME;
  const region = process.env.AWS_REGION || 'ap-south-1';
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!bucket || !accessKeyId || !secretAccessKey) {
    return null;
  }

  try {
    const s3 = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });

    const fileStream = fs.createReadStream(filePath);
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: s3Key,
        Body: fileStream,
        ContentType: 'application/vnd.android.package-archive',
      })
    );

    const s3Url = `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;
    console.log(`[AppRelease] APK successfully uploaded to S3: ${s3Url}`);
    return s3Url;
  } catch (err) {
    console.warn('[AppRelease] Background S3 upload skipped or failed:', err);
    return null;
  }
}
