export interface GPSCoordinates {
  lat: number;
  lng: number;
  precision_m?: number;
  verified: boolean;
  verified_at?: string;
}

export interface PassportData {
  // Origen (M01)
  caficultor_nombre: string;
  caficultor_id: string;
  caficultor_gps: GPSCoordinates;
  pais_region: string;
  variedad: string;
  proceso_beneficiado: 'lavado' | 'natural' | 'honey' | 'anaerobico';
  fecha_cosecha: string;
  altitud_msnm?: number;

  // Importación (M02) - opcional
  importador_nombre?: string;
  importador_pais?: string;
  fecha_importacion?: string;
  cupping_score?: number;
  cupping_notas?: string;

  // Tueste (M03)
  tostador_nombre: string;
  tostador_id: string;
  fecha_tueste: string;
  nivel_tueste: 'claro' | 'medio' | 'oscuro';
  perfil_tueste?: string;
  notas_cata?: string;

  // EUDR
  eudr_hash?: string;
  eudr_compliant?: boolean;

  // Metadata
  lote_id: string;
  version: number;
}

export interface SealedPassport {
  id: string;
  lote_id: string;
  data: PassportData;
  hash_sha256: string;
  hash_corto: string;
  public_url: string;
  sealed: boolean;
  sealed_at: string;
  version: number;
  obsolete?: boolean;
}

export interface QRResult {
  hash_sha256: string;
  hash_corto: string;
  public_url: string;
  sealed_passport: SealedPassport;
  qr_data_url?: string;
}
