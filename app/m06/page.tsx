'use client';
import { useState, useEffect } from 'react';
import { useConsumidorStore } from '@/lib/stores/consumidorStore';
import Link from 'next/link';

interface Recomendacion {
  lote_id: string;
  variedad: string;
  caficultor_nombre: string;
  pais: string;
  region: string;
  proceso: string;
  cupping_score: number | null;
  eudr_status: string;
  notas_cata: string | null;
  kilos_disponibles: number;
  match_score: number | null;
  match_pct: number | null;
  motivo: string;
}

export default function M06Feed() {
  const { perfil } = useConsumidorStore();
  const [recomendaciones, setRecomendaciones] = useState<Recomendacion[]>([]);
  const [loadingRec, setLoadingRec] = useState(true);
  const [modoRec, setModoRec] = useState<'personalizado' | 'top_cupping'>('top_cupping');

  useEffect(() => {
    let mounted = true;
    const fetchRecs = async () => {
      setLoadingRec(true);
      try {
        const res = await fetch('/api/ai/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ perfil: perfil ?? null }),
        });
        if (res.ok) {
          const data = await res.json();
          if (mounted) {
            setRecomendaciones(data.recomendaciones);
            setModoRec(data.modo);
          }
        }
      } catch { /* mantener vacío */ }
      finally { if (mounted) setLoadingRec(false); }
    };
    fetchRecs();
    return () => { mounted = false; };
  }, [perfil]);

  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: 700, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#8B5E3C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.5rem' }}>M06 · Consumidor</div>
        <h1 style={{ fontWeight: 900, fontSize: '1.6rem', margin: 0 }}>Descubrir cafés</h1>
        {!perfil && (
          <div style={{ background: 'rgba(139,94,60,0.08)', border: '1px solid rgba(139,94,60,0.25)', borderRadius: 10, padding: '0.75rem 1rem', marginTop: '0.85rem', fontSize: '0.82rem', color: '#C49A6C' }}>
            💡 Completa tu <Link href="/m06/quiz" style={{ color: '#C49A6C', fontWeight: 700 }}>quiz sensorial</Link> para recomendaciones IA personalizadas (3 min)
          </div>
        )}
      </div>

      {/* CTAs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Link href="/m06/quiz" style={{ background: '#8B5E3C', borderRadius: 12, padding: '1.1rem', textDecoration: 'none', color: '#FBF6EE', display: 'block' }}>
          <div style={{ fontSize: '1.3rem', marginBottom: '0.4rem' }}>🎯</div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{perfil ? 'Repetir quiz' : 'Quiz sensorial'}</div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(251,246,238,0.7)', marginTop: 2 }}>3 min · recomendaciones IA</div>
        </Link>
        <Link href="/m06/escanear" style={{ background: '#3B1F08', borderRadius: 12, padding: '1.1rem', textDecoration: 'none', color: '#FBF6EE', display: 'block', border: '1px solid rgba(196,154,108,0.2)' }}>
          <div style={{ fontSize: '1.3rem', marginBottom: '0.4rem' }}>📷</div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Escanear QR</div>
          <div style={{ fontSize: '0.72rem', color: '#C49A6C', marginTop: 2 }}>Cámara real + demo hashes</div>
        </Link>
        <Link href="/m06/fidelizacion" style={{ background: '#3B1F08', borderRadius: 12, padding: '1.1rem', textDecoration: 'none', color: '#FBF6EE', display: 'block', border: '1px solid rgba(196,154,108,0.2)' }}>
          <div style={{ fontSize: '1.3rem', marginBottom: '0.4rem' }}>🎁</div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Fidelización</div>
          <div style={{ fontSize: '0.72rem', color: '#C49A6C', marginTop: 2 }}>Puntos · sellos · recompensas</div>
        </Link>
        <Link href="/m06/historial" style={{ background: '#3B1F08', borderRadius: 12, padding: '1.1rem', textDecoration: 'none', color: '#FBF6EE', display: 'block', border: '1px solid rgba(196,154,108,0.2)' }}>
          <div style={{ fontSize: '1.3rem', marginBottom: '0.4rem' }}>🧾</div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Mis pedidos</div>
          <div style={{ fontSize: '0.72rem', color: '#C49A6C', marginTop: 2 }}>Historial de compras</div>
        </Link>
      </div>

      {/* Recomendaciones IA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#C49A6C', textTransform: 'uppercase', letterSpacing: 1 }}>
          {modoRec === 'personalizado' ? '✨ Recomendado para ti · IA' : 'Cafés destacados · CVA'}
        </div>
        {modoRec === 'personalizado' && (
          <div style={{ fontSize: '0.65rem', color: '#8B5E3C', background: 'rgba(139,94,60,0.1)', padding: '0.15rem 0.5rem', borderRadius: 100 }}>
            basado en tu perfil sensorial
          </div>
        )}
      </div>

      {loadingRec ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ background: '#3B1F08', borderRadius: 12, padding: '1.25rem', border: '1px solid rgba(196,154,108,0.08)', height: 76, opacity: 0.4, animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
          <style>{`@keyframes pulse { 0%,100% { opacity:0.4; } 50% { opacity:0.7; } }`}</style>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {recomendaciones.map((r) => (
            <div key={r.lote_id} style={{ background: 'linear-gradient(135deg, rgba(59,31,8,0.95) 0%, rgba(26,13,5,0.98) 100%)', borderRadius: 12, padding: '1rem 1.25rem', border: '1px solid rgba(196,154,108,0.12)', display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
              <div style={{ width: 44, height: 44, background: '#8B5E3C', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>☕</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FBF6EE', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.variedad} · {r.proceso}</div>
                <div style={{ fontSize: '0.72rem', color: '#C49A6C' }}>{r.caficultor_nombre} · {r.region}, {r.pais}</div>
                {r.motivo && <div style={{ fontSize: '0.65rem', color: '#8B5E3C', marginTop: 2, fontStyle: 'italic' }}>{r.motivo}</div>}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                {r.cupping_score && (
                  <div>
                    <div style={{ fontWeight: 800, color: '#C49A6C', fontSize: '0.9rem' }}>{r.cupping_score}</div>
                    <div style={{ fontSize: '0.58rem', color: '#8B5E3C' }}>CVA</div>
                  </div>
                )}
                {r.match_pct !== null && (
                  <div style={{ marginTop: r.cupping_score ? '0.25rem' : 0 }}>
                    <div style={{ fontWeight: 700, color: r.match_pct >= 70 ? '#4ADE80' : '#fbbf24', fontSize: '0.78rem' }}>{r.match_pct}%</div>
                    <div style={{ fontSize: '0.58rem', color: '#8B5E3C' }}>match</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
