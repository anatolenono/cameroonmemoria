import { PrismaClient, BannerType } from '@prisma/client';

const prisma = new PrismaClient();

const BUCKET_NAME = 'banner-presets';

const MINIO_PUBLIC_URL = (process.env.MINIO_PUBLIC_URL || 'http://localhost:9000').replace(/\/$/, '');

function getMinioUrl(path: string): string {
  return `${MINIO_PUBLIC_URL}/${BUCKET_NAME}/${path}`;
}

export async function seedBanners() {
  console.log('🎨 Seeding banner presets...');

  // Color presets
  const colors = [
    { name: 'Coral Red', fileName: 'coral-red', category: 'Warm', order: 1 },
    { name: 'Sunset Orange', fileName: 'sunset-orange', category: 'Warm', order: 2 },
    { name: 'Soft Pink', fileName: 'soft-pink', category: 'Warm', order: 3 },
    { name: 'Warm Beige', fileName: 'warm-beige', category: 'Neutral', order: 4 },
    { name: 'Ocean Blue', fileName: 'ocean-blue', category: 'Cool', order: 5 },
    { name: 'Sky Blue', fileName: 'sky-blue', category: 'Cool', order: 6 },
    { name: 'Mint Green', fileName: 'mint-green', category: 'Cool', order: 7 },
    { name: 'Lavender', fileName: 'lavender', category: 'Cool', order: 8 },
  ];

  for (const color of colors) {
    await prisma.bannerPreset.upsert({
      where: { id: `color-${color.fileName}` },
      update: {},
      create: {
        id: `color-${color.fileName}`,
        name: color.name,
        type: BannerType.COLOR,
        imageUrl: getMinioUrl(`colors/${color.fileName}.webp`),
        thumbnailUrl: getMinioUrl(`colors/thumbs/${color.fileName}.webp`),
        category: color.category,
        displayOrder: color.order,
        isActive: true,
      },
    });
  }

  console.log(`✓ Seeded ${colors.length} color presets`);

  // Gradient presets
  const gradients = [
    { name: 'Ocean Depths', fileName: 'ocean', order: 1 },
    { name: 'Sunset Glow', fileName: 'sunset', order: 2 },
    { name: 'Purple Dream', fileName: 'purple-dream', order: 3 },
    { name: 'Forest Mist', fileName: 'forest', order: 4 },
    { name: 'Rose Garden', fileName: 'rose', order: 5 },
    { name: 'Midnight Sky', fileName: 'midnight', order: 6 },
    { name: 'Autumn Leaves', fileName: 'autumn', order: 7 },
  ];

  for (const gradient of gradients) {
    await prisma.bannerPreset.upsert({
      where: { id: `gradient-${gradient.fileName}` },
      update: {},
      create: {
        id: `gradient-${gradient.fileName}`,
        name: gradient.name,
        type: BannerType.GRADIENT,
        imageUrl: getMinioUrl(`gradients/${gradient.fileName}.webp`),
        thumbnailUrl: getMinioUrl(`gradients/thumbs/${gradient.fileName}.webp`),
        category: null,
        displayOrder: gradient.order,
        isActive: true,
      },
    });
  }

  console.log(`✓ Seeded ${gradients.length} gradient presets`);
  console.log(`✅ Banner seeding complete! Total: ${colors.length + gradients.length} presets\n`);
}
