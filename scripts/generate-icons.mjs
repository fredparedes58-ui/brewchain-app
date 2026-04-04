// Script para generar iconos PNG desde el SVG usando sharp
// Ejecutar: node scripts/generate-icons.mjs

import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ICONS_DIR = join(ROOT, 'public', 'icons');

mkdirSync(ICONS_DIR, { recursive: true });

const svgContent = readFileSync(join(ICONS_DIR, 'icon.svg'));

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

console.log('Generando iconos BREW CHAIN...');

for (const size of sizes) {
  await sharp(svgContent)
    .resize(size, size)
    .png()
    .toFile(join(ICONS_DIR, `icon-${size}.png`));
  console.log(`✓ icon-${size}.png`);
}

// Icono maskable (con padding del 10% para safe area)
await sharp(svgContent)
  .resize(460, 460)  // 90% del tamaño para dejar safe area
  .extend({ top: 26, bottom: 26, left: 26, right: 26, background: { r: 26, g: 13, b: 5, alpha: 1 } })
  .png()
  .toFile(join(ICONS_DIR, 'icon-maskable.png'));
console.log('✓ icon-maskable.png (con safe area)');

// Apple touch icon (180x180)
await sharp(svgContent)
  .resize(180, 180)
  .png()
  .toFile(join(ROOT, 'public', 'apple-touch-icon.png'));
console.log('✓ apple-touch-icon.png');

// Favicon 32x32
await sharp(svgContent)
  .resize(32, 32)
  .png()
  .toFile(join(ROOT, 'public', 'favicon-32.png'));
console.log('✓ favicon-32.png');

console.log('\n✅ Todos los iconos generados en public/icons/');
