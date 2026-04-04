'use client';
import { FocusScore } from '@/lib/types/dss';
import { getFocusColorHex, getFocusLabel } from '@/lib/services/s_dss';

interface Props { score: FocusScore; compact?: boolean; }

const COMPONENT_LABELS: Record<string, string> = {
  retention: 'Retención', ltv_cac: 'LTV/CAC', moat: 'Moat',
  qr_traction: 'QR Traction', marketplace_health: 'Marketplace', eudr_coverage: 'EUDR',
};

export default function FocusScoreWidget({ score, compact = false }: Props) {
  const colorHex = getFocusColorHex(score.color);
  const label = getFocusLabel(score.color);

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#3B1F08', borderRadius: 10, padding: '0.75rem 1rem', border: `1px solid ${colorHex}40` }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: `${colorHex}20`, border: `3px solid ${colorHex}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.1rem', color: colorHex, flexShrink: 0 }}>
          {score.score}
        </div>
        <div>
          <div style={{ fontWeight: 700, color: '#FBF6EE', fontSize: '0.85rem' }}>Focus Score</div>
          <div style={{ fontSize: '0.75rem', color: colorHex }}>{label}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#3B1F08', borderRadius: 16, padding: '1.5rem', border: `1px solid ${colorHex}30` }}>
      {/* Score principal */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: `${colorHex}15`, border: `4px solid ${colorHex}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontWeight: 900, fontSize: '1.8rem', color: colorHex }}>{score.score}</span>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#C49A6C', textTransform: 'uppercase', letterSpacing: 1 }}>Focus Score · BREW CHAIN DSS</div>
          <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#FBF6EE', marginTop: 4 }}>{label}</div>
          <div style={{ fontSize: '0.78rem', color: '#8B5E3C', marginTop: 2 }}>Calculado {new Date(score.timestamp).toLocaleTimeString('es-ES')}</div>
        </div>
      </div>

      {/* Componentes */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.7rem', color: '#C49A6C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.75rem' }}>Desglose</div>
        <div style={{ display: 'grid', gap: '0.4rem' }}>
          {Object.entries(score.components).map(([key, val]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 80, fontSize: '0.72rem', color: '#C49A6C', textAlign: 'right', flexShrink: 0 }}>{COMPONENT_LABELS[key]}</div>
              <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: val >= 7 ? '#1B5E30' : val >= 4 ? '#D97706' : '#DC2626', width: `${val * 10}%`, borderRadius: 3, transition: 'width 0.5s' }} />
              </div>
              <div style={{ width: 28, fontSize: '0.72rem', color: '#FBF6EE', fontWeight: 600 }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Alertas */}
      {score.alerts.length > 0 && (
        <div>
          <div style={{ fontSize: '0.7rem', color: '#C49A6C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.5rem' }}>Alertas activas ({score.alerts.length}/3 máx.)</div>
          {score.alerts.map((alert, i) => {
            const aC = alert.severity === 'red' ? '#DC2626' : '#D97706';
            return (
              <div key={i} style={{ background: `${aC}12`, border: `1px solid ${aC}30`, borderRadius: 8, padding: '0.75rem', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.82rem', color: '#FBF6EE' }}>{alert.variable}</span>
                  <span style={{ fontSize: '0.78rem', color: aC, fontWeight: 700 }}>{alert.value}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#C49A6C' }}>{alert.action}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
