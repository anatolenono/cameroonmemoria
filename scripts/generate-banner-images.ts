import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

/**
 * Script to generate banner images for BannerPresets
 * Generates solid colors and gradients as 1200x400 images
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.join(__dirname, '../public/banners');
const FULL_SIZE = { width: 1200, height: 400 };
const THUMBNAIL_SIZE = { width: 200, height: 67 };

// Color definitions
const COLORS = [
  { name: 'coral-red', hex: '#E57373', displayName: 'Coral Red', category: 'Warm' },
  { name: 'sunset-orange', hex: '#FFB74D', displayName: 'Sunset Orange', category: 'Warm' },
  { name: 'ocean-blue', hex: '#4FC3F7', displayName: 'Ocean Blue', category: 'Cool' },
  { name: 'mint-green', hex: '#81C784', displayName: 'Mint Green', category: 'Cool' },
  { name: 'lavender', hex: '#BA68C8', displayName: 'Lavender', category: 'Cool' },
  { name: 'soft-pink', hex: '#F06292', displayName: 'Soft Pink', category: 'Warm' },
  { name: 'sky-blue', hex: '#64B5F6', displayName: 'Sky Blue', category: 'Cool' },
  { name: 'warm-beige', hex: '#D7CCC8', displayName: 'Warm Beige', category: 'Neutral' },
];

// Gradient definitions
const GRADIENTS = [
  {
    name: 'ocean',
    displayName: 'Ocean Depths',
    colors: ['#667eea', '#764ba2'],
    direction: '135deg'
  },
  {
    name: 'sunset',
    displayName: 'Sunset Glow',
    colors: ['#FF6B6B', '#FFE66D'],
    direction: '135deg'
  },
  {
    name: 'purple-dream',
    displayName: 'Purple Dream',
    colors: ['#a8edea', '#fed6e3'],
    direction: '135deg'
  },
  {
    name: 'forest',
    displayName: 'Forest Mist',
    colors: ['#134E5E', '#71B280'],
    direction: '135deg'
  },
  {
    name: 'rose',
    displayName: 'Rose Garden',
    colors: ['#ED4264', '#FFEDBC'],
    direction: '135deg'
  },
  {
    name: 'midnight',
    displayName: 'Midnight Sky',
    colors: ['#232526', '#414345'],
    direction: '135deg'
  },
  {
    name: 'autumn',
    displayName: 'Autumn Leaves',
    colors: ['#DAD299', '#B0DAB9'],
    direction: '135deg'
  },
];

// Utility to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

// Create SVG for gradient
function createGradientSvg(
  colors: string[],
  direction: string,
  width: number,
  height: number
): string {
  // Convert CSS angle to SVG coordinates
  const angle = parseInt(direction);
  const rad = (angle * Math.PI) / 180;

  let x1, y1, x2, y2;

  if (angle === 135) {
    x1 = '0%'; y1 = '0%'; x2 = '100%'; y2 = '100%';
  } else if (angle === 90) {
    x1 = '0%'; y1 = '0%'; x2 = '0%'; y2 = '100%';
  } else {
    x1 = '0%'; y1 = '0%'; x2 = '100%'; y2 = '0%';
  }

  const stops = colors.map((color, index) => {
    const offset = (index / (colors.length - 1)) * 100;
    return `<stop offset="${offset}%" style="stop-color:${color}" />`;
  }).join('\n      ');

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
          ${stops}
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#grad)" />
    </svg>
  `.trim();
}

async function generateSolidColor(
  name: string,
  hex: string,
  outputPath: string,
  size: { width: number; height: number }
) {
  const rgb = hexToRgb(hex);

  await sharp({
    create: {
      width: size.width,
      height: size.height,
      channels: 4,
      background: rgb,
    },
  })
    .webp({ quality: 85 })
    .toFile(outputPath);

  console.log(`✓ Generated ${name} (${size.width}x${size.height})`);
}

async function generateGradient(
  name: string,
  colors: string[],
  direction: string,
  outputPath: string,
  size: { width: number; height: number }
) {
  const svg = createGradientSvg(colors, direction, size.width, size.height);

  await sharp(Buffer.from(svg))
    .webp({ quality: 85 })
    .toFile(outputPath);

  console.log(`✓ Generated ${name} (${size.width}x${size.height})`);
}

async function main() {
  console.log('🎨 Generating banner images...\n');

  // Create directories
  const colorDir = path.join(OUTPUT_DIR, 'colors');
  const colorThumbDir = path.join(colorDir, 'thumbs');
  const gradientDir = path.join(OUTPUT_DIR, 'gradients');
  const gradientThumbDir = path.join(gradientDir, 'thumbs');

  [colorDir, colorThumbDir, gradientDir, gradientThumbDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Generate solid colors
  console.log('Generating solid colors...');
  for (const color of COLORS) {
    const fullPath = path.join(colorDir, `${color.name}.webp`);
    const thumbPath = path.join(colorThumbDir, `${color.name}.webp`);

    await generateSolidColor(color.name, color.hex, fullPath, FULL_SIZE);
    await generateSolidColor(color.name, color.hex, thumbPath, THUMBNAIL_SIZE);
  }

  console.log('\nGenerating gradients...');
  for (const gradient of GRADIENTS) {
    const fullPath = path.join(gradientDir, `${gradient.name}.webp`);
    const thumbPath = path.join(gradientThumbDir, `${gradient.name}.webp`);

    await generateGradient(gradient.name, gradient.colors, gradient.direction, fullPath, FULL_SIZE);
    await generateGradient(gradient.name, gradient.colors, gradient.direction, thumbPath, THUMBNAIL_SIZE);
  }

  console.log('\n✅ All banner images generated successfully!');
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
}

main().catch(console.error);
