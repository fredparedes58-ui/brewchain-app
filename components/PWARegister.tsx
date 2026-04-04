'use client';
import { useEffect, useState } from 'react';

export default function PWARegister() {
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then(reg => {
          console.log('[BREW CHAIN SW] Registrado:', reg.scope);
        })
        .catch(err => {
          console.warn('[BREW CHAIN SW] Error:', err);
        });
    }

    // Detectar si ya está instalada
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Capturar el evento de instalación
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      // Mostrar banner después de 3 segundos
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowBanner(false);
      setInstallPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (installPrompt as any).prompt();
    if (result?.outcome === 'accepted') {
      setShowBanner(false);
      setInstallPrompt(null);
    }
  };

  if (isInstalled || !showBanner || !installPrompt) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '1rem',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 2rem)',
      maxWidth: 420,
      background: 'linear-gradient(135deg, rgba(59,31,8,0.98) 0%, rgba(26,13,5,0.99) 100%)',
      border: '1px solid rgba(196,154,108,0.3)',
      borderRadius: 16,
      padding: '1rem 1.25rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      zIndex: 9999,
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      backdropFilter: 'blur(20px)',
    }}>
      <div style={{ fontSize: '2rem', flexShrink: 0 }}>☕</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#FBF6EE', marginBottom: '0.15rem' }}>
          Instalar BREW CHAIN
        </div>
        <div style={{ fontSize: '0.75rem', color: '#C49A6C' }}>
          Accede sin internet · Sin App Store
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flexShrink: 0 }}>
        <button
          onClick={handleInstall}
          style={{
            background: '#8B5E3C',
            color: '#FBF6EE',
            border: 'none',
            borderRadius: 10,
            padding: '0.5rem 1rem',
            fontWeight: 700,
            fontSize: '0.82rem',
            cursor: 'pointer',
          }}
        >
          Instalar
        </button>
        <button
          onClick={() => setShowBanner(false)}
          style={{
            background: 'none',
            color: '#8B5E3C',
            border: 'none',
            fontSize: '0.75rem',
            cursor: 'pointer',
            padding: '0.25rem',
          }}
        >
          Ahora no
        </button>
      </div>
    </div>
  );
}
