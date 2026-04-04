export interface CompraItem {
  lote_id: string;
  variedad: string;
  caficultor_nombre: string;
  pais: string;
  region: string;
  cantidad_g: number; // gramos
  precio_eur: number;
  qr_hash?: string;
}

export interface Compra {
  id: string;
  numero: string; // ORD-2025-001
  items: CompraItem[];
  total_eur: number;
  fecha: string;
  estado: 'procesando' | 'confirmado' | 'enviado' | 'entregado';
  metodo_pago: string;
  direccion_envio?: string;
}
