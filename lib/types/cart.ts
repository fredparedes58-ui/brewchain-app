export interface CartItem {
  productoId: string;
  nombre: string;
  vendedor: string;
  precio_unitario: number;
  cantidad: number;
  tipo: 'lote' | 'producto';
  imagen_emoji: string;
  origen?: string;
  eudr_status?: 'green' | 'amber' | 'red';
}
