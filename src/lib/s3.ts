import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs/promises';
import path from 'path';

const region = process.env.AWS_REGION?.trim() || 'ap-south-1';
const bucketName = process.env.AWS_S3_BUCKET_NAME?.trim();
const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();
const publicApiUrl = (process.env.BACKEND_PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/$/, '');

const s3Enabled = Boolean(bucketName && accessKeyId && secretAccessKey);
const s3Client = s3Enabled
  ? new S3Client({ region, credentials: { accessKeyId: accessKeyId!, secretAccessKey: secretAccessKey! } })
  : null;

export const S3_BASE_URL = s3Enabled && bucketName ? `https://${bucketName}.s3.${region}.amazonaws.com` : '';

function safeKey(key: string) {
  return key
    .replace(/\\/g, '/')
    .split('/')
    .map((part) => part.replace(/[^a-zA-Z0-9._-]/g, '-'))
    .filter(Boolean)
    .join('/');
}

/** Upload to configured S3, or use public/uploads for local development. */
export async function uploadToS3(
  key: string,
  body: Buffer | Uint8Array | string,
  contentType = 'image/jpeg'
): Promise<string> {
  const cleanKey = safeKey(key);
  if (!cleanKey) throw new Error('A valid upload key is required.');

  if (s3Client && bucketName) {
    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: cleanKey,
      Body: body,
      ContentType: contentType,
    }));
    return `${S3_BASE_URL}/${cleanKey}`;
  }

  const uploadRoot = path.resolve(process.cwd(), 'public', 'uploads');
  const destination = path.join(uploadRoot, cleanKey);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, body);
  return `${publicApiUrl}/uploads/${cleanKey}`;
}

/** Decode and upload an image sent as a data URL. */
export async function uploadBase64ToS3(imageBase64: string, fileName = 'service-image.jpg'): Promise<string> {
  const match = imageBase64.match(/^data:(image\/(?:jpeg|jpg|png|webp|gif));base64,([A-Za-z0-9+/=\r\n]+)$/i);
  const contentType = match?.[1]?.toLowerCase() || 'image/jpeg';
  const encoded = match?.[2] || imageBase64;
  const buffer = Buffer.from(encoded.replace(/\s/g, ''), 'base64');
  if (!buffer.length) throw new Error('The image payload is empty or invalid.');
  if (buffer.length > 8 * 1024 * 1024) throw new Error('Images must be 8MB or smaller.');

  const extension = contentType === 'image/jpeg' || contentType === 'image/jpg' ? 'jpg' : contentType.slice(6);
  const baseName = path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, '-').replace(/\.+/g, '.');
  const name = baseName.includes('.') ? baseName : `${baseName}.${extension}`;
  return uploadToS3(`services/${Date.now()}-${name}`, buffer, contentType);
}

export function getS3Url(key: string): string {
  const cleanKey = safeKey(key);
  return S3_BASE_URL ? `${S3_BASE_URL}/${cleanKey}` : `${publicApiUrl}/uploads/${cleanKey}`;
}
