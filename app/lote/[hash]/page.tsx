import { MOCK_PASAPORTES } from '@/lib/mock/pasaportes';
import PassportView from '@/components/brewchain/PassportView';
import Link from 'next/link';

export default function PassportePage({ params }: { params: { hash: string } }) {
  const passport = MOCK_PASAPORTES.find(
    p => p.hash_corto === params.hash || p.hash_sha256 === params.hash
  );

  if (!passport) {
    return (
      <div style={{ minHeight: '100vh', background: '#1A0D05', color: '#FBF6EE', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
        <h1 style={{ fontWeight: 900, fontSize: '1.5rem', marginBottom: '0.5rem' }}>Pasaporte no encontrado</h1>
        <p style={{ color: '#C49A6C' }}>El código <code style={{ background: '#3B1F08', padding: '0.2rem 0.5rem', borderRadius: 4 }}>{params.hash}</code> no existe en el sistema.</p>
        <Link href="/" style={{ marginTop: '1.5rem', color: '#8B5E3C', textDecoration: 'none', fontWeight: 600 }}>← Volver al inicio</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#1A0D05' }}>
      {/* Header público */}
      <div style={{ borderBottom: '1px solid rgba(196,154,108,0.15)', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 700, margin: '0 auto' }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#FBF6EE', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontWeight: 900, fontSize: '1rem' }}>BREW CHAIN</span>
        </Link>
        <span style={{ fontSize: '0.75rem', color: '#C49A6C' }}>Pasaporte Digital · Inmutable</span>
      </div>

      {/* Passport */}
      <PassportView passport={passport} />

      {/* Footer */}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '1.5rem 1.5rem 3rem', borderTop: '1px solid rgba(196,154,108,0.1)' }}>
        <div style={{ fontSize: '0.72rem', color: '#8B5E3C', textAlign: 'center', lineHeight: 1.6 }}>
          Este pasaporte digital está sellado con SHA-256 y es inmutable desde {new Date(passport.sealed_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}.<br />
          Trazabilidad verificada por BREW CHAIN · <a href="/" style={{ color: '#8B5E3C' }}>brewchain.app</a>
        </div>
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return MOCK_PASAPORTES.map(p => ({ hash: p.hash_corto }));
}
