const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const regions = ['ap-south-1', 'us-east-1', 'us-east-2', 'ap-southeast-1', 'eu-west-1'];
const candidateBuckets = [
  'laundry-2026',
  'laundry',
  'laundry-images',
  'laundry-bucket',
  'laundry-s3',
  'laundryfresh',
  'laundryfresh-2026',
  'anushabazaar',
  'anushabazaar-2288e',
  'anushabazaar-storage',
  'anushabazaar-2288e.appspot.com',
  'anushabazaar-2288e.firebasestorage.app'
];

async function testAll() {
  console.log('--- Testing AWS S3 across regions ---');
  for (const reg of regions) {
    const client = new S3Client({
      region: reg,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    for (const b of candidateBuckets) {
      try {
        await client.send(new PutObjectCommand({
          Bucket: b,
          Key: 'test-ping.txt',
          Body: 'ping',
          ContentType: 'text/plain',
        }));
        console.log(`>>> SUCCESS on AWS S3! Bucket: "${b}" in Region: "${reg}"`);
        return { type: 's3', bucket: b, region: reg };
      } catch (err) {
        if (err.name !== 'NoSuchBucket' && err.name !== 'PermanentRedirect') {
          console.log(`[${reg}] ${b}: ${err.name} - ${err.message}`);
        }
      }
    }
  }

  console.log('\n--- Testing Firebase Cloud Storage ---');
  try {
    const cert = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(cert),
        storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
      });
    }
    const bucket = admin.storage().bucket();
    const file = bucket.file('test-ping.txt');
    await file.save('ping', { contentType: 'text/plain' });
    console.log(`>>> SUCCESS on Firebase Cloud Storage! Bucket: ${bucket.name}`);
    return { type: 'firebase', bucket: bucket.name };
  } catch (fe) {
    console.log('Firebase storage error:', fe.message);
  }
}

testAll();
