export type PedidoEstado =
  | 'borrador'
  | 'pendiente'
  | 'aceptado'
  | 'rechazado'
  | 'enviado'
  | 'recibido';

export interface LineaPedido {
  lote_id: string;
  variedad: string;
  caficultor_nombre: string;
  region: string;
  pais: string;
  kilos: number;
  precio_kg: number; // EUR
  eudr_compliant: boolean;
}

export interface PedidoB2B {
  id: string;
  numero: string; // PED-2024-001
  comprador_id: string;
  comprador_nombre: string;
  comprador_empresa: string;
  comprador_pais: string;
  vendedor_id: string; // caficultor o tostadería
  vendedor_nombre: string;
  lineas: LineaPedido[];
  estado: PedidoEstado;
  created_at: string;
  updated_at: string;
  // totales calculados
  total_kilos: number;
  total_eur: number;
  // opcional
  nota_comprador?: string;
  nota_vendedor?: string;
  fecha_entrega_estimada?: string;
  tracking_id?: string;
  motivo_rechazo?: string;
}

export interface PedidoState {
  pedidos: PedidoB2B[];
  addPedido: (p: PedidoB2B) => void;
  updateEstado: (
    id: string,
    estado: PedidoEstado,
    extra?: Partial<Pick<PedidoB2B, 'nota_vendedor' | 'motivo_rechazo' | 'tracking_id' | 'fecha_entrega_estimada'>>
  ) => void;
  removePedido: (id: string) => void;
}
