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
}
