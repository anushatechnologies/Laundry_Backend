const { S3Client, CreateBucketCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const s3 = new S3Client({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function tryCreate() {
  const bucketName = 'laundry-2026';
  try {
    console.log('Attempting CreateBucket on ap-south-1...');
    await s3.send(new CreateBucketCommand({
      Bucket: bucketName,
      CreateBucketConfiguration: {
        LocationConstraint: 'ap-south-1'
      }
    }));
    console.log('Bucket created successfully!');
  } catch (e) {
    console.log('Create error in ap-south-1:', e.name, e.message);
  }

  // Also try us-east-1 (where LocationConstraint is not passed)
  const s3UsEast = new S3Client({
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
  try {
    console.log('Attempting CreateBucket on us-east-1...');
    await s3UsEast.send(new CreateBucketCommand({
      Bucket: bucketName,
    }));
    console.log('Bucket created in us-east-1!');
  } catch (e) {
    console.log('Create error in us-east-1:', e.name, e.message);
  }
}

tryCreate();
