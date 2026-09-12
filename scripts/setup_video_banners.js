const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
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

async function main() {
  console.log('Connecting to MySQL RDS...');
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,
    ssl: { rejectUnauthorized: false },
  });

  try {
    // 1. Check and add columns to banners table
    console.log('Checking banners table columns in MySQL...');
    const [cols] = await pool.query('DESCRIBE banners');
    const colNames = cols.map((c) => c.Field);

    if (!colNames.includes('media_type')) {
      console.log('Adding media_type column to banners...');
      await pool.query("ALTER TABLE banners ADD COLUMN media_type VARCHAR(20) DEFAULT 'IMAGE'");
      console.log('✓ Added media_type column');
    } else {
      console.log('✓ media_type column already exists');
    }

    if (!colNames.includes('video_url')) {
      console.log('Adding video_url column to banners...');
      await pool.query('ALTER TABLE banners ADD COLUMN video_url TEXT');
      console.log('✓ Added video_url column');
    } else {
      console.log('✓ video_url column already exists');
    }

    // 2. Upload video files from Downloads to AWS S3
    const downloadsDir = 'C:\\Users\\HP\\Downloads';
    const videoFiles = [
      {
        localName: 'Create_a_premium_cinematic_s.mp4',
        s3Key: 'banners/videos/banner-video-premium-cinematic-1.mp4',
        id: 'banner-video-1',
        title: 'Premium Cinematic Garment Care',
        subtitle: 'Pure Ozone Sanitization & German Fabric Spa Technology',
        badgeText: 'CINEMATIC CARE',
        couponCode: 'CINEMA30',
        discountPercent: 30,
        displayOrder: 1,
        fallbackImage: 'https://anjanilaundry.s3.ap-south-2.amazonaws.com/banners/banner-first50.jpg',
        actionType: 'BOOK',
        actionTarget: '',
      },
      {
        localName: 'Create_a_premium_cinematic_s (1).mp4',
        s3Key: 'banners/videos/banner-video-premium-cinematic-2.mp4',
        id: 'banner-video-2',
        title: 'Delicate Silk, Wool & Suit Dry Cleaning',
        subtitle: 'Zero Color Bleed, Charak Polish & Doorstep Express Delivery',
        badgeText: 'ROYAL SPA',
        couponCode: 'ROYAL25',
        discountPercent: 25,
        displayOrder: 2,
        fallbackImage: 'https://anjanilaundry.s3.ap-south-2.amazonaws.com/banners/banner-silkspa.jpg',
        actionType: 'CATEGORY',
        actionTarget: 'bridal-wear',
      },
    ];

    for (const v of videoFiles) {
      const filePath = path.join(downloadsDir, v.localName);
      if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        continue;
      }

      const stat = fs.statSync(filePath);
      console.log(`Reading ${v.localName} (${(stat.size / (1024 * 1024)).toFixed(2)} MB)...`);
      const fileBuffer = fs.readFileSync(filePath);

      console.log(`Uploading to AWS S3: s3://${BUCKET}/${v.s3Key}...`);
      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: v.s3Key,
          Body: fileBuffer,
          ContentType: 'video/mp4',
        })
      );
      const s3Url = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${v.s3Key}`;
      console.log(`✓ S3 Upload Successful: ${s3Url}`);

      v.videoUrl = s3Url;
    }

    // 3. Shift existing banners display_order by +2 so videos appear first
    console.log('Updating existing image banners display orders...');
    await pool.query(
      'UPDATE banners SET display_order = display_order + 2 WHERE id NOT IN (?, ?)',
      ['banner-video-1', 'banner-video-2']
    );

    // 4. Insert or update the video banners in MySQL
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    for (const v of videoFiles) {
      if (!v.videoUrl) continue;
      console.log(`Inserting/Updating video banner: ${v.id}...`);
      await pool.query(
        `INSERT INTO banners (
          id, title, subtitle, badge_text, coupon_code, discount_percent,
          image_url, media_type, video_url, action_type, action_target,
          display_order, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
        ON DUPLICATE KEY UPDATE
          title = VALUES(title),
          subtitle = VALUES(subtitle),
          badge_text = VALUES(badge_text),
          coupon_code = VALUES(coupon_code),
          discount_percent = VALUES(discount_percent),
          image_url = VALUES(image_url),
          media_type = VALUES(media_type),
          video_url = VALUES(video_url),
          action_type = VALUES(action_type),
          action_target = VALUES(action_target),
          display_order = VALUES(display_order),
          is_active = 1,
          updated_at = VALUES(updated_at)`,
        [
          v.id,
          v.title,
          v.subtitle,
          v.badgeText,
          v.couponCode,
          v.discountPercent,
          v.fallbackImage,
          'VIDEO',
          v.videoUrl,
          v.actionType,
          v.actionTarget,
          v.displayOrder,
          now,
          now,
        ]
      );
      console.log(`✓ Saved video banner ${v.id} into MySQL`);
    }

    // 5. Query and print all active banners
    const [allBanners] = await pool.query('SELECT id, title, media_type, video_url, is_active, display_order FROM banners ORDER BY display_order ASC');
    console.log('\n--- Active Banners in MySQL ---');
    console.table(allBanners);

    await pool.end();
    console.log('\nAll done successfully!');
  } catch (err) {
    console.error('Error during setup:', err);
    await pool.end();
    process.exit(1);
  }
}

main();
