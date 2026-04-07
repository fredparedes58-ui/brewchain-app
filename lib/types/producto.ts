import { ActorRole } from './actors';

export type CategoriaMarketplace =
  | 'lote_verde'
  | 'lote_tostado'
  | 'capsula'
  | 'accesorio'
  | 'suscripcion'
  | 'b2b_granel';

export type OrdenPor =
  | 'relevancia'
  | 'precio_asc'
  | 'precio_desc'
  | 'cupping_desc'
  | 'mas_reciente'
  | 'eudr_primero';

/**
 * Componente de un blend: referencia a un lote con su porcentaje.
 * La suma de todos los porcentajes en un blend DEBE ser 100.
 */
export interface BlendComponente {
  lote_id: string;   // ID del lote en MOCK_LOTES o Supabase
  porcentaje: number; // 0-100, suma total debe ser 100
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: CategoriaMarketplace;
  precio: number;
  unidad: string;
  imagen_emoji: string;
  vendedor_nombre: string;
  vendedor_rol: ActorRole;
  disponible: boolean;
  destacado?: boolean;
  cupping_score?: number;
  eudr_status?: 'green' | 'amber' | 'red';
  suscripcion_frecuencia?: 'semanal' | 'quincenal' | 'mensual' | 'trimestral';
  fecha_creacion: string;

  // ── Campos de blend multi-origen (Ítem 3) ─────────────────
  is_blend?: boolean;
  blend_componentes?: BlendComponente[];  // lotes + porcentajes
  blend_compliance_pct?: number;          // calculado por s_blend.calculateBlendEUDR()
}
