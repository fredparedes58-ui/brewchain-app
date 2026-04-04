export type ScanFuente = 'sala' | 'bolsa' | 'web' | 'compartido' | 'desconocido';

export interface ScanEvent {
  id: string;
  qr_hash: string;
  variedad?: string;
  caficultor?: string;
  timestamp: string; // ISO
  fuente: ScanFuente;
  convertido: boolean; // si el usuario completó el quiz/compra tras escanear
  pais_visitante?: string;
}

export interface ScanAnalyticsState {
  eventos: ScanEvent[];
  addScan: (qr_hash: string, fuente?: ScanFuente, extra?: Partial<ScanEvent>) => void;
  marcarConversion: (id: string) => void;
}
