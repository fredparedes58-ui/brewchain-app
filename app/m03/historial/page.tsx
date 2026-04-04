'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useComercialStore } from '@/lib/stores/comercialStore';
import { generateQRDataURL } from '@/lib/services/s_qr';
import { LoteTostado } from '@/lib/types/tostado';

const NIVEL_ICON = { claro: '☀️', medio: '🌤️', oscuro: '🌑' };
const NIVEL_COLOR = { claro: '#fbbf24', medio: '#C49A6C', oscuro: '#8B5E3C' };

// Lotes de ejemplo para que el historial no aparezca vacío en primera carga
const MOCK_HISTORIAL: LoteTostado[] = [
  {
    id: 'lt-demo-001',
    lote_id_origen: 'lot-001',
    caficultor_nombre: 'Carlos Humberto Muñoz',
    variedad: 'Castillo',
    pais: 'Colombia',
    region: 'Huila',
    fecha_tueste: '2025-03-10',
    nivel_tueste: 'claro',
    temp_carga: 185,
    primer_crack: 196,
    temp_final: 205,
    tiempo_total_min: 12.5,
    kilos_entrada: 22,
    kilos_salida: 18.7,
    merma_pct: 15,
    notas_cata: 'Frutos rojos, chocolate amargo, acidez brillante',
    origen: 'manual',
  },
  {
    id: 'lt-demo-002',
    lote_id_origen: 'lot-hist-003',
    caficultor_nombre: 'Carlos Humberto Muñoz',
    variedad: 'Colombia Anaeróbico',
    pais: 'Colombia',
    region: 'Huila',
    fecha_tueste: '2025-02-20',
    nivel_tueste: 'medio',
    temp_carga: 183,
    temp_final: 210,
    tiempo_total_min: 13.2,
    kilos_entrada: 15,
    kilos_salida: 12.6,
    merma_pct: 16,
    notas_cata: 'Tropical, mango, fermentado suave',
    origen: 'cropster',
  },
  {
    id: 'lt-demo-003',
    lote_id_origen: 'lot-002',
    caficultor_nombre: 'Rosa Elena Vargas',
    variedad: 'Gesha',
    pais: 'Colombia',
    region: 'Nariño',
    fecha_tueste: '2025-01-28',
    nivel_tueste: 'claro',
    temp_carga: 180,
    temp_final: 202,
    tiempo_total_min: 11.8,
    kilos_entrada: 10,
    kilos_salida: 8.5,
    merma_pct: 15,
    notas_cata: 'Jazmín, melocotón, bergamota',
    origen: 'manual',
  },
];

