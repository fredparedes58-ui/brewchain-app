// S_CROPSTER — Parser real de exportaciones Cropster
// Soporta: CSV (Cropster v10.x) y .alog (JSON renombrado)
// Columnas CSV: Date, Batch ID, Green Coffee, Roast Color, Charge Temperature,
//               First Crack Time, End Temperature, Weight In, Weight Out, Total Roast Time

import { CropsterCSVRow, LoteTostado, calcularMerma, parseMmSs } from '../types/tostado';
import { PerfilTueste } from '../stores/comercialStore';
import { NivelTueste } from '../types/lote';

// Mapeo de Roast Color de Cropster a NivelTueste de BREWCHAIN
const COLOR_TO_NIVEL: Record<string, NivelTueste> = {
  'light':        'claro',
  'light medium': 'claro',
  'light-medium': 'claro',
  'medium light': 'claro',
  'medium':       'medio',
  'medium dark':  'medio',
  'medium-dark':  'medio',
  'dark medium':  'medio',
  'dark':         'oscuro',
  'french':       'oscuro',
  'italian':      'oscuro',
  'very dark':    'oscuro',
  'full city':    'medio',
  'city':         'claro',
  'city+':        'medio',
  'vienna':       'oscuro',
};

function mapRoastColor(color: string): NivelTueste {
  const normalized = color.toLowerCase().trim();
  return COLOR_TO_NIVEL[normalized] ?? 'medio';
}

// Normaliza nombres de columnas (case-insensitive, sin espacios extra)
function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/__+/g, '_').replace(/^_|_$/g, '');
}

// Parser mini de CSV con soporte para campos entre comillas
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += c;
    }
  }
  result.push(current.trim());
  return result;
}

// Convierte kg/g a kg — Cropster puede exportar en g si los valores son > 100
function toKg(value: number): number {
  return value > 100 ? value / 1000 : value;
}

// Parsea CSV de Cropster y devuelve rows tipadas
export function parseCropsterCSV(text: string): { rows: CropsterCSVRow[]; errors: string[] } {
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  if (lines.length < 2) return { rows: [], errors: ['Archivo CSV vacío o sin datos'] };

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  const errors: string[] = [];

  // Verificar columnas mínimas
  const required = ['date', 'batch_id'];
  const missing = required.filter(r => !headers.some(h => h.includes(r.replace('_', ''))));
  if (missing.length > 0) {
    errors.push(`Columnas mínimas faltantes: ${missing.join(', ')}`);
    return { rows: [], errors };
  }

  // Mapeo de posición para las columnas conocidas
  const idx = (name: string) => headers.findIndex(h =>
    h.includes(name.replace(/_/g, '')) || h === name
  );

  const colDate = idx('date');
  const colBatch = idx('batch_id') !== -1 ? idx('batch_id') : idx('batch');
  const colGreenCoffee = idx('green_coffee') !== -1 ? idx('green_coffee') : idx('greencoffee');
  const colRoastColor = idx('roast_color') !== -1 ? idx('roast_color') : idx('roastcolor');
  const colChargeTemp = idx('charge_temp') !== -1 ? idx('charge_temp') : idx('chargetemp');
  const colFirstCrack = idx('first_crack') !== -1 ? idx('first_crack') : idx('firstcrack');
  const colEndTemp = idx('end_temp') !== -1 ? idx('end_temp') : idx('endtemperature');
  const colWeightIn = idx('weight_in') !== -1 ? idx('weight_in') : idx('weightin');
  const colWeightOut = idx('weight_out') !== -1 ? idx('weight_out') : idx('weightout');
  const colTotalTime = idx('total_roast_time') !== -1 ? idx('total_roast_time') : idx('totalroasttime');

  const rows: CropsterCSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    if (cells.length < 2) continue;

    const weightInRaw = colWeightIn >= 0 ? parseFloat(cells[colWeightIn] || '0') : 0;
    const weightOutRaw = colWeightOut >= 0 ? parseFloat(cells[colWeightOut] || '0') : 0;

    rows.push({
      date: colDate >= 0 ? cells[colDate] : '',
      batch_id: colBatch >= 0 ? cells[colBatch] : `BATCH-${i}`,
      green_coffee: colGreenCoffee >= 0 ? cells[colGreenCoffee] : '',
      roast_color: colRoastColor >= 0 ? cells[colRoastColor] : 'Medium',
      charge_temp: colChargeTemp >= 0 ? parseFloat(cells[colChargeTemp] || '0') || undefined : undefined,
      first_crack_time: colFirstCrack >= 0 ? cells[colFirstCrack] || undefined : undefined,
      end_temperature: colEndTemp >= 0 ? parseFloat(cells[colEndTemp] || '0') || undefined : undefined,
      weight_in_kg: weightInRaw > 0 ? toKg(weightInRaw) : undefined,
      weight_out_kg: weightOutRaw > 0 ? toKg(weightOutRaw) : undefined,
      total_roast_time: colTotalTime >= 0 ? cells[colTotalTime] || undefined : undefined,
    });
  }

  return { rows, errors };
}

