/**
 * Genera screenshots para el manifest PWA (Android install prompt)
 * y splash screens para iOS usando sharp (ya instalado en el proyecto).
 *
 * Uso: node scripts/generate-pwa-assets.mjs
 */

import sharp from 'sharp';
import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, '..', 'public');

// ─── Paleta BREW CHAIN ────────────────────────────────────────────────────────
const BG        = '#1A0D05';
const BROWN     = '#3B1F08';
const GOLD      = '#C49A6C';
const GOLD_DIM  = '#8B5E3C';
const WHITE     = '#FBF6EE';

// ─── Helpers SVG ─────────────────────────────────────────────────────────────
const rect = (x, y, w, h, fill, rx = 0) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" rx="${rx}"/>`;

const text = (content, x, y, opts = {}) => {
  const { size = 28, fill = WHITE, weight = 'normal', anchor = 'middle', family = 'system-ui, sans-serif' } = opts;
  return `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-weight="${weight}" text-anchor="${anchor}" font-family="${family}">${content}</text>`;
};

const circle = (cx, cy, r, fill) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`;

// ─── Logo/icono simplificado ─────────────────────────────────────────────────
function logoGroup(cx, cy, size) {
  const r = size / 2;
  return `
    <g>
      ${circle(cx, cy, r, GOLD_DIM)}
      ${circle(cx, cy, r * 0.75, BROWN)}
      ${text('⛓', cx, cy + r * 0.35, { size: r * 0.9, anchor: 'middle' })}
    </g>`;
}

// ─── Screenshot mobile (390×844) — para manifest Android ────────────────────
function svgMobile() {
  const W = 390, H = 844;
  const cardY = 160, cardH = 90, cardGap = 12, cardX = 20, cardW = W - 40;
  const cards = [
    { label: 'Marketplace', sub: 'Cafés de especialidad EUDR', emoji: '🛒' },
    { label: 'Trazabilidad QR',  sub: 'Pasaporte digital inmutable',  emoji: '📱' },
    { label: 'Scouting IA',  sub: 'Recomendaciones personalizadas', emoji: '✨' },
    { label: 'Pedidos B2B',  sub: 'Importadoras · Tostaderías',  emoji: '📦' },
  ];

  const cardsSVG = cards.map((c, i) => {
    const y = cardY + i * (cardH + cardGap);
    return `
      <g>
        ${rect(cardX, y, cardW, cardH, BROWN, 14)}
        ${text(c.emoji, cardX + 28, y + cardH / 2 + 10, { size: 30, anchor: 'middle' })}
        ${text(c.label, cardX + 60, y + cardH / 2 - 6, { size: 18, weight: '700', fill: WHITE, anchor: 'start' })}
        ${text(c.sub, cardX + 60, y + cardH / 2 + 16, { size: 13, fill: GOLD_DIM, anchor: 'start' })}
      </g>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    ${rect(0, 0, W, H, BG)}
    <!-- Status bar fake -->
    ${rect(0, 0, W, 44, '#120904')}
    ${text('9:41', 20, 30, { size: 15, fill: WHITE, anchor: 'start', weight: '600' })}
    <!-- Logo + título -->
    ${logoGroup(W / 2, 88, 56)}
    ${text('BREW CHAIN', W / 2, 150, { size: 22, weight: '900', fill: WHITE })}
    <!-- Cards -->
    ${cardsSVG}
    <!-- Bottom nav fake -->
    ${rect(0, H - 72, W, 72, '#120904')}
    ${['🏠','📋','⭐','👤'].map((e, i) =>
      text(e, 48 + i * (W - 96) / 3, H - 30, { size: 24, anchor: 'middle' })
    ).join('')}
    ${text('BREW CHAIN · De la semilla a tu taza', W / 2, H - 10, { size: 10, fill: GOLD_DIM })}
  </svg>`;
}

// ─── Screenshot desktop-wide (1280×800) — para manifest tablet/desktop ──────
function svgWide() {
  const W = 1280, H = 800;
  const cols = [
    { title: 'Caficultor', items: ['Precio ICO live', 'Historial ventas', 'GPS EUDR'], color: '#1B5E30' },
    { title: 'Comercial',  items: ['Pedidos B2B', 'Declaraciones TRACES', 'Wish List'], color: '#1A2E5C' },
    { title: 'Tostaduria', items: ['QR Pasaportes', 'Migración Cropster', 'Suscripciones D2C'], color: '#3B1F08' },
    { title: 'Cafetería',  items: ['QR en sala', 'Analytics scans', 'Google Maps live'], color: '#2D1B00' },
  ];

  const colW = (W - 80) / 4;
  const colsSVG = cols.map((col, i) => {
    const x = 24 + i * (colW + 8);
    return `
      <g>
        ${rect(x, 100, colW, H - 160, col.color + '33', 16)}
        ${rect(x, 100, colW, 44, col.color, 16)}
        ${rect(x, 130, colW, 14, col.color)}
        ${text(col.title, x + colW / 2, 128, { size: 20, weight: '800', fill: WHITE })}
        ${col.items.map((item, j) => `
          ${rect(x + 12, 162 + j * 72, colW - 24, 60, BG + 'cc', 12)}
          ${text('•', x + 30, 199 + j * 72, { size: 18, fill: GOLD })}
          ${text(item, x + 50, 199 + j * 72, { size: 16, fill: WHITE, anchor: 'start' })}
        `).join('')}
      </g>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    ${rect(0, 0, W, H, BG)}
    <!-- Top bar -->
    ${rect(0, 0, W, 72, '#120904')}
    ${logoGroup(48, 36, 44)}
    ${text('BREW CHAIN', 80, 44, { size: 24, weight: '900', fill: WHITE, anchor: 'start' })}
    ${text('Primera plataforma all-in-one del café de especialidad', W / 2, 44, { size: 15, fill: GOLD_DIM })}
    <!-- Columns -->
    ${colsSVG}
    <!-- Footer -->
    ${rect(0, H - 40, W, 40, '#120904')}
    ${text('brewchain.app · Trazada · Verificada · Conectada', W / 2, H - 14, { size: 13, fill: GOLD_DIM })}
  </svg>`;
}

// ─── Splash screen iOS (SVG centrado, se escala por tamaño) ──────────────────
function svgSplash(W, H) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    ${rect(0, 0, W, H, BG)}
    ${logoGroup(W / 2, H / 2 - 60, Math.min(W, H) * 0.22)}
    ${text('BREW CHAIN', W / 2, H / 2 + 40, { size: Math.min(W, H) * 0.055, weight: '900', fill: WHITE })}
    ${text('De la semilla a tu taza', W / 2, H / 2 + 80, { size: Math.min(W, H) * 0.028, fill: GOLD_DIM })}
  </svg>`;
}

