'use client';
import { EUDRValidation, EUDRStatus } from '@/lib/types/eudr';

interface Props {
  validation: EUDRValidation;
  compact?: boolean;
}

const STATUS_CONFIG = {
  green: { bg: '#1B5E30', label: '🟢 EUDR Compliant', text: 'Todos los requisitos cumplidos. Listo para exportar a EU.' },
  amber: { bg: '#D97706', label: '🟡 Datos incompletos', text: 'Algunos requisitos pendientes. Ver detalle.' },
  red: { bg: '#DC2626', label: '🔴 Sin GPS — No exportable a EU', text: 'Este lote NO puede importarse en la UE. Contactar al productor.' },
};

export default function EUDRSemaforo({ validation, compact = false }: Props) {
  const config = STATUS_CONFIG[validation.status];

  if (compact) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: config.bg + '22', border: `1px solid ${config.bg}`,
        borderRadius: 100, padding: '0.25rem 0.75rem', fontSize: '0.78rem',
        color: config.bg === '#1B5E30' ? '#4ADE80' : config.bg,
        fontWeight: 600,
      }}>
        {config.label}
        <span style={{ color: '#C49A6C' }}>{validation.compliance_pct}%</span>
      </span>
    );
  }

  return (
    <div style={{ background: '#3B1F08', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(196,154,108,0.15)' }}>
      {/* Status header */}
      <div style={{ background: config.bg, padding: '1rem 1.25rem' }}>
        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'white' }}>{config.label}</div>
        <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>{config.text}</div>
        <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.3)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'white', width: `${validation.compliance_pct}%`, borderRadius: 3 }} />
          </div>
          <span style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>{validation.satisfied_count}/{validation.requirements.length}</span>
        </div>
      </div>

      {/* Requirements list */}
      <div style={{ padding: '1rem' }}>
        <div style={{ fontSize: '0.75rem', color: '#C49A6C', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>
          Requisitos EU 2023/1115
        </div>
        <div style={{ display: 'grid', gap: '0.35rem' }}>
          {validation.requirements.map((req) => (
            <div key={req.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
              padding: '0.4rem 0.6rem', borderRadius: 6,
              background: req.satisfied ? 'rgba(27,94,48,0.15)' : 'rgba(220,38,38,0.1)',
              fontSize: '0.78rem',
            }}>
              <span style={{ flexShrink: 0, marginTop: 1 }}>{req.satisfied ? '✓' : '✗'}</span>
              <span style={{ color: req.satisfied ? '#86efac' : '#fca5a5', lineHeight: 1.3 }}>
                <strong>Req. {req.id}:</strong> {req.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
