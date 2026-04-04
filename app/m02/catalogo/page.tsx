'use client';
import { useState } from 'react';
import { MOCK_LOTES } from '@/lib/mock/lotes';
import LoteCard from '@/components/brewchain/LoteCard';

export default function M02Catalogo() {
  const [filterStatus, setFilterStatus] = useState<'all' | 'green' | 'amber' | 'red'>('all');
  const filtered = filterStatus === 'all' ? MOCK_LOTES : MOCK_LOTES.filter(l => l.eudr_status === filterStatus);

  return (
    <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontWeight: 900, fontSize: '1.8rem', margin: 0 }}>Catálogo de Lotes</h1>
        <p style={{ color: '#C49A6C', marginTop: '0.5rem', marginBottom: 0 }}>Filtrar por estado EUDR · Solo lotes 🟢 son exportables a EU</p>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[['all', '📋 Todos'], ['green', '🟢 EUDR OK'], ['amber', '🟡 Incompletos'], ['red', '🔴 Bloqueados']].map(([val, label]) => (
          <button key={val} onClick={() => setFilterStatus(val as any)} style={{ background: filterStatus === val ? '#8B5E3C' : '#3B1F08', color: '#FBF6EE', padding: '0.5rem 1rem', borderRadius: 100, border: `1px solid ${filterStatus === val ? '#C49A6C' : 'rgba(196,154,108,0.2)'}`, cursor: 'pointer', fontSize: '0.82rem', fontWeight: filterStatus === val ? 700 : 400 }}>
            {label}
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {filtered.map(lote => <LoteCard key={lote.id} lote={lote} />)}
      </div>
    </div>
  );
}
