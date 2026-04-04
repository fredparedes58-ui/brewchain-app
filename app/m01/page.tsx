'use client';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { useCaficultorStore } from '@/lib/stores/caficultorStore';
import { MOCK_LOTES } from '@/lib/mock/lotes';
import Link from 'next/link';
import { usePrecioICO } from '@/lib/hooks/usePrecioICO';

const TENDENCIA_ICON = { up: '↑', down: '↓', stable: '→' };
const TENDENCIA_COLOR = { up: '#4ADE80', down: '#fca5a5', stable: '#fbbf24' };

export default function M01Dashboard() {
  const { nombre } = useAuthStore();
  const { alertas, marcarAlertaLeida } = useCaficultorStore();
  const { precio: precioICO, variacion_pct, tendencia, isLoading, ultimaActualizacion } = usePrecioICO();
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  const precioMostrado = isClient ? (precioICO ?? 320) : 320;
  const alertasActivas = alertas.filter(a => !a.leida);
  const misLotes = MOCK_LOTES.filter(l => l.caficultor_id === 'caf-001');
  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div style={{ padding: '1.25rem', maxWidth: 640, margin: '0 auto' }}>

      {/* Hero Card — Caficultor */}
      <div style={{ background: 'linear-gradient(135deg, #1B5E30 0%, #0f3a1c 100%)', borderRadius: 20, padding: '1.5rem', marginBottom: '1rem', border: '1px solid rgba(74,222,128,0.15)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -20, right: -20, fontSize: '7rem', opacity: 0.07 }}>🌱</div>
        <div style={{ fontSize: '0.7rem', color: 'rgba(74,222,128,0.7)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: '0.4rem' }}>{saludo.toUpperCase()}</div>
        <div style={{ fontWeight: 900, fontSize: '1.6rem', color: '#FBF6EE', marginBottom: '0.2rem' }}>{nombre || 'Carlos Moya'}</div>
        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1rem' }}>Finca El Paraíso · Huila, Colombia</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 100, padding: '0.4rem 1rem', fontSize: '0.8rem', color: '#4ADE80', fontWeight: 700 }}>
          📍 GPS verificado · EUDR compliant
        </div>
      </div>

      {/* Precio ICO */}
      <div style={{ background: 'linear-gradient(135deg, rgba(59,31,8,0.95) 0%, rgba(26,13,5,0.98) 100%)', border: '1px solid rgba(196,154,108,0.2)', borderRadius: 16, padding: '1.25rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <div style={{ fontSize: '0.65rem', color: '#8B5E3C', letterSpacing: 2, textTransform: 'uppercase' }}>PRECIO ICO · NY MARKET</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: isLoading ? '#fbbf24' : '#4ADE80', display: 'inline-block', animation: isLoading ? 'none' : 'pulse 2s infinite' }} />
            <span style={{ fontSize: '0.62rem', color: '#8B5E3C' }}>{isLoading ? 'Actualizando…' : 'En vivo'}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.4rem' }}>
          <span style={{ fontWeight: 900, fontSize: '2.2rem', color: '#FBF6EE', transition: 'color 0.3s' }}>${precioMostrado}</span>
          <span style={{ color: '#8B5E3C', fontSize: '0.85rem' }}>/quintal</span>
          {isClient && tendencia && variacion_pct !== null && (
            <span style={{ color: TENDENCIA_COLOR[tendencia], fontSize: '0.85rem', fontWeight: 700 }}>
              {TENDENCIA_ICON[tendencia]} {variacion_pct > 0 ? '+' : ''}{variacion_pct.toFixed(2)}%
            </span>
          )}
        </div>
        <div style={{ fontSize: '0.82rem', color: '#C49A6C', lineHeight: 1.5 }}>
          Tostadores en marketplace pagan <strong style={{ color: '#FBF6EE' }}>${precioMostrado + 60}-{precioMostrado + 90}</strong>/quintal por café de tu zona
        </div>
        {isClient && ultimaActualizacion && (
          <div style={{ fontSize: '0.62rem', color: '#8B5E3C', marginTop: '0.4rem' }}>
            Actualizado: {new Date(ultimaActualizacion).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} · Suaves Colombianos
          </div>
        )}
      </div>

      {/* Alertas activas */}
      {alertasActivas.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.8rem' }}>⚠️</span>
            <span style={{ fontSize: '0.7rem', color: '#D97706', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700 }}>ALERTA ACTIVA</span>
          </div>
          {alertasActivas.slice(0, 2).map(alerta => (
            <div key={alerta.id} style={{ background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.2)', borderRadius: 14, padding: '1rem', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#D97706', marginTop: 4, flexShrink: 0, display: 'block' }} />
                  <span style={{ fontSize: '0.85rem', color: '#FBF6EE', lineHeight: 1.55 }}>{alerta.mensaje}</span>
                </div>
                <button onClick={() => marcarAlertaLeida(alerta.id)} style={{ background: 'none', border: 'none', color: '#8B5E3C', cursor: 'pointer', fontSize: '1rem', flexShrink: 0 }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mis Lotes */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.7rem', color: '#8B5E3C', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700 }}>MIS LOTES</span>
          <Link href="/m01/lotes" style={{ fontSize: '0.78rem', color: '#C49A6C', textDecoration: 'none' }}>Ver todos →</Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {misLotes.slice(0, 3).map(lote => (
            <div key={lote.id} style={{ background: 'linear-gradient(135deg, rgba(59,31,8,0.95) 0%, rgba(26,13,5,0.98) 100%)', border: '1px solid rgba(196,154,108,0.12)', borderRadius: 14, padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#FBF6EE' }}>{lote.variedad} · <span style={{ color: '#C49A6C', textTransform: 'capitalize' }}>{lote.proceso}</span></div>
                <div style={{ fontSize: '0.75rem', color: '#8B5E3C', marginTop: '0.2rem' }}>{lote.kilos_disponibles} kg · {lote.altitud_msnm}m</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#C49A6C' }}>€{lote.precio_fob}/kg</span>
                {lote.qr_sealed && <span style={{ background: 'rgba(139,94,60,0.2)', color: '#C49A6C', border: '1px solid rgba(139,94,60,0.3)', borderRadius: 100, padding: '0.15rem 0.55rem', fontSize: '0.65rem', fontWeight: 700 }}>QR ✓</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Acciones rápidas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <Link href="/m01/parcela" style={{ textDecoration: 'none', background: '#DC2626', borderRadius: 14, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <span style={{ fontSize: '1.4rem' }}>📍</span>
          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#FBF6EE' }}>Registrar Parcela GPS</span>
        </Link>
        <Link href="/m01/camara" style={{ textDecoration: 'none', background: 'rgba(59,31,8,0.8)', border: '1px solid rgba(196,154,108,0.15)', borderRadius: 14, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <span style={{ fontSize: '1.4rem' }}>🔬</span>
          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#FBF6EE' }}>Detección Plagas</span>
        </Link>
        <Link href="/m01/historial" style={{ textDecoration: 'none', background: 'rgba(59,31,8,0.8)', border: '1px solid rgba(196,154,108,0.15)', borderRadius: 14, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <span style={{ fontSize: '1.4rem' }}>💰</span>
          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#FBF6EE' }}>Historial Ventas</span>
        </Link>
        <Link href="/m01/mensajes" style={{ textDecoration: 'none', background: 'rgba(59,31,8,0.8)', border: '1px solid rgba(196,154,108,0.15)', borderRadius: 14, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <span style={{ fontSize: '1.4rem' }}>💬</span>
          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#FBF6EE' }}>Mensajes</span>
        </Link>
      </div>
    </div>
  );
}
