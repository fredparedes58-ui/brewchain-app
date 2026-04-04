'use client';
import { Producto } from '@/lib/types/producto';
import { CartItem } from '@/lib/types/cart';

interface Props {
  producto: Producto;
  onAddToCart: (item: CartItem) => void;
}

const CATEGORIA_LABEL: Record<string, string> = {
  capsula: 'Cápsula',
  accesorio: 'Accesorio',
  suscripcion: 'Suscripción',
  b2b_granel: 'B2B Granel',
  lote_verde: 'Café Verde',
  lote_tostado: 'Café Tostado',
};

const FRECUENCIA_LABEL: Record<string, string> = {
  semanal: 'Entrega semanal',
  quincenal: 'Entrega quincenal',
  mensual: 'Entrega mensual',
  trimestral: 'Entrega trimestral',
};

export default function ProductoCard({ producto, onAddToCart }: Props) {
  const handleAdd = () => {
    onAddToCart({
      productoId: producto.id,
      nombre: producto.nombre,
      vendedor: producto.vendedor_nombre,
      precio_unitario: producto.precio,
      cantidad: 1,
      tipo: 'producto',
      imagen_emoji: producto.imagen_emoji,
      eudr_status: producto.eudr_status,
    });
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(59,31,8,0.95) 0%, rgba(26,13,5,0.98) 100%)',
      border: '1px solid rgba(196,154,108,0.15)',
      borderRadius: 16, padding: '1.1rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flex: 1 }}>
          {/* Emoji grande */}
          <div style={{
            width: 48, height: 48, borderRadius: 12, flexShrink: 0,
            background: 'rgba(139,94,60,0.15)', border: '1px solid rgba(196,154,108,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
          }}>
            {producto.imagen_emoji}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#FBF6EE', lineHeight: 1.3 }}>
              {producto.nombre}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#C49A6C', marginTop: '0.2rem' }}>
              {producto.vendedor_nombre}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontWeight: 900, fontSize: '1.05rem', color: '#C49A6C' }}>
            €{producto.precio.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.65rem', color: '#8B5E3C', marginTop: '0.1rem' }}>
            {producto.unidad}
          </div>
        </div>
      </div>

      {/* Descripción */}
      <div style={{ fontSize: '0.78rem', color: '#8B5E3C', lineHeight: 1.5, marginBottom: '0.75rem' }}>
        {producto.descripcion}
      </div>

      {/* Pills de info */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        <span style={{
          background: 'rgba(139,94,60,0.15)', color: '#C49A6C',
          border: '1px solid rgba(196,154,108,0.2)',
          borderRadius: 100, padding: '0.2rem 0.6rem', fontSize: '0.68rem', fontWeight: 600,
        }}>
          {CATEGORIA_LABEL[producto.categoria] ?? producto.categoria}
        </span>

        {producto.destacado && (
          <span style={{
            background: 'rgba(217,119,6,0.15)', color: '#fbbf24',
            border: '1px solid rgba(217,119,6,0.25)',
            borderRadius: 100, padding: '0.2rem 0.6rem', fontSize: '0.68rem', fontWeight: 700,
          }}>⭐ Destacado</span>
        )}

        {producto.eudr_status === 'green' && (
          <span style={{
            background: 'rgba(27,94,48,0.2)', color: '#4ADE80',
            border: '1px solid rgba(27,94,48,0.3)',
            borderRadius: 100, padding: '0.2rem 0.6rem', fontSize: '0.68rem', fontWeight: 700,
          }}>✓ EUDR</span>
        )}

        {producto.cupping_score && (
          <span style={{
            background: 'rgba(196,154,108,0.1)', color: '#C49A6C',
            border: '1px solid rgba(196,154,108,0.2)',
            borderRadius: 100, padding: '0.2rem 0.6rem', fontSize: '0.68rem', fontWeight: 700,
          }}>{producto.cupping_score} pts</span>
        )}

        {producto.suscripcion_frecuencia && (
          <span style={{
            background: 'rgba(26,46,92,0.2)', color: '#93c5fd',
            border: '1px solid rgba(26,46,92,0.3)',
            borderRadius: 100, padding: '0.2rem 0.6rem', fontSize: '0.68rem',
          }}>🔄 {FRECUENCIA_LABEL[producto.suscripcion_frecuencia]}</span>
        )}
      </div>

      {/* Botón añadir */}
      <button
        onClick={handleAdd}
        disabled={!producto.disponible}
        style={{
          width: '100%',
          background: producto.disponible ? 'rgba(139,94,60,0.15)' : 'rgba(59,31,8,0.3)',
          border: `1px solid ${producto.disponible ? 'rgba(196,154,108,0.25)' : 'rgba(196,154,108,0.1)'}`,
          borderRadius: 10, padding: '0.6rem',
          color: producto.disponible ? '#C49A6C' : '#8B5E3C',
          fontWeight: 700, fontSize: '0.82rem',
          cursor: producto.disponible ? 'pointer' : 'not-allowed',
        }}
      >
        {producto.disponible ? `+ Añadir al carrito` : 'No disponible'}
      </button>
    </div>
  );
}
