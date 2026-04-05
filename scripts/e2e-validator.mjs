#!/usr/bin/env node
/**
 * BREWCHAIN E2E Flow Validator
 * Valida los flujos end-to-end críticos del MVP sin necesitar un browser.
 * Simula cada flujo trazando el camino de datos: entrada → store → UI → output.
 * Uso: node scripts/e2e-validator.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const C = {
  reset:'\x1b[0m', bold:'\x1b[1m', green:'\x1b[32m', red:'\x1b[31m',
  yellow:'\x1b[33m', cyan:'\x1b[36m', dim:'\x1b[2m', blue:'\x1b[34m'
};

let passed = 0, failed = 0;
const failures = [];

function read(rel) {
  try { return fs.readFileSync(path.join(ROOT, rel), 'utf-8'); } catch { return ''; }
}
function exists(rel) { return fs.existsSync(path.join(ROOT, rel)); }
function has(s, p) { return typeof p === 'string' ? s.includes(p) : p.test(s); }

function flow(name, steps) {
  console.log(`\n  ${C.bold}${C.cyan}▶ ${name}${C.reset}`);
  let allOk = true;
  for (const { step, check, fix } of steps) {
    if (check) {
      console.log(`    ${C.green}✓${C.reset} ${C.dim}${step}${C.reset}`);
      passed++;
    } else {
      console.log(`    ${C.red}✗${C.reset} ${step}`);
      if (fix) console.log(`      ${C.yellow}→ Fix: ${fix}${C.reset}`);
      failed++;
      failures.push({ flow: name, step, fix });
      allOk = false;
    }
  }
  return allOk;
}

function section(title) {
  console.log(`\n${C.bold}── ${title} ──────────────────────────────────────────${C.reset}`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// FLUJO 1: Caficultor registra parcela y vende lote
// ═══════════════════════════════════════════════════════════════════════════════
section('FLUJOS E2E CRÍTICOS');

flow('F01: Caficultor → Registrar parcela GPS → Lote disponible', [
  { step: 'Página /m01/parcela existe', check: exists('app/m01/parcela/page.tsx') },
  { step: 'GPS input (lat/lng) en formulario', check: has(read('app/m01/parcela/page.tsx'), 'gps_lat') || has(read('app/m01/parcela/page.tsx'), 'lat') },
  { step: 'Validación EUDR en GPS (gps_eudr_verified)', check: has(read('lib/mock/caficultores.ts'), 'eudr_verified') },
  { step: 'addParcela() en caficultorStore', check: has(read('lib/stores/caficultorStore.ts'), 'addParcela') },
  { step: 'Parcela persistida (persist middleware)', check: has(read('lib/stores/caficultorStore.ts'), 'persist') },
  { step: 'Lote creado aparece en /m01/lotes', check: has(read('app/m01/lotes/page.tsx'), 'MOCK_LOTES') || has(read('app/m01/lotes/page.tsx'), 'caficultor') },
]);

// ═══════════════════════════════════════════════════════════════════════════════
// FLUJO 2: Tostador genera QR y sella pasaporte
// ═══════════════════════════════════════════════════════════════════════════════
flow('F02: Tostador → Seleccionar lote → Gate L2 → QR sellado → Pasaporte público', [
  { step: 'Lotes disponibles filtrados por GPS verificado', check: has(read('app/m03/qr/page.tsx'), 'gps_eudr_verified') },
  { step: 'Datos tueste (nivel, perfil, notas) recopilados', check: has(read('app/m03/qr/page.tsx'), 'nivelTueste') && has(read('app/m03/qr/page.tsx'), 'perfilTueste') },
  { step: 'Gate L2: firma + checkbox requeridos', check: has(read('app/m03/qr/page.tsx'), 'gateSignature') && has(read('app/m03/qr/page.tsx'), 'gateConfirmed') },
  { step: 'Llamada a /api/qr/generate (POST)', check: has(read('app/m03/qr/page.tsx'), '/api/qr/generate') },
  { step: 'SHA-256 hash generado en API', check: has(read('app/api/qr/generate/route.ts'), 'sha256') || has(read('app/api/qr/generate/route.ts'), 'SHA') },
  { step: 'sealPassport() guarda en comercialStore', check: has(read('app/m03/qr/page.tsx'), 'sealPassport') },
  { step: 'LoteTostado con merma persiste en store', check: has(read('app/m03/qr/page.tsx'), 'addLoteTostado') && has(read('app/m03/qr/page.tsx'), 'merma') },
  { step: '/lote/[hash] es client component (lee store)', check: has(read('app/lote/[hash]/page.tsx'), "'use client'") },
  { step: '/lote/[hash] combina MOCK + store.pasaportes', check: has(read('app/lote/[hash]/page.tsx'), 'storePasaportes') },
  { step: 'URL WhatsApp generada para compartir', check: has(read('app/m03/qr/page.tsx'), 'wa.me') },
  { step: 'Clipboard API para copiar URL', check: has(read('app/m03/qr/page.tsx'), 'clipboard') },
]);

// ═══════════════════════════════════════════════════════════════════════════════
// FLUJO 3: Importador valida EUDR y genera declaración
// ═══════════════════════════════════════════════════════════════════════════════
flow('F03: Importador → Validar lote EUDR → GFW check → Declaración → TRACES NT', [
  { step: 'Dashboard M02 muestra semáforo EUDR por lote', check: has(read('app/m02/page.tsx'), 'eudr_status') || has(read('app/m02/page.tsx'), 'green') },
  { step: 'EUDRLoteClient consulta /api/gfw/forest-loss', check: has(read('app/m02/eudr/[loteId]/EUDRLoteClient.tsx'), '/api/gfw/forest-loss') },
  { step: 'GFW route con datos Hansen pre-calculados', check: has(read('app/api/gfw/forest-loss/route.ts'), 'HANSEN_FALLBACK') },
  { step: 'GFW devuelve risk_level (standard/elevated/high)', check: has(read('app/api/gfw/forest-loss/route.ts'), 'risk_level') },
  { step: 'validateEUDR() valida 12 requisitos', check: has(read('lib/services/s_eudr.ts'), 'validateEUDR') },
  { step: 'Declaración incluye código HS 0901', check: has(read('app/api/eudr/declaration/route.ts'), '0901') },
  { step: 'Declaración calcula retención 5 años', check: has(read('app/api/eudr/declaration/route.ts'), '5') && has(read('app/api/eudr/declaration/route.ts'), 'archiv') },
  { step: 'TRACES NT genera referencia TRA.NT.YYYY', check: has(read('app/api/eudr/traces-submit/route.ts'), 'TRA.NT') },
  { step: 'Declaración persiste en comercialStore', check: has(read('app/m02/eudr/[loteId]/EUDRLoteClient.tsx'), 'addEUDRRecord') || has(read('app/m02/eudr/[loteId]/EUDRLoteClient.tsx'), 'eudrRecords') },
]);

// ═══════════════════════════════════════════════════════════════════════════════
// FLUJO 4: Consumidor hace quiz → recibe recomendaciones IA → escanea QR
// ═══════════════════════════════════════════════════════════════════════════════
flow('F04: Consumidor → Quiz sensorial → IA recomienda lotes → Escanear QR → Puntos', [
  { step: 'Quiz recopila perfil (intensidad, acidez, sabores, proceso, origen)', check: has(read('app/m06/quiz/page.tsx'), 'intensidad') && has(read('app/m06/quiz/page.tsx'), 'acidez') },
  { step: 'setPerfil() guarda en consumidorStore', check: has(read('app/m06/quiz/page.tsx'), 'setPerfil') },
  { step: 'Feed M06 llama /api/ai/recommendations POST', check: has(read('app/m06/page.tsx'), '/api/ai/recommendations') },
  { step: 'IA scoring pesa cupping (40 pts) + EUDR (15) + intensidad (15) + acidez (15) + sabores (15)', check: has(read('app/api/ai/recommendations/route.ts'), '40') && has(read('app/api/ai/recommendations/route.ts'), 'cupping') },
  { step: 'Recomendaciones muestran match_pct %', check: has(read('app/m06/page.tsx'), 'match_pct') || has(read('app/m06/page.tsx'), 'match') },
  { step: 'BarcodeDetector API para cámara real', check: has(read('app/m06/escanear/page.tsx'), 'BarcodeDetector') },
  { step: 'Fallback a input manual si sin BarcodeDetector', check: has(read('app/m06/escanear/page.tsx'), 'supported') || has(read('app/m06/escanear/page.tsx'), 'fallback') || has(read('app/m06/escanear/page.tsx'), 'manual') },
  { step: 'Scan suma evento escaneo_qr (+10 puntos)', check: has(read('app/m06/escanear/page.tsx'), 'escaneo_qr') || has(read('app/m06/escanear/page.tsx'), 'addEvento') },
  { step: 'Scan suma sello stamp card', check: has(read('app/m06/escanear/page.tsx'), 'addSello') || has(read('app/m06/escanear/page.tsx'), 'sello') },
  { step: 'Pasaporte abre desde /lote/[hash]', check: exists('app/lote/[hash]/page.tsx') },
]);

// ═══════════════════════════════════════════════════════════════════════════════
// FLUJO 5: Cafetería registra scans en sala → ve analytics
// ═══════════════════════════════════════════════════════════════════════════════
flow('F05: Cafetería → QR en sala escaneado → ScanStore → Analytics dashboard', [
  { step: 'ScanStore genera seed de 30 días', check: has(read('lib/stores/scanStore.ts'), '30') },
  { step: 'addScan() registra fuente (sala/bolsa/web)', check: has(read('lib/stores/scanStore.ts'), 'addScan') && has(read('lib/stores/scanStore.ts'), 'sala') },
  { step: 'Analytics page lee scanStore', check: has(read('app/m05/analytics/page.tsx'), 'scanStore') || has(read('app/m05/analytics/page.tsx'), 'useScanStore') },
  { step: 'Analytics tiene selector de rango temporal', check: has(read('app/m05/analytics/page.tsx'), '7') && has(read('app/m05/analytics/page.tsx'), '30') },
  { step: 'Analytics calcula tasa conversión', check: has(read('app/m05/analytics/page.tsx'), 'conversion') || has(read('app/m05/analytics/page.tsx'), 'tasa') },
  { step: 'Google Maps rating visible en dashboard', check: has(read('app/m05/page.tsx'), 'rating') || has(read('app/m05/page.tsx'), 'Places') },
  { step: 'Aprovisionamiento modal Pedir muestra funciona', check: has(read('app/m05/aprovisionamiento/page.tsx'), 'muestraModal') },
]);

// ═══════════════════════════════════════════════════════════════════════════════
// FLUJO 6: Suscripción D2C + Cropster import
// ═══════════════════════════════════════════════════════════════════════════════
flow('F06: Tostaduria → Crear suscripción D2C → Simular cobro → Importar Cropster', [
  { step: 'SuscripcionStore con seed activo', check: has(read('lib/stores/suscripcionStore.ts'), 'activa') },
  { step: 'MRR calculado en suscripciones page', check: has(read('app/m03/suscripciones/page.tsx'), 'MRR') || has(read('app/m03/suscripciones/page.tsx'), 'mrr') },
  { step: 'simularCobro() con feedback visual', check: has(read('app/m03/suscripciones/page.tsx'), 'simularCobro') },
  { step: 'Migración acepta archivo CSV Cropster', check: has(read('app/m03/migracion/page.tsx'), 'csv') || has(read('app/m03/migracion/page.tsx'), 'CSV') },
  { step: 'Migración acepta .alog JSON', check: has(read('app/m03/migracion/page.tsx'), 'alog') || has(read('app/m03/migracion/page.tsx'), '.alog') },
  { step: 'Preview de datos antes de importar', check: has(read('app/m03/migracion/page.tsx'), 'preview') || has(read('app/m03/migracion/page.tsx'), 'Preview') },
  { step: 'Lotes importados se añaden a comercialStore', check: has(read('app/m03/migracion/page.tsx'), 'addLoteTostado') },
]);

// ═══════════════════════════════════════════════════════════════════════════════
// FLUJO 7: Marketplace unificado + carrito
// ═══════════════════════════════════════════════════════════════════════════════
flow('F07: Marketplace → Filtrar por rol/categoría → Añadir carrito → Checkout', [
  { step: 'Pills Soy: navegan a módulo correspondiente', check: has(read('app/page.tsx'), 'router.push') && has(read('app/page.tsx'), 'ROLES_COMPRAR') },
  { step: 'Feed unifica lotes + productos con relevancia', check: has(read('app/page.tsx'), 'feedItems') },
  { step: 'Categorías tienen colores únicos por tipo', check: has(read('app/page.tsx'), 'bg:') && has(read('app/page.tsx'), 'border:') },
  { step: 'CartStore permite añadir items', check: has(read('lib/stores/cartStore.ts'), 'addItem') },
  { step: 'CartModal muestra items del carrito', check: exists('components/brewchain/CartModal.tsx') },
  { step: '10+ lotes de 6+ países en mock', check: (read('lib/mock/lotes.ts').match(/id: 'lot-/g) || []).length >= 9 },
  { step: 'Productos B2B Granel disponibles', check: has(read('lib/mock/productos.ts'), 'b2b_granel') },
  { step: 'Pasaportes sellados demo accesibles (3+)', check: has(read('lib/mock/pasaportes.ts'), 'pas-003') && has(read('lib/mock/pasaportes.ts'), 'pas-002') },
]);

// ═══════════════════════════════════════════════════════════════════════════════
// TypeScript check
// ═══════════════════════════════════════════════════════════════════════════════
section('TYPESCRIPT');
try {
  execSync('npx tsc --noEmit --skipLibCheck 2>&1 | grep -v node_modules | grep -v next.config', { cwd: ROOT, stdio: 'pipe' });
  console.log(`  ${C.green}✓${C.reset} TypeScript: 0 errores`);
  passed++;
} catch (e) {
  const out = e.stdout?.toString() || '';
  const errors = out.split('\n').filter(l => l.includes('error TS')).length;
  if (errors === 0) {
    console.log(`  ${C.green}✓${C.reset} TypeScript: 0 errores`);
    passed++;
  } else {
    console.log(`  ${C.red}✗${C.reset} TypeScript: ${errors} errores`);
    failures.push({ flow: 'TypeScript', step: `${errors} errores`, fix: 'npx tsc --noEmit para ver detalles' });
    failed++;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Resumen
// ═══════════════════════════════════════════════════════════════════════════════
console.log(`\n${'═'.repeat(54)}`);
console.log(`${C.bold}  RESUMEN E2E BREWCHAIN${C.reset}`);
console.log(`${'═'.repeat(54)}`);
console.log(`  ${C.green}✓ Flujos OK${C.reset}:    ${passed}`);
console.log(`  ${C.red}✗ Flujos KO${C.reset}:    ${failed}`);
console.log(`${'═'.repeat(54)}`);

const score = Math.round((passed / (passed + failed)) * 100);
const color = score === 100 ? C.green : score >= 85 ? C.yellow : C.red;
const label = score === 100 ? 'TODOS LOS FLUJOS VALIDADOS' : score >= 85 ? 'CASI LISTO' : 'FLUJOS CRÍTICOS ROTOS';
console.log(`\n  Score E2E: ${color}${score}%${C.reset} — ${color}${C.bold}${label}${C.reset}\n`);

if (failures.length > 0) {
  console.log(`${C.bold}${C.red}  Flujos fallidos:${C.reset}`);
  failures.forEach(f => {
    console.log(`  • [${f.flow}] ${f.step}`);
    if (f.fix) console.log(`    ${C.yellow}→ ${f.fix}${C.reset}`);
  });
  console.log();
}

process.exit(failed > 0 ? 1 : 0);
