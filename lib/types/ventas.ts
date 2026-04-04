export type EstadoPago = 'pagado' | 'pendiente' | 'en_proceso';
export type CompradorTipo = 'Tostaduria' | 'Importadora';

export interface VentaHistorial {
  id: string;
  lote_id: string;
  variedad: string;
  region: string;
  pais: string;
  proceso: string;
  kilos: number;
  precio_fob_kg: number;
  total_eur: number;
  fecha: string;
  fecha_pago?: string;
  estado_pago: EstadoPago;
  comprador_tipo: CompradorTipo;
  comprador_nombre: string;
  comprador_pais: string;
  cupping_score?: number;
  notas?: string;
}

export interface ResumenVentas {
  total_ingresado_eur: number;
  pendiente_cobro_eur: number;
  lotes_vendidos: number;
  kilos_totales: number;
  ticket_promedio_eur: number;
  mejor_precio_fob: number;
  ingresos_por_mes: { mes: string; total: number }[];
}
