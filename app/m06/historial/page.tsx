'use client';
import Link from 'next/link';
import { useCompraStore } from '@/lib/stores/compraStore';
import { Compra } from '@/lib/types/compra';

const ESTADO_META: Record<Compra['estado'], { label: string; color: string; bg: string; border: string }> = {
  procesando: { label: 'Procesando',  color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.3)' },
  confirmado:  { label: 'Confirmado',  color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.3)' },
  enviado:     { label: 'En camino',   color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.3)' },
  entregado:   { label: 'Entregado',   color: '#4ADE80', bg: 'rgba(74,222,128,0.1)',  border: 'rgba(74,222,128,0.3)' },
};

export default function HistorialComprasPage() {
  const { compras } = useCompraStore();

  const totalGastado = compras.reduce((a, c) => a + c.total_eur, 0);
  const totalPedidos = compras.length;
  const ultimaCompra = compras[0]?.fecha ?? null;

  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: 700, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Link href="/m06" style={{ color: '#8B5E3C', textDecoration: 'none', fontSize: '1.2rem' }}>←</Link>
        <div>
          <h1 style={{ fontWeight: 900, fontSize: '1.5rem', margin: 0 }}>Historial de compras</h1>
          <div style={{ fontSize: '0.72rem', color: '#8B5E3C', letterSpacing: 1, marginTop: 2 }}>M06 · CONSUMIDOR · MIS PEDIDOS</div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { v: `€${totalGastado.toFixed(2)}`, l: 'Total gastado', c: '#C49A6C' },
          { v: `${totalPedidos}`, l: 'Pedidos', c: '#FBF6EE' },
          { v: ultimaCompra ?? '—', l: 'Última compra', c: '#8B5E3C' },
        ].map(({ v, l, c }) => (
          <div key={l} style={{ background: 'linear-gradient(135deg, rgba(59,31,8,0.95) 0%, rgba(26,13,5,0.98) 100%)', border: '1px solid rgba(196,154,108,0.12)', borderRadius: 12, padding: '0.9rem' }}>
            <div style={{ fontWeight: 900, fontSize: '1.1rem', color: c }}>{v}</div>
            <div style={{ fontSize: '0.68rem', color: '#8B5E3C', marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Aviso datos demo */}
      <div style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.75rem', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>ℹ️</span>
        <span>Datos de ejemplo · Se sincronizará con tu cuenta real al conectar Supabase</span>
      </div>

      {/* Lista pedidos */}
      {compras.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#8B5E3C' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#C49A6C', marginBottom: '0.5rem' }}>Sin compras todavía</div>
          <div style={{ fontSize: '0.82rem', marginBottom: '1.5rem' }}>Explora el marketplace y descubre cafés de especialidad con trazabilidad completa.</div>
          <Link href="/" style={{ background: '#8B5E3C', color: '#FBF6EE', padding: '0.75rem 1.5rem', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: '0.88rem' }}>
            Ir al marketplace →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {compras.map(c => {
            const meta = ESTADO_META[c.estado];
            return (
              <div key={c.id} style={{ background: 'linear-gradient(135deg, rgba(59,31,8,0.95) 0%, rgba(26,13,5,0.98) 100%)', border: '1px solid rgba(196,154,108,0.12)', borderRadius: 14, overflow: 'hidden' }}>
                {/* Header pedido */}
                <div style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', borderBottom: '1px solid rgba(196,154,108,0.08)' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.8rem', color: '#C49A6C' }}>{c.numero}</span>
                      <span style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`, borderRadius: 100, padding: '0.1rem 0.5rem', fontSize: '0.65rem', fontWeight: 700 }}>
                        {meta.label}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#8B5E3C' }}>
                      {c.fecha} · {c.metodo_pago}
                    </div>
                  </div>
                  <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#C49A6C', flexShrink: 0 }}>
                    €{c.total_eur.toFixed(2)}
                  </div>
                </div>

                {/* Items */}
                <div style={{ padding: '0.75rem 1.25rem' }}>
                  {c.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', paddingBottom: i < c.items.length - 1 ? '0.6rem' : 0, marginBottom: i < c.items.length - 1 ? '0.6rem' : 0, borderBottom: i < c.items.length - 1 ? '1px solid rgba(196,154,108,0.06)' : 'none' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#FBF6EE', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.variedad}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#8B5E3C', marginTop: 1 }}>
                          {item.caficultor_nombre} · {item.region}, {item.pais} · {item.cantidad_g}g
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#C49A6C' }}>€{item.precio_eur.toFixed(2)}</div>
                        {item.qr_hash && (
                          <Link href={`/lote/${item.qr_hash}`} style={{ fontSize: '0.62rem', color: '#8B5E3C', textDecoration: 'none' }}>
                            ver pasaporte →
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Dirección si existe */}
                {c.direccion_envio && (
                  <div style={{ padding: '0.5rem 1.25rem 0.75rem', fontSize: '0.7rem', color: '#8B5E3C', borderTop: '1px solid rgba(196,154,108,0.06)' }}>
                    📍 {c.direccion_envio}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
