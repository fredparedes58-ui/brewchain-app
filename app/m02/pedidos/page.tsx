'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePedidoStore } from '@/lib/stores/pedidoStore';
import { PedidoB2B, PedidoEstado, LineaPedido } from '@/lib/types/pedido';
import { MOCK_LOTES } from '@/lib/mock/lotes';

const ESTADO_META: Record<PedidoEstado, { label: string; color: string; bg: string; border: string }> = {
  borrador:  { label: 'Borrador',  color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.3)' },
  pendiente: { label: 'Pendiente', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.3)' },
  aceptado:  { label: 'Aceptado',  color: '#4ADE80', bg: 'rgba(74,222,128,0.1)',  border: 'rgba(74,222,128,0.3)' },
  rechazado: { label: 'Rechazado', color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)' },
  enviado:   { label: 'Enviado',   color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.3)' },
  recibido:  { label: 'Recibido',  color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.3)' },
};

const NEXT_ESTADO: Partial<Record<PedidoEstado, PedidoEstado>> = {
  pendiente: 'aceptado',
  aceptado: 'enviado',
  enviado: 'recibido',
};

type FiltroEstado = 'todos' | PedidoEstado;

export default function PedidosB2BPage() {
  const { pedidos, addPedido, updateEstado } = usePedidoStore();

  const [filtro, setFiltro] = useState<FiltroEstado>('todos');
  const [pedidoExpandido, setPedidoExpandido] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Modal rechazo
  const [rechazandoId, setRechazandoId] = useState<string | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');

  // Modal tracking
  const [trackingId_pedidoId, setTrackingPedidoId] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState('');

  // Formulario nuevo pedido
  const [formEmpresa, setFormEmpresa] = useState('');
  const [formNombre, setFormNombre] = useState('');
  const [formPais, setFormPais] = useState('');
  const [formLoteId, setFormLoteId] = useState('');
  const [formKilos, setFormKilos] = useState('');
  const [formPrecioKg, setFormPrecioKg] = useState('');
  const [formNota, setFormNota] = useState('');

  const filtrados = pedidos.filter(p => filtro === 'todos' || p.estado === filtro);

  // KPIs
  const totalPendiente = pedidos.filter(p => p.estado === 'pendiente').reduce((a, p) => a + p.total_eur, 0);
  const totalAceptado = pedidos.filter(p => p.estado === 'aceptado').reduce((a, p) => a + p.total_eur, 0);
  const totalEnviado = pedidos.filter(p => p.estado === 'enviado').reduce((a, p) => a + p.total_eur, 0);

  const handleNuevoPedido = () => {
    const lote = MOCK_LOTES.find(l => l.id === formLoteId);
    if (!formEmpresa || !formLoteId || !formKilos || !formPrecioKg) return;
    const kilos = parseFloat(formKilos);
    const precioKg = parseFloat(formPrecioKg);
    const linea: LineaPedido = {
      lote_id: formLoteId,
      variedad: lote?.variedad ?? 'Desconocido',
      caficultor_nombre: lote?.caficultor_nombre ?? 'Desconocido',
      region: lote?.region ?? '',
      pais: lote?.pais ?? '',
      kilos,
      precio_kg: precioKg,
      eudr_compliant: lote?.eudr_status === 'green',
    };
    const nuevo: PedidoB2B = {
      id: `ped-${Date.now()}`,
      numero: `PED-${new Date().getFullYear()}-${String(pedidos.length + 1).padStart(3, '0')}`,
      comprador_id: `imp-${Date.now()}`,
      comprador_nombre: formNombre || 'Comprador',
      comprador_empresa: formEmpresa,
      comprador_pais: formPais || 'UE',
      vendedor_id: lote?.caficultor_id ?? 'caf-xxx',
      vendedor_nombre: lote?.caficultor_nombre ?? 'Caficultor',
      lineas: [linea],
      estado: 'pendiente',
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0],
      total_kilos: kilos,
      total_eur: Math.round(kilos * precioKg * 100) / 100,
      nota_comprador: formNota || undefined,
    };
    addPedido(nuevo);
    setShowForm(false);
    setFormEmpresa(''); setFormNombre(''); setFormPais('');
    setFormLoteId(''); setFormKilos(''); setFormPrecioKg(''); setFormNota('');
  };

  const confirmarRechazo = (id: string) => {
    updateEstado(id, 'rechazado', { motivo_rechazo: motivoRechazo || 'Sin especificar' });
    setRechazandoId(null);
    setMotivoRechazo('');
  };

  const confirmarTracking = (id: string) => {
    updateEstado(id, 'enviado', { tracking_id: trackingInput });
    setTrackingPedidoId(null);
    setTrackingInput('');
  };

  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: 960, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href="/m02" style={{ color: '#8B5E3C', textDecoration: 'none', fontSize: '1.2rem' }}>←</Link>
          <div>
            <h1 style={{ fontWeight: 900, fontSize: '1.5rem', margin: 0 }}>Pedidos B2B</h1>
            <div style={{ fontSize: '0.72rem', color: '#8B5E3C', letterSpacing: 1, marginTop: 2 }}>M02 · COMERCIAL · IMPORTADORAS & TOSTADERÍAS</div>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{ background: '#8B5E3C', color: '#FBF6EE', border: 'none', borderRadius: 10, padding: '0.6rem 1.25rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
        >
          + Nuevo pedido
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {[
          { v: `€${totalPendiente.toLocaleString('es')}`, l: 'Pendiente aprobación', c: '#fbbf24' },
          { v: `€${totalAceptado.toLocaleString('es')}`, l: 'Aceptado · en preparación', c: '#4ADE80' },
          { v: `€${totalEnviado.toLocaleString('es')}`, l: 'En tránsito', c: '#60a5fa' },
        ].map(({ v, l, c }) => (
          <div key={l} style={{ background: 'linear-gradient(135deg, rgba(59,31,8,0.95) 0%, rgba(26,13,5,0.98) 100%)', border: '1px solid rgba(196,154,108,0.12)', borderRadius: 12, padding: '0.9rem' }}>
            <div style={{ fontWeight: 900, fontSize: '1.3rem', color: c }}>{v}</div>
            <div style={{ fontSize: '0.68rem', color: '#8B5E3C', marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {(['todos', 'pendiente', 'aceptado', 'enviado', 'recibido', 'rechazado', 'borrador'] as FiltroEstado[]).map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            style={{
              background: filtro === f ? '#8B5E3C' : 'rgba(59,31,8,0.6)',
              color: filtro === f ? '#FBF6EE' : '#C49A6C',
              border: `1px solid ${filtro === f ? '#8B5E3C' : 'rgba(196,154,108,0.2)'}`,
              borderRadius: 100,
              padding: '0.3rem 0.75rem',
              fontSize: '0.72rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {f === 'todos' ? `Todos (${pedidos.length})` : `${ESTADO_META[f as PedidoEstado]?.label ?? f} (${pedidos.filter(p => p.estado === f).length})`}
          </button>
        ))}
      </div>

      {/* Lista pedidos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filtrados.map(p => {
          const meta = ESTADO_META[p.estado];
          const expandido = pedidoExpandido === p.id;
          const nextEst = NEXT_ESTADO[p.estado];

          return (
            <div
              key={p.id}
              style={{ background: 'linear-gradient(135deg, rgba(59,31,8,0.95) 0%, rgba(26,13,5,0.98) 100%)', border: '1px solid rgba(196,154,108,0.12)', borderRadius: 14 }}
            >
              {/* Row principal */}
              <div
                style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => setPedidoExpandido(expandido ? null : p.id)}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.82rem', fontFamily: 'monospace', color: '#C49A6C' }}>{p.numero}</span>
                    <span style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`, borderRadius: 100, padding: '0.12rem 0.5rem', fontSize: '0.65rem', fontWeight: 700 }}>
                      {meta.label}
                    </span>
                    {p.lineas.some(l => !l.eudr_compliant) && (
                      <span style={{ background: 'rgba(220,38,38,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 100, padding: '0.12rem 0.5rem', fontSize: '0.65rem', fontWeight: 700 }}>⚠️ EUDR pendiente</span>
                    )}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#FBF6EE' }}>{p.comprador_empresa} · {p.comprador_pais}</div>
                  <div style={{ fontSize: '0.72rem', color: '#8B5E3C', marginTop: 2 }}>
                    {p.total_kilos} kg · {p.lineas.length} lote{p.lineas.length > 1 ? 's' : ''} · Creado {p.created_at}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#C49A6C' }}>€{p.total_eur.toLocaleString('es')}</div>
                  <div style={{ fontSize: '0.62rem', color: '#8B5E3C' }}>{expandido ? '▲ cerrar' : '▼ ver más'}</div>
                </div>
              </div>

              {/* Detalle expandido */}
              {expandido && (
                <div style={{ borderTop: '1px solid rgba(196,154,108,0.1)', padding: '1rem 1.25rem' }}>
                  {/* Líneas */}
                  <div style={{ marginBottom: '0.85rem' }}>
                    <div style={{ fontSize: '0.68rem', color: '#8B5E3C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.5rem' }}>Líneas del pedido</div>
                    {p.lineas.map((l, i) => (
                      <div key={i} style={{ background: 'rgba(59,31,8,0.5)', borderRadius: 8, padding: '0.65rem 0.85rem', marginBottom: '0.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{l.variedad} · {l.caficultor_nombre}</div>
                          <div style={{ fontSize: '0.7rem', color: '#8B5E3C' }}>{l.region}, {l.pais} · {l.kilos} kg × €{l.precio_kg}/kg</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontWeight: 700, color: '#C49A6C' }}>€{(l.kilos * l.precio_kg).toLocaleString('es')}</div>
                          <div style={{ fontSize: '0.65rem', color: l.eudr_compliant ? '#4ADE80' : '#f87171' }}>
                            {l.eudr_compliant ? '✓ EUDR' : '✗ EUDR'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Notas */}
                  {(p.nota_comprador || p.nota_vendedor) && (
                    <div style={{ marginBottom: '0.85rem', fontSize: '0.78rem', color: '#C49A6C', lineHeight: 1.5 }}>
                      {p.nota_comprador && <div><strong>Comprador:</strong> {p.nota_comprador}</div>}
                      {p.nota_vendedor && <div><strong>Vendedor:</strong> {p.nota_vendedor}</div>}
                    </div>
                  )}

                  {/* Tracking */}
                  {p.tracking_id && (
                    <div style={{ marginBottom: '0.85rem', fontSize: '0.78rem', color: '#60a5fa' }}>
                      📦 Tracking: <strong style={{ fontFamily: 'monospace' }}>{p.tracking_id}</strong>
                      {p.fecha_entrega_estimada && ` · Entrega est. ${p.fecha_entrega_estimada}`}
                    </div>
                  )}
                  {p.motivo_rechazo && (
                    <div style={{ marginBottom: '0.85rem', fontSize: '0.78rem', color: '#f87171' }}>
                      ✗ Motivo rechazo: {p.motivo_rechazo}
                    </div>
                  )}

                  {/* Acciones */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {nextEst && nextEst !== 'enviado' && (
                      <button
                        onClick={() => updateEstado(p.id, nextEst)}
                        style={{ background: 'rgba(74,222,128,0.12)', color: '#4ADE80', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 8, padding: '0.4rem 0.9rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        ✓ Marcar como {ESTADO_META[nextEst].label}
                      </button>
                    )}
                    {p.estado === 'aceptado' && (
                      <button
                        onClick={() => { setTrackingPedidoId(p.id); setTrackingInput(p.tracking_id ?? ''); }}
                        style={{ background: 'rgba(96,165,250,0.12)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)', borderRadius: 8, padding: '0.4rem 0.9rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        📦 Marcar enviado + tracking
                      </button>
                    )}
                    {p.estado === 'enviado' && (
                      <button
                        onClick={() => updateEstado(p.id, 'recibido')}
                        style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 8, padding: '0.4rem 0.9rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        ✓ Confirmar recepción
                      </button>
                    )}
                    {(p.estado === 'pendiente' || p.estado === 'aceptado') && (
                      <button
                        onClick={() => setRechazandoId(p.id)}
                        style={{ background: 'rgba(220,38,38,0.08)', color: '#f87171', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 8, padding: '0.4rem 0.9rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        ✗ Rechazar
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtrados.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#8B5E3C' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📭</div>
            <div>No hay pedidos en este estado</div>
          </div>
        )}
      </div>

      {/* Modal: nuevo pedido */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#1A0D05', border: '1px solid rgba(196,154,108,0.2)', borderRadius: 16, padding: '1.75rem', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontWeight: 900, fontSize: '1.2rem', margin: 0 }}>Nuevo pedido B2B</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#8B5E3C', cursor: 'pointer', fontSize: '1.3rem' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {[
                { label: 'Empresa compradora *', val: formEmpresa, set: setFormEmpresa, placeholder: 'Ej: Nordic Roasters GmbH' },
                { label: 'Nombre contacto', val: formNombre, set: setFormNombre, placeholder: 'Ej: Hans Meyer' },
                { label: 'País comprador', val: formPais, set: setFormPais, placeholder: 'Ej: Alemania' },
              ].map(({ label, val, set, placeholder }) => (
                <div key={label}>
                  <label style={{ fontSize: '0.73rem', color: '#C49A6C', display: 'block', marginBottom: '0.3rem' }}>{label}</label>
                  <input value={val} onChange={e => set(e.target.value)} placeholder={placeholder}
                    style={{ width: '100%', background: '#3B1F08', border: '1px solid rgba(196,154,108,0.25)', borderRadius: 8, padding: '0.6rem 0.75rem', color: '#FBF6EE', fontSize: '0.88rem', boxSizing: 'border-box', outline: 'none' }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: '0.73rem', color: '#C49A6C', display: 'block', marginBottom: '0.3rem' }}>Lote *</label>
                <select value={formLoteId} onChange={e => setFormLoteId(e.target.value)}
                  style={{ width: '100%', background: '#3B1F08', border: '1px solid rgba(196,154,108,0.25)', borderRadius: 8, padding: '0.6rem 0.75rem', color: '#FBF6EE', fontSize: '0.88rem', boxSizing: 'border-box', outline: 'none' }}>
                  <option value="">Selecciona un lote...</option>
                  {MOCK_LOTES.map(l => (
                    <option key={l.id} value={l.id}>{l.variedad} · {l.caficultor_nombre} · {l.region}, {l.pais} ({l.kilos_disponibles} kg)</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.73rem', color: '#C49A6C', display: 'block', marginBottom: '0.3rem' }}>Kilos *</label>
                  <input type="number" value={formKilos} onChange={e => setFormKilos(e.target.value)} placeholder="300" min={1}
                    style={{ width: '100%', background: '#3B1F08', border: '1px solid rgba(196,154,108,0.25)', borderRadius: 8, padding: '0.6rem 0.75rem', color: '#FBF6EE', fontSize: '0.88rem', boxSizing: 'border-box', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.73rem', color: '#C49A6C', display: 'block', marginBottom: '0.3rem' }}>€/kg *</label>
                  <input type="number" value={formPrecioKg} onChange={e => setFormPrecioKg(e.target.value)} placeholder="12.50" min={0} step={0.1}
                    style={{ width: '100%', background: '#3B1F08', border: '1px solid rgba(196,154,108,0.25)', borderRadius: 8, padding: '0.6rem 0.75rem', color: '#FBF6EE', fontSize: '0.88rem', boxSizing: 'border-box', outline: 'none' }} />
                </div>
              </div>
              {formKilos && formPrecioKg && (
                <div style={{ background: 'rgba(196,154,108,0.08)', borderRadius: 8, padding: '0.6rem 0.85rem', fontSize: '0.82rem', color: '#C49A6C', fontWeight: 600 }}>
                  Total: €{(parseFloat(formKilos) * parseFloat(formPrecioKg)).toLocaleString('es', { minimumFractionDigits: 2 })}
                </div>
              )}
              <div>
                <label style={{ fontSize: '0.73rem', color: '#C49A6C', display: 'block', marginBottom: '0.3rem' }}>Nota (opcional)</label>
                <textarea value={formNota} onChange={e => setFormNota(e.target.value)} rows={2} placeholder="Requisitos especiales, certificaciones..."
                  style={{ width: '100%', background: '#3B1F08', border: '1px solid rgba(196,154,108,0.25)', borderRadius: 8, padding: '0.6rem 0.75rem', color: '#FBF6EE', fontSize: '0.88rem', boxSizing: 'border-box', resize: 'vertical', outline: 'none' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.25rem' }}>
              <button onClick={() => setShowForm(false)}
                style={{ flex: 1, background: '#3B1F08', color: '#C49A6C', border: '1px solid rgba(196,154,108,0.2)', borderRadius: 10, padding: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>
                Cancelar
              </button>
              <button
                onClick={handleNuevoPedido}
                disabled={!formEmpresa || !formLoteId || !formKilos || !formPrecioKg}
                style={{ flex: 2, background: formEmpresa && formLoteId && formKilos && formPrecioKg ? '#8B5E3C' : '#3B1F08', color: '#FBF6EE', border: 'none', borderRadius: 10, padding: '0.75rem', cursor: formEmpresa && formLoteId && formKilos && formPrecioKg ? 'pointer' : 'not-allowed', fontWeight: 700, opacity: formEmpresa && formLoteId && formKilos && formPrecioKg ? 1 : 0.5 }}>
                Crear pedido pendiente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: rechazo */}
      {rechazandoId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#1A0D05', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 400 }}>
            <h2 style={{ fontWeight: 900, fontSize: '1.1rem', margin: '0 0 0.75rem', color: '#f87171' }}>Rechazar pedido</h2>
            <textarea value={motivoRechazo} onChange={e => setMotivoRechazo(e.target.value)} placeholder="Motivo del rechazo (opcional)" rows={3}
              style={{ width: '100%', background: '#3B1F08', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 8, padding: '0.7rem', color: '#FBF6EE', fontSize: '0.88rem', boxSizing: 'border-box', resize: 'none', outline: 'none', marginBottom: '1rem' }} />
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button onClick={() => setRechazandoId(null)}
                style={{ flex: 1, background: '#3B1F08', color: '#C49A6C', border: '1px solid rgba(196,154,108,0.2)', borderRadius: 10, padding: '0.7rem', cursor: 'pointer', fontWeight: 600 }}>
                Cancelar
              </button>
              <button onClick={() => confirmarRechazo(rechazandoId)}
                style={{ flex: 1, background: 'rgba(220,38,38,0.2)', color: '#f87171', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 10, padding: '0.7rem', cursor: 'pointer', fontWeight: 700 }}>
                Confirmar rechazo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: tracking */}
      {trackingId_pedidoId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#1A0D05', border: '1px solid rgba(96,165,250,0.2)', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 400 }}>
            <h2 style={{ fontWeight: 900, fontSize: '1.1rem', margin: '0 0 0.75rem', color: '#60a5fa' }}>Marcar como enviado</h2>
            <input value={trackingInput} onChange={e => setTrackingInput(e.target.value)} placeholder="Número de seguimiento (DHL, FedEx...)"
              style={{ width: '100%', background: '#3B1F08', border: '1px solid rgba(96,165,250,0.25)', borderRadius: 8, padding: '0.7rem', color: '#FBF6EE', fontSize: '0.88rem', boxSizing: 'border-box', outline: 'none', marginBottom: '1rem', fontFamily: 'monospace' }} />
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button onClick={() => setTrackingPedidoId(null)}
                style={{ flex: 1, background: '#3B1F08', color: '#C49A6C', border: '1px solid rgba(196,154,108,0.2)', borderRadius: 10, padding: '0.7rem', cursor: 'pointer', fontWeight: 600 }}>
                Cancelar
              </button>
              <button onClick={() => confirmarTracking(trackingId_pedidoId)}
                style={{ flex: 1, background: 'rgba(96,165,250,0.15)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)', borderRadius: 10, padding: '0.7rem', cursor: 'pointer', fontWeight: 700 }}>
                📦 Marcar enviado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