function QRMiniatura({ url }: { url: string }) {
  const [qr, setQr] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    generateQRDataURL(url).then(setQr).catch(() => setQr(null));
  }, [url]);
  if (!qr) return <div style={{ width: 56, height: 56, background: 'rgba(59,31,8,0.6)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>📱</div>;
  return <img src={qr} alt="QR" style={{ width: 56, height: 56, borderRadius: 8, background: '#FBF6EE', padding: 3, boxSizing: 'border-box' }} />;
}

export default function HistorialLotesPage() {
  const { lotesTostados } = useComercialStore();
  const [filtroNivel, setFiltroNivel] = useState<'todos' | 'claro' | 'medio' | 'oscuro'>('todos');
  const [filtroVariedad, setFiltroVariedad] = useState('');
  const [filtroDesde, setFiltroDesde] = useState('');
  const [filtroHasta, setFiltroHasta] = useState('');

  // Combinar mock histórico con los del store (los del store son los generados en sesión)
  const todos: LoteTostado[] = [...MOCK_HISTORIAL, ...lotesTostados];

  const filtrados = todos.filter(l => {
    if (filtroNivel !== 'todos' && l.nivel_tueste !== filtroNivel) return false;
    if (filtroVariedad && !l.variedad.toLowerCase().includes(filtroVariedad.toLowerCase())) return false;
    if (filtroDesde && l.fecha_tueste < filtroDesde) return false;
    if (filtroHasta && l.fecha_tueste > filtroHasta) return false;
    return true;
  }).sort((a, b) => b.fecha_tueste.localeCompare(a.fecha_tueste));

  // KPIs derivados
  const kilosTotales = todos.reduce((s, l) => s + l.kilos_salida, 0);
  const mermaProm = todos.length > 0
    ? Math.round(todos.reduce((s, l) => s + l.merma_pct, 0) / todos.length * 10) / 10
    : 0;
  const qrsGenerados = todos.filter(l => l.qr_hash).length;
  const deCropster = todos.filter(l => l.origen === 'cropster').length;

  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Link href="/m03" style={{ color: '#8B5E3C', textDecoration: 'none', fontSize: '1.2rem' }}>←</Link>
        <div>
          <h1 style={{ fontWeight: 900, fontSize: '1.5rem', margin: 0 }}>Historial de Lotes Tostados</h1>
          <div style={{ fontSize: '0.72rem', color: '#8B5E3C', letterSpacing: 1, marginTop: 2 }}>M03 · TOSTADURIA · PERSISTIDO EN SESIÓN</div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {[
          { v: `${kilosTotales.toFixed(1)} kg`, l: 'Total tostado', color: '#C49A6C' },
          { v: `${mermaProm}%`, l: 'Merma promedio', color: '#fbbf24' },
          { v: `${qrsGenerados}`, l: 'QRs generados', color: '#4ADE80' },
          { v: `${deCropster}`, l: 'Vía Cropster', color: '#93c5fd' },
        ].map(({ v, l, color }) => (
          <div key={l} style={{ background: 'linear-gradient(135deg, rgba(59,31,8,0.95) 0%, rgba(26,13,5,0.98) 100%)', border: '1px solid rgba(196,154,108,0.12)', borderRadius: 12, padding: '0.9rem' }}>
            <div style={{ fontWeight: 900, fontSize: '1.3rem', color }}>{v}</div>
            <div style={{ fontSize: '0.68rem', color: '#8B5E3C', marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ background: 'rgba(59,31,8,0.5)', border: '1px solid rgba(196,154,108,0.12)', borderRadius: 12, padding: '1rem', marginBottom: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Nivel */}
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {(['todos', 'claro', 'medio', 'oscuro'] as const).map(n => (
            <button key={n} onClick={() => setFiltroNivel(n)} style={{ background: filtroNivel === n ? '#8B5E3C' : 'rgba(59,31,8,0.6)', color: filtroNivel === n ? '#FBF6EE' : '#C49A6C', border: `1px solid ${filtroNivel === n ? '#8B5E3C' : 'rgba(196,154,108,0.2)'}`, borderRadius: 100, padding: '0.3rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>
              {n === 'todos' ? 'Todos' : `${NIVEL_ICON[n]} ${n}`}
            </button>
          ))}
        </div>
        {/* Variedad */}
        <input value={filtroVariedad} onChange={e => setFiltroVariedad(e.target.value)} placeholder="Variedad..." style={{ background: 'rgba(26,13,5,0.8)', border: '1px solid rgba(196,154,108,0.2)', borderRadius: 8, padding: '0.35rem 0.65rem', color: '#FBF6EE', fontSize: '0.78rem', width: 130, outline: 'none' }} />
        {/* Fechas */}
        <input type="date" value={filtroDesde} onChange={e => setFiltroDesde(e.target.value)} style={{ background: 'rgba(26,13,5,0.8)', border: '1px solid rgba(196,154,108,0.2)', borderRadius: 8, padding: '0.35rem 0.65rem', color: '#C49A6C', fontSize: '0.75rem', outline: 'none' }} />
        <span style={{ color: '#8B5E3C', fontSize: '0.75rem' }}>→</span>
        <input type="date" value={filtroHasta} onChange={e => setFiltroHasta(e.target.value)} style={{ background: 'rgba(26,13,5,0.8)', border: '1px solid rgba(196,154,108,0.2)', borderRadius: 8, padding: '0.35rem 0.65rem', color: '#C49A6C', fontSize: '0.75rem', outline: 'none' }} />
        <span style={{ fontSize: '0.72rem', color: '#8B5E3C', marginLeft: 'auto' }}>{filtrados.length} resultado(s)</span>
      </div>

      {/* Lista */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {filtrados.map(lote => (
          <div key={lote.id} style={{ background: 'linear-gradient(135deg, rgba(59,31,8,0.95) 0%, rgba(26,13,5,0.98) 100%)', border: '1px solid rgba(196,154,108,0.12)', borderRadius: 14, padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            {/* QR miniatura (solo si tiene URL) */}
            {lote.qr_url ? (
              <QRMiniatura url={lote.qr_url} />
            ) : (
              <div style={{ width: 56, height: 56, background: 'rgba(59,31,8,0.6)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                {NIVEL_ICON[lote.nivel_tueste]}
              </div>
            )}

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#FBF6EE' }}>{lote.variedad}</div>
                  <div style={{ fontSize: '0.75rem', color: '#C49A6C', marginTop: '0.1rem' }}>{lote.caficultor_nombre} · {lote.region}, {lote.pais}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <span style={{ background: 'rgba(139,94,60,0.2)', color: NIVEL_COLOR[lote.nivel_tueste], border: '1px solid rgba(196,154,108,0.25)', borderRadius: 100, padding: '0.2rem 0.6rem', fontSize: '0.7rem', fontWeight: 700 }}>
                    {NIVEL_ICON[lote.nivel_tueste]} {lote.nivel_tueste}
                  </span>
                  {lote.origen === 'cropster' && (
                    <span style={{ background: 'rgba(37,99,235,0.15)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 100, padding: '0.2rem 0.6rem', fontSize: '0.7rem' }}>Cropster</span>
                  )}
                  {lote.qr_hash && (
                    <span style={{ background: 'rgba(27,94,48,0.2)', color: '#4ADE80', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 100, padding: '0.2rem 0.6rem', fontSize: '0.7rem' }}>QR ✓</span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.72rem', color: '#8B5E3C' }}>📅 {lote.fecha_tueste}</span>
                <span style={{ fontSize: '0.72rem', color: '#8B5E3C' }}>⚖️ {lote.kilos_entrada}kg → {lote.kilos_salida}kg</span>
                <span style={{ fontSize: '0.72rem', color: '#fbbf24' }}>↓ {lote.merma_pct}% merma</span>
                {lote.temp_final && <span style={{ fontSize: '0.72rem', color: '#8B5E3C' }}>🌡️ {lote.temp_final}°C</span>}
                {lote.tiempo_total_min && <span style={{ fontSize: '0.72rem', color: '#8B5E3C' }}>⏱️ {lote.tiempo_total_min.toFixed(1)} min</span>}
              </div>

              {lote.notas_cata && (
                <div style={{ marginTop: '0.45rem', fontSize: '0.75rem', color: '#8B5E3C', fontStyle: 'italic' }}>{lote.notas_cata}</div>
              )}
            </div>
          </div>
        ))}

        {filtrados.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#8B5E3C' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔥</div>
            <div>Sin lotes que coincidan con los filtros</div>
          </div>
        )}
      </div>
    </div>
  );
}
