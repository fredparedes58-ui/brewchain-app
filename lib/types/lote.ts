export type LoteEstado = 'disponible' | 'reservado' | 'vendido' | 'en_tueste' | 'tostado' | 'distribuido';
export type Proceso = 'lavado' | 'natural' | 'honey' | 'anaerobico';
export type NivelTueste = 'claro' | 'medio' | 'oscuro';

export interface Lote {
  id: string;
  caficultor_id: string;
  caficultor_nombre: string;
  parcela_id: string;
  pais: string;
  region: string;
  variedad: string;
  proceso: Proceso;
  altitud_msnm: number;
  fecha_cosecha: string;
  kilos_disponibles: number;
  precio_fob: number;           // EUR/kg
  notas_cata?: string;
  cupping_score?: number;
  gps_lat: number;
  gps_lng: number;
  gps_eudr_verified: boolean;
  eudr_status: 'green' | 'amber' | 'red';
  eudr_compliance_pct: number;
  estado: LoteEstado;
  tostador_id?: string;
  fecha_tueste?: string;
  nivel_tueste?: NivelTueste;
  qr_hash?: string;
  qr_url?: string;
  qr_sealed?: boolean;
  imagen_url?: string;
}

export interface Parcela {
  id: string;
  caficultor_id: string;
  nombre: string;
  gps_lat: number;
  gps_lng: number;
  variedad: string;
  altitud: number;
  hectareas: number;
  eudr_verified: boolean;
  created_at: string;
}

export interface CuppingResult {
  id: string;
  lote_id: string;
  catador_nombre: string;
  fecha: string;
  fragancia: number;
  aroma: number;
  sabor: number;
  acidez: number;
  cuerpo: number;
  balance: number;
  dulzor: number;
  total: number;
  descriptor_principal: string;
  notas: string;
  resultado: 'aprobado' | 'rechazado';
}
