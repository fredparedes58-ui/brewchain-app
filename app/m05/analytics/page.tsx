'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useScanStore } from '@/lib/stores/scanStore';
import { ScanFuente } from '@/lib/types/scanAnalytics';

const FUENTE_LABELS: Record<ScanFuente, string> = {
  sala: 'En sala',
  bolsa: 'Bolsa',
  web: 'Web',
  compartido: 'Compartido',
  desconocido: 'Desconocido',
};

const FUENTE_COLOR: Record<ScanFuente, string> = {
  sala: '#C49A6C',
  bolsa: '#4ADE80',
  web: '#60a5fa',
  compartido: '#a78bfa',
  desconocido: '#8B5E3C',
};

type Rango = '7d' | '14d' | '30d';

export default function AnalyticsQRPage() {
  const { eventos } = useScanStore();
  const [rango, setRango] = useState<Rango>('30d');

  const diasRango = rango === '7d' ? 7 : rango === '14d' ? 14 : 30;

  const corte = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - diasRango);
    return d;
  }, [diasRango]);

  const eventosFiltrados = useMemo(
    () => eventos.filter(e => new Date(e.timestamp) >= corte),
    [eventos, corte]
  );

  // KPIs
  const totalScans = eventosFiltrados.length;
  const conversiones = eventosFiltrados.filter(e => e.convertido).length;
  const tasaConversion = totalScans > 0 ? Math.round((conversiones / totalScans) * 100) : 0;
  const scansSala = eventosFiltrados.filter(e => e.fuente === 'sala').length;

  // Scans por día (últimos N días)
  const scansPorDia = useMemo(() => {
    const mapa: Record<string, number> = {};
    for (let i = diasRango - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      mapa[d.toISOString().split('T')[0]] = 0;
    }
    for (const e of eventosFiltrados) {
      const dia = e.timestamp.split('T')[0];
      if (dia in mapa) mapa[dia]++;
    }
    return Object.entries(mapa).map(([fecha, count]) => ({ fecha, count, label: fecha.slice(5) }));
  }, [eventosFiltrados, diasRango]);

  const maxDia = Math.max(...scansPorDia.map(d => d.count), 1);

  // Scans por QR hash
  const scansPorHash = useMemo(() => {
    const mapa: Record<string, { count: number; variedad: string; caficultor: string; conversiones: number }> = {};
    for (const e of eventosFiltrados) {
      if (!mapa[e.qr_hash]) {
        mapa[e.qr_hash] = { count: 0, variedad: e.variedad ?? e.qr_hash, caficultor: e.caficultor ?? '', conversiones: 0 };
      }
      mapa[e.qr_hash].count++;
      if (e.convertido) mapa[e.qr_hash].conversiones++;
    }
    return Object.entries(mapa)
      .map(([hash, d]) => ({ hash, ...d }))
      .sort((a, b) => b.count - a.count);
  }, [eventosFiltrados]);

  const maxHash = Math.max(...scansPorHash.map(d => d.count), 1);

  // Scans por hora del día
  const scansPorHora = useMemo(() => {
    const mapa: number[] = new Array(24).fill(0);
    for (const e of eventosFiltrados) {
      const hora = new Date(e.timestamp).getHours();
      mapa[hora]++;
    }
    return mapa.map((count, hora) => ({ hora, count, label: `${hora}h` }));
  }, [eventosFiltrados]);

  const maxHora = Math.max(...scansPorHora.map(d => d.count), 1);

  // Scans por fuente
  const scansPorFuente = useMemo(() => {
    const mapa: Record<string, number> = {};
    for (const e of eventosFiltrados) {
      mapa[e.fuente] = (mapa[e.fuente] ?? 0) + 1;
    }
    return Object.entries(mapa).sort((a, b) => b[1] - a[1]);
  }, [eventosFiltrados]);

  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: 960, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <Link href="/m05" style={{ color: '#8B5E3C', textDecoration: 'none', fontSize: '1.2rem' }}>←</Link>
        <div>
          <h1 style={{ fontWeight: 900, fontSize: '1.5rem', margin: 0 }}>Analytics QR en Sala</h1>
          <div style={{ fontSize: '0.72rem', color: '#8B5E3C', letterSpacing: 1, marginTop: 2 }}>M05 · CAFETERÍA · ENGAGEMENT TRAZABILIDAD</div>
        </div>
      </div>

      {/* Rango */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem' }}>
        {(['7d', '14d', '30d'] as Rango[]).map(r => (
          <button key={r} onClick={() => setRango(r)}
            style={{ background: rango === r ? '#8B5E3C' : 'rgba(59,31,8,0.6)', color: rango === r ? '#FBF6EE' : '#C49A6C', border: `1px solid ${rango === r ? '#8B5E3C' : 'rgba(196,154,108,0.2)'}`, borderRadius: 8, padding: '0.35rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer', fontWeight: rango === r ? 700 : 400 }}>
            {r === '7d' ? 'Últimos 7d' : r === '14d' ? 'Últimos 14d' : 'Últimos 30d'}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { v: `${totalScans}`, l: 'Total escaneos', c: '#C49A6C' },
          { v: `${scansSala}`, l: 'En sala', c: '#FBF6EE' },
          { v: `${conversiones}`, l: 'Conversiones', c: '#4ADE80' },
          { v: `${tasaConversion}%`, l: 'Tasa conversión', c: tasaConversion >= 15 ? '#4ADE80' : tasaConversion >= 10 ? '#fbbf24' : '#f87171' },
        ].map(({ v, l, c }) => (
          <div key={l} style={{ background: 'linear-gradient(135deg, rgba(59,31,8,0.95) 0%, rgba(26,13,5,0.98) 100%)', border: '1px solid rgba(196,154,108,0.12)', borderRadius: 12, padding: '0.9rem' }}>
            <div style={{ fontWeight: 900, fontSize: '1.4rem', color: c }}>{v}</div>
            <div style={{ fontSize: '0.68rem', color: '#8B5E3C', marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Gráfico: escaneos por día */}
      <div style={{ background: 'linear-gradient(135deg, rgba(59,31,8,0.95) 0%, rgba(26,13,5,0.98) 100%)', border: '1px solid rgba(196,154,108,0.12)', borderRadius: 14, padding: '1.25rem', marginBottom: '1rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#C49A6C', marginBottom: '1rem' }}>Escaneos por día</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: 100, overflowX: 'auto' }}>
          {scansPorDia.map(({ label, count }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: diasRango === 7 ? 40 : diasRango === 14 ? 22 : 12 }}>
              <div
                title={`${label}: ${count} escaneos`}
                style={{
                  width: '100%',
                  height: `${Math.max(4, (count / maxDia) * 85)}px`,
                  background: count > 0 ? '#C49A6C' : 'rgba(196,154,108,0.15)',
                  borderRadius: '3px 3px 0 0',
                  transition: 'height 0.3s',
                  cursor: 'default',
                }}
              />
              {diasRango <= 14 && (
                <div style={{ fontSize: '0.6rem', color: '#8B5E3C', marginTop: 2, transform: 'rotate(-30deg)', whiteSpace: 'nowrap' }}>{label}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        {/* Scans por QR */}
        <div style={{ background: 'linear-gradient(135deg, rgba(59,31,8,0.95) 0%, rgba(26,13,5,0.98) 100%)', border: '1px solid rgba(196,154,108,0.12)', borderRadius: 14, padding: '1.25rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#C49A6C', marginBottom: '0.85rem' }}>Por QR</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {scansPorHash.slice(0, 5).map(({ hash, variedad, caficultor, count, conversiones: conv }) => (
              <div key={hash}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#FBF6EE', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{variedad}</div>
                  <div style={{ fontSize: '0.72rem', color: '#C49A6C', flexShrink: 0 }}>{count} <span style={{ color: '#4ADE80' }}>({conv}✓)</span></div>
                </div>
                <div style={{ height: 6, background: 'rgba(196,154,108,0.12)', borderRadius: 3 }}>
                  <div style={{ height: '100%', width: `${(count / maxHash) * 100}%`, background: '#C49A6C', borderRadius: 3, transition: 'width 0.3s' }} />
                </div>
                <div style={{ fontSize: '0.65rem', color: '#8B5E3C', marginTop: 1 }}>{caficultor}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scans por hora */}
        <div style={{ background: 'linear-gradient(135deg, rgba(59,31,8,0.95) 0%, rgba(26,13,5,0.98) 100%)', border: '1px solid rgba(196,154,108,0.12)', borderRadius: 14, padding: '1.25rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#C49A6C', marginBottom: '0.85rem' }}>Por hora del día</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: 80 }}>
            {scansPorHora.map(({ hora, count }) => (
              <div key={hora} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div
                  title={`${hora}:00 — ${count} scans`}
                  style={{
                    width: '100%',
                    height: `${Math.max(2, (count / maxHora) * 75)}px`,
                    background: hora >= 7 && hora <= 20 ? '#C49A6C' : 'rgba(196,154,108,0.3)',
                    borderRadius: '2px 2px 0 0',
                  }}
                />
                {hora % 4 === 0 && (
                  <div style={{ fontSize: '0.55rem', color: '#8B5E3C', marginTop: 1 }}>{hora}h</div>
                )}
              </div>
            ))}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#8B5E3C', marginTop: '0.5rem' }}>Pico: {scansPorHora.reduce((a, b) => a.count > b.count ? a : b).hora}:00h</div>
        </div>
      </div>

      {/* Por fuente */}
      <div style={{ background: 'linear-gradient(135deg, rgba(59,31,8,0.95) 0%, rgba(26,13,5,0.98) 100%)', border: '1px solid rgba(196,154,108,0.12)', borderRadius: 14, padding: '1.25rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#C49A6C', marginBottom: '0.85rem' }}>Por fuente de escaneo</div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {scansPorFuente.map(([fuente, count]) => {
            const pct = totalScans > 0 ? Math.round((count / totalScans) * 100) : 0;
            const color = FUENTE_COLOR[fuente as ScanFuente] ?? '#8B5E3C';
            return (
              <div key={fuente} style={{ background: 'rgba(59,31,8,0.5)', border: `1px solid rgba(196,154,108,0.1)`, borderRadius: 10, padding: '0.75rem 1rem', flex: 1, minWidth: 100 }}>
                <div style={{ fontWeight: 800, fontSize: '1.2rem', color }}>{pct}%</div>
                <div style={{ fontSize: '0.72rem', color: '#FBF6EE', marginTop: 2 }}>{FUENTE_LABELS[fuente as ScanFuente] ?? fuente}</div>
                <div style={{ fontSize: '0.65rem', color: '#8B5E3C' }}>{count} scans</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
