#!/usr/bin/env node
/**
 * BREWCHAIN RAG Knowledge Indexer
 * Construye un índice de conocimiento del codebase para consultas semánticas.
 * Genera: scripts/knowledge-index.json
 * Uso: node scripts/rag-knowledge.mjs [--query "texto"]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(__dirname, 'knowledge-index.json');

// ── Colores ──────────────────────────────────────────────────────────────────
const C = { reset:'\x1b[0m', bold:'\x1b[1m', cyan:'\x1b[36m', green:'\x1b[32m', yellow:'\x1b[33m', dim:'\x1b[2m' };

// ── Extrae metadatos de un archivo TS/TSX ─────────────────────────────────────
function extractMetadata(filePath, content) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  const lines = content.split('\n');

  const exports = [];
  const imports = [];
  const storeRefs = [];
  const apiCalls = [];
  const keywords = [];

  lines.forEach(line => {
    // Exports
    if (/^export (default |const |function |type |interface |class )/.test(line)) {
      const m = line.match(/^export (?:default )?(?:const|function|type|interface|class)\s+(\w+)/);
      if (m) exports.push(m[1]);
    }
    // Imports
    const imp = line.match(/^import .+ from ['"](@\/lib\/[^'"]+|@\/components\/[^'"]+)['"]/);
    if (imp) imports.push(imp[1]);
    // Store references
    const store = line.match(/use(\w+Store)/);
    if (store) storeRefs.push(store[1] + 'Store');
    // API calls
    const api = line.match(/fetch\(['"`](\/api\/[^'"`]+)['"`]/);
    if (api) apiCalls.push(api[1]);
    // Keywords
    ['EUDR','QR','pasaporte','cupping','suscripcion','pedido','fidelizacion','analytics',
     'BarcodeDetector','ICO','GFW','TRACES','cropster','b2b','d2c'].forEach(kw => {
      if (line.toLowerCase().includes(kw.toLowerCase()) && !keywords.includes(kw)) keywords.push(kw);
    });
  });

  // Tipo de archivo
  let type = 'other';
  if (rel.startsWith('app/') && rel.endsWith('page.tsx')) type = 'page';
  else if (rel.startsWith('app/api/')) type = 'api_route';
  else if (rel.startsWith('lib/stores/')) type = 'store';
  else if (rel.startsWith('lib/types/')) type = 'type';
  else if (rel.startsWith('lib/services/')) type = 'service';
  else if (rel.startsWith('lib/mock/')) type = 'mock';
  else if (rel.startsWith('components/')) type = 'component';

  // Módulo
  let module = 'core';
  const modMatch = rel.match(/\/(m0[1-6])\//);
  if (modMatch) module = modMatch[1].toUpperCase();

  // Descripción automática
  const description = inferDescription(rel, type, exports, storeRefs, apiCalls, keywords);

  return {
    path: rel,
    type,
    module,
    exports: [...new Set(exports)],
    imports: [...new Set(imports)],
    stores: [...new Set(storeRefs)],
    api_calls: [...new Set(apiCalls)],
    keywords: [...new Set(keywords)],
    lines: lines.length,
    description,
  };
}

function inferDescription(rel, type, exports, stores, apis, keywords) {
  if (type === 'page') {
    const mod = rel.match(/m0[1-6]/)?.[0]?.toUpperCase() || '';
    const name = rel.split('/').slice(-2, -1)[0];
    return `Página ${mod} — ${name}. Stores: [${stores.join(', ')}]. APIs: [${apis.join(', ')}]. Temas: [${keywords.join(', ')}]`;
  }
  if (type === 'store') return `Zustand store. Exports: [${exports.join(', ')}]`;
  if (type === 'api_route') return `API Route. Calls: [${apis.join(', ')}]. Temas: [${keywords.join(', ')}]`;
  if (type === 'service') return `Servicio. Funciones: [${exports.join(', ')}]`;
  if (type === 'type') return `Tipos TypeScript. Interfaces: [${exports.join(', ')}]`;
  if (type === 'mock') return `Datos mock. Exports: [${exports.join(', ')}]`;
  if (type === 'component') return `Componente React. Exports: [${exports.join(', ')}]. Temas: [${keywords.join(', ')}]`;
  return exports.join(', ');
}

// ── Recorre el proyecto ───────────────────────────────────────────────────────
function walkDir(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  const skip = ['node_modules', '.next', '.git', 'dist', 'build', 'coverage'];
  for (const entry of fs.readdirSync(dir)) {
    if (skip.includes(entry)) continue;
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walkDir(full, results);
    else if (/\.(ts|tsx|mjs)$/.test(entry) && !entry.endsWith('.d.ts')) results.push(full);
  }
  return results;
}

// ── Búsqueda semántica simple (TF-IDF básico) ─────────────────────────────────
function search(index, query) {
  const terms = query.toLowerCase().split(/\s+/);
  return index
    .map(doc => {
      const text = [doc.path, doc.description, ...doc.keywords, ...doc.exports, ...doc.stores, ...doc.api_calls].join(' ').toLowerCase();
      const score = terms.reduce((s, t) => s + (text.includes(t) ? 1 : 0), 0);
      return { ...doc, score };
    })
    .filter(d => d.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

// ── Main ──────────────────────────────────────────────────────────────────────
function buildIndex() {
  console.log(`${C.bold}${C.cyan}── BREWCHAIN RAG Knowledge Indexer ──${C.reset}`);
  const files = walkDir(ROOT);
  console.log(`${C.dim}  Indexando ${files.length} archivos...${C.reset}`);

  const index = [];
  for (const f of files) {
    try {
      const content = fs.readFileSync(f, 'utf-8');
      index.push(extractMetadata(f, content));
    } catch { /* skip */ }
  }

  // Estadísticas
  const byType = index.reduce((acc, d) => { acc[d.type] = (acc[d.type] || 0) + 1; return acc; }, {});
  const byModule = index.reduce((acc, d) => { acc[d.module] = (acc[d.module] || 0) + 1; return acc; }, {});

  const knowledge = {
    generated_at: new Date().toISOString(),
    total_files: index.length,
    by_type: byType,
    by_module: byModule,
    index,
  };

  fs.writeFileSync(OUT, JSON.stringify(knowledge, null, 2));
  console.log(`${C.green}✓${C.reset} Índice generado: ${OUT}`);
  console.log(`  ${C.dim}Archivos: ${index.length} | Páginas: ${byType.page || 0} | APIs: ${byType.api_route || 0} | Stores: ${byType.store || 0}${C.reset}`);

  return knowledge;
}

// ── CLI ───────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const queryIdx = args.indexOf('--query');

if (queryIdx !== -1) {
  const query = args[queryIdx + 1];
  if (!query) { console.error('Uso: --query "texto"'); process.exit(1); }

  let knowledge;
  if (fs.existsSync(OUT)) {
    knowledge = JSON.parse(fs.readFileSync(OUT, 'utf-8'));
    console.log(`${C.dim}Usando índice existente (${knowledge.generated_at})${C.reset}\n`);
  } else {
    knowledge = buildIndex();
  }

  const results = search(knowledge.index, query);
  console.log(`\n${C.bold}Resultados para "${query}":${C.reset}`);
  results.forEach((r, i) => {
    console.log(`  ${i + 1}. ${C.cyan}${r.path}${C.reset} [score: ${r.score}]`);
    console.log(`     ${C.dim}${r.description}${C.reset}`);
  });
} else {
  buildIndex();
}
