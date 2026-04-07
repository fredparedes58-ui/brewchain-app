'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { ActorRole, ROLE_LABELS, ROLE_ICONS } from '@/lib/types/actors';
import ChatBadge from '@/components/brewchain/ChatBadge';

interface NavItem { label: string; href: string; icon: string; }

const NAV_BY_ROLE: Record<ActorRole, NavItem[]> = {
  M01: [
    { label: 'Inicio', href: '/m01', icon: '🏠' },
    { label: 'Mi Parcela', href: '/m01/parcela', icon: '📍' },
    { label: 'Mis Lotes', href: '/m01/lotes', icon: '📦' },
    { label: 'Historial Ventas', href: '/m01/historial', icon: '💰' },
    { label: 'Mensajes', href: '/m01/mensajes', icon: '💬' },
    { label: 'Detección Plagas', href: '/m01/camara', icon: '🔬' },
  ],
  M02: [
    { label: 'Dashboard EUDR', href: '/m02', icon: '🛡️' },
    { label: 'Catálogo', href: '/m02/catalogo', icon: '📋' },
    { label: 'EUDR por Lote', href: '/m02/eudr', icon: '📄' },
    { label: 'Pedidos B2B', href: '/m02/pedidos', icon: '📦' },
    { label: 'Wish List', href: '/m02/wish-list', icon: '⭐' },
    { label: 'Cupping CVA', href: '/m02/cupping', icon: '☕' },
  ],
  M03: [
    { label: 'Dashboard', href: '/m03', icon: '📊' },
    { label: 'Marketplace', href: '/m03/lotes', icon: '🛒' },
    { label: 'Generar QR', href: '/m03/qr', icon: '📱' },
    { label: 'Historial Lotes', href: '/m03/historial', icon: '📜' },
    { label: 'Perfiles Tueste', href: '/m03/perfiles', icon: '🔥' },
    { label: 'Suscripciones', href: '/m03/suscripciones', icon: '🔄' },
    { label: 'Migrar Cropster', href: '/m03/migracion', icon: '⬆️' },
  ],
  M04: [
    { label: 'Dashboard', href: '/m04', icon: '📊' },
    { label: 'Recibir lote verde', href: '/m04/recibir', icon: '📥' },
    { label: 'Registrar tueste', href: '/m04/tueste', icon: '🔥' },
    { label: 'Historial tostados', href: '/m04/historial', icon: '📜' },
    { label: 'Marketplace', href: '/m04/marketplace', icon: '🛒' },
  ],
  M05: [
    { label: 'QR en Sala', href: '/m05', icon: '🏪' },
    { label: 'Analytics QR', href: '/m05/analytics', icon: '📊' },
    { label: 'Carta Digital', href: '/m05/menu', icon: '📋' },
    { label: 'Aprovisionamiento', href: '/m05/aprovisionamiento', icon: '📦' },
  ],
  M06: [
    { label: 'Descubrir', href: '/m06', icon: '✨' },
    { label: 'Escanear QR', href: '/m06/escanear', icon: '📷' },
    { label: 'Fidelización', href: '/m06/fidelizacion', icon: '🎁' },
    { label: 'Mis Pedidos', href: '/m06/historial', icon: '🧾' },
    { label: 'Mi Perfil Sensorial', href: '/m06/perfil', icon: '🎯' },
    { label: 'Quiz Sensorial', href: '/m06/quiz', icon: '🧪' },
  ],
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { role, nombre, logout } = useAuthStore();

  if (!role) return null;
  const navItems = NAV_BY_ROLE[role] || [];

  return (
    <aside style={{
      width: 240,
      minHeight: '100vh',
      background: '#3B1F08',
      borderRight: '1px solid rgba(196,154,108,0.15)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(196,154,108,0.15)' }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#FBF6EE' }}>
          <div style={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>BREW CHAIN</div>
          <div style={{ fontSize: '0.7rem', color: '#C49A6C', marginTop: 2 }}>De la semilla a tu taza</div>
        </Link>
      </div>

      {/* Role Badge */}
      <div style={{ padding: '1rem', borderBottom: '1px solid rgba(196,154,108,0.1)' }}>
        <div style={{ background: 'rgba(139,94,60,0.2)', borderRadius: 8, padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>{ROLE_ICONS[role]}</span>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#C49A6C', textTransform: 'uppercase', letterSpacing: 1 }}>{role} · {ROLE_LABELS[role]}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FBF6EE', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>{nombre}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '0.75rem' }}>
        {navItems.map(({ label, href, icon }) => {
          const isActive = pathname === href || (href !== '/m01' && href !== '/m02' && href !== '/m03' && href !== '/m04' && href !== '/m05' && href !== '/m06' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.75rem',
                borderRadius: 8,
                marginBottom: '0.25rem',
                background: isActive ? 'rgba(139,94,60,0.3)' : 'transparent',
                border: isActive ? '1px solid rgba(196,154,108,0.3)' : '1px solid transparent',
                color: isActive ? '#FBF6EE' : '#C49A6C',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.15s',
              }}
            >
              <span>{icon}</span>
              <span style={{ flex: 1 }}>{label}</span>
              {href === '/m01/mensajes' && <ChatBadge />}
            </Link>
          );
        })}
      </nav>

      {/* Role Switcher + Logout */}
      <div style={{ padding: '1rem', borderTop: '1px solid rgba(196,154,108,0.15)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Link href="/" style={{
          display: 'block',
          background: 'rgba(139,94,60,0.15)',
          border: '1px solid rgba(139,94,60,0.3)',
          borderRadius: 6,
          padding: '0.5rem 0.75rem',
          color: '#C49A6C',
          textDecoration: 'none',
          fontSize: '0.78rem',
          textAlign: 'center',
        }}>
          🔄 Cambiar rol
        </Link>
        <button
          onClick={() => { logout(); router.push('/'); }}
          style={{ background: 'none', border: 'none', color: '#8B5E3C', cursor: 'pointer', fontSize: '0.78rem', padding: '0.25rem' }}
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