// Parsea .alog (JSON de Cropster)
export function parseCropsterAlog(jsonText: string): { rows: CropsterCSVRow[]; errors: string[] } {
  try {
    const parsed = JSON.parse(jsonText);
    // .alog puede tener { roasts: [...] } o ser un array directamente
    const roasts = Array.isArray(parsed) ? parsed : (parsed.roasts ?? parsed.data ?? [parsed]);

    const rows: CropsterCSVRow[] = roasts.map((r: Record<string, unknown>, i: number) => ({
      date: String(r.date ?? r.Date ?? r.roast_date ?? r.RoastDate ?? ''),
      batch_id: String(r.batch_id ?? r['Batch ID'] ?? r.id ?? `BATCH-${i + 1}`),
      green_coffee: String(r.green_coffee ?? r['Green Coffee'] ?? r.coffee ?? ''),
      roast_color: String(r.roast_color ?? r['Roast Color'] ?? r.level ?? 'Medium'),
      charge_temp: Number(r.charge_temp ?? r['Charge Temperature'] ?? r.chargeTemp ?? 0) || undefined,
      first_crack_time: String(r.first_crack_time ?? r['First Crack Time'] ?? r.firstCrack ?? '') || undefined,
      end_temperature: Number(r.end_temperature ?? r['End Temperature'] ?? r.endTemp ?? 0) || undefined,
      weight_in_kg: (() => {
        const v = Number(r.weight_in ?? r['Weight In'] ?? r.weightIn ?? 0);
        return v > 0 ? toKg(v) : undefined;
      })(),
      weight_out_kg: (() => {
        const v = Number(r.weight_out ?? r['Weight Out'] ?? r.weightOut ?? 0);
        return v > 0 ? toKg(v) : undefined;
      })(),
      total_roast_time: String(r.total_roast_time ?? r['Total Roast Time'] ?? r.totalTime ?? '') || undefined,
    }));

    return { rows, errors: [] };
  } catch {
    return { rows: [], errors: ['Archivo .alog inválido — no es JSON válido'] };
  }
}

// Convierte una CropsterCSVRow a PerfilTueste compatible con comercialStore
export function mapToPerfilTueste(row: CropsterCSVRow): Omit<PerfilTueste, 'id'> {
  return {
    nombre: row.batch_id,
    lote_id: row.batch_id,
    lote_origen: row.green_coffee || 'Sin especificar',
    fecha: row.date || new Date().toISOString().split('T')[0],
    temp_carga: row.charge_temp ?? 185,
    primer_crack: 196, // valor típico si no está en CSV
    temp_final: row.end_temperature ?? 205,
    tiempo_total_min: row.total_roast_time ? parseMmSs(row.total_roast_time) : 12,
    nivel: mapRoastColor(row.roast_color),
    notas: [
      row.first_crack_time ? `1er crack: ${row.first_crack_time}` : '',
      row.development_time ? `DTR: ${row.development_time}` : '',
    ].filter(Boolean).join(' · '),
  };
}

// Convierte una CropsterCSVRow a LoteTostado
export function mapToLoteTostado(row: CropsterCSVRow): Omit<LoteTostado, 'id'> {
  const kilosEntrada = row.weight_in_kg ?? 0;
  const kilosSalida = row.weight_out_kg ?? (kilosEntrada * 0.84); // 16% merma típica si no hay dato
  return {
    lote_id_origen: row.batch_id,
    caficultor_nombre: row.green_coffee?.split(' ').slice(1).join(' ') || 'Importado Cropster',
    variedad: row.green_coffee || 'Sin especificar',
    pais: row.green_coffee?.split(' ')[0] || 'Desconocido',
    region: '',
    fecha_tueste: row.date || new Date().toISOString().split('T')[0],
    nivel_tueste: mapRoastColor(row.roast_color),
    temp_carga: row.charge_temp,
    primer_crack: undefined,
    temp_final: row.end_temperature,
    tiempo_total_min: row.total_roast_time ? parseMmSs(row.total_roast_time) : undefined,
    kilos_entrada: kilosEntrada,
    kilos_salida: Math.round(kilosSalida * 100) / 100,
    merma_pct: calcularMerma(kilosEntrada, kilosSalida),
    notas_cata: row.development_time ? `DTR: ${row.development_time}` : undefined,
    origen: 'cropster',
  };
}
