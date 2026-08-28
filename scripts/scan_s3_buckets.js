const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const names = [
  'laundry-2026',
  'laundry2026',
  'laundry-s3-2026',
  'laundry-bucket-2026',
  'laundry-storage-2026',
  'laundry-app-2026',
  'laundryfresh-2026',
  'laundry-fresh-2026',
  'laundry-s3-user',
  'anushabazaar',
  'anushabazaar-2288e',
  'anushabazaar-2026',
  'anushabazaar-s3',
  'anushabazaar-storage',
  'anushabazaar-bucket',
  'anusha-bazaar-2026',
  'anushatech-2026',
  'laundry-prod',
  'laundry-dev',
  'laundry-media',
  'laundry-images-2026',
  'laundry-uploads-2026'
];

async function scan() {
  for (const name of names) {
    try {
      await s3.send(new PutObjectCommand({
        Bucket: name,
        Key: 's3-check.txt',
        Body: 'ok',
        ContentType: 'text/plain'
      }));
      console.log(`\n=========================================\n>>> FOUND ALLOWED BUCKET: "${name}" <<<\n=========================================\n`);
      return name;
    } catch (e) {
      if (e.name !== 'NoSuchBucket') {
        console.log(`[${name}] ${e.name}: ${e.message}`);
      }
    }
  }
  console.log('Scan complete.');
}

scan();
