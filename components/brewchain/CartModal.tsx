'use client';
import { useState } from 'react';
import { useCartStore } from '@/lib/stores/cartStore';

export default function CartModal() {
  const { items, isOpen, closeCart, removeItem, updateCantidad, clearCart, totalEuros } = useCartStore();
  const [pedidoEnviado, setPedidoEnviado] = useState(false);

  const handleCheckout = () => {
    setPedidoEnviado(true);
    setTimeout(() => {
      clearCart();
      setPedidoEnviado(false);
      closeCart();
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
        }}
      />

      {/* Panel lateral */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 'min(100vw, 420px)',
        background: 'linear-gradient(180deg, #1A0D05 0%, #0d0602 100%)',
        borderLeft: '1px solid rgba(196,154,108,0.2)',
        zIndex: 1001,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.5)',
      }}>

        {/* Header del carrito */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(196,154,108,0.12)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: '1.1rem' }}>🛒 Mi Carrito</div>
            <div style={{ fontSize: '0.72rem', color: '#8B5E3C', marginTop: '0.1rem' }}>
              {items.length === 0 ? 'Vacío' : `${items.length} producto${items.length > 1 ? 's' : ''}`}
            </div>
          </div>
          <button onClick={closeCart} style={{
            background: 'rgba(59,31,8,0.6)', border: '1px solid rgba(196,154,108,0.2)',
            borderRadius: '50%', width: 36, height: 36, cursor: 'pointer',
            color: '#C49A6C', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        {/* Estado: pedido enviado */}
        {pedidoEnviado && (
          <div style={{
            margin: '1.5rem', background: 'rgba(27,94,48,0.2)',
            border: '1px solid #1B5E30', borderRadius: 16, padding: '2rem', textAlign: 'center',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>✅</div>
            <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#4ADE80', marginBottom: '0.5rem' }}>
              ¡Pedido recibido!
            </div>
            <div style={{ fontSize: '0.85rem', color: '#C49A6C' }}>
              El vendedor confirmará disponibilidad en menos de 24h. Recibirás notificación.
            </div>
          </div>
        )}

        {/* Lista de ítems */}
        {!pedidoEnviado && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
            {items.length === 0 ? (
              <div style={{ textAlign: 'center', paddingTop: '3rem', color: '#8B5E3C' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>☕</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#C49A6C', marginBottom: '0.5rem' }}>
                  Tu carrito está vacío
                </div>
                <div style={{ fontSize: '0.82rem' }}>Explora el marketplace y añade productos</div>
                <button onClick={closeCart} style={{
                  marginTop: '1.5rem', background: '#8B5E3C', color: '#FBF6EE',
                  border: 'none', borderRadius: 10, padding: '0.75rem 1.5rem',
                  fontWeight: 700, cursor: 'pointer',
                }}>
                  Ver marketplace →
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {items.map(item => (
                  <div key={item.productoId} style={{
                    background: 'rgba(59,31,8,0.5)',
                    border: '1px solid rgba(196,154,108,0.12)',
                    borderRadius: 14, padding: '1rem',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', flex: 1 }}>
                        <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>{item.imagen_emoji}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FBF6EE', lineHeight: 1.3 }}>
                            {item.nombre}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#8B5E3C', marginTop: '0.2rem' }}>
                            {item.vendedor}
                            {item.origen && ` · ${item.origen}`}
                          </div>
                          {item.eudr_status === 'green' && (
                            <span style={{
                              display: 'inline-block', marginTop: '0.3rem',
                              background: 'rgba(27,94,48,0.2)', color: '#4ADE80',
                              border: '1px solid rgba(27,94,48,0.3)',
                              borderRadius: 100, padding: '0.1rem 0.5rem', fontSize: '0.65rem', fontWeight: 700,
                            }}>✓ EUDR</span>
                          )}
                        </div>
                      </div>
                      <button onClick={() => removeItem(item.productoId)} style={{
                        background: 'none', border: 'none', color: '#8B5E3C',
                        cursor: 'pointer', fontSize: '0.9rem', flexShrink: 0, padding: '0.2rem',
                      }}>🗑</button>
                    </div>

                    {/* Cantidad + precio */}
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      marginTop: '0.75rem', paddingTop: '0.75rem',
                      borderTop: '1px solid rgba(196,154,108,0.1)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button onClick={() => updateCantidad(item.productoId, item.cantidad - 1)} style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: 'rgba(196,154,108,0.1)', border: '1px solid rgba(196,154,108,0.2)',
                          color: '#C49A6C', cursor: 'pointer', fontWeight: 900, fontSize: '1rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>−</button>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', minWidth: 20, textAlign: 'center' }}>
                          {item.cantidad}
                        </span>
                        <button onClick={() => updateCantidad(item.productoId, item.cantidad + 1)} style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: 'rgba(196,154,108,0.1)', border: '1px solid rgba(196,154,108,0.2)',
                          color: '#C49A6C', cursor: 'pointer', fontWeight: 900, fontSize: '1rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>+</button>
                      </div>
                      <span style={{ fontWeight: 900, fontSize: '1rem', color: '#C49A6C' }}>
                        €{(item.precio_unitario * item.cantidad).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer con total y checkout */}
        {!pedidoEnviado && items.length > 0 && (
          <div style={{
            padding: '1.25rem 1.5rem',
            borderTop: '1px solid rgba(196,154,108,0.12)',
            background: 'rgba(59,31,8,0.3)',
          }}>
            {/* Desglose */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.82rem', color: '#8B5E3C' }}>
              <span>Subtotal ({items.reduce((s, i) => s + i.cantidad, 0)} items)</span>
              <span>€{totalEuros().toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.82rem', color: '#8B5E3C' }}>
              <span>Envío estimado</span>
              <span style={{ color: '#4ADE80' }}>A consultar</span>
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: '1rem', paddingTop: '0.75rem',
              borderTop: '1px solid rgba(196,154,108,0.15)',
            }}>
              <span style={{ fontWeight: 700, fontSize: '1rem' }}>Total</span>
              <span style={{ fontWeight: 900, fontSize: '1.4rem', color: '#C49A6C' }}>
                €{totalEuros().toFixed(2)}
              </span>
            </div>

            <button onClick={handleCheckout} style={{
              width: '100%', background: '#8B5E3C', color: '#FBF6EE',
              border: 'none', borderRadius: 12, padding: '1rem',
              fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
              marginBottom: '0.5rem',
            }}>
              Enviar pedido →
            </button>
            <button onClick={clearCart} style={{
              width: '100%', background: 'none', color: '#8B5E3C',
              border: 'none', fontSize: '0.78rem', cursor: 'pointer', padding: '0.35rem',
            }}>
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </>
  );
}
