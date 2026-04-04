'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { useCartStore } from '@/lib/stores/cartStore';
import { MOCK_LOTES } from '@/lib/mock/lotes';
import { MOCK_PRODUCTOS } from '@/lib/mock/productos';
import { CartItem } from '@/lib/types/cart';
import { CategoriaMarketplace, OrdenPor } from '@/lib/types/producto';
import ProductoCard from '@/components/brewchain/ProductoCard';
import CartModal from '@/components/brewchain/CartModal';

const CATEGORIAS: { label: string; value: string }[] = [
  { label: 'Todo', value: 'todo' },
  { label: '🔥 Tostado', value: 'lote_tostado' },
  { label: '🌱 Verde·FOB', value: 'lote_verde' },
  { label: '🔄 Suscripción', value: 'suscripcion' },
  { label: '🏪 B2B Granel', value: 'b2b_granel' },
  { label: '💊 Cápsulas', value: 'capsula' },
  { label: '⚙️ Accesorios', value: 'accesorio' },
];

const ORDEN_OPCIONES: { label: string; value: OrdenPor }[] = [
  { label: 'Relevancia', value: 'relevancia' },
  { label: 'Precio: menor a mayor', value: 'precio_asc' },
  { label: 'Precio: mayor a menor', value: 'precio_desc' },
  { label: 'Cupping score', value: 'cupping_desc' },
  { label: 'Más reciente', value: 'mas_reciente' },
  { label: 'EUDR primero', value: 'eudr_primero' },
];

const ROLES_VENDER = [
  {
    id: 'M03', icon: '🔥', label: 'Tostaduria', sub: 'M03',
    desc: 'Publica tus lotes tostados, crea suscripciones D2C y packs B2B. El QR de trazabilidad se genera solo.',
    features: ['QR de trazabilidad en cada bolsa', 'Suscripcion D2C incluida', 'Acceso a cafeterias del ecosistema', 'Migracion desde Cropster sin perdida de datos'],
    color: '#8B5E3C', route: '/m03',
  },
  {
    id: 'M02', icon: '🚢', label: 'Importadora', sub: 'M02',
    desc: 'Publica lotes de cafe verde con trazabilidad EUDR completa y acceso a tostadores europeos.',
    features: ['Declaración EUDR automática', 'Semáforo compliance 12 requisitos', 'Wish list inversa con matching IA', 'Cupping digital CVA 2024'],
    color: '#1A2E5C', route: '/m02',
  },
  {
    id: 'M01', icon: '🌱', label: 'Caficultor', sub: 'M01',
    desc: 'Vende tu cosecha directamente a importadoras y tostaderias europeas. Tu GPS es tu pasaporte a Europa.',
    features: ['GPS EUDR compliant desde el dia 1', 'Precio ICO en tiempo real', 'Acceso directo a compradores EU', 'Alertas agronomicas de roya y broca'],
    color: '#1B5E30', route: '/m01',
  },
  {
    id: 'M05', icon: '🏪', label: 'Cafeteria', sub: 'M05',
    desc: 'Muestra el cafe que sirves en tu barra, crea programas de fidelizacion y vende tu experiencia.',
    features: ['QR de barra en el marketplace', 'Programa de fidelizacion digital', 'Visibilidad en el mapa de BREW CHAIN', 'Aprovisionamiento B2B integrado'],
    color: '#3B1F08', route: '/m05',
  },
];

const ROLES_COMPRAR = ['Todos', 'Consumidor', 'Cafetería', 'Tostaduria', 'Importadora', 'Caficultor'];

// Calcula score de relevancia (0–100) para lotes
function relevanciaLote(lote: (typeof MOCK_LOTES)[0]): number {
  const cupping = lote.cupping_score ? (lote.cupping_score - 80) / 20 * 40 : 0;        // 0–40
  const eudr = lote.eudr_status === 'green' ? 35 : lote.eudr_status === 'amber' ? 15 : 0; // 0–35
  const disponible = lote.kilos_disponibles > 0 ? 15 : 0;                                 // 0–15
  const qr = lote.qr_sealed ? 10 : 0;                                                     // 0–10
  return cupping + eudr + disponible + qr;
}

