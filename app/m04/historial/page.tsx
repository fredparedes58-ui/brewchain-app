'use client';
import Link from 'next/link';
import { useComercialStore } from '@/lib/stores/comercialStore';
import { LoteTostado } from '@/lib/types/tostado';

// LoteTostado con campo opcional tostador_id que M04 añade
type LoteTostadoM04 = LoteTostado & { tostador_id?: string };

export default function HistorialM04() {
  const { lotesTostados } = useComercialStore();

  // Filtrar solo los lotes tostados por M04 (tostador_id empieza con 'tos-m04')
  const lotesM04 = (lotesTostados as LoteTostadoM04[]).filter(
    l => l.tostador_id?.startsWith('tos-m04') ?? false
  );

  // Ordenar más recientes primero
  const lotesOrdenados = [...lotesM04].sort((a, b) =>
    new Date(b.fecha_tueste).getTime() - new Date(a.fecha_tueste).getTime()
  );

  const totalKg = lotesM04.reduce((sum, l) => sum + l.kilos_salida, 0);
  const mermaPromedio = lotesM04.length > 0
    ? (lotesM04.reduce((sum, l) => sum + l.merma_pct, 0) / lotesM04.length).toFixed(1)
    : '0';

  return (
    <div style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <a href="/m04" style={{ color: '#C49A6C', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-block', marginBottom: '1rem' }}>← Dashboard M04</a>
        <div style={{ fontSize: '0.75rem', color: '#C49A6C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.5rem' }}>M04 · Café + Tostado</div>
        <h1 style={{ fontWeight: 900, fontSize: '1.8rem', margin: '0 0 0.5rem' }}>Historial de Tostados</h1>
        <p style={{ color: '#C49A6C', margin: 0 }}>Todos los lotes procesados bajo el actor M04</p>
      </div>

      {/* Stats resumen */}
      {lotesM04.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Lotes tostados', value: lotesM04.length },
            { label: 'Kg tostados total', value: `${totalKg.toFixed(1)} kg` },
            { label: 'Merma promedio', value: `${mermaPromedio}%` },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: '#3B1F08', borderRadius: 10, padding: '1rem', border: '1px solid rgba(196,154,108,0.15)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: '#8B5E3C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.4rem' }}>{label}</div>
              <div style={{ fontWeight: 900, fontSize: '1.4rem', color: '#C49A6C' }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Lista */}
      {lotesOrdenados.length === 0 ? (
        <div style={{ background: '#3B1F08', borderRadius: 12, padding: '3rem', textAlign: 'center', border: '1px solid rgba(196,154,108,0.15)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>☕</div>
          <div style={{ color: '#C49A6C', marginBottom: '1.5rem' }}>Sin lotes tostados por M04 aún.</div>
          <Link href="/m04/recibir" style={{ background: '#8B5E3C', color: '#FBF6EE', padding: '0.75rem 1.5rem', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>
            Recibir primer lote
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {lotesOrdenados.map(lote => (
            <div key={lote.id} style={{ background: '#3B1F08', borderRadius: 12, padding: '1.25rem', border: '1px solid rgba(196,154,108,0.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>
                    {lote.variedad}
                    <span style={{ marginLeft: '0.5rem', padding: '0.15rem 0.5rem', borderRadius: 100, fontSize: '0.7rem', background: 'rgba(139,94,60,0.25)', color: '#C49A6C', border: '1px solid rgba(196,154,108,0.3)' }}>
                      {lote.nivel_tueste}
                    </span>
                  </div>
                  <div style={{ color: '#C49A6C', fontSize: '0.82rem', marginBottom: '0.5rem' }}>
                    {lote.caficultor_nombre} · {lote.region}, {lote.pais}
                  </div>
                  <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.78rem', color: '#8B5E3C', flexWrap: 'wrap' }}>
                    <span>📅 {lote.fecha_tueste}</span>
                    <span>⬇ {lote.kilos_entrada} kg verde</span>
                    <span>⬆ {lote.kilos_salida} kg tostado</span>
                    <span>📉 merma {lote.merma_pct}%</span>
                  </div>
                  {lote.perfil_nombre && (
                    <div style={{ fontSize: '0.75rem', color: '#8B5E3C', marginTop: '0.4rem' }}>
                      Perfil: {lote.perfil_nombre}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
                  {lote.qr_hash && (
                    <div style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#8B5E3C', background: 'rgba(0,0,0,0.2)', padding: '0.25rem 0.5rem', borderRadius: 4 }}>
                      #{lote.qr_hash.slice(0, 8)}
                    </div>
                  )}
                  {lote.qr_url && (
                    <a
                      href={lote.qr_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: '0.75rem', color: '#4ADE80', textDecoration: 'none', border: '1px solid rgba(74,222,128,0.3)', padding: '0.2rem 0.5rem', borderRadius: 6 }}
                    >
                      Ver pasaporte
                    </a>
                  )}
                </div>
              </div>
              {lote.notas_cata && (
                <div style={{ marginTop: '0.75rem', padding: '0.6rem', background: 'rgba(0,0,0,0.15)', borderRadius: 6, fontSize: '0.78rem', color: '#C49A6C', fontStyle: 'italic' }}>
                  &ldquo;{lote.notas_cata}&rdquo;
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
