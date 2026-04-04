export type ActorRole = 'M01' | 'M02' | 'M03' | 'M04' | 'M05' | 'M06';

export interface Actor {
  id: string;
  email: string;
  nombre: string;
  role: ActorRole;
  pais: string;
  plan: string;
  created_at: string;
}

export const ROLE_LABELS: Record<ActorRole, string> = {
  M01: 'Caficultor',
  M02: 'Importadora',
  M03: 'Tostaduria',
  M04: 'Café+Tostado',
  M05: 'Cafetería',
  M06: 'Consumidor',
};

export const ROLE_DESCRIPTIONS: Record<ActorRole, string> = {
  M01: 'Registro GPS de parcela, alertas agronómicas, precio ICO',
  M02: 'Dashboard EUDR, wish list inversa, cupping CVA 2024',
  M03: 'Generador QR, perfiles de tueste, migración Cropster',
  M04: 'Tostaduria + Cafetería combinados',
  M05: 'QR en sala, aprovisionamiento B2B',
  M06: 'Quiz sensorial, escanear QR, pasaporte digital',
};

export const ROLE_COLORS: Record<ActorRole, string> = {
  M01: '#1B5E30',
  M02: '#1A2E5C',
  M03: '#8B5E3C',
  M04: '#8B5E3C',
  M05: '#C49A6C',
  M06: '#3B1F08',
};

export const ROLE_ICONS: Record<ActorRole, string> = {
  M01: '🌱',
  M02: '🚢',
  M03: '🔥',
  M04: '☕',
  M05: '🏪',
  M06: '👤',
};
