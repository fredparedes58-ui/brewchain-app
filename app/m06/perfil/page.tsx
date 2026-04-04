'use client';
import { useConsumidorStore } from '@/lib/stores/consumidorStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MOCK_PASAPORTES } from '@/lib/mock/pasaportes';

const INTENSIDAD_LABEL: Record<string, string> = {
  suave: 'Suave y delicado',
  medio: 'Equilibrado',
  intenso: 'Intenso y potente',
};
const ACIDEZ_LABEL: Record<string, string> = {
  baja: 'Acidez baja — redondo',
  media: 'Acidez media — vivo',
  alta: 'Acidez alta — brillante',
};
const SABOR_EMOJI: Record<string, string> = {
  frutal: '🍓',
  chocolate: '🍫',
  nuez: '🌰',
  floral: '🌸',
  caramelo: '🍯',
};
const PROCESO_LABEL: Record<string, string> = {
  lavado: 'Lavado',
  natural: 'Natural',
  honey: 'Honey',
  anaerobic: 'Anaeróbico',
  cualquiera: 'Sin preferencia',
};

export default function M06Perfil() {
  const { perfil, qrEscaneados } = useConsumidorStore();
  const router = useRouter();

  // Cafés escaneados con sus pasaportes
  const pasaportesEscaneados = qrEscaneados
    .map(hash => MOCK_PASAPORTES.find(p => p.hash_corto === hash || p.hash_sha256 === hash))
    .filter(Boolean);

  if (!perfil || !perfil.completado) {
    return (
      <div style={{ padding: '2rem', maxWidth: 560, margin: '0 auto', textAlign: 'center', paddingTop: '4rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎯</div>
        <h2 style={{ fontWeight: 900, fontSize: '1.6rem', marginBottom: '0.75rem' }}>Todavía no tienes perfil</h2>
        <p style={{ color: '#C49A6C', marginBottom: '2rem', lineHeight: 1.6 }}>
          Completa el quiz sensorial de 3 minutos y descubre qué cafés se adaptan a tu paladar.
        </p>
        <button
          onClick={() => router.push('/m06/quiz')}
          style={{ background: '#8B5E3C', color: '#FBF6EE', padding: '1rem 2.5rem', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}
        >
          Hacer el quiz ahora →
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 640, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontWeight: 900, fontSize: '1.8rem', margin: '0 0 0.25rem' }}>Mi Perfil Sensorial</h1>
        <p style={{ color: '#C49A6C', margin: 0, fontSize: '0.9rem' }}>Basado en tu quiz · Actualizado automáticamente</p>
      </div>

      {/* Tarjeta principal del perfil */}
      <div style={{ background: 'linear-gradient(135deg, #3B1F08 0%, #1A0D05 100%)', borderRadius: 16, padding: '2rem', marginBottom: '1.5rem', border: '1px solid rgba(196,154,108,0.3)', position: 'relative', overflow: 'hidden' }}>
        {/* Decoración */}
        <div style={{ position: 'absolute', top: -20, right: -20, fontSize: '8rem', opacity: 0.06 }}>☕</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', position: 'relative' }}>
          {/* Intensidad */}
          <div>
            <div style={{ fontSize: '0.7rem', color: '#8B5E3C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.35rem' }}>Intensidad</div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#FBF6EE' }}>{INTENSIDAD_LABEL[perfil.intensidad]}</div>
            <div style={{ display: 'flex', gap: 4, marginTop: '0.4rem' }}>
              {['suave', 'medio', 'intenso'].map(v => (
                <div key={v} style={{ height: 6, flex: 1, borderRadius: 3, background: perfil.intensidad === v ? '#8B5E3C' : 'rgba(255,255,255,0.1)' }} />
              ))}
            </div>
          </div>

          {/* Acidez */}
          <div>
            <div style={{ fontSize: '0.7rem', color: '#8B5E3C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.35rem' }}>Acidez</div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#FBF6EE' }}>{ACIDEZ_LABEL[perfil.acidez]}</div>
            <div style={{ display: 'flex', gap: 4, marginTop: '0.4rem' }}>
              {['baja', 'media', 'alta'].map(v => (
                <div key={v} style={{ height: 6, flex: 1, borderRadius: 3, background: perfil.acidez === v ? '#C49A6C' : 'rgba(255,255,255,0.1)' }} />
              ))}
            </div>
          </div>

          {/* Proceso */}
          <div>
            <div style={{ fontSize: '0.7rem', color: '#8B5E3C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.35rem' }}>Proceso favorito</div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#FBF6EE' }}>{PROCESO_LABEL[perfil.proceso_preferido] ?? perfil.proceso_preferido}</div>
          </div>

          {/* Origen */}
          <div>
            <div style={{ fontSize: '0.7rem', color: '#8B5E3C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.35rem' }}>Origen preferido</div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#FBF6EE' }}>{perfil.origen_preferido}</div>
          </div>
        </div>

        {/* Sabores */}
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(196,154,108,0.15)', paddingTop: '1.25rem' }}>
          <div style={{ fontSize: '0.7rem', color: '#8B5E3C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.75rem' }}>Notas que buscas</div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {perfil.sabores_preferidos.map(s => (
              <span key={s} style={{ background: 'rgba(139,94,60,0.3)', border: '1px solid rgba(196,154,108,0.4)', borderRadius: 20, padding: '0.35rem 0.9rem', fontSize: '0.85rem', color: '#FBF6EE' }}>
                {SABOR_EMOJI[s]} {s.charAt(0).toUpperCase() + s.slice(1)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats de actividad */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#3B1F08', borderRadius: 12, padding: '1.25rem', border: '1px solid rgba(196,154,108,0.15)', textAlign: 'center' }}>
          <div style={{ fontWeight: 900, fontSize: '2.5rem', color: '#8B5E3C' }}>{qrEscaneados.length}</div>
          <div style={{ fontSize: '0.8rem', color: '#C49A6C', marginTop: '0.25rem' }}>Pasaportes escaneados</div>
        </div>
        <div style={{ background: '#3B1F08', borderRadius: 12, padding: '1.25rem', border: '1px solid rgba(196,154,108,0.15)', textAlign: 'center' }}>
          <div style={{ fontWeight: 900, fontSize: '2.5rem', color: '#1B5E30' }}>{pasaportesEscaneados.filter(p => p?.data.eudr_compliant).length}</div>
          <div style={{ fontSize: '0.8rem', color: '#C49A6C', marginTop: '0.25rem' }}>Cafés EUDR compliant</div>
        </div>
      </div>

      {/* Historial de QRs escaneados */}
      {pasaportesEscaneados.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#C49A6C', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }}>
            ☕ Cafés que has probado
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pasaportesEscaneados.map((p, i) => p && (
              <Link key={i} href={`/lote/${p.hash_corto}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#3B1F08', borderRadius: 12, padding: '1rem', border: '1px solid rgba(196,154,108,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'border-color 0.2s' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#FBF6EE', fontSize: '0.95rem' }}>{p.data.variedad} · {p.data.pais_region}</div>
                    <div style={{ fontSize: '0.8rem', color: '#C49A6C', marginTop: '0.2rem' }}>{p.data.tostador_nombre}</div>
                    <div style={{ fontSize: '0.72rem', color: '#8B5E3C', marginTop: '0.15rem' }}>#{p.hash_corto}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {p.data.cupping_score && (
                      <div style={{ fontWeight: 900, fontSize: '1.4rem', color: p.data.cupping_score >= 90 ? '#4ADE80' : '#C49A6C' }}>
                        {p.data.cupping_score}
                      </div>
                    )}
                    {p.data.eudr_compliant && (
                      <div style={{ fontSize: '0.65rem', color: '#4ADE80', marginTop: '0.15rem' }}>✓ EUDR</div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Acciones */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <button
          onClick={() => router.push('/m06/quiz')}
          style={{ background: 'transparent', border: '1px solid rgba(196,154,108,0.4)', color: '#C49A6C', padding: '0.875rem', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
        >
          🔄 Repetir quiz para actualizar perfil
        </button>
        <button
          onClick={() => router.push('/m06/escanear')}
          style={{ background: '#8B5E3C', color: '#FBF6EE', padding: '0.875rem', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}
        >
          📷 Escanear nuevo QR
        </button>
      </div>
    </div>
  );
}
