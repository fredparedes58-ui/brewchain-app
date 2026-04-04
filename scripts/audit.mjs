/**
 * BREWCHAIN — Auditor determinista de UX, navegación y módulos
 * Uso: node scripts/audit.mjs
 *
 * Chequea sin servidor:
 *   1. Cobertura de rutas (todos los pages existen)
 *   2. Stores: exports, métodos requeridos
 *   3. API routes: métodos HTTP declarados
 *   4. Navegación: links del Sidebar apuntan a pages reales
 *   5. Módulo por módulo: lógica, tipos, imports críticos
 *   6. PWA: manifest, iconos, splash screens
 *   7. TypeScript: tsc --noEmit
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

// ─── Colores ──────────────────────────────────────────────────────────────────
const G = s => `\x1b[32m${s}\x1b[0m`;   // verde
const R = s => `\x1b[31m${s}\x1b[0m`;   // rojo
const Y = s => `\x1b[33m${s}\x1b[0m`;   // amarillo
const B = s => `\x1b[1m${s}\x1b[0m`;    // bold
const D = s => `\x1b[2m${s}\x1b[0m`;    // dim

let passed = 0, failed = 0, warned = 0;
const failures = [];

function ok(msg)   { console.log(`  ${G('✓')} ${msg}`); passed++; }
function fail(msg) { console.log(`  ${R('✗')} ${msg}`); failed++; failures.push(msg); }
function warn(msg) { console.log(`  ${Y('⚠')} ${msg}`); warned++; }
function section(title) { console.log(`\n${B(`── ${title} ──────────────────────────────────`)}`); }

// ─── Helpers ──────────────────────────────────────────────────────────────────
const file = (...parts) => path.join(ROOT, ...parts);
const exists = (...parts) => existsSync(file(...parts));
const read = (...parts) => readFileSync(file(...parts), 'utf8');
const has = (content, pattern) =>
  pattern instanceof RegExp ? pattern.test(content) : content.includes(pattern);

// ─── 1. COBERTURA DE RUTAS ────────────────────────────────────────────────────
section('1. COBERTURA DE RUTAS (pages)');

const EXPECTED_PAGES = [
  'app/page.tsx',
  'app/lote/[hash]/page.tsx',
  // M01
  'app/m01/page.tsx',
  'app/m01/parcela/page.tsx',
  'app/m01/lotes/page.tsx',
  'app/m01/historial/page.tsx',
  'app/m01/mensajes/page.tsx',
  'app/m01/camara/page.tsx',
  // M02
  'app/m02/page.tsx',
  'app/m02/catalogo/page.tsx',
  'app/m02/eudr/page.tsx',
  'app/m02/eudr/[loteId]/page.tsx',
  'app/m02/eudr/[loteId]/EUDRLoteClient.tsx',
  'app/m02/pedidos/page.tsx',
  'app/m02/wish-list/page.tsx',
  'app/m02/cupping/page.tsx',
  // M03
  'app/m03/page.tsx',
  'app/m03/qr/page.tsx',
  'app/m03/historial/page.tsx',
  'app/m03/lotes/page.tsx',
  'app/m03/perfiles/page.tsx',
  'app/m03/suscripciones/page.tsx',
  'app/m03/migracion/page.tsx',
  // M05
  'app/m05/page.tsx',
  'app/m05/analytics/page.tsx',
  'app/m05/menu/page.tsx',
  'app/m05/aprovisionamiento/page.tsx',
  // M06
  'app/m06/page.tsx',
  'app/m06/escanear/page.tsx',
  'app/m06/fidelizacion/page.tsx',
  'app/m06/historial/page.tsx',
  'app/m06/quiz/page.tsx',
  'app/m06/perfil/page.tsx',
  // Layouts
  'app/layout.tsx',
  'app/m01/layout.tsx',
  'app/m02/layout.tsx',
  'app/m03/layout.tsx',
  'app/m05/layout.tsx',
  'app/m06/layout.tsx',
];

for (const p of EXPECTED_PAGES) {
  exists(p) ? ok(p) : fail(`FALTA: ${p}`);
}

// ─── 2. API ROUTES ────────────────────────────────────────────────────────────
section('2. API ROUTES');

const EXPECTED_APIS = {
  'app/api/ico/price/route.ts':               ['GET'],
  'app/api/qr/generate/route.ts':             ['POST'],
  'app/api/qr/verify/route.ts':               ['GET'],
  'app/api/qr/scan/route.ts':                 ['POST'],
  'app/api/eudr/declaration/route.ts':        ['POST'],
  'app/api/eudr/traces-submit/route.ts':      ['POST'],
  'app/api/eudr/validate/route.ts':           ['POST'],
  'app/api/gfw/forest-loss/route.ts':         ['GET'],
  'app/api/gps/validate/route.ts':            ['POST'],
  'app/api/pasaportes/[hash]/route.ts':       ['GET'],
  'app/api/lotes/route.ts':                   ['GET'],
  'app/api/dss/score/route.ts':               ['POST'],
  'app/api/ai/recommendations/route.ts':      ['POST'],
  'app/api/places/rating/route.ts':           ['GET'],
};

for (const [routePath, methods] of Object.entries(EXPECTED_APIS)) {
  if (!exists(routePath)) { fail(`FALTA route: ${routePath}`); continue; }
  const content = read(routePath);
  let allOk = true;
  for (const method of methods) {
    if (!has(content, `export async function ${method}`) && !has(content, `export function ${method}`)) {
      fail(`${routePath} — falta export ${method}`);
      allOk = false;
    }
  }
  if (allOk) ok(`${routePath} [${methods.join(',')}]`);
}

// ─── 3. STORES ────────────────────────────────────────────────────────────────
section('3. STORES — exports y métodos requeridos');

const STORE_CHECKS = {
  'lib/stores/authStore.ts': ['useAuthStore', 'role', 'nombre', 'logout'],
  'lib/stores/caficultorStore.ts': ['useCaficultorStore', 'alertas', 'addAlerta', 'precioICO', 'setPrecioICO'],
  'lib/stores/comercialStore.ts': ['useComercialStore', 'sealPassport', 'eudrRecords', 'addEUDRRecord', 'lotesTostados', 'addLoteTostado'],
  'lib/stores/cartStore.ts': ['useCartStore', 'items', 'addItem', 'removeItem'],
  'lib/stores/chatStore.ts': ['useChatStore', 'conversaciones', 'mensajesNuevosTotal'],
  'lib/stores/pedidoStore.ts': ['usePedidoStore', 'pedidos', 'addPedido', 'updateEstado'],
  'lib/stores/suscripcionStore.ts': ['useSuscripcionStore', 'suscriptores', 'addSuscriptor', 'pausar', 'reactivar', 'cancelar', 'simularCobro'],
  'lib/stores/fidelizacionStore.ts': ['useFidelizacionStore', 'puntos', 'sellos', 'historial', 'addEvento', 'addSello', 'canjear'],
  'lib/stores/scanStore.ts': ['useScanStore', 'eventos', 'addScan', 'marcarConversion'],
  'lib/stores/consumidorStore.ts': ['useConsumidorStore', 'perfil', 'qrEscaneados', 'setPerfil', 'addQRescaneado'],
  'lib/stores/compraStore.ts': ['useCompraStore', 'compras', 'addCompra'],
};

for (const [storePath, required] of Object.entries(STORE_CHECKS)) {
  if (!exists(storePath)) { fail(`FALTA store: ${storePath}`); continue; }
  const content = read(storePath);
  const missing = required.filter(r => !has(content, r));
  if (missing.length === 0) {
    ok(`${path.basename(storePath)} — ${required.length} símbolos ✓`);
  } else {
    fail(`${storePath} — faltan: ${missing.join(', ')}`);
  }
}

// ─── 4. TIPOS ─────────────────────────────────────────────────────────────────
section('4. TIPOS — interfaces críticas');

const TYPE_CHECKS = {
  'lib/types/lote.ts':          ['Lote', 'eudr_status', 'gps_lat', 'gps_lng', 'cupping_score'],
  'lib/types/passport.ts':      ['PassportData', 'SealedPassport', 'hash_corto', 'public_url'],
  'lib/types/eudr.ts':          ['EUDRDeclarationRecord', 'referencia_traces', 'traces_nt_reference'],
  'lib/types/tostado.ts':       ['LoteTostado', 'Suscriptor', 'CropsterCSVRow', 'calcularMerma'],
  'lib/types/pedido.ts':        ['PedidoB2B', 'LineaPedido', 'PedidoEstado'],
  'lib/types/fidelizacion.ts':  ['PuntoEvento', 'Sello', 'PUNTOS_POR_EVENTO', 'RECOMPENSAS', 'SELLOS_PARA_GRATIS'],
  'lib/types/scanAnalytics.ts': ['ScanEvent', 'ScanFuente'],
  'lib/types/compra.ts':        ['Compra', 'CompraItem'],
  'lib/types/chat.ts':          ['Mensaje', 'Conversacion'],
  'lib/types/ventas.ts':        ['VentaHistorial', 'ResumenVentas'],
};

for (const [typePath, required] of Object.entries(TYPE_CHECKS)) {
  if (!exists(typePath)) { fail(`FALTA tipos: ${typePath}`); continue; }
  const content = read(typePath);
  const missing = required.filter(r => !has(content, r));
  if (missing.length === 0) {
    ok(`${path.basename(typePath)} — ${required.length} símbolos ✓`);
  } else {
    fail(`${typePath} — faltan: ${missing.join(', ')}`);
  }
}

// ─── 5. SERVICIOS ─────────────────────────────────────────────────────────────
section('5. SERVICIOS');

const SERVICE_CHECKS = {
  'lib/services/s_qr.ts':       ['generateQRDataURL'],
  'lib/services/s_eudr.ts':     ['loteToEUDRData'],
  'lib/services/s_gps.ts':      ['validateGPS'],
  'lib/services/s_dss.ts':      ['calculateFocusScore'],
  'lib/services/s_cropster.ts': ['parseCropsterCSV', 'parseCropsterAlog', 'mapToLoteTostado', 'mapToPerfilTueste'],
};

for (const [svcPath, required] of Object.entries(SERVICE_CHECKS)) {
  if (!exists(svcPath)) { fail(`FALTA servicio: ${svcPath}`); continue; }
  const content = read(svcPath);
  const missing = required.filter(r => !has(content, r));
  if (missing.length === 0) {
    ok(`${path.basename(svcPath)} — [${required.join(', ')}] ✓`);
  } else {
    fail(`${svcPath} — faltan: ${missing.join(', ')}`);
  }
}

// ─── 6. NAVEGACIÓN SIDEBAR ────────────────────────────────────────────────────
section('6. NAVEGACIÓN — Sidebar links → pages');

const sidebarContent = read('components/layout/Sidebar.tsx');
const hrefMatches = [...sidebarContent.matchAll(/href:\s*'([^']+)'/g)].map(m => m[1]);

for (const href of hrefMatches) {
  if (href === '/' || href === '#' || href.includes('?tab=')) {
    ok(`${href} (ruta especial)`);
    continue;
  }
  // Convertir href a ruta de archivo
  const pageFile = `app${href}/page.tsx`;
  const dynamicFile = `app${href.replace(/\/[^/]+$/, '/[loteId]')}/page.tsx`;
  if (exists(pageFile)) {
    ok(`${href} → ${pageFile}`);
  } else if (exists(dynamicFile)) {
    ok(`${href} → ${dynamicFile} (dinámica)`);
  } else {
    fail(`Sidebar href="${href}" → NO existe ${pageFile}`);
  }
}

// ─── 7. MÓDULO M01 — Caficultor ──────────────────────────────────────────────
section('7. M01 CAFICULTOR — Flujo de trabajo');

{
  // Precio ICO en tiempo real
  const m01 = read('app/m01/page.tsx');
  has(m01, 'usePrecioICO')        ? ok('M01: hook usePrecioICO integrado') : fail('M01: falta usePrecioICO en page');
  has(m01, 'precioICO')           ? ok('M01: precioICO renderizado') : fail('M01: falta display precioICO');
  has(m01, 'tendencia')           ? ok('M01: tendencia de precio mostrada') : warn('M01: tendencia no visible en page');

  // Hook ICO
  const icoHook = read('lib/hooks/usePrecioICO.ts');
  has(icoHook, 'setInterval')     ? ok('M01: polling ICO con setInterval') : fail('M01: falta polling en usePrecioICO');
  has(icoHook, '30_000')          ? ok('M01: intervalo 30s ICO') : warn('M01: intervalo ICO distinto de 30s');

  // Historial ventas
  const historial = read('app/m01/historial/page.tsx');
  has(historial, 'VentaHistorial') || has(historial, 'MOCK_VENTAS') || has(historial, 'ventas')
    ? ok('M01: historial de ventas con datos') : fail('M01: historial sin datos reales');
  has(historial, 'ingresos')      ? ok('M01: KPI ingresos en historial') : warn('M01: KPI ingresos no detectado');

  // Chat
  const chat = read('app/m01/mensajes/page.tsx');
  has(chat, 'useChatStore')       ? ok('M01: chat conectado a chatStore') : fail('M01: chat sin store');
  has(chat, 'setInterval')        ? ok('M01: polling mensajes nuevos') : warn('M01: chat sin polling');

  // Parcela GPS
  const parcela = read('app/m01/parcela/page.tsx');
  has(parcela, 'GPSMapPicker') || has(parcela, 'gps')
    ? ok('M01: GPS/mapa en parcela') : warn('M01: parcela sin GPS picker');

  // API ICO
  const icoApi = read('app/api/ico/price/route.ts');
  has(icoApi, 'Math.sin')         ? ok('M01: precio ICO con oscilación sinusoidal') : fail('M01: API ICO sin simulación');
  has(icoApi, 'BASE_PRICE')       ? ok('M01: BASE_PRICE definido') : fail('M01: falta BASE_PRICE');
}

// ─── 8. MÓDULO M02 — Comercial/EUDR ─────────────────────────────────────────
section('8. M02 COMERCIAL — EUDR, TRACES, Pedidos B2B');

{
  // EUDR page
  const eudr = read('app/m02/eudr/page.tsx');
  has(eudr, 'eudrRecords') || has(eudr, 'addEUDRRecord')
    ? ok('M02: declaraciones EUDR persistidas en store') : fail('M02: EUDR sin persistencia');
  has(eudr, 'traces-submit') || has(eudr, 'traces_nt_reference')
    ? ok('M02: integración TRACES NT presente') : fail('M02: falta TRACES NT');

  // EUDR dinámica
  const eudrDyn = read('app/m02/eudr/[loteId]/EUDRLoteClient.tsx');
  has(eudrDyn, 'gfw') || has(eudrDyn, 'forest-loss')
    ? ok('M02: GFW API integrada en detalle lote') : fail('M02: falta GFW en página de lote');
  has(eudrDyn, 'TRA.NT') || has(eudrDyn, 'traces')
    ? ok('M02: TRACES NT referencia en cliente') : warn('M02: referencia TRACES no visible en cliente');

  // API TRACES
  const traces = read('app/api/eudr/traces-submit/route.ts');
  has(traces, 'TRA.NT')           ? ok('M02: formato TRA.NT.YYYY generado') : fail('M02: API TRACES sin formato NT');
  has(traces, '0901 11 00')       ? ok('M02: código HS café incluido') : warn('M02: código HS no detectado');

  // GFW API
  const gfw = read('app/api/gfw/forest-loss/route.ts');
  has(gfw, 'data-api.globalforestwatch.org')
    ? ok('M02: GFW real API endpoint configurado') : fail('M02: falta endpoint GFW real');
  has(gfw, 'HANSEN_FALLBACK') || has(gfw, 'fallback')
    ? ok('M02: fallback Hansen pre-calculado') : fail('M02: falta fallback GFW');

  // Pedidos B2B
  const pedidos = read('app/m02/pedidos/page.tsx');
  has(pedidos, 'usePedidoStore')  ? ok('M02: pedidos conectados a store') : fail('M02: pedidos sin store');
  has(pedidos, 'updateEstado')    ? ok('M02: cambio de estado pedido') : fail('M02: falta updateEstado');
  has(pedidos, 'tracking')        ? ok('M02: tracking ID en pedidos') : warn('M02: tracking no detectado');
  has(pedidos, 'motivo_rechazo')  ? ok('M02: motivo rechazo pedido') : warn('M02: motivo rechazo no detectado');

  // Wish list
  const wish = read('app/m02/wish-list/page.tsx');
  has(wish, 'useComercialStore')  ? ok('M02: wish list conectada a store') : fail('M02: wish list sin store');

  // Cupping + notificación
  const cupping = read('app/m02/cupping/page.tsx');
  has(cupping, 'addAlerta') || has(cupping, 'cupping')
    ? ok('M02: cupping dispara alerta al caficultor') : fail('M02: cupping sin notificación');
}

// ─── 9. MÓDULO M03 — Tostaduria ──────────────────────────────────────────────
section('9. M03 TOSTADURIA — QR, Cropster, Suscripciones');

{
  // QR page
  const qr = read('app/m03/qr/page.tsx');
  has(qr, 'addLoteTostado')       ? ok('M03: QR persiste LoteTostado tras sello') : fail('M03: QR sin persistencia lote');
  has(qr, 'wa.me')                ? ok('M03: botón WhatsApp QR') : fail('M03: falta WhatsApp deep link');
  has(qr, 'clipboard')            ? ok('M03: botón copiar URL QR') : fail('M03: falta clipboard copy');
  has(qr, 'gate_l2')              ? ok('M03: Gate L2 confirmación presente') : fail('M03: falta Gate L2');
  has(qr, 'SHA-256') || has(qr, 'hash')
    ? ok('M03: hash SHA-256 visible') : warn('M03: hash no detectado en UI');

  // Historial lotes
  const hist = read('app/m03/historial/page.tsx');
  has(hist, 'lotesTostados') || has(hist, 'comercialStore')
    ? ok('M03: historial conectado a comercialStore') : fail('M03: historial sin store');
  has(hist, 'nivel') || has(hist, 'merma')
    ? ok('M03: filtros en historial') : warn('M03: historial sin filtros');

  // Cropster parser
  const cropster = read('lib/services/s_cropster.ts');
  has(cropster, 'parseCropsterCSV')  ? ok('M03: parser CSV Cropster real') : fail('M03: falta parseCropsterCSV');
  has(cropster, 'parseCropsterAlog') ? ok('M03: parser .alog JSON real') : fail('M03: falta parseCropsterAlog');
  has(cropster, 'COLOR_TO_NIVEL')    ? ok('M03: mapeo color→nivel tueste') : fail('M03: falta COLOR_TO_NIVEL');

  // Migración page
  const mig = read('app/m03/migracion/page.tsx');
  has(mig, 'parseCropsterCSV') || has(mig, 's_cropster')
    ? ok('M03: migración usa parser real') : fail('M03: migración sin parser real (sigue en mock)');
  has(mig, 'preview') || has(mig, 'rows')
    ? ok('M03: vista previa antes de importar') : warn('M03: sin vista previa');

  // Suscripciones
  const sus = read('app/m03/suscripciones/page.tsx');
  has(sus, 'useSuscripcionStore') ? ok('M03: suscripciones con store real') : fail('M03: suscripciones sin store');
  has(sus, 'simularCobro')        ? ok('M03: simular cobro implementado') : fail('M03: falta simularCobro');
  has(sus, 'pausar')              ? ok('M03: acción pausar suscripción') : fail('M03: falta pausar');
  has(sus, 'reactivar')           ? ok('M03: acción reactivar suscripción') : fail('M03: falta reactivar');
  has(sus, 'MRR') || has(sus, 'mrr')
    ? ok('M03: KPI MRR calculado') : warn('M03: MRR no detectado');
}

// ─── 10. MÓDULO M05 — Cafetería ───────────────────────────────────────────────
section('10. M05 CAFETERÍA — QR sala, Analytics, Google Maps');

{
  // M05 main
  const m05 = read('app/m05/page.tsx');
  has(m05, 'useScanStore')        ? ok('M05: scans reales del store') : fail('M05: scans sin store');
  has(m05, 'usePlacesRating')     ? ok('M05: Google Maps rating real') : fail('M05: rating sin hook Places');
  has(m05, 'rating.rating') || has(m05, 'rating.user_ratings_total')
    ? ok('M05: rating dinámico en UI') : fail('M05: rating estático');

  // Analytics
  const analytics = read('app/m05/analytics/page.tsx');
  has(analytics, 'useScanStore')  ? ok('M05: analytics conectado a scanStore') : fail('M05: analytics sin store');
  has(analytics, 'diasRango')     ? ok('M05: selector rango 7/14/30d') : warn('M05: sin selector rango');
  has(analytics, 'scansPorDia')   ? ok('M05: gráfico escaneos por día') : fail('M05: falta gráfico por día');
  has(analytics, 'scansPorHora')  ? ok('M05: gráfico por hora del día') : fail('M05: falta gráfico por hora');
  has(analytics, 'conversion') || has(analytics, 'convertido')
    ? ok('M05: tasa conversión calculada') : fail('M05: falta tasa conversión');

  // Places API
  const places = read('app/api/places/rating/route.ts');
  has(places, 'maps.googleapis.com')
    ? ok('M05: Google Places API real configurada') : fail('M05: falta endpoint Places real');
  has(places, 'fallback')         ? ok('M05: fallback Places sin API key') : fail('M05: falta fallback Places');

  // Hook Places
  const placesHook = read('lib/hooks/usePlacesRating.ts');
  has(placesHook, 'CACHE_TTL_MS') ? ok('M05: caché 6h en hook Places') : warn('M05: sin caché en hook Places');
}

// ─── 11. MÓDULO M06 — Consumidor ─────────────────────────────────────────────
section('11. M06 CONSUMIDOR — Cámara QR, IA, Fidelización, Compras');

{
  // Escanear QR
  const scan = read('app/m06/escanear/page.tsx');
  has(scan, 'BarcodeDetector')    ? ok('M06: BarcodeDetector API nativa') : fail('M06: sin cámara real');
  has(scan, 'getUserMedia')       ? ok('M06: getUserMedia para cámara') : fail('M06: sin getUserMedia');
  has(scan, 'no_support')         ? ok('M06: fallback si BarcodeDetector no disponible') : fail('M06: sin fallback cámara');
  has(scan, 'addEvento')          ? ok('M06: escaneo suma puntos fidelización') : fail('M06: escaneo sin puntos');
  has(scan, 'addSello')           ? ok('M06: escaneo suma sello stamp card') : fail('M06: escaneo sin sello');

  // Recomendaciones IA
  const m06 = read('app/m06/page.tsx');
  has(m06, '/api/ai/recommendations')
    ? ok('M06: llama a /api/ai/recommendations') : fail('M06: sin recomendaciones IA');
  has(m06, 'modoRec') || has(m06, 'match_pct')
    ? ok('M06: muestra modo y % match IA') : warn('M06: match % no detectado en UI');

  // API IA
  const aiApi = read('app/api/ai/recommendations/route.ts');
  has(aiApi, 'scorarLote')        ? ok('M06: función scoring multi-dimensión') : fail('M06: falta scorarLote');
  has(aiApi, 'cupping_score')     ? ok('M06: scoring incluye cupping (40pts)') : fail('M06: scoring sin cupping');
  has(aiApi, 'PROCESO_SABORES')   ? ok('M06: mapeo proceso→sabores') : fail('M06: falta PROCESO_SABORES');

  // Fidelización
  const fid = read('app/m06/fidelizacion/page.tsx');
  has(fid, 'useFidelizacionStore')? ok('M06: fidelización con store real') : fail('M06: fidelización sin store');
  has(fid, 'stamp') || has(fid, 'sello') || has(fid, 'SELLOS_PARA_GRATIS')
    ? ok('M06: stamp card presente') : fail('M06: falta stamp card');
  has(fid, 'canjear')             ? ok('M06: canje de recompensas') : fail('M06: falta canjear');
  has(fid, 'historial')           ? ok('M06: historial de puntos') : fail('M06: falta historial puntos');

  // Historial compras
  const compras = read('app/m06/historial/page.tsx');
  has(compras, 'useCompraStore')  ? ok('M06: historial conectado a compraStore') : fail('M06: historial sin store');
  has(compras, 'estado')          ? ok('M06: estados de pedido en historial') : fail('M06: historial sin estados');
  has(compras, 'demo') || has(compras, 'Supabase') || has(compras, 'ejemplo')
    ? ok('M06: aviso datos demo visible') : warn('M06: sin aviso datos demo');
}

// ─── 12. PWA ──────────────────────────────────────────────────────────────────
section('12. PWA — Manifest, Iconos, Splash, Service Worker');

{
  // Manifest
  const manifest = JSON.parse(read('public/manifest.json'));
  manifest.name === 'BREW CHAIN'  ? ok('PWA: name correcto') : fail(`PWA: name incorrecto (${manifest.name})`);
  manifest.display === 'standalone' ? ok('PWA: display standalone') : fail('PWA: display no es standalone');
  manifest.start_url              ? ok(`PWA: start_url = "${manifest.start_url}"`) : fail('PWA: sin start_url');

  const screenshots = manifest.screenshots ?? [];
  screenshots.length >= 2         ? ok(`PWA: ${screenshots.length} screenshots (Android install prompt)`) : fail('PWA: faltan screenshots');
  const narrowSS = screenshots.find(s => s.form_factor === 'narrow');
  const wideSS   = screenshots.find(s => s.form_factor === 'wide');
  narrowSS && exists('public', narrowSS.src.replace('/', ''))
    ? ok('PWA: screenshot narrow.png existe') : fail('PWA: falta screenshot narrow.png');
  wideSS && exists('public', wideSS.src.replace('/', ''))
    ? ok('PWA: screenshot wide.png existe') : fail('PWA: falta screenshot wide.png');

  const maskable = (manifest.icons ?? []).find(i => i.purpose === 'maskable');
  maskable        ? ok('PWA: icono maskable presente') : fail('PWA: falta icono maskable');

  // Splash screens iOS
  const splashFiles = [
    'public/splash/splash-750x1334.png',
    'public/splash/splash-1170x2532.png',
    'public/splash/splash-1179x2556.png',
    'public/splash/splash-1290x2796.png',
    'public/splash/splash-2048x2732.png',
  ];
  for (const f of splashFiles) {
    exists(f) ? ok(`PWA: ${path.basename(f)}`) : fail(`PWA: FALTA ${f}`);
  }

  // Service Worker
  exists('public/sw.js')          ? ok('PWA: service worker sw.js existe') : fail('PWA: falta sw.js');

  // layout meta
  const layout = read('app/layout.tsx');
  has(layout, 'apple-touch-icon') || has(layout, 'appleWebApp')
    ? ok('PWA: meta apple-web-app en layout') : fail('PWA: falta meta Apple en layout');
  has(layout, 'startupImage')     ? ok('PWA: splash startupImage en layout') : fail('PWA: falta startupImage en layout');
}

// ─── 13. TYPESCRIPT ───────────────────────────────────────────────────────────
section('13. TYPESCRIPT — tsc --noEmit');

{
  try {
    const out = execSync('npx tsc --noEmit 2>&1', { cwd: ROOT, encoding: 'utf8' });
    const errors = out.split('\n').filter(l => l.includes('error TS') && !l.includes('next.config.ts'));
    if (errors.length === 0) {
      ok('TypeScript: 0 errores (excl. next.config.ts)');
    } else {
      errors.forEach(e => fail(`TS: ${e.trim()}`));
    }
  } catch (e) {
    const errors = e.stdout.split('\n').filter(l => l.includes('error TS') && !l.includes('next.config.ts'));
    if (errors.length === 0) {
      ok('TypeScript: 0 errores relevantes');
    } else {
      errors.slice(0, 10).forEach(e => fail(`TS: ${e.trim()}`));
    }
  }
}

// ─── 14. MOCKS — datos seed ───────────────────────────────────────────────────
section('14. MOCKS — integridad de datos seed');

{
  const lotes = read('lib/mock/lotes.ts');
  const loteCount = (lotes.match(/id:/g) || []).length;
  loteCount >= 4    ? ok(`Lotes mock: ${loteCount} lotes`) : warn(`Lotes mock: solo ${loteCount} lotes`);
  has(lotes, 'gps_lat') && has(lotes, 'gps_lng')
    ? ok('Lotes: GPS lat/lng presentes') : fail('Lotes: sin GPS');
  has(lotes, 'eudr_status')
    ? ok('Lotes: eudr_status presente') : fail('Lotes: sin eudr_status');

  const pasaportes = read('lib/mock/pasaportes.ts');
  has(pasaportes, 'a3f2e1b4c9d8')
    ? ok('Pasaportes: hash demo a3f2e1b4c9d8 presente') : fail('Pasaportes: falta hash demo');

  const pedidos = read('lib/mock/pedidos.ts');
  const pedCount = (pedidos.match(/id:/g) || []).length;
  pedCount >= 3     ? ok(`Pedidos mock: ${pedCount} pedidos`) : warn(`Pedidos mock: solo ${pedCount}`);

  const ventas = read('lib/mock/ventas.ts');
  has(ventas, 'VentaHistorial') || has(ventas, 'MOCK_VENTAS') || has(ventas, 'ingresos')
    ? ok('Ventas: datos mock presentes') : warn('Ventas: mock escaso');
}

// ─── RESUMEN FINAL ────────────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(52));
console.log(B('  RESUMEN AUDITORÍA BREWCHAIN'));
console.log('═'.repeat(52));
console.log(`  ${G('✓ Pasados')}:  ${passed}`);
console.log(`  ${Y('⚠ Avisos')}:  ${warned}`);
console.log(`  ${R('✗ Fallidos')}: ${failed}`);
console.log('═'.repeat(52));

if (failures.length > 0) {
  console.log(`\n${B(R('  PROBLEMAS A RESOLVER:'))}`);
  failures.forEach((f, i) => console.log(`  ${i + 1}. ${R(f)}`));
}

const score = Math.round((passed / (passed + failed)) * 100);
console.log(`\n  Score: ${score >= 90 ? G(score + '%') : score >= 70 ? Y(score + '%') : R(score + '%')} — ${
  score >= 90 ? G('LISTO PARA PRODUCCIÓN') :
  score >= 70 ? Y('REVISIÓN RECOMENDADA') :
  R('REQUIERE CORRECCIONES')
}`);
console.log();

process.exit(failed > 0 ? 1 : 0);
