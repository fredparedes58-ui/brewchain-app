'use client';
import { useState } from 'react';
import { MOCK_LOTES } from '@/lib/mock/lotes';
import { useCaficultorStore } from '@/lib/stores/caficultorStore';

export default function M02Cupping() {
  const { addAlerta } = useCaficultorStore();
  const [selectedLoteId, setSelectedLoteId] = useState('');
  const [scores, setScores] = useState({ fragancia: 7, aroma: 7, sabor: 7, acidez: 7, cuerpo: 7, balance: 7, dulzor: 7 });
  const [notas, setNotas] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const total = Object.values(scores).reduce((a, b) => a + b, 0) + 36; // CVA 2024 base
  const loteSel = MOCK_LOTES.find(l => l.id === selectedLoteId);

  const ScoreInput = ({ label, scoreKey }: { label: string; scoreKey: keyof typeof scores }) => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <label style={{ fontSize: '0.78rem', color: '#C49A6C' }}>{label}</label>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FBF6EE' }}>{scores[scoreKey]}</span>
      </div>
      <input type="range" min="1" max="10" value={scores[scoreKey]} onChange={e => setScores(s => ({ ...s, [scoreKey]: Number(e.target.value) }))} style={{ width: '100%', accentColor: '#8B5E3C' }} />
    </div>
  );

  const registrarCupping = () => {
    if (!loteSel) return;

    // Notificar al caficultor via su store (persiste en localStorage)
    const descripcion = notas.trim() || 'Sin notas adicionales';
    const calificacion = total >= 90 ? 'Excelente' : total >= 85 ? 'Muy bueno' : total >= 80 ? 'Bueno' : 'Estándar';
    addAlerta({
      id: `cupping-${Date.now()}`,
      tipo: 'cupping',
      mensaje: `☕ Tu lote "${loteSel.variedad} · ${loteSel.region}" recibió un cupping: ${total} pts CVA 2024 (${calificacion}). Notas: ${descripcion}`,
      urgente: total >= 90,
      timestamp: new Date().toISOString(),
      leida: false,
    });

    setSubmitted(true);
  };

  if (submitted && loteSel) {
    return (
      <div style={{ padding: '2rem', maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>☕</div>
        <h2 style={{ fontWeight: 900, fontSize: '1.6rem', margin: '0 0 0.5rem' }}>Cupping registrado</h2>
        <div style={{ background: '#3B1F08', borderRadius: 12, padding: '1.5rem', border: '1px solid rgba(196,154,108,0.2)', marginBottom: '1rem' }}>
          <div style={{ fontWeight: 900, fontSize: '2.5rem', color: total >= 90 ? '#4ADE80' : '#C49A6C' }}>{total}</div>
          <div style={{ color: '#8B5E3C', marginTop: 4 }}>puntos CVA 2024</div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.88rem', color: '#FBF6EE', fontWeight: 600 }}>{loteSel.variedad} · {loteSel.region}</div>
          {notas && <div style={{ marginTop: '0.4rem', fontSize: '0.82rem', color: '#C49A6C', fontStyle: 'italic' }}>{notas}</div>}
        </div>
        {/* Confirmación de notificación */}
        <div style={{ background: 'rgba(27,94,48,0.15)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 10, padding: '0.85rem', marginBottom: '1.25rem', fontSize: '0.82rem', color: '#4ADE80', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
          <span>🔔</span>
          <span>Notificación enviada a <strong>{loteSel.caficultor_nombre}</strong></span>
        </div>
        <button onClick={() => { setSubmitted(false); setSelectedLoteId(''); setNotas(''); setScores({ fragancia: 7, aroma: 7, sabor: 7, acidez: 7, cuerpo: 7, balance: 7, dulzor: 7 }); }} style={{ background: '#8B5E3C', color: '#FBF6EE', padding: '0.875rem 2rem', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700 }}>
          Nuevo cupping
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 640, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontWeight: 900, fontSize: '1.8rem', margin: 0 }}>Cupping Digital</h1>
        <p style={{ color: '#C49A6C', marginTop: '0.5rem', marginBottom: 0 }}>Protocolo CVA 2024 · Specialty Coffee Association</p>
      </div>

      <div style={{ background: '#3B1F08', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid rgba(196,154,108,0.15)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label style={{ fontSize: '0.78rem', color: '#C49A6C', display: 'block', marginBottom: '0.4rem' }}>Seleccionar lote</label>
          <select value={selectedLoteId} onChange={e => setSelectedLoteId(e.target.value)} style={{ width: '100%', background: '#1A0D05', border: '1px solid rgba(196,154,108,0.3)', borderRadius: 8, padding: '0.75rem', color: '#FBF6EE', fontSize: '0.9rem' }}>
            <option value="">-- Selecciona un lote --</option>
            {MOCK_LOTES.map(l => <option key={l.id} value={l.id}>{l.variedad} · {l.caficultor_nombre} · {l.region}</option>)}
          </select>
        </div>

        {loteSel && (
          <div style={{ background: 'rgba(139,94,60,0.1)', border: '1px solid rgba(196,154,108,0.15)', borderRadius: 8, padding: '0.75rem', fontSize: '0.8rem', color: '#C49A6C' }}>
            🔔 El caficultor <strong style={{ color: '#FBF6EE' }}>{loteSel.caficultor_nombre}</strong> recibirá una notificación con el resultado del cupping.
          </div>
        )}

        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {Object.keys(scores).map(k => (
            <ScoreInput key={k} label={k.charAt(0).toUpperCase() + k.slice(1)} scoreKey={k as keyof typeof scores} />
          ))}
        </div>

        <div style={{ background: 'rgba(139,94,60,0.2)', borderRadius: 10, padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#C49A6C', fontSize: '0.9rem' }}>Puntuación total CVA 2024</span>
          <span style={{ fontWeight: 900, fontSize: '1.5rem', color: total >= 90 ? '#4ADE80' : total >= 80 ? '#C49A6C' : '#fca5a5' }}>{total}</span>
        </div>

        <div>
          <label style={{ fontSize: '0.78rem', color: '#C49A6C', display: 'block', marginBottom: '0.4rem' }}>Notas y descriptores</label>
          <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={3} placeholder="Frutos rojos, chocolate, acidez brillante..." style={{ width: '100%', background: '#1A0D05', border: '1px solid rgba(196,154,108,0.3)', borderRadius: 8, padding: '0.75rem', color: '#FBF6EE', fontSize: '0.9rem', boxSizing: 'border-box', resize: 'vertical' }} />
        </div>

        <button
          onClick={registrarCupping}
          disabled={!selectedLoteId}
          style={{ background: selectedLoteId ? '#8B5E3C' : '#3B1F08', color: '#FBF6EE', padding: '1rem', borderRadius: 10, border: 'none', cursor: selectedLoteId ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: '1rem', opacity: selectedLoteId ? 1 : 0.5 }}
        >
          ✓ Registrar cupping · {total} pts
        </button>
      </div>
    </div>
  );
}
