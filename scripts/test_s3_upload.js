const { S3Client, ListBucketsCommand, CreateBucketCommand } = require('@aws-sdk/client-s3');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function findOrCreateBucket() {
  try {
    const res = await s3.send(new ListBucketsCommand({}));
    console.log('Available AWS S3 Buckets in account:', res.Buckets?.map(b => b.Name));
    
    // Check if bucket exists, if not create it
    const bucketName = process.env.AWS_S3_BUCKET_NAME || 'laundry-2026';
    const exists = res.Buckets?.some(b => b.Name === bucketName);
    if (!exists) {
      console.log(`Creating bucket ${bucketName} in ${process.env.AWS_REGION || 'ap-south-1'}...`);
      try {
        await s3.send(new CreateBucketCommand({
          Bucket: bucketName,
          CreateBucketConfiguration: {
            LocationConstraint: 'ap-south-1',
          },
        }));
        console.log(`Successfully created bucket ${bucketName}!`);
      } catch (ce) {
        console.log('Create bucket error:', ce.message);
      }
    }
  } catch (err) {
    console.error('List buckets error:', err);
  }
}

findOrCreateBucket();
