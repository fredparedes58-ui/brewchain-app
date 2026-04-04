'use client';
import { useEffect, useState } from 'react';
import { calculateFocusScore } from '@/lib/services/s_dss';
import { MOCK_KPIS, MOCK_FINANCIALS } from '@/lib/mock/kpis';
import FocusScoreWidget from '@/components/brewchain/FocusScoreWidget';
import { FocusScore } from '@/lib/types/dss';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/authStore';

export default function M03Dashboard() {
  const { nombre } = useAuthStore();
  const [score, setScore] = useState<FocusScore | null>(null);

  useEffect(() => {
    setScore(calculateFocusScore(MOCK_KPIS));
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: 1000, margin: '0 auto' }}>
      {/* Module quick nav */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '1.25rem', scrollbarWidth: 'none' }}>
        {[
          { label: 'M03 · Tostaduria', active: true },
          { label: 'Generar QR', href: '/m03/qr' },
          { label: 'Historial lotes', href: '/m03/historial' },
          { label: 'Catálogo lotes', href: '/m03/lotes' },
          { label: 'Suscripción D2C', href: '/m03/suscripciones' },
          { label: 'Migración Cropster', href: '/m03/migracion' },
        ].map(item => (
          <a key={item.label} href={item.href || '#'} style={{ background: item.active ? '#8B5E3C' : 'rgba(59,31,8,0.6)', color: item.active ? '#FBF6EE' : '#C49A6C', border: `1px solid ${item.active ? '#8B5E3C' : 'rgba(196,154,108,0.2)'}`, borderRadius: 100, padding: '0.45rem 1rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, textDecoration: 'none' }}>
            {item.label}
          </a>
        ))}
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.75rem', color: '#C49A6C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.5rem' }}>M03 · Tostaduria</div>
        <h1 style={{ fontWeight: 900, fontSize: '1.8rem', margin: 0 }}>Dashboard</h1>
        <p style={{ color: '#C49A6C', marginTop: '0.5rem', marginBottom: 0 }}>{nombre}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Focus Score */}
        <div style={{ gridColumn: '1 / -1' }}>
          {score && <FocusScoreWidget score={score} />}
        </div>

        {/* KPIs */}
        {[
          { label: 'MRR', value: `€${MOCK_FINANCIALS.mrr.toLocaleString()}`, sub: '+18% MoM', color: '#C49A6C' },
          { label: 'LTV/CAC', value: `${MOCK_KPIS.ltv_cac_ratio}×`, sub: 'objetivo >5×', color: MOCK_KPIS.ltv_cac_ratio >= 5 ? '#4ADE80' : '#D97706' },
          { label: 'GMV marketplace', value: `€${MOCK_KPIS.gmv_monthly.toLocaleString()}`, sub: 'este mes', color: '#C49A6C' },
          { label: 'QRs/semana', value: MOCK_KPIS.qrs_scanned_weekly, sub: `objetivo: 1000`, color: MOCK_KPIS.qrs_scanned_weekly >= 1000 ? '#4ADE80' : '#DC2626' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} style={{ background: '#3B1F08', borderRadius: 12, padding: '1.25rem', border: '1px solid rgba(196,154,108,0.15)' }}>
            <div style={{ fontSize: '0.7rem', color: '#8B5E3C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.5rem' }}>{label}</div>
            <div style={{ fontWeight: 900, fontSize: '1.6rem', color }}>{value}</div>
            <div style={{ fontSize: '0.75rem', color: '#8B5E3C', marginTop: 4 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Churn warning */}
      {MOCK_KPIS.churn_rate > 0.10 && (
        <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid #DC2626', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 700, color: '#fca5a5', marginBottom: '0.5rem' }}>
            ⚠️ Churn {(MOCK_KPIS.churn_rate * 100).toFixed(0)}% — BLOQUEO ADQUISICIÓN
          </div>
          <div style={{ fontSize: '0.85rem', color: '#C49A6C' }}>
            El churn supera el 10%. No escalar marketing hasta reducir churn. La causa raíz es la rotación insuficiente de lotes en plataforma.
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {[
          { href: '/m03/qr', icon: '📱', label: 'Generar QR', desc: 'Sellar pasaporte digital' },
          { href: '/m03/lotes', icon: '🛒', label: 'Marketplace', desc: 'Ver lotes disponibles' },
          { href: '/m03/migracion', icon: '⬆️', label: 'Migrar Cropster', desc: 'Importar perfiles históricos' },
        ].map(({ href, icon, label, desc }) => (
          <Link key={href} href={href} style={{ background: '#3B1F08', border: '1px solid rgba(196,154,108,0.15)', borderRadius: 12, padding: '1.25rem', textDecoration: 'none', color: '#FBF6EE', transition: 'border-color 0.15s', display: 'block' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{icon}</div>
            <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{label}</div>
            <div style={{ fontSize: '0.78rem', color: '#C49A6C' }}>{desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
