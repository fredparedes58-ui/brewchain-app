'use client';
import { useState } from 'react';
import { MOCK_LOTES } from '@/lib/mock/lotes';
import { useComercialStore } from '@/lib/stores/comercialStore';

export default function WishList() {
  const { wishList, addWishListItem, removeWishListItem } = useComercialStore();
  const [variedad, setVariedad] = useState('');
  const [origen, setOrigen] = useState('');
  const [scoreMin, setScoreMin] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [matches, setMatches] = useState<typeof MOCK_LOTES>([]);

  const buscar = () => {
    const results = MOCK_LOTES.filter(l => {
      if (variedad && !l.variedad.toLowerCase().includes(variedad.toLowerCase())) return false;
      if (origen && !l.pais.toLowerCase().includes(origen.toLowerCase())) return false;
      if (scoreMin && (l.cupping_score || 0) < Number(scoreMin)) return false;
      if (l.eudr_status === 'red') return false;
      return true;
    }).slice(0, 5);
    setMatches(results);
    setSubmitted(true);
  };

  const guardarWishList = () => {
    if (!variedad && !origen && !scoreMin) return;
    addWishListItem({
      id: `wl-${Date.now()}`,
      variedad: variedad || 'Cualquier variedad',
      origen_pais: origen || 'Cualquier origen',
      score_min: scoreMin ? Number(scoreMin) : undefined,
      kilos: 0,
      fecha_necesaria: new Date().toISOString(),
      matches,
    });
    // Limpiar formulario
    setVariedad('');
    setOrigen('');
    setScoreMin('');
    setSubmitted(false);
    setMatches([]);
  };

  const PROCESO_ICON: Record<string, string> = { lavado: '💧', natural: '☀️', honey: '🍯', anaerobico: '🫙' };

  return (
    <div style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontWeight: 900, fontSize: '1.6rem', margin: 0 }}>Wish List Inversa</h1>
        <p style={{ color: '#C49A6C', marginTop: '0.5rem', marginBottom: 0 }}>
          Publica el perfil que buscas → IA sugiere los 5 lotes más compatibles
        </p>
      </div>

      {/* Formulario de búsqueda */}
      <div style={{ background: '#3B1F08', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid rgba(196,154,108,0.15)', display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#C49A6C', display: 'block', marginBottom: '0.4rem' }}>Variedad buscada</label>
            <input value={variedad} onChange={e => setVariedad(e.target.value)} placeholder="Ej: Gesha, Bourbon..." style={{ width: '100%', background: '#1A0D05', border: '1px solid rgba(196,154,108,0.3)', borderRadius: 8, padding: '0.75rem', color: '#FBF6EE', fontSize: '0.9rem', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#C49A6C', display: 'block', marginBottom: '0.4rem' }}>País de origen</label>
            <input value={origen} onChange={e => setOrigen(e.target.value)} placeholder="Colombia, Guatemala..." style={{ width: '100%', background: '#1A0D05', border: '1px solid rgba(196,154,108,0.3)', borderRadius: 8, padding: '0.75rem', color: '#FBF6EE', fontSize: '0.9rem', boxSizing: 'border-box' }} />
          </div>
        </div>
        <div>
          <label style={{ fontSize: '0.78rem', color: '#C49A6C', display: 'block', marginBottom: '0.4rem' }}>Puntuación mínima CVA 2024</label>
          <input type="number" value={scoreMin} onChange={e => setScoreMin(e.target.value)} placeholder="Ej: 85" min="0" max="100" style={{ width: '100%', background: '#1A0D05', border: '1px solid rgba(196,154,108,0.3)', borderRadius: 8, padding: '0.75rem', color: '#FBF6EE', fontSize: '0.9rem', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem' }}>
          <button onClick={buscar} style={{ background: '#8B5E3C', color: '#FBF6EE', padding: '0.875rem', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700 }}>
            🤖 Buscar con IA (claude-haiku-4-5)
          </button>
          {submitted && matches.length > 0 && (
            <button onClick={guardarWishList} style={{ background: 'rgba(27,94,48,0.3)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ADE80', padding: '0.875rem 1.25rem', borderRadius: 10, cursor: 'pointer', fontWeight: 700, whiteSpace: 'nowrap' }}>
              💾 Guardar
            </button>
          )}
        </div>
      </div>

      {/* Resultados de búsqueda */}
      {submitted && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#C49A6C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.75rem' }}>
            {matches.length} lote(s) compatibles encontrados (excl. lotes sin GPS)
          </div>
          {matches.length === 0 && (
            <div style={{ background: '#3B1F08', borderRadius: 10, padding: '1.5rem', textAlign: 'center', color: '#C49A6C' }}>
              Sin resultados. Ajusta los criterios o amplía el origen.
            </div>
          )}
          {matches.map((lote, i) => (
            <div key={lote.id} style={{ background: '#3B1F08', borderRadius: 10, padding: '1rem', marginBottom: '0.5rem', border: '1px solid rgba(196,154,108,0.15)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ width: 28, height: 28, background: i === 0 ? '#8B5E3C' : 'rgba(139,94,60,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0 }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{lote.variedad} · {lote.region}, {lote.pais}</div>
                <div style={{ fontSize: '0.78rem', color: '#C49A6C' }}>
                  {lote.caficultor_nombre} · {lote.cupping_score} pts · €{lote.precio_fob}/kg
                  {lote.proceso && <span style={{ marginLeft: '0.4rem' }}>{PROCESO_ICON[lote.proceso] ?? ''} {lote.proceso}</span>}
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#4ADE80', background: 'rgba(27,94,48,0.2)', border: '1px solid #1B5E30', borderRadius: 100, padding: '0.2rem 0.6rem' }}>🟢 EUDR OK</span>
            </div>
          ))}
        </div>
      )}

      {/* Wish Lists guardadas */}
      {wishList.length > 0 && (
        <div>
          <div style={{ fontSize: '0.7rem', color: '#8B5E3C', letterSpacing: 2, textTransform: 'uppercase', marginBottom: '0.75rem', fontWeight: 700 }}>
            MIS BÚSQUEDAS GUARDADAS · {wishList.length}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {wishList.map(item => (
              <div key={item.id} style={{ background: 'rgba(59,31,8,0.6)', border: '1px solid rgba(196,154,108,0.12)', borderRadius: 10, padding: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#FBF6EE' }}>
                    {item.variedad}
                    {item.origen_pais !== 'Cualquier origen' && <span style={{ color: '#8B5E3C', fontWeight: 400 }}> · {item.origen_pais}</span>}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#8B5E3C', marginTop: '0.15rem' }}>
                    {item.score_min ? `≥ ${item.score_min} pts` : 'Cualquier score'}
                    {item.matches && item.matches.length > 0 && <span style={{ color: '#4ADE80', marginLeft: '0.5rem' }}>· {item.matches.length} match(es)</span>}
                    <span style={{ marginLeft: '0.5rem' }}>· {new Date(item.fecha_necesaria).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>
                  </div>
                </div>
                <button
                  onClick={() => removeWishListItem(item.id)}
                  style={{ background: 'none', border: 'none', color: '#8B5E3C', cursor: 'pointer', fontSize: '1rem', flexShrink: 0, padding: '0.25rem' }}
                  title="Eliminar"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
