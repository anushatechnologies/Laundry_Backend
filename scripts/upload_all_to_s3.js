const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const BUCKET = process.env.AWS_S3_BUCKET_NAME || 'laundry-2026';
const REGION = process.env.AWS_REGION || 'ap-south-1';

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function uploadDirectory(localDir, s3Prefix = '') {
  if (!fs.existsSync(localDir)) return;
  const files = fs.readdirSync(localDir);

  for (const file of files) {
    const fullPath = path.join(localDir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      await uploadDirectory(fullPath, `${s3Prefix}${file}/`);
    } else if (file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg') || file.endsWith('.svg')) {
      const s3Key = `${s3Prefix}${file}`;
      const fileBuffer = fs.readFileSync(fullPath);
      let contentType = 'image/jpeg';
      if (file.endsWith('.png')) contentType = 'image/png';
      else if (file.endsWith('.svg')) contentType = 'image/svg+xml';


      try {
        console.log(`Uploading ${s3Key} to s3://${BUCKET}/${s3Key}...`);
        await s3.send(
          new PutObjectCommand({
            Bucket: BUCKET,
            Key: s3Key,
            Body: fileBuffer,
            ContentType: contentType,
            ACL: 'public-read', // If bucket ACLs are enabled
          })
        );
        console.log(`✓ Uploaded: https://${BUCKET}.s3.${REGION}.amazonaws.com/${s3Key}`);
      } catch (err) {
        // If ACL error, retry without ACL
        try {
          await s3.send(
            new PutObjectCommand({
              Bucket: BUCKET,
              Key: s3Key,
              Body: fileBuffer,
              ContentType: contentType,
            })
          );
          console.log(`✓ Uploaded (bucket-policy controlled): https://${BUCKET}.s3.${REGION}.amazonaws.com/${s3Key}`);
        } catch (e2) {
          console.error(`✗ Error uploading ${s3Key}:`, e2.message);
        }
      }
    }
  }
}

async function startUpload() {
  console.log(`=== Starting AWS S3 Batch Upload to Bucket "${BUCKET}" (${REGION}) ===\n`);

  const garmentDir = path.join(__dirname, '../../frontend-web/public/images/garments');
  const serviceDir = path.join(__dirname, '../../frontend-web/public/images');

  console.log('--- 1. Uploading Garment Images ---');
  await uploadDirectory(garmentDir, 'garments/');

  console.log('\n--- 2. Uploading Service Images ---');
  // Upload top-level service images
  const files = fs.readdirSync(serviceDir);
  for (const file of files) {
    const fullPath = path.join(serviceDir, file);
    if (fs.statSync(fullPath).isFile() && (file.endsWith('.jpg') || file.endsWith('.png'))) {
      const s3Key = `services/${file}`;
      const fileBuffer = fs.readFileSync(fullPath);
      const contentType = file.endsWith('.png') ? 'image/png' : 'image/jpeg';

      try {
        await s3.send(
          new PutObjectCommand({
            Bucket: BUCKET,
            Key: s3Key,
            Body: fileBuffer,
            ContentType: contentType,
          })
        );
        console.log(`✓ Uploaded: https://${BUCKET}.s3.${REGION}.amazonaws.com/${s3Key}`);
      } catch (err) {
        console.error(`✗ Error uploading ${s3Key}:`, err.message);
      }
    }
  }

  console.log(`\n=== Batch Upload Complete ===`);
  console.log(`Check images at: https://${BUCKET}.s3.${REGION}.amazonaws.com/garments/shirt.jpg`);
}

startUpload();
