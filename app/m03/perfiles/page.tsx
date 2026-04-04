'use client';
import { useState } from 'react';
import { useComercialStore } from '@/lib/stores/comercialStore';

export default function PerfilesTueste() {
  const { perfilesTueste, addPerfilTueste } = useComercialStore();
  const [showing, setShowing] = useState(false);
  const [form, setForm] = useState({ nombre: '', lote_origen: '', temp_carga: '', primer_crack: '', temp_final: '', tiempo_total_min: '', nivel: 'claro', notas: '' });

  const handleAdd = () => {
    addPerfilTueste({ id: `pf-${Date.now()}`, lote_id: 'new', fecha: new Date().toISOString().split('T')[0], ...form, temp_carga: Number(form.temp_carga), primer_crack: Number(form.primer_crack), temp_final: Number(form.temp_final), tiempo_total_min: Number(form.tiempo_total_min), nivel: form.nivel as any });
    setShowing(false);
    setForm({ nombre: '', lote_origen: '', temp_carga: '', primer_crack: '', temp_final: '', tiempo_total_min: '', nivel: 'claro', notas: '' });
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontWeight: 900, fontSize: '1.8rem', margin: 0 }}>Perfiles de Tueste</h1>
        <button onClick={() => setShowing(!showing)} style={{ background: '#8B5E3C', color: '#FBF6EE', padding: '0.75rem 1.25rem', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700 }}>
          + Nuevo perfil
        </button>
      </div>

      {showing && (
        <div style={{ background: '#3B1F08', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid rgba(196,154,108,0.2)', display: 'grid', gap: '0.75rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[['nombre', 'Nombre del perfil'], ['lote_origen', 'Origen del lote']].map(([k, l]) => (
              <div key={k}><label style={{ fontSize: '0.75rem', color: '#C49A6C', display: 'block', marginBottom: '0.3rem' }}>{l}</label><input value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} style={{ width: '100%', background: '#1A0D05', border: '1px solid rgba(196,154,108,0.3)', borderRadius: 8, padding: '0.65rem', color: '#FBF6EE', fontSize: '0.85rem', boxSizing: 'border-box' }} /></div>
            ))}
            {[['temp_carga', 'Temp. carga (°C)'], ['primer_crack', '1er crack (°C)'], ['temp_final', 'Temp. final (°C)'], ['tiempo_total_min', 'Tiempo total (min)']].map(([k, l]) => (
              <div key={k}><label style={{ fontSize: '0.75rem', color: '#C49A6C', display: 'block', marginBottom: '0.3rem' }}>{l}</label><input type="number" value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} style={{ width: '100%', background: '#1A0D05', border: '1px solid rgba(196,154,108,0.3)', borderRadius: 8, padding: '0.65rem', color: '#FBF6EE', fontSize: '0.85rem', boxSizing: 'border-box' }} /></div>
            ))}
          </div>
          <button onClick={handleAdd} style={{ background: '#8B5E3C', color: '#FBF6EE', padding: '0.75rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700 }}>Guardar perfil</button>
        </div>
      )}

      {perfilesTueste.length === 0 ? (
        <div style={{ background: '#3B1F08', borderRadius: 12, padding: '2rem', textAlign: 'center', color: '#C49A6C' }}>Sin perfiles aún. Crea tu primer perfil o importa desde Cropster.</div>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {perfilesTueste.map(p => (
            <div key={p.id} style={{ background: '#3B1F08', borderRadius: 10, padding: '1rem', border: '1px solid rgba(196,154,108,0.12)' }}>
              <div style={{ fontWeight: 700 }}>{p.nombre} — {p.lote_origen}</div>
              <div style={{ fontSize: '0.8rem', color: '#C49A6C', marginTop: 4 }}>Carga {p.temp_carga}°C · 1er crack {p.primer_crack}°C · Final {p.temp_final}°C · {p.tiempo_total_min} min</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
