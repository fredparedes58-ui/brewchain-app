'use client';
import { useRouter } from 'next/navigation';
import { MOCK_LOTES } from '@/lib/mock/lotes';

export default function RecibirLoteVerde() {
  const router = useRouter();

  // Todos los lotes disponibles con kilos > 0 (no filtrar por caficultor_id — M04 compra a TODOS)
  const lotesDisponibles = MOCK_LOTES.filter(l => l.estado === 'disponible' && l.kilos_disponibles > 0);

  const eudrBadge = (status: 'green' | 'amber' | 'red') => {
    const config = {
      green: { bg: 'rgba(27,94,48,0.2)', color: '#4ADE80', border: '#1B5E30', label: '✓ EUDR' },
      amber: { bg: 'rgba(217,119,6,0.15)', color: '#FBBF24', border: '#92400E', label: '⚠ EUDR' },
      red: { bg: 'rgba(220,38,38,0.15)', color: '#F87171', border: '#7F1D1D', label: '✗ EUDR' },
    };
    const c = config[status];
    return (
      <span style={{ padding: '0.2rem 0.55rem', borderRadius: 100, fontSize: '0.68rem', background: c.bg, color: c.color, border: `1px solid ${c.border}`, fontWeight: 700 }}>
        {c.label}
      </span>
    );
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 700, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <a href="/m04" style={{ background: 'none', border: 'none', color: '#C49A6C', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-block' }}>← Volver al dashboard</a>
        <div style={{ fontSize: '0.75rem', color: '#C49A6C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.5rem' }}>M04 · Café + Tostado</div>
        <h1 style={{ fontWeight: 900, fontSize: '1.8rem', margin: '0 0 0.5rem' }}>Recibir Lote Verde</h1>
        <p style={{ color: '#C49A6C', marginTop: 0, marginBottom: 0 }}>
          Selecciona un lote verde de cualquier caficultor para registrar el tueste
        </p>
      </div>

      {/* Nota informativa */}
      <div style={{ background: 'rgba(139,94,60,0.1)', border: '1px solid rgba(139,94,60,0.3)', borderRadius: 10, padding: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#C49A6C' }}>
        <strong style={{ color: '#FBF6EE' }}>☕ M04 Café+Tostado:</strong> Como tostador independiente, puedes comprar lotes de CUALQUIER caficultor registrado en BREWCHAIN. Los lotes se muestran con su estado EUDR para tu debida diligencia.
      </div>

      {lotesDisponibles.length === 0 ? (
        <div style={{ background: '#3B1F08', borderRadius: 12, padding: '2rem', textAlign: 'center', color: '#C49A6C' }}>
          No hay lotes disponibles en este momento.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {lotesDisponibles.map((lote) => (
            <button
              key={lote.id}
              onClick={() => router.push(`/m04/tueste?lote_id=${lote.id}`)}
              style={{
                background: '#3B1F08',
                border: '1px solid rgba(196,154,108,0.15)',
                borderRadius: 10,
                padding: '1rem 1.25rem',
                cursor: 'pointer',
                textAlign: 'left',
                color: '#FBF6EE',
                width: '100%',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(196,154,108,0.4)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(196,154,108,0.15)')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>
                    {lote.variedad} · {lote.proceso}
                  </div>
                  <div style={{ color: '#C49A6C', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                    {lote.caficultor_nombre} · {lote.region}, {lote.pais}
                  </div>
                  <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.78rem', color: '#8B5E3C' }}>
                    <span>📦 {lote.kilos_disponibles} kg disponibles</span>
                    <span>💶 €{lote.precio_fob}/kg FOB</span>
                    <span>⛰ {lote.altitud_msnm} msnm</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem', flexShrink: 0 }}>
                  {eudrBadge(lote.eudr_status)}
                  {lote.gps_eudr_verified && (
                    <span style={{ padding: '0.2rem 0.55rem', borderRadius: 100, fontSize: '0.68rem', background: 'rgba(27,94,48,0.2)', color: '#4ADE80', border: '1px solid #1B5E30' }}>
                      ✓ GPS
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
