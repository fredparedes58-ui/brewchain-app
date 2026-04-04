'use client';
import { SealedPassport } from '@/lib/types/passport';

interface Props { passport: SealedPassport; }

const PROCESO_LABELS = { lavado: 'Lavado', natural: 'Natural', honey: 'Honey', anaerobico: 'Anaeróbico' };
const TUESTE_LABELS = { claro: '☀️ Claro', medio: '🌤️ Medio', oscuro: '🌑 Oscuro' };

export default function PassportView({ passport }: Props) {
  const { data } = passport;

  return (
    <div style={{ background: '#1A0D05', color: '#FBF6EE', fontFamily: 'system-ui', maxWidth: 640, margin: '0 auto', padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.75rem', color: '#C49A6C', letterSpacing: 2, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Pasaporte Digital</div>
        <div style={{ fontWeight: 900, fontSize: '2rem', letterSpacing: '-0.03em' }}>BREW CHAIN</div>
        <div style={{ fontSize: '0.8rem', color: '#C49A6C', marginTop: 4 }}>Trazabilidad verificada · SHA-256</div>
      </div>

      {/* Identity */}
      <div style={{ background: '#3B1F08', borderRadius: 12, padding: '1.5rem', marginBottom: '1rem', border: '1px solid rgba(196,154,108,0.2)' }}>
        <div style={{ fontSize: '0.65rem', color: '#8B5E3C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.75rem' }}>Origen</div>
        <div style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: '0.25rem' }}>{data.caficultor_nombre}</div>
        <div style={{ color: '#C49A6C', fontSize: '0.9rem', marginBottom: '0.75rem' }}>{data.pais_region}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {[
            { label: 'Variedad', value: data.variedad },
            { label: 'Proceso', value: PROCESO_LABELS[data.proceso_beneficiado] },
            { label: 'Cosecha', value: data.fecha_cosecha },
            { label: 'Altitud', value: data.altitud_msnm ? `${data.altitud_msnm} msnm` : '—' },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: '0.65rem', color: '#8B5E3C', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: 2 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* GPS Badge */}
        {data.caficultor_gps.verified && (
          <div style={{ marginTop: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(27,94,48,0.2)', border: '1px solid #1B5E30', borderRadius: 100, padding: '0.3rem 0.75rem', fontSize: '0.75rem', color: '#4ADE80' }}>
            📍 GPS verificado · {data.caficultor_gps.lat.toFixed(4)}°, {data.caficultor_gps.lng.toFixed(4)}°
          </div>
        )}
      </div>

      {/* Importación */}
      {data.importador_nombre && (
        <div style={{ background: '#3B1F08', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem', border: '1px solid rgba(26,46,92,0.4)' }}>
          <div style={{ fontSize: '0.65rem', color: '#8B5E3C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.5rem' }}>Importación</div>
          <div style={{ fontWeight: 600 }}>{data.importador_nombre} · {data.importador_pais}</div>
          {data.fecha_importacion && <div style={{ color: '#C49A6C', fontSize: '0.8rem', marginTop: 2 }}>Importado: {data.fecha_importacion}</div>}
          {data.cupping_score && (
            <div style={{ marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(26,46,92,0.3)', border: '1px solid #1A2E5C', borderRadius: 100, padding: '0.25rem 0.75rem', fontSize: '0.8rem', color: '#93c5fd' }}>
              ☕ Cupping CVA 2024: {data.cupping_score} pts
            </div>
          )}
          {data.cupping_notas && <div style={{ color: '#C49A6C', fontSize: '0.8rem', marginTop: '0.5rem', fontStyle: 'italic' }}>"{data.cupping_notas}"</div>}
        </div>
      )}

      {/* Tueste */}
      <div style={{ background: '#3B1F08', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem', border: '1px solid rgba(139,94,60,0.3)' }}>
        <div style={{ fontSize: '0.65rem', color: '#8B5E3C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.5rem' }}>Tueste</div>
        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{data.tostador_nombre}</div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ color: '#C49A6C', fontSize: '0.85rem' }}>📅 {data.fecha_tueste}</span>
          <span style={{ color: '#C49A6C', fontSize: '0.85rem' }}>{TUESTE_LABELS[data.nivel_tueste]}</span>
        </div>
        {data.notas_cata && (
          <div style={{ marginTop: '0.75rem', background: 'rgba(139,94,60,0.1)', borderRadius: 8, padding: '0.75rem', borderLeft: '3px solid #8B5E3C' }}>
            <div style={{ fontSize: '0.65rem', color: '#8B5E3C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.25rem' }}>Notas de cata</div>
            <div style={{ fontSize: '0.9rem', color: '#FBF6EE', fontStyle: 'italic' }}>"{data.notas_cata}"</div>
          </div>
        )}
      </div>

      {/* EUDR */}
      {data.eudr_compliant && (
        <div style={{ background: 'rgba(27,94,48,0.15)', borderRadius: 12, padding: '1rem', marginBottom: '1rem', border: '1px solid rgba(27,94,48,0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🇪🇺</span>
            <span style={{ fontWeight: 600, color: '#4ADE80' }}>EUDR Compliant</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#86efac', marginTop: 4 }}>Reglamento EU 2023/1115 · Todos los 12 requisitos verificados</div>
        </div>
      )}

      {/* Hash / Integrity */}
      <div style={{ borderTop: '1px solid rgba(196,154,108,0.15)', paddingTop: '1rem', marginTop: '0.5rem' }}>
        <div style={{ fontSize: '0.65rem', color: '#8B5E3C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.5rem' }}>Integridad · Sello SHA-256</div>
        <div style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: '#C49A6C', wordBreak: 'break-all', lineHeight: 1.5, background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: 6 }}>
          {passport.hash_sha256}
        </div>
        <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#8B5E3C' }}>
          Sellado: {new Date(passport.sealed_at).toLocaleString('es-ES')} · Inmutable
        </div>
      </div>
    </div>
  );
}
