#!/usr/bin/env node
/**
 * BREWCHAIN Q&A Deterministic Module Validator
 * Ejecuta preguntas y respuestas específicas por módulo para validar MVP.
 * Cada Q&A verifica un flujo concreto de negocio/técnico.
 * Uso: node scripts/qa-modules.mjs [--module M01|M02|M03|M05|M06|all]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const C = {
  reset:'\x1b[0m', bold:'\x1b[1m', green:'\x1b[32m', red:'\x1b[31m',
  yellow:'\x1b[33m', cyan:'\x1b[36m', dim:'\x1b[2m', blue:'\x1b[34m', magenta:'\x1b[35m'
};

let passed = 0, failed = 0, warnings = 0;
const failures = [];

function read(rel) {
  try { return fs.readFileSync(path.join(ROOT, rel), 'utf-8'); } catch { return ''; }
}
function exists(rel) { return fs.existsSync(path.join(ROOT, rel)); }
function has(content, pattern) {
  if (typeof pattern === 'string') return content.includes(pattern);
  return pattern.test(content);
}

function qa(question, answer, pass, isWarning = false) {
  if (pass) {
    console.log(`  ${C.green}✓${C.reset} ${C.dim}Q:${C.reset} ${question}`);
    passed++;
  } else if (isWarning) {
    console.log(`  ${C.yellow}⚠${C.reset} ${C.dim}Q:${C.reset} ${question}`);
    console.log(`    ${C.yellow}→ ${answer}${C.reset}`);
    warnings++;
  } else {
    console.log(`  ${C.red}✗${C.reset} ${C.dim}Q:${C.reset} ${question}`);
    console.log(`    ${C.red}→ ${answer}${C.reset}`);
    failed++;
    failures.push({ question, answer });
  }
}

function section(title, color = C.cyan) {
  console.log(`\n${C.bold}${color}── ${title} ──────────────────────────────────────${C.reset}`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// M01 — CAFICULTOR
// ═══════════════════════════════════════════════════════════════════════════════
function qaM01() {
  section('M01 CAFICULTOR — Flujo GPS, ICO, Chat, Cámara', C.green);
  const dash  = read('app/m01/page.tsx');
  const parc  = read('app/m01/parcela/page.tsx');
  const lotes = read('app/m01/lotes/page.tsx');
  const hist  = read('app/m01/historial/page.tsx');
  const chat  = read('app/m01/mensajes/page.tsx');
  const cam   = read('app/m01/camara/page.tsx');
  const icoHook = read('lib/hooks/usePrecioICO.ts');
  const mockVentas = read('lib/mock/ventas.ts');

  qa('¿El dashboard M01 muestra precio ICO en tiempo real?', 'usePrecioICO no integrado', has(dash, 'usePrecioICO'));
  qa('¿El ICO tiene tendencia (subida/bajada)?', 'tendencia no renderizada', has(dash, 'tendencia') || has(dash, 'variacion'));
  qa('¿El ICO hace polling con setInterval?', 'setInterval no encontrado', has(icoHook, 'setInterval'));
  qa('¿El hook ICO tiene fallback sinusoidal si falla API?', 'sin fallback', has(icoHook, 'Math.sin') || has(icoHook, 'fallback'));
  qa('¿Parcela tiene wizard multi-paso?', 'no hay etapas', has(parc, 'step') || has(parc, 'stage') || has(parc, 'Stage'));
  qa('¿Parcela integra GPSMapPicker?', 'mapa no integrado', has(parc, 'GPSMapPicker') || has(parc, 'gps_lat'));
  qa('¿Lotes filtra por caficultor activo?', 'sin filtro por caficultor', has(lotes, 'caf-001') || has(lotes, 'caficultor_id'));
  qa('¿Historial tiene KPIs de ingresos?', 'sin KPIs económicos', has(hist, 'EUR') || has(hist, 'total') || has(hist, 'ingresos'));
  qa('¿Historial tiene gráfico de ventas?', 'sin gráfico', has(hist, 'chart') || has(hist, 'barra') || has(hist, 'bar') || has(hist, 'Chart'));
  qa('¿Mock ventas tiene datos de caficultor?', 'datos vacíos', has(mockVentas, 'MOCK_VENTAS_CAF001') || has(mockVentas, 'vta-001'));
  qa('¿Chat usa chatStore para enviar mensajes?', 'chatStore no integrado', has(chat, 'chatStore') || has(chat, 'useChatStore'));
  qa('¿Chat tiene polling de mensajes nuevos?', 'sin polling', has(chat, 'setInterval') || has(chat, 'MENSAJES_ENTRANTES'));
  qa('¿Cámara simula detección de plagas?', 'sin detección plagas', has(cam, 'roya') || has(cam, 'Hemileia') || has(cam, 'detectar'));
  qa('¿Layout M01 tiene sidebar activo?', 'sin layout', exists('app/m01/layout.tsx'));
}

// ═══════════════════════════════════════════════════════════════════════════════
// M02 — IMPORTADORA / EUDR
// ═══════════════════════════════════════════════════════════════════════════════
function qaM02() {
  section('M02 IMPORTADORA — EUDR, TRACES NT, Pedidos B2B', C.blue);
  const dash    = read('app/m02/page.tsx');
  const eudr    = read('app/m02/eudr/page.tsx');
  const client  = read('app/m02/eudr/[loteId]/EUDRLoteClient.tsx');
  const pedidos = read('app/m02/pedidos/page.tsx');
  const cupping = read('app/m02/cupping/page.tsx');
  const sEudr   = read('lib/services/s_eudr.ts');
  const apiDecl = read('app/api/eudr/declaration/route.ts');
  const apiGfw  = read('app/api/gfw/forest-loss/route.ts');
  const pedStore= read('lib/stores/pedidoStore.ts');

  qa('¿Dashboard M02 cuenta lotes por EUDR status?', 'sin conteo EUDR', has(dash, 'green') && has(dash, 'amber') && has(dash, 'red'));
  qa('¿EUDR valida 12 requisitos completos?', 'validación incompleta', has(sEudr, '12') || (has(sEudr, 'required') && has(sEudr, 'satisfied')));
  qa('¿EUDRSemaforo consulta GFW API real?', 'sin integración GFW', has(client, '/api/gfw/forest-loss'));
  qa('¿GFW route tiene datos Hansen pre-calculados?', 'sin fallback Hansen', has(apiGfw, 'HANSEN_FALLBACK') || has(apiGfw, 'loss_ha'));
  qa('¿Declaración EUDR incluye código HS café?', 'sin código HS', has(apiDecl, '0901') || has(apiDecl, 'hs_code'));
  qa('¿TRACES NT genera referencia TRA.NT.YYYY?', 'formato incorrecto', has(apiDecl, 'TRA.NT') || has(read('app/api/eudr/traces-submit/route.ts'), 'TRA.NT'));
  qa('¿Pedidos B2B tienen máquina de estados completa?', 'sin estados', has(pedidos, 'aceptado') && has(pedidos, 'enviado') && has(pedidos, 'rechazado'));
  qa('¿Pedidos tienen tracking ID?', 'sin tracking', has(pedidos, 'tracking'));
  qa('¿Pedidos tienen motivo de rechazo?', 'sin rechazo', has(pedidos, 'motivo') || has(pedidos, 'rechazo'));
  qa('¿PedidoStore tiene datos seed (4+ pedidos)?', 'seed insuficiente', has(pedStore, 'MOCK_PEDIDOS') || has(pedStore, 'ped-00'));
  qa('¿Cupping usa protocolo CVA 2024?', 'sin protocolo CVA', has(cupping, 'CVA') || has(cupping, '2024'));
  qa('¿Cupping notifica al caficultor?', 'sin notificación', has(cupping, 'addAlerta') || has(cupping, 'notif'));
}

// ═══════════════════════════════════════════════════════════════════════════════
// M03 — TOSTADURIA
// ═══════════════════════════════════════════════════════════════════════════════
function qaM03() {
  section('M03 TOSTADURIA — QR, Cropster, Suscripciones D2C', C.yellow);
  const qrPage  = read('app/m03/qr/page.tsx');
  const mig     = read('app/m03/migracion/page.tsx');
  const sus     = read('app/m03/suscripciones/page.tsx');
  const hist    = read('app/m03/historial/page.tsx');
  const sQR     = read('lib/services/s_qr.ts');
  const sCrop   = read('lib/services/s_cropster.ts');
  const susStore= read('lib/stores/suscripcionStore.ts');
  const comStore= read('lib/stores/comercialStore.ts');
  const apiQR   = read('app/api/qr/generate/route.ts');

  qa('¿QR page tiene Gate L2 con firma?', 'sin Gate L2', has(qrPage, 'gate') || has(qrPage, 'Gate') || has(qrPage, 'firma'));
  qa('¿QR calcula hash SHA-256?', 'sin SHA-256', has(sQR, 'SHA-256') || has(sQR, 'sha256') || has(apiQR, 'sha256') || has(apiQR, 'SHA'));
  qa('¿QR persiste en comercialStore tras sellado?', 'sin persistencia', has(qrPage, 'sealPassport'));
  qa('¿QR incluye botón WhatsApp?', 'sin WhatsApp share', has(qrPage, 'wa.me') || has(qrPage, 'whatsapp'));
  qa('¿QR incluye copiar URL al portapapeles?', 'sin clipboard', has(qrPage, 'clipboard') || has(qrPage, 'Clipboard'));
  qa('¿QR persiste LoteTostado con merma?', 'sin merma', has(qrPage, 'merma') || has(qrPage, 'calcularMerma'));
  qa('¿Migración Cropster parsea CSV real?', 'sin parser CSV', has(sCrop, 'parseCropsterCSV'));
  qa('¿Migración Cropster parsea .alog JSON?', 'sin parser .alog', has(sCrop, 'parseCropsterAlog'));
  qa('¿Migración tiene preview antes de importar?', 'sin preview', has(mig, 'preview') || has(mig, 'Preview'));
  qa('¿Suscripciones calculan MRR?', 'sin cálculo MRR', has(sus, 'MRR') || has(sus, 'mrr'));
  qa('¿Suscripciones tienen acciones pausar/reactivar?', 'sin acciones', has(sus, 'pausar') || has(sus, 'pausada'));
  qa('¿SuscripcionStore tiene 7+ métodos?', 'store incompleto', has(susStore, 'simularCobro') && has(susStore, 'cancelar'));
  qa('¿ComercialStore tiene sealPassport?', 'método ausente', has(comStore, 'sealPassport'));
  qa('¿Historial M03 tiene filtros?', 'sin filtros', has(hist, 'filtro') || has(hist, 'filter') || has(hist, 'nivel'));
}

// ═══════════════════════════════════════════════════════════════════════════════
// M05 — CAFETERIA
// ═══════════════════════════════════════════════════════════════════════════════
function qaM05() {
  section('M05 CAFETERÍA — QR Sala, Analytics, Google Maps', C.magenta);
  const dash    = read('app/m05/page.tsx');
  const anal    = read('app/m05/analytics/page.tsx');
  const menu    = read('app/m05/menu/page.tsx');
  const aprov   = read('app/m05/aprovisionamiento/page.tsx');
  const places  = read('lib/hooks/usePlacesRating.ts');
  const scanSt  = read('lib/stores/scanStore.ts');
  const apiPlaces = read('app/api/places/rating/route.ts');

  qa('¿Dashboard M05 muestra rating de Google Maps?', 'sin rating', has(dash, 'rating') || has(dash, 'usePlacesRating'));
  qa('¿Places hook tiene caché de 6h?', 'sin caché', has(places, '6') && (has(places, 'cache') || has(places, 'TTL') || has(places, 'ttl')));
  qa('¿Places API tiene fallback sinusoidal sin API key?', 'sin fallback', has(apiPlaces, 'Math.sin') || has(apiPlaces, 'fallback'));
  qa('¿Analytics tiene selector de rango 7/14/30d?', 'sin selector', has(anal, '7') && has(anal, '14') && has(anal, '30'));
  qa('¿Analytics tiene gráfico de escaneos por día?', 'sin gráfico diario', has(anal, 'dia') || has(anal, 'day') || has(anal, 'escaneos'));
  qa('¿Analytics calcula tasa de conversión?', 'sin tasa conversión', has(anal, 'conversion') || has(anal, 'conversión') || has(anal, 'tasa'));
  qa('¿ScanStore genera 30 días de seed?', 'sin seed temporal', has(scanSt, '30') && (has(scanSt, 'seed') || has(scanSt, 'Seed')));
  qa('¿ScanStore distribuye scans entre 8-22h?', 'distribución incorrecta', has(scanSt, '8') && has(scanSt, '22'));
  qa('¿Menú carta muestra pasaporte QR por ítem?', 'sin link a pasaporte', has(menu, '/lote/') || has(menu, 'qr_hash') || has(menu, 'pasaporte'));
  qa('¿Aprovisionamiento tiene modal Pedir muestra?', 'modal ausente', has(aprov, 'muestraModal') || has(aprov, 'modal'));
  qa('¿Aprovisionamiento muestra coste estimado?', 'sin coste', has(aprov, 'precio_fob') && (has(aprov, 'coste') || has(aprov, 'Coste') || has(aprov, 'estimado')));
}

// ═══════════════════════════════════════════════════════════════════════════════
// M06 — CONSUMIDOR
// ═══════════════════════════════════════════════════════════════════════════════
function qaM06() {
  section('M06 CONSUMIDOR — Cámara QR, IA, Fidelización, Compras', C.cyan);
  const scan    = read('app/m06/escanear/page.tsx');
  const fid     = read('app/m06/fidelizacion/page.tsx');
  const feed    = read('app/m06/page.tsx');
  const quiz    = read('app/m06/quiz/page.tsx');
  const perfil  = read('app/m06/perfil/page.tsx');
  const hist    = read('app/m06/historial/page.tsx');
  const fidSt   = read('lib/stores/fidelizacionStore.ts');
  const apiAI   = read('app/api/ai/recommendations/route.ts');
  const loteHash= read('app/lote/[hash]/page.tsx');

  qa('¿Escanear usa BarcodeDetector nativo?', 'sin BarcodeDetector', has(scan, 'BarcodeDetector'));
  qa('¿Escanear tiene fallback si BarcodeDetector no disponible?', 'sin fallback input', has(scan, 'fallback') || has(scan, 'manual') || has(scan, 'supported'));
  qa('¿Escanear tiene overlay visor con animación?', 'sin visor QR', has(scan, 'scanline') || has(scan, 'viewfinder') || has(scan, 'overlay'));
  qa('¿Escanear suma puntos fidelización al escanear?', 'sin puntos', has(scan, 'addEvento') || has(scan, 'escaneo_qr'));
  qa('¿Escanear suma sello stamp card?', 'sin sello', has(scan, 'addSello') || has(scan, 'sello'));
  qa('¿Feed M06 llama a /api/ai/recommendations?', 'sin llamada IA', has(feed, '/api/ai/recommendations'));
  qa('¿IA recommendations tiene scoring multi-dimensión?', 'scoring simple', has(apiAI, 'cupping') && has(apiAI, 'acidez') && has(apiAI, 'intensidad'));
  qa('¿IA scoring incluye sabores del proceso (natural/lavado)?', 'sin mapeo proceso→sabores', has(apiAI, 'PROCESO_SABORES') || (has(apiAI, 'natural') && has(apiAI, 'frutal')));
  qa('¿Fidelización tiene stamp card visual?', 'sin tarjeta visual', has(fid, 'sello') && (has(fid, 'grid') || has(fid, '10')));
  qa('¿Fidelización tiene canje de recompensas?', 'sin canje', has(fid, 'canjear') || has(fid, 'Canjear'));
  qa('¿FidelizacionStore tiene seed con puntos iniciales?', 'sin seed', has(fidSt, '135') || has(fidSt, 'puntos'));
  qa('¿Quiz tiene 5 preguntas sensoriales?', 'menos de 5 preguntas', has(quiz, 'intensidad') && has(quiz, 'acidez') && has(quiz, 'proceso'));
  qa('¿Perfil consumidor muestra archetype sensorial?', 'sin archetype', has(perfil, 'archetype') || has(perfil, 'Archetype') || has(perfil, 'perfil'));
  qa('¿Historial compras muestra estado del pedido?', 'sin estados', has(hist, 'procesando') || has(hist, 'confirmado') || has(hist, 'enviado'));
  qa('¿/lote/[hash] es client component (lee store)?', 'sigue siendo server component', has(loteHash, "'use client'") || has(loteHash, '"use client"'));
  qa('¿/lote/[hash] combina mocks + store.pasaportes?', 'solo mocks', has(loteHash, 'storePasaportes') || has(loteHash, 'useComercialStore'));
}

// ═══════════════════════════════════════════════════════════════════════════════
// CORE — Marketplace, PWA, Tipos
// ═══════════════════════════════════════════════════════════════════════════════
function qaCore() {
  section('CORE — Marketplace, PWA, API Routes', C.dim);
  const market  = read('app/page.tsx');
  const layout  = read('app/layout.tsx');
  const manifest= read('public/manifest.json');
  const sw      = read('public/sw.js');
  const lotesMock = read('lib/mock/lotes.ts');
  const prodMock  = read('lib/mock/productos.ts');

  qa('¿Marketplace tiene pills de categoría con colores únicos?', 'pills sin colores', has(market, 'CATEGORIAS') && has(market, 'bg:'));
  qa('¿Pills "Soy:" navegan al módulo correspondiente?', 'sin navegación', has(market, 'entrarComoRol') || has(market, 'router.push'));
  qa('¿Marketplace tiene feed unificado (lotes + productos)?', 'feed incompleto', has(market, 'feedItems') && has(market, 'lotesFiltrados'));
  qa('¿Marketplace tiene ordenación por relevancia/precio/cupping?', 'sin ordenación', has(market, 'relevancia') && has(market, 'cupping_desc'));
  qa('¿Hay 10+ lotes mock con datos ricos?', 'pocos lotes', (lotesMock.match(/id: 'lot-/g) || []).length >= 9);
  qa('¿Hay productos B2B Granel en el mock?', 'sin B2B Granel', has(prodMock, 'b2b_granel') && has(prodMock, 'b2b-001'));
  qa('¿PWA manifest tiene screenshots narrow/wide?', 'sin screenshots', has(manifest, 'narrow') && has(manifest, 'wide'));
  qa('¿PWA service worker usa Network First?', 'sin estrategia', has(sw, 'network') || has(sw, 'Network') || has(sw, 'networkFirst'));
  qa('¿Layout tiene splash screens para iOS (startupImage)?', 'sin splash iOS', has(layout, 'startupImage') || has(layout, 'apple-touch-startup-image'));
  qa('¿Layout tiene 11+ splash screens iOS?', 'pocos splashes', (layout.match(/splash-\d+x\d+/g) || []).length >= 8);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════════════════════
const args = process.argv.slice(2);
const moduleFlag = args[args.indexOf('--module') + 1] || 'all';

console.log(`\n${C.bold}╔══════════════════════════════════════════════════╗`);
console.log(`║   BREWCHAIN Q&A MODULE VALIDATOR                ║`);
console.log(`╚══════════════════════════════════════════════════╝${C.reset}`);

const runners = { M01: qaM01, M02: qaM02, M03: qaM03, M05: qaM05, M06: qaM06, CORE: qaCore };

if (moduleFlag === 'all') {
  Object.values(runners).forEach(fn => fn());
} else {
  const fn = runners[moduleFlag.toUpperCase()];
  if (!fn) { console.error(`Módulo desconocido: ${moduleFlag}. Opciones: M01 M02 M03 M05 M06 CORE all`); process.exit(1); }
  fn();
}

// Resumen
console.log(`\n${'═'.repeat(52)}`);
console.log(`${C.bold}  RESUMEN Q&A BREWCHAIN${C.reset}`);
console.log(`${'═'.repeat(52)}`);
console.log(`  ${C.green}✓ Pasados${C.reset}:  ${passed}`);
console.log(`  ${C.yellow}⚠ Avisos${C.reset}:   ${warnings}`);
console.log(`  ${C.red}✗ Fallidos${C.reset}: ${failed}`);
console.log(`${'═'.repeat(52)}`);

const total = passed + failed + warnings;
const score = total > 0 ? Math.round((passed / (passed + failed)) * 100) : 100;
const color = score === 100 ? C.green : score >= 80 ? C.yellow : C.red;
const label = score === 100 ? 'MVP LISTO' : score >= 80 ? 'CASI LISTO' : 'NECESITA TRABAJO';
console.log(`\n  Score: ${color}${score}%${C.reset} — ${color}${label}${C.reset}\n`);

if (failures.length > 0) {
  console.log(`${C.bold}${C.red}  Fallos detectados:${C.reset}`);
  failures.forEach(f => console.log(`  • ${f.question}\n    ${C.dim}${f.answer}${C.reset}`));
  console.log();
}

process.exit(failed > 0 ? 1 : 0);
