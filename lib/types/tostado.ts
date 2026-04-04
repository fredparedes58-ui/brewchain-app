import { NivelTueste } from './lote';

export interface LoteTostado {
  id: string;
  lote_id_origen: string;
  caficultor_nombre: string;
  variedad: string;
  pais: string;
  region: string;
  fecha_tueste: string;         // YYYY-MM-DD
  nivel_tueste: NivelTueste;
  perfil_nombre?: string;
  temp_carga?: number;
  primer_crack?: number;
  temp_final?: number;
  tiempo_total_min?: number;
  kilos_entrada: number;
  kilos_salida: number;
  merma_pct: number;            // (1 - salida/entrada) * 100
  qr_hash?: string;
  qr_url?: string;
  notas_cata?: string;
  origen: 'manual' | 'cropster';
}

export interface Suscriptor {
  id: string;
  consumidor: string;
  email?: string;
  plan: 'semanal' | 'quincenal' | 'mensual' | 'trimestral';
  productos: string;
  precio: number;
  estado: 'activa' | 'pausada' | 'cancelada';
  proxima_fecha: string;        // YYYY-MM-DD
  creada_at: string;
  ultimo_cobro?: string;
  total_cobrado?: number;
}

export interface CropsterCSVRow {
  date: string;
  batch_id: string;
  green_coffee: string;
  roast_color: string;
  charge_temp?: number;
  first_crack_time?: string;    // mm:ss
  end_temperature?: number;
  weight_in_kg?: number;
  weight_out_kg?: number;
  total_roast_time?: string;    // mm:ss
  development_time?: string;    // mm:ss o %
}

// Helper para calcular merma de forma segura
export function calcularMerma(entrada: number, salida: number): number {
  if (entrada <= 0) return 0;
  return Math.round((1 - salida / entrada) * 10000) / 100;
}

// Helper para parsear mm:ss a minutos decimales
export function parseMmSs(mmss: string): number {
  const parts = mmss.split(':');
  if (parts.length !== 2) return 0;
  return parseInt(parts[0], 10) + parseInt(parts[1], 10) / 60;
}
