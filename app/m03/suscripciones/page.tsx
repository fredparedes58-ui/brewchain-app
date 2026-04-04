'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useSuscripcionStore } from '@/lib/stores/suscripcionStore';
import { Suscriptor } from '@/lib/types/tostado';

const PLAN_LABELS: Record<Suscriptor['plan'], string> = {
  semanal: 'Semanal',
  quincenal: 'Quincenal',
  mensual: 'Mensual',
  trimestral: 'Trimestral',
};

const PLAN_DIAS: Record<Suscriptor['plan'], number> = {
  semanal: 7,
  quincenal: 14,
  mensual: 30,
  trimestral: 90,
};

function calcularMRR(subs: Suscriptor[]): number {
  return subs
    .filter(s => s.estado === 'activa')
    .reduce((acc, s) => {
      const multiplicador = s.plan === 'semanal' ? 4.3 : s.plan === 'quincenal' ? 2.15 : s.plan === 'mensual' ? 1 : 1 / 3;
      return acc + s.precio * multiplicador;
    }, 0);
}

export default function SuscripcionesPage() {
  const {
    suscriptores,
    simCobroId,
    addSuscriptor,
    pausar,
    reactivar,
    cancelar,
    simularCobro,
    calcularProximaFecha,
  } = useSuscripcionStore();

  const [filtro, setFiltro] = useState<'todos' | 'activa' | 'pausada' | 'cancelada'>('todos');
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formNombre, setFormNombre] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPlan, setFormPlan] = useState<Suscriptor['plan']>('mensual');
  const [formProductos, setFormProductos] = useState('');
  const [formPrecio, setFormPrecio] = useState('');

  const filtradas = suscriptores.filter(s =>
    filtro === 'todos' ? true : s.estado === filtro
  );

  const activas = suscriptores.filter(s => s.estado === 'activa').length;
  const pausadas = suscriptores.filter(s => s.estado === 'pausada').length;
  const mrr = calcularMRR(suscriptores);
  const totalCobrado = suscriptores.reduce((a, s) => a + (s.total_cobrado ?? 0), 0);

  const handleAddSuscriptor = () => {
    if (!formNombre.trim() || !formProductos.trim() || !formPrecio) return;
    const nueva: Suscriptor = {
      id: `sub-${Date.now()}`,
      consumidor: formNombre.trim(),
      email: formEmail.trim() || undefined,
      plan: formPlan,
      productos: formProductos.trim(),
      precio: parseFloat(formPrecio),
      estado: 'activa',
      proxima_fecha: calcularProximaFecha(formPlan),
      creada_at: new Date().toISOString().split('T')[0],
      total_cobrado: 0,
    };
    addSuscriptor(nueva);
    setShowForm(false);
    setFormNombre('');
    setFormEmail('');
    setFormProductos('');
    setFormPrecio('');
    setFormPlan('mensual');
  };

  const estadoColor = (estado: Suscriptor['estado']) => {
    if (estado === 'activa') return { bg: 'rgba(27,94,48,0.2)', color: '#4ADE80', border: 'rgba(74,222,128,0.3)' };
    if (estado === 'pausada') return { bg: 'rgba(217,119,6,0.15)', color: '#fbbf24', border: 'rgba(251,191,36,0.3)' };
    return { bg: 'rgba(220,38,38,0.1)', color: '#f87171', border: 'rgba(248,113,113,0.3)' };
  };

  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href="/m03" style={{ color: '#8B5E3C', textDecoration: 'none', fontSize: '1.2rem' }}>←</Link>
          <div>
            <h1 style={{ fontWeight: 900, fontSize: '1.5rem', margin: 0 }}>Suscripciones D2C</h1>
            <div style={{ fontSize: '0.72rem', color: '#8B5E3C', letterSpacing: 1, marginTop: 2 }}>M03 · TOSTADURIA · DIRECTO AL CONSUMIDOR</div>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{ background: '#8B5E3C', color: '#FBF6EE', border: 'none', borderRadius: 10, padding: '0.6rem 1.25rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
        >
          + Nueva suscripción
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {[
          { v: `€${mrr.toFixed(0)}/mes`, l: 'MRR estimado', color: '#4ADE80' },
          { v: `${activas}`, l: 'Activas', color: '#C49A6C' },
          { v: `${pausadas}`, l: 'Pausadas', color: '#fbbf24' },
          { v: `€${totalCobrado.toFixed(0)}`, l: 'Total cobrado', color: '#93c5fd' },
        ].map(({ v, l, color }) => (
          <div key={l} style={{ background: 'linear-gradient(135deg, rgba(59,31,8,0.95) 0%, rgba(26,13,5,0.98) 100%)', border: '1px solid rgba(196,154,108,0.12)', borderRadius: 12, padding: '0.9rem' }}>
            <div style={{ fontWeight: 900, fontSize: '1.3rem', color }}>{v}</div>
            <div style={{ fontSize: '0.68rem', color: '#8B5E3C', marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Filtros estado */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {(['todos', 'activa', 'pausada', 'cancelada'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            style={{
              background: filtro === f ? '#8B5E3C' : 'rgba(59,31,8,0.6)',
              color: filtro === f ? '#FBF6EE' : '#C49A6C',
              border: `1px solid ${filtro === f ? '#8B5E3C' : 'rgba(196,154,108,0.2)'}`,
              borderRadius: 100,
              padding: '0.3rem 0.75rem',
              fontSize: '0.75rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {f === 'todos' ? `Todos (${suscriptores.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${suscriptores.filter(s => s.estado === f).length})`}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {filtradas.map(s => {
          const { bg, color, border } = estadoColor(s.estado);
          const isCobrandose = simCobroId === s.id;
          return (
            <div
              key={s.id}
              style={{
                background: 'linear-gradient(135deg, rgba(59,31,8,0.95) 0%, rgba(26,13,5,0.98) 100%)',
                border: '1px solid rgba(196,154,108,0.12)',
                borderRadius: 14,
                padding: '1rem 1.25rem',
                opacity: isCobrandose ? 0.75 : 1,
                transition: 'opacity 0.3s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                {/* Info principal */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#FBF6EE' }}>{s.consumidor}</div>
                    <span style={{ background: bg, color, border: `1px solid ${border}`, borderRadius: 100, padding: '0.15rem 0.55rem', fontSize: '0.68rem', fontWeight: 700 }}>
                      {s.estado}
                    </span>
                  </div>
                  {s.email && (
                    <div style={{ fontSize: '0.72rem', color: '#8B5E3C', marginBottom: '0.25rem' }}>{s.email}</div>
                  )}
                  <div style={{ fontSize: '0.78rem', color: '#C49A6C' }}>
                    {PLAN_LABELS[s.plan]} · {s.productos}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#8B5E3C', marginTop: '0.3rem' }}>
                    📅 Próximo envío: <strong style={{ color: '#C49A6C' }}>{s.proxima_fecha}</strong>
                    {s.ultimo_cobro && ` · Último cobro: ${s.ultimo_cobro}`}
                  </div>
                </div>

                {/* Precio + total */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#C49A6C' }}>€{s.precio}</div>
                  <div style={{ fontSize: '0.68rem', color: '#8B5E3C' }}>por envío</div>
                  {s.total_cobrado !== undefined && (
                    <div style={{ fontSize: '0.72rem', color: '#4ADE80', marginTop: '0.25rem' }}>€{s.total_cobrado} total</div>
                  )}
                </div>
              </div>

              {/* Acciones */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.85rem', flexWrap: 'wrap' }}>
                {s.estado === 'activa' && (
                  <>
                    <button
                      onClick={() => simularCobro(s.id)}
                      disabled={isCobrandose}
                      style={{
                        background: isCobrandose ? 'rgba(74,222,128,0.1)' : 'rgba(27,94,48,0.25)',
                        color: '#4ADE80',
                        border: '1px solid rgba(74,222,128,0.3)',
                        borderRadius: 8,
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: isCobrandose ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {isCobrandose ? '⏳ Cobrando...' : '💳 Simular cobro'}
                    </button>
                    <button
                      onClick={() => pausar(s.id)}
                      style={{ background: 'rgba(217,119,6,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 8, padding: '0.35rem 0.75rem', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      ⏸ Pausar
                    </button>
                  </>
                )}
                {s.estado === 'pausada' && (
                  <button
                    onClick={() => reactivar(s.id)}
                    style={{ background: 'rgba(27,94,48,0.25)', color: '#4ADE80', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 8, padding: '0.35rem 0.75rem', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    ▶ Reactivar
                  </button>
                )}
                {s.estado !== 'cancelada' && (
                  <button
                    onClick={() => cancelar(s.id)}
                    style={{ background: 'rgba(220,38,38,0.08)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, padding: '0.35rem 0.75rem', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    ✕ Cancelar
                  </button>
                )}
                <div style={{ fontSize: '0.68rem', color: '#8B5E3C', alignSelf: 'center', marginLeft: 'auto' }}>
                  Cada {PLAN_DIAS[s.plan]}d · desde {s.creada_at}
                </div>
              </div>
            </div>
          );
        })}

        {filtradas.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#8B5E3C' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📭</div>
            <div>No hay suscripciones en este estado</div>
          </div>
        )}
      </div>

      {/* Modal: nueva suscripción */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#1A0D05', border: '1px solid rgba(196,154,108,0.2)', borderRadius: 16, padding: '1.75rem', width: '100%', maxWidth: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontWeight: 900, fontSize: '1.2rem', margin: 0 }}>Nueva suscripción</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#8B5E3C', cursor: 'pointer', fontSize: '1.3rem' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#C49A6C', display: 'block', marginBottom: '0.35rem' }}>Nombre del consumidor *</label>
                <input
                  value={formNombre}
                  onChange={e => setFormNombre(e.target.value)}
                  placeholder="Ej: Ana Martínez"
                  style={{ width: '100%', background: '#3B1F08', border: '1px solid rgba(196,154,108,0.25)', borderRadius: 8, padding: '0.65rem 0.75rem', color: '#FBF6EE', fontSize: '0.88rem', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#C49A6C', display: 'block', marginBottom: '0.35rem' }}>Email (opcional)</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  placeholder="ana@ejemplo.com"
                  style={{ width: '100%', background: '#3B1F08', border: '1px solid rgba(196,154,108,0.25)', borderRadius: 8, padding: '0.65rem 0.75rem', color: '#FBF6EE', fontSize: '0.88rem', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#C49A6C', display: 'block', marginBottom: '0.35rem' }}>Plan *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
                  {(['semanal', 'quincenal', 'mensual', 'trimestral'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setFormPlan(p)}
                      style={{
                        background: formPlan === p ? '#8B5E3C' : '#3B1F08',
                        color: formPlan === p ? '#FBF6EE' : '#C49A6C',
                        border: `1px solid ${formPlan === p ? '#8B5E3C' : 'rgba(196,154,108,0.2)'}`,
                        borderRadius: 8,
                        padding: '0.5rem 0.25rem',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        fontWeight: formPlan === p ? 700 : 400,
                      }}
                    >
                      {PLAN_LABELS[p]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#C49A6C', display: 'block', marginBottom: '0.35rem' }}>Productos *</label>
                <input
                  value={formProductos}
                  onChange={e => setFormProductos(e.target.value)}
                  placeholder="Ej: Gesha Natural · 250g"
                  style={{ width: '100%', background: '#3B1F08', border: '1px solid rgba(196,154,108,0.25)', borderRadius: 8, padding: '0.65rem 0.75rem', color: '#FBF6EE', fontSize: '0.88rem', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#C49A6C', display: 'block', marginBottom: '0.35rem' }}>Precio por envío (€) *</label>
                <input
                  type="number"
                  value={formPrecio}
                  onChange={e => setFormPrecio(e.target.value)}
                  placeholder="28"
                  min={1}
                  style={{ width: '100%', background: '#3B1F08', border: '1px solid rgba(196,154,108,0.25)', borderRadius: 8, padding: '0.65rem 0.75rem', color: '#FBF6EE', fontSize: '0.88rem', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.25rem' }}>
              <button
                onClick={() => setShowForm(false)}
                style={{ flex: 1, background: '#3B1F08', color: '#C49A6C', border: '1px solid rgba(196,154,108,0.2)', borderRadius: 10, padding: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
              >
                Cancelar
              </button>
              <button
                onClick={handleAddSuscriptor}
                disabled={!formNombre.trim() || !formProductos.trim() || !formPrecio}
                style={{
                  flex: 2,
                  background: formNombre.trim() && formProductos.trim() && formPrecio ? '#8B5E3C' : '#3B1F08',
                  color: '#FBF6EE',
                  border: 'none',
                  borderRadius: 10,
                  padding: '0.75rem',
                  cursor: formNombre.trim() && formProductos.trim() && formPrecio ? 'pointer' : 'not-allowed',
                  fontWeight: 700,
                  opacity: formNombre.trim() && formProductos.trim() && formPrecio ? 1 : 0.5,
                }}
              >
                Crear suscripción activa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