// ─── Dispositivos iOS a generar ──────────────────────────────────────────────
// media query portrait + landscape para cada dispositivo
const IOS_SPLASHES = [
  // iPhone SE 2nd/3rd (4.7")
  { w: 750,  h: 1334, name: 'splash-750x1334'  },
  // iPhone X / XS / 11 Pro (5.8")
  { w: 1125, h: 2436, name: 'splash-1125x2436' },
  // iPhone XR / 11 (6.1")
  { w: 828,  h: 1792, name: 'splash-828x1792'  },
  // iPhone 12/13 mini (5.4")
  { w: 1080, h: 2340, name: 'splash-1080x2340' },
  // iPhone 12/13/14 (6.1")
  { w: 1170, h: 2532, name: 'splash-1170x2532' },
  // iPhone 12/13/14 Pro Max (6.7")
  { w: 1284, h: 2778, name: 'splash-1284x2778' },
  // iPhone 14 Pro (6.1")
  { w: 1179, h: 2556, name: 'splash-1179x2556' },
  // iPhone 14 Pro Max (6.7")
  { w: 1290, h: 2796, name: 'splash-1290x2796' },
  // iPhone 15 / 15 Pro (6.1") — mismas que 14 Pro
  { w: 1179, h: 2556, name: 'splash-1179x2556', skip: true },
  // iPad Mini 6th gen
  { w: 1488, h: 2266, name: 'splash-1488x2266' },
  // iPad Pro 11"
  { w: 1668, h: 2388, name: 'splash-1668x2388' },
  // iPad Pro 12.9"
  { w: 2048, h: 2732, name: 'splash-2048x2732' },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const screenshotsDir = path.join(PUBLIC, 'screenshots');
  const splashDir      = path.join(PUBLIC, 'splash');

  if (!existsSync(screenshotsDir)) await mkdir(screenshotsDir, { recursive: true });
  if (!existsSync(splashDir))      await mkdir(splashDir,      { recursive: true });

  // 1. Screenshots para manifest (Android)
  console.log('📸 Generando screenshots para manifest...');
  await sharp(Buffer.from(svgMobile()))
    .png()
    .toFile(path.join(screenshotsDir, 'narrow.png'));
  console.log('  ✓ screenshots/narrow.png  (390×844)');

  await sharp(Buffer.from(svgWide()))
    .png()
    .toFile(path.join(screenshotsDir, 'wide.png'));
  console.log('  ✓ screenshots/wide.png  (1280×800)');

  // 2. Splash screens iOS
  console.log('🍎 Generando splash screens iOS...');
  for (const { w, h, name, skip } of IOS_SPLASHES) {
    if (skip) continue;
    const outPath = path.join(splashDir, `${name}.png`);
    await sharp(Buffer.from(svgSplash(w, h)))
      .png()
      .toFile(outPath);
    console.log(`  ✓ splash/${name}.png  (${w}×${h})`);
  }

  console.log('\n✅ Todos los assets generados. Actualiza manifest.json y layout.tsx.');
}

main().catch(console.error);
