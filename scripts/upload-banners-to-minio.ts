import * as Minio from 'minio';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BANNER_DIR = path.join(__dirname, '../public/banners');
const BUCKET_NAME = 'banner-presets';

async function uploadToMinio() {
  console.log('📤 Uploading banners to MinIO...\n');

  // Initialize MinIO client
  const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
  });

  // Ensure bucket exists
  const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
  if (!bucketExists) {
    await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
    console.log(`✓ Created bucket: ${BUCKET_NAME}`);

    // Set public read policy
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
        },
      ],
    };

    await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
    console.log(`✓ Set public read policy for ${BUCKET_NAME}\n`);
  } else {
    console.log(`✓ Bucket ${BUCKET_NAME} already exists\n`);
  }

  // Upload files
  const uploadFile = async (filePath: string, objectName: string) => {
    const metaData = {
      'Content-Type': 'image/webp',
      'Cache-Control': 'public, max-age=31536000',
    };

    await minioClient.fPutObject(BUCKET_NAME, objectName, filePath, metaData);
    console.log(`✓ Uploaded: ${objectName}`);
  };

  // Upload colors
  console.log('Uploading colors...');
  const colorDir = path.join(BANNER_DIR, 'colors');
  const colorFiles = fs.readdirSync(colorDir).filter(f => f.endsWith('.webp'));

  for (const file of colorFiles) {
    await uploadFile(path.join(colorDir, file), `colors/${file}`);
  }

  // Upload color thumbnails
  const colorThumbDir = path.join(colorDir, 'thumbs');
  if (fs.existsSync(colorThumbDir)) {
    const thumbFiles = fs.readdirSync(colorThumbDir).filter(f => f.endsWith('.webp'));
    for (const file of thumbFiles) {
      await uploadFile(path.join(colorThumbDir, file), `colors/thumbs/${file}`);
    }
  }

  // Upload gradients
  console.log('\nUploading gradients...');
  const gradientDir = path.join(BANNER_DIR, 'gradients');
  const gradientFiles = fs.readdirSync(gradientDir).filter(f => f.endsWith('.webp'));

  for (const file of gradientFiles) {
    await uploadFile(path.join(gradientDir, file), `gradients/${file}`);
  }

  // Upload gradient thumbnails
  const gradientThumbDir = path.join(gradientDir, 'thumbs');
  if (fs.existsSync(gradientThumbDir)) {
    const thumbFiles = fs.readdirSync(gradientThumbDir).filter(f => f.endsWith('.webp'));
    for (const file of thumbFiles) {
      await uploadFile(path.join(gradientThumbDir, file), `gradients/thumbs/${file}`);
    }
  }

  console.log('\n✅ All banners uploaded to MinIO successfully!');
  console.log(`📦 Bucket: ${BUCKET_NAME}`);
}

uploadToMinio().catch(console.error);
