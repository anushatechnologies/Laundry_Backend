const { S3Client, HeadBucketCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const candidates = [
  'laundry-2026',
  'anushabazaar-2288e',
  'anushabazaar',
  'laundryfresh',
  'laundry-fresh',
  'laundry',
  'laundry-bucket',
  'laundry-app',
  'laundry-images',
  'laundry-uploads',
  'laundry-s3',
  'laundryfresh-2026',
  'anusha-bazaar',
  'anushabazaar-bucket',
  'anushatechnologies',
  'laundry-storage'
];

async function findAllowedBucket() {
  for (const b of candidates) {
    try {
      await s3.send(new PutObjectCommand({
        Bucket: b,
        Key: 'test.txt',
        Body: 'test',
        ContentType: 'text/plain',
      }));
      console.log(`>>> SUCCESS! Bucket "${b}" has PutObject permission!`);
      return b;
    } catch (e) {
      console.log(`Bucket ${b}: ${e.name} - ${e.message}`);
    }
  }
}

findAllowedBucket();
