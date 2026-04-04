// S_EUDR — Validación 12 requisitos EUDR determinista
// Reglamento EU 2023/1115 | Archivo 5 años mínimo

import { EUDRValidation, EUDRStatus, EUDRRequirement, EUDR_REQUIREMENTS_LABELS } from '../types/eudr';
import { Lote } from '../types/lote';

export interface LoteEUDRData {
  lote_id: string;
  codigo_cn?: string;
  caficultor_gps?: { lat: number; lng: number; verified: boolean };
  proveedor_nombre?: string;
  proveedor_pais?: string;
  comprador_nombre?: string;
  comprador_pais_eu?: string;
  legalidad_declaracion?: boolean;
  contrato_referencia?: string;
  factura_referencia?: string;
  deforestacion_risk?: 'standard' | 'elevated' | 'high';
  medidas_mitigacion?: string;
  declaracion_no_deforestacion?: boolean;
  fecha_cosecha?: string;
  conformidad_legislacion_origen?: boolean;
}

export function validateEUDR(data: LoteEUDRData): EUDRValidation {
  const results: boolean[] = new Array(12).fill(false);
  const missing: string[] = [];

  // Req 1: Código CN
  results[0] = data.codigo_cn === '0901';
  if (!results[0]) missing.push('Código CN del producto (debe ser 0901)');

  // Req 2: GPS de parcela
  results[1] = !!(data.caficultor_gps && data.caficultor_gps.verified &&
    data.caficultor_gps.lat >= -90 && data.caficultor_gps.lat <= 90);
  if (!results[1]) missing.push('Coordenadas GPS verificadas de la parcela');

  // Req 3: Proveedor
  results[2] = !!(data.proveedor_nombre && data.proveedor_pais);
  if (!results[2]) missing.push('Nombre y dirección del proveedor/caficultor');

  // Req 4: Comprador EU
  results[3] = !!(data.comprador_nombre && data.comprador_pais_eu);
  if (!results[3]) missing.push('Nombre y dirección del importador europeo');

  // Req 5: Legalidad
  results[4] = !!data.legalidad_declaracion;
  if (!results[4]) missing.push('Declaración de legalidad (legislación país de producción)');

  // Req 6: Documentos justificativos
  results[5] = !!(data.contrato_referencia || data.factura_referencia);
  if (!results[5]) missing.push('Referencia a contrato o factura');

  // Req 7: Evaluación deforestación (mock: standard por defecto)
  results[6] = data.deforestacion_risk !== undefined;
  if (!results[6]) {
    results[6] = true; // Mock: asumir evaluación GFW standard
    data.deforestacion_risk = 'standard';
  }

  // Req 8: Medidas mitigación
  results[7] = data.deforestacion_risk === 'standard' || !!data.medidas_mitigacion;
  if (!results[7]) missing.push('Medidas de mitigación del riesgo');

  // Req 9: Declaración no deforestación
  results[8] = !!data.declaracion_no_deforestacion;
  if (!results[8]) missing.push('Declaración de que el producto NO ha generado deforestación');

  // Req 10: Fecha cosecha
  results[9] = !!data.fecha_cosecha;
  if (!results[9]) missing.push('Fecha de producción (cosecha)');

  // Req 11: GPS (igual que req 2 — ambos son obligatorios por EUDR)
  results[10] = results[1];

  // Req 12: Conformidad legislación origen
  results[11] = !!data.conformidad_legislacion_origen;
  if (!results[11]) missing.push('Conformidad con la legislación del país de producción');

  const satisfied = results.filter(Boolean).length;
  const compliance_pct = Math.round((satisfied / 12) * 100);
  const status: EUDRStatus = compliance_pct === 100 ? 'green' : compliance_pct >= 75 ? 'amber' : 'red';

  const requirements: EUDRRequirement[] = EUDR_REQUIREMENTS_LABELS.map((label, i) => ({
    id: i + 1,
    label,
    description: label,
    satisfied: results[i],
    mandatory: i === 1 || i === 10, // GPS es el más crítico
  }));

  return {
    lote_id: data.lote_id,
    requirements,
    satisfied_count: satisfied,
    total_count: 12,
    compliance_pct,
    status,
    can_generate_declaration: status === 'green',
    missing_fields: missing,
  };
}

export function loteToEUDRData(
  lote: Lote,
  gfwResult?: { risk_level: 'standard' | 'elevated' | 'high' }
): LoteEUDRData {
  return {
    lote_id: lote.id,
    codigo_cn: '0901',
    caficultor_gps: lote.gps_eudr_verified ? { lat: lote.gps_lat, lng: lote.gps_lng, verified: true } : undefined,
    proveedor_nombre: lote.caficultor_nombre,
    proveedor_pais: lote.pais,
    comprador_nombre: 'Green Origin SL', // mock
    comprador_pais_eu: 'España',
    legalidad_declaracion: true,
    contrato_referencia: `CTR-${lote.id}-2025`,
    deforestacion_risk: gfwResult?.risk_level ?? 'standard',
    declaracion_no_deforestacion: lote.gps_eudr_verified,
    fecha_cosecha: lote.fecha_cosecha,
    conformidad_legislacion_origen: true,
  };
}

export function getEUDRStatusColor(status: EUDRStatus): string {
  return { green: '#1B5E30', amber: '#D97706', red: '#DC2626' }[status];
}

export function getEUDRStatusLabel(status: EUDRStatus): string {
  return { green: '✓ EUDR Compliant', amber: '⚠ Datos incompletos', red: '✗ Sin GPS — No exportable a EU' }[status];
}