// Calcula score de relevancia para productos
function relevanciaProducto(p: (typeof MOCK_PRODUCTOS)[0]): number {
  const cupping = p.cupping_score ? (p.cupping_score - 80) / 20 * 40 : 0;
  const eudr = p.eudr_status === 'green' ? 35 : 0;
  const disponible = p.disponible ? 15 : 0;
  const destacado = p.destacado ? 10 : 0;
  return cupping + eudr + disponible + destacado;
}

export default function MarketplacePage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const { addItem, toggleCart, totalItems } = useCartStore();

  const [tab, setTab] = useState<'comprar' | 'vender'>('comprar');
  const [categoriaActiva, setCategoriaActiva] = useState('todo');
  const [rolFiltro, setRolFiltro] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [ordenPor, setOrdenPor] = useState<OrdenPor>('relevancia');

  // ── Feed unificado y ordenado ──────────────────────────────────────────
  const feedItems = useMemo(() => {
    const textoBusqueda = busqueda.toLowerCase();

    // Lotes filtrados
    // "lote_tostado" → tiene nivel_tueste o está en estado tostado/distribuido
    const esTostado = (l: (typeof MOCK_LOTES)[0]) => !!l.nivel_tueste || l.estado === 'tostado' || l.estado === 'distribuido';

    const lotesFiltrados = MOCK_LOTES
      .filter(l => {
        if (l.eudr_status === 'red') return false;
        if (categoriaActiva === 'lote_verde' && esTostado(l)) return false;
        if (categoriaActiva === 'lote_tostado' && !esTostado(l)) return false;
        if (categoriaActiva !== 'todo' && categoriaActiva !== 'lote_verde' && categoriaActiva !== 'lote_tostado') return false;
        if (textoBusqueda && !l.variedad.toLowerCase().includes(textoBusqueda) && !l.region.toLowerCase().includes(textoBusqueda) && !l.pais.toLowerCase().includes(textoBusqueda)) return false;
        return true;
      })
      .map(l => ({ tipo: 'lote' as const, data: l, relevancia: relevanciaLote(l), precio: l.precio_fob, cupping: l.cupping_score ?? 0, eudr: l.eudr_status, fecha: l.fecha_cosecha }));

    // Productos filtrados
    const loteCategories = ['lote_verde', 'lote_tostado'];
    const productosFiltrados = (categoriaActiva === 'todo' || !loteCategories.includes(categoriaActiva))
      ? MOCK_PRODUCTOS
          .filter(p => {
            if (categoriaActiva !== 'todo' && p.categoria !== categoriaActiva) return false;
            if (textoBusqueda && !p.nombre.toLowerCase().includes(textoBusqueda) && !p.vendedor_nombre.toLowerCase().includes(textoBusqueda)) return false;
            return true;
          })
          .map(p => ({ tipo: 'producto' as const, data: p, relevancia: relevanciaProducto(p), precio: p.precio, cupping: p.cupping_score ?? 0, eudr: p.eudr_status ?? null, fecha: p.fecha_creacion }))
      : [];

    const todos = [...lotesFiltrados, ...productosFiltrados];

    // Ordenar
    switch (ordenPor) {
      case 'relevancia':    return todos.sort((a, b) => b.relevancia - a.relevancia);
      case 'precio_asc':    return todos.sort((a, b) => a.precio - b.precio);
      case 'precio_desc':   return todos.sort((a, b) => b.precio - a.precio);
      case 'cupping_desc':  return todos.sort((a, b) => b.cupping - a.cupping);
      case 'mas_reciente':  return todos.sort((a, b) => b.fecha.localeCompare(a.fecha));
      case 'eudr_primero':  return todos.sort((a, b) => {
        const rank = (e: string | null) => e === 'green' ? 0 : e === 'amber' ? 1 : 2;
        return rank(a.eudr) - rank(b.eudr);
      });
      default:              return todos;
    }
  }, [busqueda, categoriaActiva, ordenPor]);

  const entrarComoRol = (route: string, roleId: string) => {
    const roleMap: Record<string, { role: string; nombre: string; email: string }> = {
      '/m01': { role: 'M01', nombre: 'Carlos Moya', email: 'carlos@finca.co' },
      '/m02': { role: 'M02', nombre: 'Ana García', email: 'ana@greenorigin.es' },
      '/m03': { role: 'M03', nombre: 'Pedro Ruiz', email: 'pedro@tostaderia.es' },
      '/m05': { role: 'M05', nombre: 'Luis Café', email: 'luis@cafeteria.es' },
      '/m06': { role: 'M06', nombre: 'María López', email: 'maria@consumer.es' },
    };
    const user = roleMap[route];
    if (user) login({ userId: 'user-demo', nombre: user.nombre, email: user.email, role: user.role as 'M01'|'M02'|'M03'|'M05'|'M06', pais: 'Colombia' });
    router.push(route);
  };

  const handleAddLoteToCart = (lote: (typeof MOCK_LOTES)[0]) => {
    addItem({
      productoId: lote.id,
      nombre: `${lote.variedad} · ${lote.region}`,
      vendedor: lote.caficultor_nombre,
      precio_unitario: lote.precio_fob,
      cantidad: 1,
      tipo: 'lote',
      imagen_emoji: '🌿',
      origen: `${lote.pais}`,
      eudr_status: lote.eudr_status,
    });
  };

  const itemsCount = totalItems();

  return (
    <div style={{ minHeight: '100vh', background: '#1A0D05', color: '#FBF6EE', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(196,154,108,0.1)', position: 'sticky', top: 0, background: 'rgba(26,13,5,0.95)', backdropFilter: 'blur(12px)', zIndex: 100 }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: 1 }}>☕ BREW CHAIN</div>
          <div style={{ fontSize: '0.6rem', color: '#8B5E3C', letterSpacing: 3, textTransform: 'uppercase' }}>MARKETPLACE</div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button onClick={() => setTab('comprar')} style={{ background: tab === 'comprar' ? '#8B5E3C' : 'rgba(59,31,8,0.6)', color: tab === 'comprar' ? '#FBF6EE' : '#C49A6C', border: '1px solid rgba(196,154,108,0.2)', borderRadius: 100, padding: '0.45rem 1rem', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
            🛒 Comprar
          </button>
          <button onClick={() => setTab('vender')} style={{ background: tab === 'vender' ? '#8B5E3C' : 'rgba(59,31,8,0.6)', color: tab === 'vender' ? '#FBF6EE' : '#C49A6C', border: '1px solid rgba(196,154,108,0.2)', borderRadius: 100, padding: '0.45rem 1rem', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
            📦 Vender
          </button>
          {/* Carrito */}
          <button
            onClick={toggleCart}
            style={{ background: itemsCount > 0 ? '#8B5E3C' : 'rgba(59,31,8,0.8)', border: '1px solid rgba(196,154,108,0.2)', borderRadius: 100, padding: '0.45rem 0.9rem', cursor: 'pointer', position: 'relative', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            🛒 <span style={{ fontSize: '0.75rem', color: itemsCount > 0 ? '#FBF6EE' : '#C49A6C', fontWeight: 700 }}>{itemsCount}</span>
          </button>
        </div>
      </div>

      {/* === TAB COMPRAR === */}
      {tab === 'comprar' && (
        <div style={{ padding: '1.25rem', maxWidth: 700, margin: '0 auto' }}>
          {/* Hero Card */}
          <div style={{ background: 'linear-gradient(145deg, rgba(59,31,8,0.9) 0%, rgba(139,94,60,0.35) 50%, rgba(26,13,5,0.95) 100%)', border: '1px solid rgba(196,154,108,0.15)', borderRadius: 20, padding: '1.75rem', marginBottom: '1.25rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -30, right: -20, fontSize: '9rem', opacity: 0.06 }}>☕</div>
            <div style={{ fontSize: '0.65rem', color: '#8B5E3C', letterSpacing: 2, textTransform: 'uppercase', marginBottom: '0.5rem' }}>DE LA SEMILLA A TU TAZA · TRAZADA, VERIFICADA, CONECTADA</div>
            <h1 style={{ fontWeight: 900, fontSize: '1.9rem', lineHeight: 1.15, margin: '0 0 1rem' }}>
              El cafe de especialidad,<br />todo en un lugar.
            </h1>
            <div style={{ fontSize: '0.82rem', color: '#C49A6C', marginBottom: '1.25rem' }}>
              Tostado · Verde · Suscripciones · B2B · Cápsulas · Accesorios
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              {[
                { v: '20', l: 'Vendedores activos' },
                { v: '47', l: 'Lotes disponibles' },
                { v: '€30K', l: 'GMV este mes' },
              ].map(({ v, l }) => (
                <div key={l}>
                  <div style={{ fontWeight: 900, fontSize: '1.4rem', color: '#C49A6C' }}>{v}</div>
                  <div style={{ fontSize: '0.7rem', color: '#8B5E3C' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Buscador */}
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.9rem' }}>🔍</span>
            <input
              className="search-bar"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Origen, variedad, tostador..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>

          {/* Filtro Soy: */}
          <div style={{ marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#8B5E3C', marginRight: '0.5rem' }}>Soy:</span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
              {ROLES_COMPRAR.map(r => (
                <button key={r} onClick={() => setRolFiltro(r)} style={{ background: rolFiltro === r ? '#8B5E3C' : 'rgba(59,31,8,0.6)', color: rolFiltro === r ? '#FBF6EE' : '#C49A6C', border: `1px solid ${rolFiltro === r ? '#8B5E3C' : 'rgba(196,154,108,0.2)'}`, borderRadius: 100, padding: '0.4rem 0.9rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Pills de categoría */}
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
            {CATEGORIAS.map(c => (
              <button key={c.value} onClick={() => setCategoriaActiva(c.value)} style={{ background: categoriaActiva === c.value ? '#8B5E3C' : 'rgba(59,31,8,0.6)', color: categoriaActiva === c.value ? '#FBF6EE' : '#C49A6C', border: `1px solid ${categoriaActiva === c.value ? '#8B5E3C' : 'rgba(196,154,108,0.2)'}`, borderRadius: 100, padding: '0.45rem 1rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {c.label}
              </button>
            ))}
          </div>

          {/* Ordenar por */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.85rem 0 0.75rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#8B5E3C' }}>{feedItems.length} productos encontrados</div>
            <select
              value={ordenPor}
              onChange={e => setOrdenPor(e.target.value as OrdenPor)}
              style={{ background: 'rgba(59,31,8,0.7)', border: '1px solid rgba(196,154,108,0.2)', borderRadius: 8, padding: '0.35rem 0.65rem', color: '#C49A6C', fontSize: '0.78rem', cursor: 'pointer', outline: 'none' }}
            >
              {ORDEN_OPCIONES.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Feed unificado */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {feedItems.map(item => {
              if (item.tipo === 'producto') {
                return (
                  <ProductoCard
                    key={item.data.id}
                    producto={item.data}
                    onAddToCart={(cartItem: CartItem) => addItem(cartItem)}
                  />
                );
              }

              // Lote card
              const lote = item.data;
              return (
                <div key={lote.id} style={{ background: 'linear-gradient(135deg, rgba(59,31,8,0.95) 0%, rgba(26,13,5,0.98) 100%)', border: '1px solid rgba(196,154,108,0.15)', borderRadius: 16, padding: '1.1rem', cursor: 'pointer' }}
                  onClick={() => { if (lote.qr_hash) router.push(`/lote/${lote.qr_hash}`); }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#FBF6EE' }}>{lote.variedad}</div>
                      <div style={{ fontSize: '0.78rem', color: '#C49A6C', marginTop: '0.15rem' }}>{lote.caficultor_nombre} · {lote.region}, {lote.pais}</div>
                      <div style={{ fontSize: '0.72rem', color: '#8B5E3C', marginTop: '0.15rem' }}>{lote.altitud_msnm}m · {lote.proceso}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#C49A6C' }}>€{lote.precio_fob}/kg</div>
                      {lote.cupping_score && <div style={{ fontSize: '0.8rem', color: lote.cupping_score >= 90 ? '#4ADE80' : '#C49A6C', fontWeight: 700 }}>{lote.cupping_score} pts</div>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ background: lote.eudr_status === 'green' ? 'rgba(27,94,48,0.3)' : lote.eudr_status === 'amber' ? 'rgba(217,119,6,0.2)' : 'rgba(220,38,38,0.2)', color: lote.eudr_status === 'green' ? '#4ADE80' : lote.eudr_status === 'amber' ? '#fbbf24' : '#fca5a5', border: `1px solid ${lote.eudr_status === 'green' ? 'rgba(27,94,48,0.4)' : lote.eudr_status === 'amber' ? 'rgba(217,119,6,0.3)' : 'rgba(220,38,38,0.3)'}`, borderRadius: 100, padding: '0.2rem 0.65rem', fontSize: '0.7rem', fontWeight: 700 }}>
                      {lote.eudr_status === 'green' ? '✓ EUDR' : lote.eudr_status === 'amber' ? '⚠ EUDR' : '✗ EUDR'}
                    </span>
                    {lote.qr_sealed && <span style={{ background: 'rgba(139,94,60,0.2)', color: '#C49A6C', border: '1px solid rgba(139,94,60,0.3)', borderRadius: 100, padding: '0.2rem 0.65rem', fontSize: '0.7rem', fontWeight: 700 }}>QR ✓</span>}
                    <span style={{ background: 'rgba(59,31,8,0.6)', color: '#8B5E3C', border: '1px solid rgba(196,154,108,0.15)', borderRadius: 100, padding: '0.2rem 0.65rem', fontSize: '0.7rem' }}>{lote.kilos_disponibles} kg</span>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); handleAddLoteToCart(lote); }}
                    style={{ marginTop: '0.75rem', width: '100%', background: 'rgba(139,94,60,0.15)', border: '1px solid rgba(196,154,108,0.2)', borderRadius: 10, padding: '0.55rem', color: '#C49A6C', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                  >
                    + Añadir al carrito
                  </button>
                </div>
              );
            })}

            {feedItems.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#8B5E3C' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>☕</div>
                <div style={{ fontWeight: 700, color: '#C49A6C', marginBottom: '0.4rem' }}>Sin resultados</div>
                <div style={{ fontSize: '0.85rem' }}>Prueba con otra búsqueda o categoría</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* === TAB VENDER === */}
      {tab === 'vender' && (
        <div style={{ padding: '1.25rem', maxWidth: 700, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '1rem' }}>
            <h1 style={{ fontWeight: 900, fontSize: '2rem', lineHeight: 1.2, margin: '0 0 0.75rem' }}>
              Publica tu cafe.<br />Llega a mas compradores.
            </h1>
            <p style={{ color: '#C49A6C', margin: 0, fontSize: '0.9rem' }}>
              Todos los actores pueden vender. Elige tu rol y empieza hoy.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            {ROLES_VENDER.map(rol => (
              <div key={rol.id} style={{ background: 'linear-gradient(135deg, rgba(59,31,8,0.95) 0%, rgba(26,13,5,0.98) 100%)', border: `1px solid ${rol.color}30`, borderRadius: 20, padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${rol.color}20`, border: `1px solid ${rol.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>{rol.icon}</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#FBF6EE' }}>{rol.label}</div>
                    <div style={{ fontSize: '0.7rem', color: '#8B5E3C', letterSpacing: 1 }}>{rol.sub}</div>
                  </div>
                </div>
                <p style={{ color: '#C49A6C', fontSize: '0.88rem', margin: '0 0 1rem', lineHeight: 1.55 }}>{rol.desc}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.25rem' }}>
                  {rol.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#C49A6C' }}>
                      <span style={{ color: '#4ADE80', fontSize: '0.7rem' }}>✓</span> {f}
                    </div>
                  ))}
                </div>
                <button onClick={() => entrarComoRol(rol.route, rol.id)} style={{ width: '100%', background: rol.color, color: '#FBF6EE', padding: '0.875rem', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.95rem' }}>
                  Empezar como {rol.label} →
                </button>
              </div>
            ))}
          </div>

          {/* Stats bar */}
          <div style={{ background: 'linear-gradient(135deg, rgba(59,31,8,0.95) 0%, rgba(26,13,5,0.98) 100%)', border: '1px solid rgba(196,154,108,0.15)', borderRadius: 16, padding: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', textAlign: 'center' }}>
            {[{ v: '€30K', l: 'GMV este mes' }, { v: '3-7%', l: 'Comision por venta' }, { v: '20', l: 'Vendedores activos' }].map(({ v, l }) => (
              <div key={l}><div style={{ fontWeight: 900, fontSize: '1.3rem', color: '#C49A6C' }}>{v}</div><div style={{ fontSize: '0.7rem', color: '#8B5E3C', marginTop: '0.2rem' }}>{l}</div></div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '1rem', padding: '0.75rem', background: 'rgba(59,31,8,0.3)', borderRadius: 12, fontSize: '0.8rem', color: '#8B5E3C' }}>
            📱 QR incluido en cada venta
          </div>
        </div>
      )}

      {/* Modal carrito */}
      <CartModal />
    </div>
  );
}
