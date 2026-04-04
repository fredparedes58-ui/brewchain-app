'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useFidelizacionStore } from '@/lib/stores/fidelizacionStore';
import { RECOMPENSAS, SELLOS_PARA_GRATIS, PUNTOS_POR_EVENTO } from '@/lib/types/fidelizacion';

type Tab = 'tarjeta' | 'recompensas' | 'historial';

export default function FidelizacionPage() {
  const { puntos, sellos, historial, canjesRealizados, canjear } = useFidelizacionStore();
  const [tab, setTab] = useState<Tab>('tarjeta');
  const [canjeado, setCanjeado] = useState<string | null>(null);
  const [errorCanje, setErrorCanje] = useState<string | null>(null);

  const sellosActivos = sellos.length % SELLOS_PARA_GRATIS;
  const ciclosCompletos = Math.floor(sellos.length / SELLOS_PARA_GRATIS);

  const handleCanjear = (recompensaId: string) => {
    setErrorCanje(null);
    const ok = canjear(recompensaId);
    if (ok) {
      setCanjeado(recompensaId);
      setTimeout(() => setCanjeado(null), 3000);
    } else {
      setErrorCanje('Puntos insuficientes para este canje.');
      setTimeout(() => setErrorCanje(null), 2500);
    }
  };

  const TIPO_ICON: Record<string, string> = {
    escaneo_qr: '📷',
    compra: '🛒',
    cupping: '☕',
    quiz_completado: '🎯',
    referido: '🤝',
    canje: '🎁',
  };

  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: 700, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Link href="/m06" style={{ color: '#8B5E3C', textDecoration: 'none', fontSize: '1.2rem' }}>←</Link>
        <div>
          <h1 style={{ fontWeight: 900, fontSize: '1.5rem', margin: 0 }}>Fidelización BREW CHAIN</h1>
          <div style={{ fontSize: '0.72rem', color: '#8B5E3C', letterSpacing: 1, marginTop: 2 }}>M06 · CONSUMIDOR · PUNTOS & SELLOS</div>
        </div>
      </div>

      {/* Puntos destacados */}
      <div style={{ background: 'linear-gradient(135deg, #3B1F08 0%, #1A0D05 100%)', border: '1px solid rgba(196,154,108,0.25)', borderRadius: 20, padding: '1.5rem', marginBottom: '1.25rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 150, height: 150, background: 'rgba(196,154,108,0.04)', borderRadius: '50%' }} />
        <div style={{ fontSize: '0.72rem', color: '#8B5E3C', textTransform: 'uppercase', letterSpacing: 2, marginBottom: '0.5rem' }}>Tu saldo de puntos</div>
        <div style={{ fontWeight: 900, fontSize: '3.5rem', color: '#C49A6C', lineHeight: 1 }}>{puntos}</div>
        <div style={{ fontSize: '0.78rem', color: '#8B5E3C', marginTop: '0.4rem' }}>puntos BREW CHAIN</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#FBF6EE' }}>{sellos.length}</div>
            <div style={{ fontSize: '0.65rem', color: '#8B5E3C' }}>sellos totales</div>
          </div>
          <div style={{ width: 1, background: 'rgba(196,154,108,0.2)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#4ADE80' }}>{ciclosCompletos}</div>
            <div style={{ fontSize: '0.65rem', color: '#8B5E3C' }}>cafés gratis ganados</div>
          </div>
          <div style={{ width: 1, background: 'rgba(196,154,108,0.2)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#FBF6EE' }}>{historial.length}</div>
            <div style={{ fontSize: '0.65rem', color: '#8B5E3C' }}>eventos</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', background: 'rgba(59,31,8,0.4)', borderRadius: 12, padding: '0.3rem' }}>
        {([['tarjeta', '🎴 Tarjeta sellos'], ['recompensas', '🎁 Recompensas'], ['historial', '📋 Historial']] as [Tab, string][]).map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ flex: 1, background: tab === t ? '#8B5E3C' : 'transparent', color: tab === t ? '#FBF6EE' : '#C49A6C', border: 'none', borderRadius: 9, padding: '0.5rem', fontSize: '0.78rem', cursor: 'pointer', fontWeight: tab === t ? 700 : 400, transition: 'all 0.15s' }}>
            {l}
          </button>
        ))}
      </div>

      {/* TAB: Tarjeta sellos */}
      {tab === 'tarjeta' && (
        <div>
          <div style={{ background: 'linear-gradient(135deg, rgba(59,31,8,0.95) 0%, rgba(26,13,5,0.98) 100%)', border: '1px solid rgba(196,154,108,0.15)', borderRadius: 16, padding: '1.5rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#FBF6EE', fontSize: '0.95rem' }}>Stamp Card</div>
                <div style={{ fontSize: '0.72rem', color: '#8B5E3C', marginTop: 2 }}>{SELLOS_PARA_GRATIS} sellos = 1 café gratis · cualquier origen</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: '#C49A6C' }}>{sellosActivos}/{SELLOS_PARA_GRATIS}</div>
                <div style={{ fontSize: '0.65rem', color: '#8B5E3C' }}>ciclo actual</div>
              </div>
            </div>

            {/* Grid de sellos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {Array.from({ length: SELLOS_PARA_GRATIS }).map((_, i) => {
                const lleno = i < sellosActivos;
                return (
                  <div key={i} style={{
                    aspectRatio: '1',
                    borderRadius: 12,
                    border: `2px solid ${lleno ? '#C49A6C' : 'rgba(196,154,108,0.2)'}`,
                    background: lleno ? 'rgba(196,154,108,0.15)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    transition: 'all 0.2s',
                  }}>
                    {lleno ? '☕' : <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(196,154,108,0.15)', display: 'block' }} />}
                  </div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div style={{ height: 6, background: 'rgba(196,154,108,0.12)', borderRadius: 3, marginBottom: '0.5rem' }}>
              <div style={{ height: '100%', width: `${(sellosActivos / SELLOS_PARA_GRATIS) * 100}%`, background: 'linear-gradient(90deg, #8B5E3C, #C49A6C)', borderRadius: 3, transition: 'width 0.4s' }} />
            </div>
            <div style={{ fontSize: '0.72rem', color: '#8B5E3C', textAlign: 'center' }}>
              {sellosActivos === 0 ? 'Escanea un QR para ganar tu primer sello' : `${SELLOS_PARA_GRATIS - sellosActivos} sellos para tu próximo café gratis`}
            </div>
          </div>

          {/* Cómo ganar sellos */}
          <div style={{ background: 'rgba(59,31,8,0.4)', border: '1px solid rgba(196,154,108,0.1)', borderRadius: 12, padding: '1rem' }}>
            <div style={{ fontWeight: 600, color: '#C49A6C', fontSize: '0.82rem', marginBottom: '0.6rem' }}>¿Cómo ganar puntos y sellos?</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {Object.entries(PUNTOS_POR_EVENTO).filter(([k]) => k !== 'canje').map(([tipo, pts]) => (
                <div key={tipo} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#FBF6EE' }}>
                  <span>{TIPO_ICON[tipo] ?? '•'} {tipo.replace('_', ' ')}</span>
                  <span style={{ color: '#C49A6C', fontWeight: 700 }}>+{pts} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: Recompensas */}
      {tab === 'recompensas' && (
        <div>
          {errorCanje && (
            <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.82rem', color: '#f87171' }}>
              ❌ {errorCanje}
            </div>
          )}
          {canjeado && (
            <div style={{ background: 'rgba(27,94,48,0.15)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.82rem', color: '#4ADE80' }}>
              🎉 ¡Canje realizado con éxito! Muéstralo al barista.
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {RECOMPENSAS.map(r => {
              const canjeada = canjesRealizados.includes(r.id);
              const puedeCanar = puntos >= r.puntos_necesarios;
              return (
                <div key={r.id} style={{
                  background: 'linear-gradient(135deg, rgba(59,31,8,0.95) 0%, rgba(26,13,5,0.98) 100%)',
                  border: `1px solid ${canjeada ? 'rgba(74,222,128,0.2)' : puedeCanar ? 'rgba(196,154,108,0.25)' : 'rgba(196,154,108,0.08)'}`,
                  borderRadius: 14,
                  padding: '1rem 1.25rem',
                  opacity: canjeada ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                }}>
                  <div style={{ fontSize: '2rem', flexShrink: 0 }}>{r.icono}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#FBF6EE', fontSize: '0.9rem' }}>{r.nombre}</div>
                    <div style={{ fontSize: '0.75rem', color: '#C49A6C', marginTop: 1 }}>{r.descripcion}</div>
                    {/* Progress pts */}
                    <div style={{ marginTop: '0.5rem' }}>
                      <div style={{ height: 4, background: 'rgba(196,154,108,0.12)', borderRadius: 2, marginBottom: 2 }}>
                        <div style={{ height: '100%', width: `${Math.min(100, (puntos / r.puntos_necesarios) * 100)}%`, background: puedeCanar ? '#C49A6C' : '#8B5E3C', borderRadius: 2, transition: 'width 0.3s' }} />
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#8B5E3C' }}>
                        {puntos}/{r.puntos_necesarios} pts
                        {!puedeCanar && ` · faltan ${r.puntos_necesarios - puntos}`}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCanjear(r.id)}
                    disabled={!puedeCanar || canjeada}
                    style={{
                      flexShrink: 0,
                      background: canjeada ? 'rgba(74,222,128,0.1)' : puedeCanar ? '#8B5E3C' : 'rgba(59,31,8,0.8)',
                      color: canjeada ? '#4ADE80' : puedeCanar ? '#FBF6EE' : '#8B5E3C',
                      border: `1px solid ${canjeada ? 'rgba(74,222,128,0.3)' : puedeCanar ? '#8B5E3C' : 'rgba(196,154,108,0.1)'}`,
                      borderRadius: 10,
                      padding: '0.55rem 0.9rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: puedeCanar && !canjeada ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {canjeada ? '✓ Canjeado' : puedeCanar ? 'Canjear' : `${r.puntos_necesarios} pts`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: Historial */}
      {tab === 'historial' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {historial.map(ev => (
            <div key={ev.id} style={{ background: 'linear-gradient(135deg, rgba(59,31,8,0.95) 0%, rgba(26,13,5,0.98) 100%)', border: '1px solid rgba(196,154,108,0.1)', borderRadius: 10, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ fontSize: '1.2rem', flexShrink: 0 }}>{TIPO_ICON[ev.tipo] ?? '•'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#FBF6EE' }}>{ev.descripcion}</div>
                <div style={{ fontSize: '0.65rem', color: '#8B5E3C', marginTop: 1 }}>{ev.fecha}</div>
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: ev.puntos >= 0 ? '#C49A6C' : '#f87171', flexShrink: 0 }}>
                {ev.puntos >= 0 ? '+' : ''}{ev.puntos} pts
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
