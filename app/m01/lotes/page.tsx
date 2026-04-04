'use client';
import { MOCK_LOTES } from '@/lib/mock/lotes';

export default function M01Lotes() {
  const lotes = MOCK_LOTES.filter(l => l.caficultor_id === 'caf-001');

  return (
    <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.75rem', color: '#C49A6C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.5rem' }}>M01 · Caficultor</div>
        <h1 style={{ fontWeight: 900, fontSize: '1.8rem', margin: 0 }}>Mis Lotes</h1>
        <p style={{ color: '#C49A6C', marginTop: '0.5rem', marginBottom: 0 }}>{lotes.length} lotes en tu historial</p>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {lotes.map((lote) => (
          <div key={lote.id} style={{ background: '#3B1F08', borderRadius: 12, padding: '1.25rem', border: '1px solid rgba(196,154,108,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{lote.variedad} · {lote.proceso}</div>
                <div style={{ color: '#C49A6C', fontSize: '0.82rem' }}>Cosecha: {lote.fecha_cosecha}</div>
              </div>
              <span style={{
                padding: '0.25rem 0.75rem', borderRadius: 100, fontSize: '0.72rem', fontWeight: 600,
                background: lote.estado === 'disponible' ? 'rgba(27,94,48,0.2)' : 'rgba(139,94,60,0.2)',
                color: lote.estado === 'disponible' ? '#4ADE80' : '#C49A6C',
                border: `1px solid ${lote.estado === 'disponible' ? '#1B5E30' : '#8B5E3C'}`,
              }}>
                {lote.estado}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', color: '#8B5E3C' }}>📦 {lote.kilos_disponibles} kg</span>
              <span style={{ fontSize: '0.8rem', color: '#8B5E3C' }}>💰 €{lote.precio_fob}/kg</span>
              {lote.cupping_score && <span style={{ fontSize: '0.8rem', color: '#C49A6C' }}>☕ {lote.cupping_score} pts</span>}
              {lote.qr_sealed && <span style={{ fontSize: '0.8rem', color: '#4ADE80' }}>📱 QR sellado</span>}
            </div>
            {lote.notas_cata && <div style={{ fontSize: '0.78rem', color: '#C49A6C', fontStyle: 'italic', marginTop: '0.5rem' }}>"{lote.notas_cata}"</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
