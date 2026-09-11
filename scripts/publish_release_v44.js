const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const BUCKET = process.env.AWS_S3_BUCKET_NAME || 'anjanilaundry';
const REGION = process.env.AWS_REGION || 'ap-south-2';

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function publishRelease() {
  const apkPath = path.join(__dirname, '../../LaundryFresh-v1.0.44-release.apk');
  if (!fs.existsSync(apkPath)) {
    console.error('APK file not found at:', apkPath);
    process.exit(1);
  }

  const stat = fs.statSync(apkPath);
  const s3Key = 'releases/LaundryFresh-v1.0.44-release.apk';
  const s3Url = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${s3Key}`;
  console.log(`Reading APK: ${apkPath} (${(stat.size / (1024 * 1024)).toFixed(2)} MB)...`);

  const fileBuffer = fs.readFileSync(apkPath);

  console.log(`Uploading to AWS S3: s3://${BUCKET}/${s3Key}...`);
  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: 'application/vnd.android.package-archive',
      })
    );
    console.log(`✓ S3 Upload Successful: ${s3Url}`);
  } catch (err) {
    console.error('S3 upload error:', err);
    process.exit(1);
  }

  // Also upload latest alias
  try {
    console.log(`Uploading latest alias s3://${BUCKET}/releases/LaundryFresh.apk...`);
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: 'releases/LaundryFresh.apk',
        Body: fileBuffer,
        ContentType: 'application/vnd.android.package-archive',
      })
    );
    console.log(`✓ Latest alias uploaded to S3`);
  } catch (err) {
    console.warn('Latest alias S3 error:', err.message);
  }

  console.log('Connecting to RDS MySQL to record release...');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const releaseId = crypto.randomUUID();
  const versionName = 'v1.0.44';
  const versionCode = 44;
  const fileName = 'LaundryFresh-v1.0.44-release.apk';
  const releaseNotes = 'v1.0.44: High-contrast PDF invoice buttons in Light/System mode, direct file download to Android device storage, Android back gesture/button dismiss for Profile & Settings modals, and single-tap Zepto-style search discovery UI.';

  await connection.execute(
    `INSERT INTO app_releases 
     (id, version_name, version_code, file_name, file_url, file_size_bytes, release_notes, is_force_update, is_active, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE, UTC_TIMESTAMP(3))`,
    [
      releaseId,
      versionName,
      versionCode,
      fileName,
      s3Url,
      stat.size,
      releaseNotes,
      0,
    ]
  );

  console.log(`✓ Recorded in database! Version: ${versionName} (code ${versionCode})`);
  await connection.end();

  console.log('\n========================================');
  console.log('RELEASE v1.0.44 PUBLISHED TO AWS SUCCESSFULLY!');
  console.log('S3 URL:', s3Url);
  console.log('========================================\n');
}

publishRelease().catch((err) => {
  console.error('Publish error:', err);
  process.exit(1);
});
