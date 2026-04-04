'use client';
import { useState } from 'react';
import { MOCK_LOTES } from '@/lib/mock/lotes';
import LoteCard from '@/components/brewchain/LoteCard';

export default function M03Marketplace() {
  const [filter, setFilter] = useState('');
  const lotes = MOCK_LOTES.filter(l => l.estado === 'disponible' && l.kilos_disponibles > 0);
  const filtered = filter ? lotes.filter(l => l.pais.toLowerCase().includes(filter.toLowerCase()) || l.variedad.toLowerCase().includes(filter.toLowerCase())) : lotes;

  return (
    <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontWeight: 900, fontSize: '1.8rem', margin: 0 }}>Marketplace de Lotes</h1>
        <p style={{ color: '#C49A6C', marginTop: '0.5rem', marginBottom: 0 }}>{lotes.length} lotes disponibles · Solo lotes con GPS verificado</p>
      </div>
      <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filtrar por origen o variedad..." style={{ width: '100%', background: '#3B1F08', border: '1px solid rgba(196,154,108,0.3)', borderRadius: 10, padding: '0.875rem 1rem', color: '#FBF6EE', fontSize: '0.95rem', marginBottom: '1.5rem', boxSizing: 'border-box' }} />
      <div style={{ display: 'grid', gap: '1rem' }}>
        {filtered.map(lote => <LoteCard key={lote.id} lote={lote} />)}
        {filtered.length === 0 && <div style={{ background: '#3B1F08', borderRadius: 12, padding: '2rem', textAlign: 'center', color: '#C49A6C' }}>Sin resultados para "{filter}"</div>}
      </div>
    </div>
  );
}
