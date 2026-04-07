'use client';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/authStore';
import { useComercialStore } from '@/lib/stores/comercialStore';
import { MOCK_LOTES } from '@/lib/mock/lotes';

export default function M04Dashboard() {
  const { nombre } = useAuthStore();
  const { lotesTostados } = useComercialStore();

  // Lotes M04: los que tienen tostador_id que empieza con 'tos-m04'
  const lotesM04 = lotesTostados.filter(l => l.lote_id_origen && (l as any).tostador_id?.startsWith('tos-m04') || false);

  // Lotes disponibles para recibir (todos, no solo del caficultor propio)
  const lotesDisponibles = MOCK_LOTES.filter(l => l.estado === 'disponible' && l.kilos_disponibles > 0);

  // KPI: kg tostados este mes
  const hoy = new Date();
  const mesActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
  const kgMes = lotesM04
    .filter(l => l.fecha_tueste.startsWith(mesActual))
    .reduce((sum, l) => sum + l.kilos_salida, 0);

  // Últimos 5 lotes tostados por M04
  const ultimosLotes = [...lotesM04].reverse().slice(0, 5);

  return (
    <div style={{ padding: '2rem', maxWidth: 1000, margin: '0 auto' }}>
      {/* Quick nav */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '1.25rem', scrollbarWidth: 'none' }}>
        {[
          { label: 'M04 · Café+Tostado', active: true },
          { label: 'Recibir lote verde', href: '/m04/recibir' },
          { label: 'Mis tostados', href: '/m04/historial' },
          { label: 'Marketplace', href: '/m04/marketplace' },
        ].map(item => (
          <a
            key={item.label}
            href={item.href || '#'}
            style={{
              background: item.active ? '#8B5E3C' : 'rgba(59,31,8,0.6)',
              color: item.active ? '#FBF6EE' : '#C49A6C',
              border: `1px solid ${item.active ? '#8B5E3C' : 'rgba(196,154,108,0.2)'}`,
              borderRadius: 100,
              padding: '0.45rem 1rem',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              textDecoration: 'none',
            }}
          >
            {item.label}
          </a>
        ))}
      </div>

      {/* Hero card */}
      <div style={{ background: '#3B1F08', borderRadius: 16, padding: '1.5rem 2rem', marginBottom: '2rem', border: '1px solid rgba(196,154,108,0.2)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <span style={{ fontSize: '3rem' }}>☕</span>
        <div>
          <div style={{ fontSize: '0.7rem', color: '#C49A6C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.25rem' }}>M04 · Café + Tostado</div>
          <h1 style={{ fontWeight: 900, fontSize: '1.6rem', margin: '0 0 0.25rem' }}>José Tomás Carrillo · Café + Tostado</h1>
          <p style={{ color: '#C49A6C', margin: 0, fontSize: '0.9rem' }}>
            {nombre ? `Conectado como: ${nombre}` : 'Tostador especialista — compra lotes verdes y los tuesta'}
          </p>
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          {
            label: 'Lotes disponibles',
            value: lotesDisponibles.length,
            sub: 'para recibir',
            color: '#C49A6C',
          },
          {
            label: 'Lotes tostados',
            value: lotesM04.length,
            sub: 'por M04',
            color: lotesM04.length > 0 ? '#4ADE80' : '#C49A6C',
          },
          {
            label: 'Kg tostados',
            value: `${kgMes.toFixed(1)} kg`,
            sub: 'este mes',
            color: '#C49A6C',
          },
        ].map(({ label, value, sub, color }) => (
          <div key={label} style={{ background: '#3B1F08', borderRadius: 12, padding: '1.25rem', border: '1px solid rgba(196,154,108,0.15)' }}>
            <div style={{ fontSize: '0.7rem', color: '#8B5E3C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.5rem' }}>{label}</div>
            <div style={{ fontWeight: 900, fontSize: '1.6rem', color }}>{value}</div>
            <div style={{ fontSize: '0.75rem', color: '#8B5E3C', marginTop: 4 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Últimos lotes tostados */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.75rem', color: '#C49A6C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.75rem' }}>
          Últimos lotes tostados por M04
        </div>
        {ultimosLotes.length === 0 ? (
          <div style={{ background: '#3B1F08', borderRadius: 12, padding: '2rem', textAlign: 'center', color: '#C49A6C', border: '1px solid rgba(196,154,108,0.15)' }}>
            Sin lotes tostados aún. Recibe un lote verde y regístralo.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {ultimosLotes.map(lote => (
              <div key={lote.id} style={{ background: '#3B1F08', borderRadius: 10, padding: '1rem', border: '1px solid rgba(196,154,108,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{lote.variedad} · {lote.nivel_tueste}</div>
                  <div style={{ color: '#C49A6C', fontSize: '0.8rem' }}>{lote.caficultor_nombre} · {lote.fecha_tueste}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', color: '#FBF6EE', fontWeight: 600 }}>{lote.kilos_salida} kg</div>
                  <div style={{ fontSize: '0.72rem', color: '#8B5E3C' }}>merma {lote.merma_pct}%</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Link href="/m04/recibir" style={{ background: '#8B5E3C', color: '#FBF6EE', padding: '1.25rem', borderRadius: 12, textDecoration: 'none', display: 'block', textAlign: 'center', fontWeight: 700, fontSize: '0.95rem' }}>
          <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>📥</div>
          Recibir lote verde
        </Link>
        <Link href="/m04/historial" style={{ background: '#3B1F08', border: '1px solid rgba(196,154,108,0.3)', color: '#FBF6EE', padding: '1.25rem', borderRadius: 12, textDecoration: 'none', display: 'block', textAlign: 'center', fontWeight: 700, fontSize: '0.95rem' }}>
          <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>📜</div>
          Mis tostados
        </Link>
      </div>
    </div>
  );
}
