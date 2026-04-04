'use client';
import { MOCK_LOTES } from '@/lib/mock/lotes';

export default function M05Aprovisionamiento() {
  const lotes = MOCK_LOTES.filter(l => l.estado === 'disponible' && l.eudr_status !== 'red' && l.kilos_disponibles > 0);
  return (
    <div style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontWeight: 900, fontSize: '1.8rem', margin: '0 0 1.5rem' }}>Aprovisionamiento B2B</h1>
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {lotes.map(lote => (
          <div key={lote.id} style={{ background: '#3B1F08', borderRadius: 10, padding: '1rem 1.25rem', border: '1px solid rgba(196,154,108,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{lote.variedad} · {lote.region}, {lote.pais}</div>
              <div style={{ fontSize: '0.78rem', color: '#C49A6C' }}>{lote.caficultor_nombre} · {lote.kilos_disponibles} kg disponibles</div>
              {lote.notas_cata && <div style={{ fontSize: '0.75rem', color: '#8B5E3C', fontStyle: 'italic', marginTop: 2 }}>"{lote.notas_cata}"</div>}
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontWeight: 800, color: '#C49A6C' }}>€{lote.precio_fob}/kg</div>
              <button style={{ marginTop: 6, background: '#8B5E3C', color: '#FBF6EE', padding: '0.4rem 0.875rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Pedir muestra</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
