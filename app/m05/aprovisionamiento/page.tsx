'use client';
import { useState } from 'react';
import { MOCK_LOTES } from '@/lib/mock/lotes';
import { Lote } from '@/lib/types/lote';

export default function M05Aprovisionamiento() {
  const lotes = MOCK_LOTES.filter(l => l.estado === 'disponible' && l.eudr_status !== 'red' && l.kilos_disponibles > 0);
  const [muestraModal, setMuestraModal] = useState<Lote | null>(null);
  const [kilosMuestra, setKilosMuestra] = useState('1');
  const [nota, setNota] = useState('');
  const [enviado, setEnviado] = useState<string | null>(null);

  const handleEnviar = () => {
    if (!muestraModal) return;
    setEnviado(muestraModal.id);
    setTimeout(() => { setMuestraModal(null); setEnviado(null); setKilosMuestra('1'); setNota(''); }, 2000);
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: 800, margin: '0 auto', color: '#FBF6EE', fontFamily: 'system-ui,sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontWeight: 900, fontSize: '1.6rem', margin: '0 0 0.25rem' }}>🏭 Aprovisionamiento B2B</h1>
        <p style={{ color: '#C49A6C', fontSize: '0.85rem', margin: 0 }}>
          {lotes.length} lotes disponibles con EUDR ✓ · Solicita muestras directamente al productor
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {[
          { v: `${lotes.length}`, l: 'Lotes disponibles' },
          { v: `${lotes.reduce((a, l) => a + l.kilos_disponibles, 0).toLocaleString()} kg`, l: 'Stock total' },
          { v: `€${(lotes.reduce((a, l) => a + l.precio_fob, 0) / lotes.length).toFixed(2)}/kg`, l: 'Precio medio FOB' },
        ].map(({ v, l }) => (
          <div key={l} style={{ background: 'rgba(59,31,8,0.8)', border: '1px solid rgba(196,154,108,0.15)', borderRadius: 12, padding: '0.85rem', textAlign: 'center' }}>
            <div style={{ fontWeight: 900, fontSize: '1.2rem', color: '#C49A6C' }}>{v}</div>
            <div style={{ fontSize: '0.7rem', color: '#8B5E3C', marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Lotes list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {lotes.map(lote => (
          <div key={lote.id} style={{ background: 'rgba(59,31,8,0.8)', borderRadius: 12, padding: '1rem 1.25rem', border: '1px solid rgba(196,154,108,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{lote.variedad}</span>
                <span style={{ fontSize: '0.72rem', background: lote.eudr_status === 'green' ? 'rgba(27,94,48,0.35)' : 'rgba(217,119,6,0.2)', color: lote.eudr_status === 'green' ? '#4ADE80' : '#fbbf24', border: `1px solid ${lote.eudr_status === 'green' ? 'rgba(74,222,128,0.3)' : 'rgba(251,191,36,0.3)'}`, borderRadius: 100, padding: '0.1rem 0.5rem', fontWeight: 700 }}>EUDR {lote.eudr_status === 'green' ? '✓' : '⚠'}</span>
                {lote.cupping_score && <span style={{ fontSize: '0.72rem', color: '#C49A6C', background: 'rgba(196,154,108,0.1)', border: '1px solid rgba(196,154,108,0.2)', borderRadius: 100, padding: '0.1rem 0.5rem' }}>☕ {lote.cupping_score} pts</span>}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#C49A6C' }}>{lote.caficultor_nombre} · {lote.region}, {lote.pais} · {lote.altitud_msnm}m</div>
              <div style={{ fontSize: '0.75rem', color: '#8B5E3C', marginTop: 2 }}>{lote.proceso} · {lote.kilos_disponibles} kg disponibles</div>
              {lote.notas_cata && <div style={{ fontSize: '0.73rem', color: '#8B5E3C', fontStyle: 'italic', marginTop: 3 }}>"{lote.notas_cata}"</div>}
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
              <div style={{ fontWeight: 900, fontSize: '1.05rem', color: '#C49A6C' }}>€{lote.precio_fob}/kg</div>
              <div style={{ fontSize: '0.72rem', color: '#8B5E3C' }}>min. 5 kg</div>
              <button
                onClick={() => setMuestraModal(lote)}
                style={{ background: '#8B5E3C', color: '#FBF6EE', padding: '0.45rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700, transition: 'background 0.15s' }}
                onMouseOver={e => (e.currentTarget.style.background = '#A0724D')}
                onMouseOut={e => (e.currentTarget.style.background = '#8B5E3C')}
              >
                Pedir muestra →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal solicitar muestra */}
      {muestraModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div style={{ background: '#1A0D05', border: '1px solid rgba(196,154,108,0.2)', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 400 }}>
            {enviado === muestraModal.id ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✅</div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#4ADE80' }}>Solicitud enviada</div>
                <div style={{ fontSize: '0.82rem', color: '#C49A6C', marginTop: '0.5rem' }}>El productor recibirá tu solicitud y te contactará en 24-48h</div>
              </div>
            ) : (
              <>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.25rem' }}>Solicitar muestra</div>
                <div style={{ fontSize: '0.8rem', color: '#C49A6C', marginBottom: '1.25rem' }}>{muestraModal.variedad} · {muestraModal.region}, {muestraModal.pais}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#8B5E3C', display: 'block', marginBottom: '0.3rem' }}>Kilos solicitados (min. 1 kg)</label>
                    <input type="number" min="1" max="20" value={kilosMuestra} onChange={e => setKilosMuestra(e.target.value)}
                      style={{ width: '100%', background: 'rgba(59,31,8,0.8)', border: '1px solid rgba(196,154,108,0.2)', borderRadius: 8, padding: '0.6rem 0.75rem', color: '#FBF6EE', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#8B5E3C', display: 'block', marginBottom: '0.3rem' }}>Nota al productor (opcional)</label>
                    <textarea rows={3} value={nota} onChange={e => setNota(e.target.value)} placeholder="Ej: Interesados en muestra para cupping — espresso blend..."
                      style={{ width: '100%', background: 'rgba(59,31,8,0.8)', border: '1px solid rgba(196,154,108,0.2)', borderRadius: 8, padding: '0.6rem 0.75rem', color: '#FBF6EE', fontSize: '0.82rem', resize: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#8B5E3C', background: 'rgba(139,94,60,0.1)', borderRadius: 8, padding: '0.5rem 0.75rem', border: '1px solid rgba(139,94,60,0.2)' }}>
                    💡 Coste estimado: <strong style={{ color: '#C49A6C' }}>€{(parseFloat(kilosMuestra || '1') * muestraModal.precio_fob).toFixed(2)}</strong> (€{muestraModal.precio_fob}/kg × {kilosMuestra || 1} kg)
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => setMuestraModal(null)} style={{ flex: 1, background: 'rgba(59,31,8,0.6)', color: '#C49A6C', border: '1px solid rgba(196,154,108,0.2)', borderRadius: 10, padding: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
                    <button onClick={handleEnviar} style={{ flex: 2, background: '#8B5E3C', color: '#FBF6EE', border: 'none', borderRadius: 10, padding: '0.75rem', cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem' }}>
                      Enviar solicitud →
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
