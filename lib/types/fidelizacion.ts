export type EventoFidelizacion =
  | 'escaneo_qr'
  | 'compra'
  | 'cupping'
  | 'quiz_completado'
  | 'referido'
  | 'canje';

export interface PuntoEvento {
  id: string;
  tipo: EventoFidelizacion;
  puntos: number; // positivo = ganados, negativo = canjeados
  descripcion: string;
  fecha: string;
  lote_id?: string;
  referencia?: string; // hash QR, pedido ID, etc.
}

export interface Sello {
  id: string;
  lote_hash: string;
  variedad: string;
  caficultor_nombre: string;
  fecha: string;
}

export const PUNTOS_POR_EVENTO: Record<EventoFidelizacion, number> = {
  escaneo_qr: 10,
  compra: 50,
  cupping: 30,
  quiz_completado: 25,
  referido: 100,
  canje: 0,
};

export const SELLOS_PARA_GRATIS = 10;

export interface RecompensaDisponible {
  id: string;
  nombre: string;
  puntos_necesarios: number;
  icono: string;
  descripcion: string;
}

export const RECOMPENSAS: RecompensaDisponible[] = [
  { id: 'cafe-gratis', nombre: 'Café gratis', puntos_necesarios: 150, icono: '☕', descripcion: 'Un café de origen de tu elección' },
  { id: 'degustacion', nombre: 'Sesión de cata', puntos_necesarios: 300, icono: '🍵', descripcion: 'Cata guiada de 3 orígenes' },
  { id: 'bolsa-250', nombre: 'Bolsa 250g', puntos_necesarios: 500, icono: '🎁', descripcion: 'Bolsa de café de especialidad 250g' },
  { id: 'masterclass', nombre: 'Masterclass barista', puntos_necesarios: 1000, icono: '🏆', descripcion: 'Taller de 2h con barista certificado' },
];

export interface FidelizacionState {
  puntos: number;
  sellos: Sello[];
  historial: PuntoEvento[];
  canjesRealizados: string[];
  addEvento: (tipo: EventoFidelizacion, extra?: Partial<PuntoEvento>) => void;
  addSello: (sello: Sello) => void;
  canjear: (recompensaId: string) => boolean;
}
