#!/usr/bin/env node
/**
 * BREWCHAIN Post-Implementation Check
 * Se ejecuta automáticamente después de CADA implementación.
 * Corre: audit → Q&A → E2E en secuencia. Falla rápido si hay regresiones.
 * Uso: node scripts/post-impl-check.mjs [--fast] [--module M03]
 *
 * Integración sugerida en package.json:
 *   "postimpl": "node scripts/post-impl-check.mjs"
 *
 * O como git pre-push hook en .git/hooks/pre-push:
 *   #!/bin/sh
 *   node scripts/post-impl-check.mjs --fast
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const C = {
  reset:'\x1b[0m', bold:'\x1b[1m', green:'\x1b[32m', red:'\x1b[31m',
  yellow:'\x1b[33m', cyan:'\x1b[36m', dim:'\x1b[2m', blue:'\x1b[34m',
};

const args = process.argv.slice(2);
const fast = args.includes('--fast');
const moduleIdx = args.indexOf('--module');
const moduleFilter = moduleIdx !== -1 ? args[moduleIdx + 1] : null;

function run(cmd, label, opts = {}) {
  const start = Date.now();
  try {
    const out = execSync(cmd, { cwd: ROOT, stdio: 'pipe', encoding: 'utf-8' });
    const ms = Date.now() - start;
    console.log(`  ${C.green}✓${C.reset} ${label} ${C.dim}(${ms}ms)${C.reset}`);
    return { ok: true, output: out, ms };
  } catch (e) {
    const ms = Date.now() - start;
    const out = (e.stdout || '') + (e.stderr || '');
    console.log(`  ${C.red}✗${C.reset} ${label} ${C.dim}(${ms}ms)${C.reset}`);
    if (opts.showOutput) {
      const lines = out.split('\n').filter(l => l.trim() && !l.includes('node_modules')).slice(0, 20);
      lines.forEach(l => console.log(`    ${C.dim}${l}${C.reset}`));
    }
    return { ok: false, output: out, ms };
  }
}

// ── Header ────────────────────────────────────────────────────────────────────
const now = new Date().toLocaleString('es-ES');
console.log(`\n${C.bold}╔══════════════════════════════════════════════════════╗`);
console.log(`║  BREWCHAIN POST-IMPL CHECK                          ║`);
console.log(`║  ${now.padEnd(50)} ║`);
console.log(`╚══════════════════════════════════════════════════════╝${C.reset}\n`);

if (fast) console.log(`${C.yellow}  Modo rápido activo (--fast)${C.reset}\n`);
if (moduleFilter) console.log(`${C.cyan}  Módulo filtro: ${moduleFilter}${C.reset}\n`);

const results = [];
let step = 0;

// ── PASO 1: TypeScript ────────────────────────────────────────────────────────
console.log(`${C.bold}[${++step}] TypeScript Strict Check${C.reset}`);
const tsc = run(
  'npx tsc --noEmit --skipLibCheck 2>&1 | grep -v node_modules | grep "error TS" | head -10',
  'tsc --noEmit (0 errores)',
  { showOutput: true }
);
// tsc exits 0 if no errors, but grep also exits 1 if no match — so check output
const tsOk = !tsc.output?.includes('error TS');
if (tsOk) {
  console.log(`  ${C.green}✓${C.reset} TypeScript: sin errores`);
  results.push({ name: 'TypeScript', ok: true });
} else {
  const errCount = (tsc.output?.match(/error TS/g) || []).length;
  console.log(`  ${C.red}✗${C.reset} TypeScript: ${errCount} error(es) encontrados`);
  results.push({ name: 'TypeScript', ok: false });
}

// ── PASO 2: Auditoría estática (audit.mjs) ────────────────────────────────────
console.log(`\n${C.bold}[${++step}] Auditoría Estática (203 checks)${C.reset}`);
const audit = run('node scripts/audit.mjs 2>&1 | tail -8', 'audit.mjs', { showOutput: false });
const auditOk = audit.output?.includes('100%') || audit.output?.includes('Fallidos: 0');
if (auditOk) {
  console.log(`  ${C.green}✓${C.reset} Auditoría: 100% — 203/203 checks`);
} else {
  const failMatch = audit.output?.match(/Fallidos:\s*(\d+)/);
  const fails = failMatch ? failMatch[1] : '?';
  console.log(`  ${C.red}✗${C.reset} Auditoría: ${fails} checks fallidos`);
}
results.push({ name: 'Auditoría estática', ok: auditOk });

// ── PASO 3: Q&A por módulo ────────────────────────────────────────────────────
console.log(`\n${C.bold}[${++step}] Q&A Determinístico por Módulo${C.reset}`);
const qaCmd = moduleFilter
  ? `node scripts/qa-modules.mjs --module ${moduleFilter} 2>&1 | tail -12`
  : 'node scripts/qa-modules.mjs 2>&1 | tail -12';
const qa = run(qaCmd, `qa-modules.mjs${moduleFilter ? ` [${moduleFilter}]` : ' [all]'}`, { showOutput: false });
const qaOk = qa.output?.includes('MVP LISTO') || qa.output?.includes('Fallidos: 0');
if (qaOk) {
  const scoreMatch = qa.output?.match(/Score: \d+%/);
  console.log(`  ${C.green}✓${C.reset} Q&A: ${scoreMatch?.[0] || '100%'} — MVP LISTO`);
} else {
  const failMatch = qa.output?.match(/✗ Fallidos:\s*(\d+)/);
  const scoreMatch = qa.output?.match(/Score:\s*(\d+)%/);
  console.log(`  ${C.red}✗${C.reset} Q&A: ${scoreMatch ? scoreMatch[0] : 'Score bajo'} — ${failMatch ? failMatch[1] + ' fallos' : 'fallos detectados'}`);
}
results.push({ name: 'Q&A por módulo', ok: qaOk });

// ── PASO 4: E2E Validator (solo si no --fast) ─────────────────────────────────
if (!fast) {
  console.log(`\n${C.bold}[${++step}] E2E Flow Validator (7 flujos)${C.reset}`);
  const e2e = run('node scripts/e2e-validator.mjs 2>&1 | tail -12', 'e2e-validator.mjs', { showOutput: false });
  const e2eOk = e2e.output?.includes('TODOS LOS FLUJOS') || e2e.output?.includes('Flujos KO:    0');
  if (e2eOk) {
    const scoreMatch = e2e.output?.match(/Score E2E: \d+%/);
    console.log(`  ${C.green}✓${C.reset} E2E: ${scoreMatch?.[0] || '100%'} — Flujos validados`);
  } else {
    const scoreMatch = e2e.output?.match(/Score E2E: (\d+)%/);
    console.log(`  ${C.red}✗${C.reset} E2E: ${scoreMatch ? scoreMatch[0] : 'Score bajo'} — flujos fallidos`);
  }
  results.push({ name: 'E2E Validator', ok: e2eOk });
}

// ── PASO 5: RAG index actualizado ─────────────────────────────────────────────
console.log(`\n${C.bold}[${++step}] RAG Knowledge Index${C.reset}`);
const rag = run('node scripts/rag-knowledge.mjs 2>&1 | tail -3', 'rag-knowledge.mjs', { showOutput: false });
const ragOk = rag.ok || rag.output?.includes('Índice generado') || rag.output?.includes('generado');
if (ragOk) {
  const filesMatch = rag.output?.match(/Archivos: (\d+)/);
  console.log(`  ${C.green}✓${C.reset} RAG Index actualizado${filesMatch ? ` (${filesMatch[0]})` : ''}`);
} else {
  console.log(`  ${C.yellow}⚠${C.reset} RAG Index no pudo actualizarse (no crítico)`);
}
results.push({ name: 'RAG Index', ok: ragOk });

// ── Resumen final ─────────────────────────────────────────────────────────────
const totalOk = results.filter(r => r.ok).length;
const totalFail = results.filter(r => !r.ok).length;
const allGreen = totalFail === 0;

console.log(`\n${'═'.repeat(56)}`);
console.log(`${C.bold}  RESULTADO POST-IMPL CHECK${C.reset}`);
console.log(`${'═'.repeat(56)}`);
results.forEach(r => {
  const icon = r.ok ? `${C.green}✓${C.reset}` : `${C.red}✗${C.reset}`;
  console.log(`  ${icon} ${r.name}`);
});
console.log(`${'═'.repeat(56)}`);

if (allGreen) {
  console.log(`\n  ${C.green}${C.bold}✅ IMPLEMENTACIÓN VALIDADA — LISTO PARA PUSH${C.reset}\n`);
  process.exit(0);
} else {
  console.log(`\n  ${C.red}${C.bold}❌ ${totalFail} CHECK(S) FALLIDO(S) — REVISAR ANTES DE PUSH${C.reset}`);
  console.log(`  ${C.dim}Corre: node scripts/qa-modules.mjs o node scripts/e2e-validator.mjs para detalles${C.reset}\n`);
  process.exit(1);
}
