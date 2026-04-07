'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useComercialStore } from '@/lib/stores/comercialStore';
import { LoteTostado } from '@/lib/types/tostado';

type LoteTostadoM04 = LoteTostado & { tostador_id?: string };

interface PublicadoState {
  [id: string]: boolean;
}

export default function MarketplaceM04() {
  const { lotesTostados } = useComercialStore();
  const [publicados, setPublicados] = useState<PublicadoState>({});
  const [animando, setAnimando] = useState<string | null>(null);

  // Lotes M04 que se pueden publicar
  const lotesM04 = (lotesTostados as LoteTostadoM04[]).filter(
    l => l.tostador_id?.startsWith('tos-m04') ?? false
  );

  const handlePublicar = (lote: LoteTostadoM04) => {
    if (publicados[lote.id]) return;
    setAnimando(lote.id);

    setTimeout(() => {
      setPublicados(prev => ({ ...prev, [lote.id]: true }));
      setAnimando(null);
    }, 1200);
  };

  const calcularPrecio = (preciofob: number) => (preciofob * 1.35).toFixed(2);

  return (
    <div style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <a href="/m04" style={{ color: '#C49A6C', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-block', marginBottom: '1rem' }}>← Dashboard M04</a>
        <div style={{ fontSize: '0.75rem', color: '#C49A6C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.5rem' }}>M04 · Café + Tostado</div>
        <h1 style={{ fontWeight: 900, fontSize: '1.8rem', margin: '0 0 0.5rem' }}>Publicar al Marketplace</h1>
        <p style={{ color: '#C49A6C', margin: 0 }}>Publica tus lotes tostados para venderlos en BREWCHAIN</p>
      </div>

      {/* Nota pricing */}
      <div style={{ background: 'rgba(139,94,60,0.1)', border: '1px solid rgba(139,94,60,0.3)', borderRadius: 10, padding: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#C49A6C' }}>
        <strong style={{ color: '#FBF6EE' }}>💶 Pricing automático:</strong> El precio de venta se calcula como precio FOB origen × 1.35 (margen 35% para cubrir tueste, merma y distribución).
      </div>

      {lotesM04.length === 0 ? (
        <div style={{ background: '#3B1F08', borderRadius: 12, padding: '3rem', textAlign: 'center', border: '1px solid rgba(196,154,108,0.15)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🛒</div>
          <div style={{ color: '#C49A6C', marginBottom: '1.5rem' }}>No tienes lotes tostados para publicar aún.</div>
          <Link href="/m04/recibir" style={{ background: '#8B5E3C', color: '#FBF6EE', padding: '0.75rem 1.5rem', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>
            Recibir y tostar un lote
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {lotesM04.map(lote => {
            const estaPublicado = publicados[lote.id];
            const estaAnimando = animando === lote.id;

            return (
              <div
                key={lote.id}
                style={{
                  background: estaPublicado ? 'rgba(27,94,48,0.15)' : '#3B1F08',
                  borderRadius: 12,
                  padding: '1.25rem',
                  border: `1px solid ${estaPublicado ? 'rgba(74,222,128,0.3)' : 'rgba(196,154,108,0.15)'}`,
                  transition: 'all 0.3s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>
                      {lote.variedad} Tostado · {lote.nivel_tueste}
                    </div>
                    <div style={{ color: '#C49A6C', fontSize: '0.82rem', marginBottom: '0.5rem' }}>
                      {lote.caficultor_nombre} · {lote.region}, {lote.pais}
                    </div>
                    <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.78rem', color: '#8B5E3C', flexWrap: 'wrap' }}>
                      <span>📦 {lote.kilos_salida} kg disponibles</span>
                      <span>📅 Tostado: {lote.fecha_tueste}</span>
                      <span>📉 Merma: {lote.merma_pct}%</span>
                    </div>
                    {/* Precio calculado */}
                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.68rem', color: '#8B5E3C', textTransform: 'uppercase', letterSpacing: 1 }}>Precio venta</div>
                        <div style={{ fontWeight: 900, fontSize: '1.2rem', color: '#C49A6C' }}>
                          €{calcularPrecio(14.85)}/kg
                        </div>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#8B5E3C' }}>
                        (FOB × 1.35 = margen 35%)
                      </div>
                    </div>
                  </div>

                  <div style={{ flexShrink: 0 }}>
                    {estaPublicado ? (
                      <div style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 8, padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <div style={{ color: '#4ADE80', fontWeight: 700, fontSize: '0.85rem' }}>✓ Publicado</div>
                        <div style={{ color: '#8B5E3C', fontSize: '0.7rem', marginTop: '0.2rem' }}>en marketplace</div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handlePublicar(lote)}
                        disabled={estaAnimando}
                        style={{
                          background: estaAnimando ? 'rgba(139,94,60,0.5)' : '#8B5E3C',
                          color: '#FBF6EE',
                          border: 'none',
                          borderRadius: 8,
                          padding: '0.75rem 1.25rem',
                          cursor: estaAnimando ? 'wait' : 'pointer',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          transition: 'all 0.2s',
                          minWidth: 110,
                        }}
                      >
                        {estaAnimando ? '⏳ Publicando...' : '🛒 Publicar'}
                      </button>
                    )}
                  </div>
                </div>

                {estaPublicado && (
                  <div style={{ marginTop: '0.75rem', padding: '0.6rem 1rem', background: 'rgba(74,222,128,0.08)', borderRadius: 6, fontSize: '0.8rem', color: '#4ADE80', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>✅</span>
                    <span>Publicado en marketplace como <strong>{lote.variedad} Tostado · {lote.nivel_tueste}</strong></span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
