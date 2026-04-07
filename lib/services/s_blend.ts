/**
 * s_blend.ts — Servicio de trazabilidad EUDR para blends multi-origen
 * Ítem 3 del Plan Brewchain
 *
 * Regla conservadora CE (Reglamento 2023/1115):
 * Si CUALQUIER lote componente tiene eudr_status = 'red' → el blend entero es 'red'
 * porque los granos no conformes no pueden separarse en el producto final.
 */

import { Lote } from '../types/lote';
import { BlendComponente } from '../types/producto';

export type EUDRStatus = 'green' | 'amber' | 'red';

export interface BlendEUDRResult {
  blend_compliance_pct: number;    // media ponderada de compliance de todos los lotes
  eudr_status: EUDRStatus;         // status conservador CE
  cupping_score_blend: number;     // media ponderada de cupping scores
  precio_fob_base: number;         // media ponderada de precios FOB
  breakdown: BlendBreakdownItem[]; // detalle por lote
  warning?: string;                // advertencia si algún lote está fuera del sistema
}

export interface BlendBreakdownItem {
  lote_id: string;
  variedad: string;
  pais: string;
  porcentaje: number;
  eudr_status: EUDRStatus;
  eudr_compliance_pct: number;
  cupping_score: number;
  precio_fob: number;
  aportacion_compliance: number;   // porcentaje * compliance / 100
}

/**
 * Calcula los valores EUDR y sensoriales de un blend a partir de sus componentes.
 * @param componentes  Array de { lote_id, porcentaje } donde sum(porcentaje) === 100
 * @param lotes        Catálogo completo de lotes para buscar por ID
 */
export function calculateBlendEUDR(
  componentes: BlendComponente[],
  lotes: Lote[]
): BlendEUDRResult {
  if (componentes.length === 0) {
    return {
      blend_compliance_pct: 0,
      eudr_status: 'red',
      cupping_score_blend: 0,
      precio_fob_base: 0,
      breakdown: [],
      warning: 'Blend sin componentes',
    };
  }

  // Validar que los porcentajes sumen ~100
  const totalPct = componentes.reduce((s, c) => s + c.porcentaje, 0);
  if (Math.abs(totalPct - 100) > 0.5) {
    return {
      blend_compliance_pct: 0,
      eudr_status: 'red',
      cupping_score_blend: 0,
      precio_fob_base: 0,
      breakdown: [],
      warning: `Los porcentajes suman ${totalPct.toFixed(1)}%, deben sumar 100%`,
    };
  }

  const breakdown: BlendBreakdownItem[] = [];
  const warnings: string[] = [];
  let hasRed = false;

  for (const comp of componentes) {
    const lote = lotes.find(l => l.id === comp.lote_id);

    if (!lote) {
      warnings.push(`Lote ${comp.lote_id} no encontrado — tratado como red`);
      breakdown.push({
        lote_id: comp.lote_id,
        variedad: '—',
        pais: '—',
        porcentaje: comp.porcentaje,
        eudr_status: 'red',
        eudr_compliance_pct: 0,
        cupping_score: 0,
        precio_fob: 0,
        aportacion_compliance: 0,
      });
      hasRed = true;
      continue;
    }

    const status = (lote.eudr_status ?? 'amber') as EUDRStatus;
    if (status === 'red') hasRed = true;

    breakdown.push({
      lote_id: lote.id,
      variedad: lote.variedad,
      pais: lote.pais,
      porcentaje: comp.porcentaje,
      eudr_status: status,
      eudr_compliance_pct: lote.eudr_compliance_pct ?? 0,
      cupping_score: lote.cupping_score ?? 0,
      precio_fob: lote.precio_fob ?? 0,
      aportacion_compliance: (comp.porcentaje * (lote.eudr_compliance_pct ?? 0)) / 100,
    });
  }

  // Media ponderada de compliance
  const blend_compliance_pct = Math.round(
    breakdown.reduce((s, b) => s + b.aportacion_compliance, 0)
  );

  // REGLA CE CONSERVADORA: un solo lote red → blend red
  let eudr_status: EUDRStatus;
  if (hasRed) {
    eudr_status = 'red';
  } else if (blend_compliance_pct === 100) {
    eudr_status = 'green';
  } else {
    eudr_status = 'amber';
  }

  // Media ponderada de cupping score
  const cupping_score_blend = parseFloat(
    breakdown
      .reduce((s, b) => s + (b.cupping_score * b.porcentaje) / 100, 0)
      .toFixed(1)
  );

  // Media ponderada de precio FOB
  const precio_fob_base = parseFloat(
    breakdown
      .reduce((s, b) => s + (b.precio_fob * b.porcentaje) / 100, 0)
      .toFixed(2)
  );

  return {
    blend_compliance_pct,
    eudr_status,
    cupping_score_blend,
    precio_fob_base,
    breakdown,
    warning: warnings.length > 0 ? warnings.join('; ') : undefined,
  };
}

/**
 * Valida que los porcentajes de un blend sumen exactamente 100.
 * Retorna { valid, error }.
 */
export function validateBlendPorcentajes(componentes: BlendComponente[]): {
  valid: boolean;
  error?: string;
  total: number;
} {
  const total = componentes.reduce((s, c) => s + c.porcentaje, 0);
  const diff = Math.abs(total - 100);
  if (diff > 0.5) {
    return {
      valid: false,
      error: `Los porcentajes suman ${total.toFixed(1)}% — deben sumar 100%`,
      total,
    };
  }
  return { valid: true, total };
}

/**
 * Devuelve el color y texto del badge EUDR para un status.
 */
export function eudrStatusBadge(status: EUDRStatus): {
  color: string;
  bg: string;
  border: string;
  icon: string;
  label: string;
} {
  switch (status) {
    case 'green':
      return { color: '#4ADE80', bg: 'rgba(27,94,48,0.2)', border: 'rgba(74,222,128,0.3)', icon: '🟢', label: 'EUDR Conforme' };
    case 'amber':
      return { color: '#fbbf24', bg: 'rgba(217,119,6,0.15)', border: 'rgba(217,119,6,0.3)', icon: '🟡', label: 'EUDR Pendiente' };
    case 'red':
      return { color: '#fca5a5', bg: 'rgba(220,38,38,0.15)', border: 'rgba(220,38,38,0.3)', icon: '🔴', label: 'EUDR No conforme' };
  }
}
