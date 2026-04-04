'use client';
import { Lote } from '@/lib/types/lote';
import { getEUDRStatusColor, getEUDRStatusLabel } from '@/lib/services/s_eudr';

interface Props {
  lote: Lote;
  onSelect?: (lote: Lote) => void;
  showEUDR?: boolean;
}

const PROCESO_LABELS = { lavado: 'Lavado', natural: 'Natural', honey: 'Honey', anaerobico: 'Anaeróbico' };

export default function LoteCard({ lote, onSelect, showEUDR = true }: Props) {
  const eudrColor = getEUDRStatusColor(lote.eudr_status);
  const eudrLabel = getEUDRStatusLabel(lote.eudr_status);

  return (
    <div
      onClick={() => onSelect?.(lote)}
      style={{
        background: '#3B1F08',
        border: '1px solid rgba(196,154,108,0.15)',
        borderRadius: 12,
        padding: '1.25rem',
        cursor: onSelect ? 'pointer' : 'default',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={(e) => onSelect && (e.currentTarget.style.borderColor = 'rgba(196,154,108,0.4)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(196,154,108,0.15)')}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#FBF6EE' }}>{lote.variedad}</div>
          <div style={{ color: '#C49A6C', fontSize: '0.82rem' }}>{lote.caficultor_nombre} · {lote.region}, {lote.pais}</div>
        </div>
        {lote.cupping_score && (
          <div style={{ background: 'rgba(139,94,60,0.2)', border: '1px solid rgba(139,94,60,0.4)', borderRadius: 8, padding: '0.3rem 0.6rem', textAlign: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#C49A6C' }}>{lote.cupping_score}</div>
            <div style={{ fontSize: '0.6rem', color: '#8B5E3C', textTransform: 'uppercase' }}>pts CVA</div>
          </div>
        )}
      </div>

      {/* Details grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
        {[
          { label: 'Proceso', value: PROCESO_LABELS[lote.proceso] },
          { label: 'Altitud', value: `${lote.altitud_msnm} msnm` },
          { label: 'Precio FOB', value: `€${lote.precio_fob}/kg` },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: '0.4rem 0.5rem' }}>
            <div style={{ fontSize: '0.6rem', color: '#8B5E3C', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
            <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#FBF6EE', marginTop: 2 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Notas cata */}
      {lote.notas_cata && (
        <div style={{ fontSize: '0.78rem', color: '#C49A6C', fontStyle: 'italic', marginBottom: '0.75rem' }}>"{lote.notas_cata}"</div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.78rem', color: '#8B5E3C' }}>
          📦 {lote.kilos_disponibles} kg · cosecha {lote.fecha_cosecha}
        </div>
        {showEUDR && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: `${eudrColor}18`, border: `1px solid ${eudrColor}`,
            borderRadius: 100, padding: '0.2rem 0.6rem', fontSize: '0.7rem', color: eudrColor, fontWeight: 600,
          }}>
            {lote.eudr_status === 'green' ? '🟢' : lote.eudr_status === 'amber' ? '🟡' : '🔴'} {lote.eudr_compliance_pct}%
          </span>
        )}
      </div>
    </div>
  );
}
