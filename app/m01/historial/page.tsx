'use client';
import { useState } from 'react';
import Link from 'next/link';
import { MOCK_VENTAS_CAF001, RESUMEN_VENTAS } from '@/lib/mock/ventas';
import { EstadoPago, VentaHistorial } from '@/lib/types/ventas';

const ESTADO_CONFIG: Record<EstadoPago, { label: string; color: string; bg: string; border: string }> = {
  pagado:     { label: '✓ Pagado',     color: '#4ADE80', bg: 'rgba(27,94,48,0.25)',    border: 'rgba(74,222,128,0.3)' },
  en_proceso: { label: '⏳ En proceso', color: '#fbbf24', bg: 'rgba(217,119,6,0.15)',   border: 'rgba(217,119,6,0.3)' },
  pendiente:  { label: '◷ Pendiente',  color: '#93c5fd', bg: 'rgba(37,99,235,0.15)',   border: 'rgba(59,130,246,0.3)' },
};

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

function KpiCard({ valor, label, sub }: { valor: string; label: string; sub?: string }) {
  return (
    <div style={{ background: 'linear-gradient(135deg, rgba(59,31,8,0.95) 0%, rgba(26,13,5,0.98) 100%)', border: '1px solid rgba(196,154,108,0.15)', borderRadius: 14, padding: '1rem' }}>
      <div style={{ fontWeight: 900, fontSize: '1.5rem', color: '#C49A6C' }}>{valor}</div>
      <div style={{ fontSize: '0.72rem', color: '#8B5E3C', marginTop: '0.2rem' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.68rem', color: '#4ADE80', marginTop: '0.15rem' }}>{sub}</div>}
    </div>
  );
}

// Gráfica de barras manual (sin recharts para evitar SSR issues)
function GraficaBarras({ datos }: { datos: { mes: string; total: number }[] }) {
  const max = Math.max(...datos.map(d => d.total));
  return (
    <div style={{ background: 'linear-gradient(135deg, rgba(59,31,8,0.95) 0%, rgba(26,13,5,0.98) 100%)', border: '1px solid rgba(196,154,108,0.15)', borderRadius: 14, padding: '1.25rem', marginBottom: '1rem' }}>
      <div style={{ fontSize: '0.65rem', color: '#8B5E3C', letterSpacing: 2, textTransform: 'uppercase', marginBottom: '1rem' }}>INGRESOS POR MES (EUR)</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: 90 }}>
        {datos.map(({ mes, total }) => {
          const h = max > 0 ? Math.round((total / max) * 76) : 0;
          return (
            <div key={mes} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
              <div style={{ fontSize: '0.62rem', color: '#C49A6C', fontWeight: 700 }}>
                {total > 0 ? `€${(total / 1000).toFixed(1)}k` : ''}
              </div>
              <div style={{ width: '100%', height: h || 4, background: total > 0 ? 'linear-gradient(180deg, #C49A6C, #8B5E3C)' : 'rgba(59,31,8,0.6)', borderRadius: '4px 4px 0 0', transition: 'height 0.3s ease', minHeight: 4 }} />
              <div style={{ fontSize: '0.65rem', color: '#8B5E3C' }}>{mes}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FilaVenta({ venta }: { venta: VentaHistorial }) {
  const est = ESTADO_CONFIG[venta.estado_pago];
  return (
    <div style={{ background: 'linear-gradient(135deg, rgba(59,31,8,0.95) 0%, rgba(26,13,5,0.98) 100%)', border: '1px solid rgba(196,154,108,0.12)', borderRadius: 14, padding: '1rem', marginBottom: '0.6rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#FBF6EE' }}>{venta.variedad} · <span style={{ color: '#C49A6C', textTransform: 'capitalize' }}>{venta.proceso}</span></div>
          <div style={{ fontSize: '0.75rem', color: '#8B5E3C', marginTop: '0.15rem' }}>{venta.comprador_nombre} · {venta.comprador_pais}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#C49A6C' }}>€{venta.total_eur.toLocaleString('es-ES')}</div>
          <div style={{ fontSize: '0.7rem', color: '#8B5E3C' }}>{venta.kilos} kg · €{venta.precio_fob_kg}/kg</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span style={{ background: est.bg, color: est.color, border: `1px solid ${est.border}`, borderRadius: 100, padding: '0.2rem 0.65rem', fontSize: '0.7rem', fontWeight: 700 }}>
            {est.label}
          </span>
          <span style={{ background: 'rgba(59,31,8,0.6)', color: '#8B5E3C', border: '1px solid rgba(196,154,108,0.15)', borderRadius: 100, padding: '0.2rem 0.65rem', fontSize: '0.7rem' }}>
            {venta.comprador_tipo === 'Importadora' ? '🚢' : '🔥'} {venta.comprador_tipo}
          </span>
          {venta.cupping_score && (
            <span style={{ background: 'rgba(139,94,60,0.2)', color: '#C49A6C', border: '1px solid rgba(139,94,60,0.3)', borderRadius: 100, padding: '0.2rem 0.65rem', fontSize: '0.7rem', fontWeight: 700 }}>
              ☕ {venta.cupping_score}
            </span>
          )}
        </div>
        <span style={{ fontSize: '0.7rem', color: '#8B5E3C' }}>{formatFecha(venta.fecha)}</span>
      </div>
      {venta.notas && (
        <div style={{ marginTop: '0.6rem', fontSize: '0.78rem', color: '#8B5E3C', fontStyle: 'italic', borderTop: '1px solid rgba(196,154,108,0.08)', paddingTop: '0.5rem' }}>
          {venta.notas}
        </div>
      )}
    </div>
  );
}

export default function HistorialPage() {
  const [filtro, setFiltro] = useState<EstadoPago | 'todos'>('todos');
  const ventasFiltradas = filtro === 'todos'
    ? MOCK_VENTAS_CAF001
    : MOCK_VENTAS_CAF001.filter(v => v.estado_pago === filtro);

  return (
    <div style={{ padding: '1.25rem', maxWidth: 640, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <Link href="/m01" style={{ color: '#8B5E3C', textDecoration: 'none', fontSize: '1.2rem' }}>←</Link>
        <div>
          <div style={{ fontWeight: 900, fontSize: '1.3rem', color: '#FBF6EE' }}>Historial de Ventas</div>
          <div style={{ fontSize: '0.72rem', color: '#8B5E3C', letterSpacing: 1 }}>FINCA EL PARAÍSO · HUILA</div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
        <KpiCard valor={`€${RESUMEN_VENTAS.total_ingresado_eur.toLocaleString('es-ES')}`} label="Total ingresado" sub="✓ Cobrado" />
        <KpiCard valor={`€${RESUMEN_VENTAS.pendiente_cobro_eur.toLocaleString('es-ES')}`} label="Pendiente cobro" />
        <KpiCard valor={`${RESUMEN_VENTAS.kilos_totales.toLocaleString('es-ES')} kg`} label="Kilos vendidos" />
        <KpiCard valor={`€${RESUMEN_VENTAS.mejor_precio_fob}/kg`} label="Mejor precio FOB" sub="↑ Premium" />
      </div>

      {/* Gráfica */}
      <GraficaBarras datos={RESUMEN_VENTAS.ingresos_por_mes} />

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
        {(['todos', 'pagado', 'en_proceso', 'pendiente'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            style={{ background: filtro === f ? '#8B5E3C' : 'rgba(59,31,8,0.6)', color: filtro === f ? '#FBF6EE' : '#C49A6C', border: `1px solid ${filtro === f ? '#8B5E3C' : 'rgba(196,154,108,0.2)'}`, borderRadius: 100, padding: '0.35rem 0.85rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
          >
            {f === 'todos' ? 'Todos' : f === 'pagado' ? '✓ Pagado' : f === 'en_proceso' ? '⏳ En proceso' : '◷ Pendiente'}
          </button>
        ))}
      </div>

      {/* Lista de ventas */}
      <div style={{ fontSize: '0.72rem', color: '#8B5E3C', marginBottom: '0.75rem' }}>
        {ventasFiltradas.length} transacción{ventasFiltradas.length !== 1 ? 'es' : ''}
      </div>
      {ventasFiltradas.map(v => <FilaVenta key={v.id} venta={v} />)}
    </div>
  );
}
