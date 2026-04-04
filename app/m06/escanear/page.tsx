'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useConsumidorStore } from '@/lib/stores/consumidorStore';
import { useScanStore } from '@/lib/stores/scanStore';
import { useFidelizacionStore } from '@/lib/stores/fidelizacionStore';
import { MOCK_PASAPORTES } from '@/lib/mock/pasaportes';
import Link from 'next/link';

type ScanMode = 'camera' | 'manual';
type ScanStatus = 'idle' | 'scanning' | 'found' | 'error' | 'no_support';

const DEMO_HASHES = [
  { hash: 'a3f2e1b4c9d8', label: 'Colombia Anaeróbico · Carlos Muñoz' },
  { hash: 'b4e3f2a1d0c7', label: 'Gesha Natural · Rosa Vargas' },
  { hash: 'c5d4e3b2a1f8', label: 'Guatemala Pacamara · José Alvarado' },
];

export default function M06Escanear() {
  const router = useRouter();
  const { addQRescaneado } = useConsumidorStore();
  const { addScan } = useScanStore();
  const { addEvento, addSello } = useFidelizacionStore();

  const [mode, setMode] = useState<ScanMode>('camera');
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [hash, setHash] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [foundHash, setFoundHash] = useState('');
  const [cameraPermission, setCameraPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);

  const hasBarcodeDetector = typeof window !== 'undefined' && 'BarcodeDetector' in window;

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const handleFoundHash = useCallback((scannedHash: string) => {
    const limpio = scannedHash.trim();
    stopCamera();
    setFoundHash(limpio);
    setStatus('found');

    const pasaporte = MOCK_PASAPORTES.find(
      p => p.hash_corto === limpio || scannedHash.includes(p.hash_corto)
    );
    const hashFinal = pasaporte?.hash_corto ?? limpio;

    addQRescaneado(hashFinal);
    addScan(hashFinal, 'sala', {
      variedad: pasaporte?.data.variedad,
      caficultor: pasaporte?.data.caficultor_nombre,
    });
    addEvento('escaneo_qr', {
      descripcion: `Escaneaste: ${pasaporte?.data.variedad ?? hashFinal}${pasaporte ? ' · ' + pasaporte.data.caficultor_nombre : ''}`,
      referencia: hashFinal,
    });
    if (pasaporte) {
      addSello({
        id: `sel-${Date.now()}`,
        lote_hash: hashFinal,
        variedad: pasaporte.data.variedad,
        caficultor_nombre: pasaporte.data.caficultor_nombre,
        fecha: new Date().toISOString().split('T')[0],
      });
    }

    setTimeout(() => router.push(`/lote/${hashFinal}`), 1200);
  }, [stopCamera, addQRescaneado, addScan, addEvento, addSello, router]);

  const startCamera = useCallback(async () => {
    if (!hasBarcodeDetector) {
      setStatus('no_support');
      setMode('manual');
      return;
    }
    setStatus('scanning');
    setErrorMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      setCameraPermission('granted');
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      // @ts-expect-error BarcodeDetector es API experimental
      const detector = new BarcodeDetector({ formats: ['qr_code'] });

      const tick = async () => {
        if (!videoRef.current || !streamRef.current) return;
        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes.length > 0) {
            const raw: string = barcodes[0].rawValue;
            const match = raw.match(/lote\/([a-f0-9]{8,64})/i) ?? raw.match(/^([a-f0-9]{8,64})$/i);
            handleFoundHash(match ? match[1] : raw);
            return;
          }
        } catch { /* frame no procesable */ }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setCameraPermission('denied');
        setErrorMsg('Permiso de cámara denegado.');
      } else {
        setErrorMsg('No se pudo acceder a la cámara.');
      }
      setStatus('error');
      setMode('manual');
    }
  }, [hasBarcodeDetector, handleFoundHash]);

  useEffect(() => {
    if (mode === 'camera') startCamera();
    return () => stopCamera();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  if (status === 'found') {
    return (
      <div style={{ padding: '3rem 2rem', maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
        <div style={{ fontWeight: 900, fontSize: '1.3rem', color: '#4ADE80', marginBottom: '0.5rem' }}>¡QR detectado!</div>
        <div style={{ fontFamily: 'monospace', color: '#C49A6C', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{foundHash}</div>
        <div style={{ color: '#8B5E3C', fontSize: '0.82rem' }}>+10 pts · +1 sello · Abriendo pasaporte...</div>
        <div style={{ marginTop: '1.5rem', height: 4, background: 'rgba(196,154,108,0.15)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: '#C49A6C', borderRadius: 2, animation: 'progreso 1.2s linear forwards' }} />
        </div>
        <style>{`@keyframes progreso { from { width: 0%; } to { width: 100%; } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: 500, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <Link href="/m06" style={{ color: '#8B5E3C', textDecoration: 'none', fontSize: '1.2rem' }}>←</Link>
        <div>
          <h1 style={{ fontWeight: 900, fontSize: '1.5rem', margin: 0 }}>Escanear QR</h1>
          <div style={{ fontSize: '0.72rem', color: '#8B5E3C', letterSpacing: 1, marginTop: 2 }}>M06 · CONSUMIDOR · PASAPORTE DIGITAL</div>
        </div>
      </div>

      {/* Selector modo */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', background: 'rgba(59,31,8,0.4)', borderRadius: 12, padding: '0.3rem' }}>
        <button
          onClick={() => { setMode('camera'); setErrorMsg(''); }}
          style={{ flex: 1, background: mode === 'camera' ? '#8B5E3C' : 'transparent', color: mode === 'camera' ? '#FBF6EE' : '#C49A6C', border: 'none', borderRadius: 9, padding: '0.5rem', fontSize: '0.8rem', cursor: 'pointer', fontWeight: mode === 'camera' ? 700 : 400 }}
        >
          📷 Cámara
        </button>
        <button
          onClick={() => { stopCamera(); setMode('manual'); setStatus('idle'); setErrorMsg(''); }}
          style={{ flex: 1, background: mode === 'manual' ? '#8B5E3C' : 'transparent', color: mode === 'manual' ? '#FBF6EE' : '#C49A6C', border: 'none', borderRadius: 9, padding: '0.5rem', fontSize: '0.8rem', cursor: 'pointer', fontWeight: mode === 'manual' ? 700 : 400 }}
        >
          ⌨️ Manual
        </button>
      </div>

      {/* MODO CÁMARA */}
      {mode === 'camera' && (
        <div>
          <div style={{ position: 'relative', background: '#0a0a0a', borderRadius: 16, overflow: 'hidden', aspectRatio: '4/3', marginBottom: '1rem' }}>
            <video ref={videoRef} muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', display: status === 'scanning' ? 'block' : 'none' }} />

            {/* Visor de escaneo */}
            {status === 'scanning' && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <div style={{ width: 200, height: 200, position: 'relative' }}>
                  {[
                    { top: 0, left: 0, borderTop: '3px solid #C49A6C', borderLeft: '3px solid #C49A6C' },
                    { top: 0, right: 0, borderTop: '3px solid #C49A6C', borderRight: '3px solid #C49A6C' },
                    { bottom: 0, left: 0, borderBottom: '3px solid #C49A6C', borderLeft: '3px solid #C49A6C' },
                    { bottom: 0, right: 0, borderBottom: '3px solid #C49A6C', borderRight: '3px solid #C49A6C' },
                  ].map((s, i) => (
                    <div key={i} style={{ position: 'absolute', width: 24, height: 24, ...s }} />
                  ))}
                  <div style={{ position: 'absolute', left: 8, right: 8, height: 2, background: 'linear-gradient(90deg, transparent, #C49A6C, transparent)', animation: 'scanline 2s ease-in-out infinite', borderRadius: 1 }} />
                </div>
                <style>{`@keyframes scanline { 0%,100% { top:8px; } 50% { top:188px; } }`}</style>
              </div>
            )}

            {status === 'idle' && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                <div style={{ fontSize: '3rem' }}>📷</div>
                <div style={{ color: '#C49A6C', fontSize: '0.85rem' }}>Iniciando cámara...</div>
              </div>
            )}
          </div>

          {(status === 'error' || status === 'no_support') && (
            <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 10, padding: '0.85rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#fca5a5' }}>
              {status === 'no_support'
                ? '⚠️ Tu navegador no soporta escáner QR nativo. Usa Chrome/Edge en Android o cambia a modo Manual.'
                : `❌ ${errorMsg}`}
            </div>
          )}

          {cameraPermission === 'denied' && (
            <div style={{ background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.2)', borderRadius: 10, padding: '0.85rem', marginBottom: '1rem', fontSize: '0.78rem', color: '#fbbf24' }}>
              🔒 Permiso bloqueado. Ve a Ajustes del navegador → Permisos del sitio → Cámara → Permitir.
            </div>
          )}

          {status === 'scanning' && (
            <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#8B5E3C', marginBottom: '1rem' }}>
              Apunta la cámara al QR del empaque · Detección automática
            </div>
          )}
        </div>
      )}

      {/* MODO MANUAL */}
      {mode === 'manual' && (
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ fontSize: '0.78rem', color: '#C49A6C', display: 'block', marginBottom: '0.4rem' }}>Hash del QR o URL del pasaporte</label>
          <input
            value={hash}
            onChange={e => setHash(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && hash.trim() && handleFoundHash(hash)}
            placeholder="a3f2e1b4c9d8  ó  brewchain.app/lote/..."
            autoFocus
            style={{ width: '100%', background: '#3B1F08', border: '1px solid rgba(196,154,108,0.3)', borderRadius: 8, padding: '0.875rem', color: '#FBF6EE', fontSize: '0.92rem', fontFamily: 'monospace', boxSizing: 'border-box', outline: 'none', marginBottom: '0.75rem' }}
          />
          {errorMsg && <div style={{ fontSize: '0.78rem', color: '#fca5a5', marginBottom: '0.75rem' }}>{errorMsg}</div>}
          <button
            onClick={() => handleFoundHash(hash)}
            disabled={!hash.trim()}
            style={{ width: '100%', background: hash.trim() ? '#8B5E3C' : '#3B1F08', color: '#FBF6EE', padding: '0.9rem', borderRadius: 10, border: 'none', cursor: hash.trim() ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: '0.95rem', opacity: hash.trim() ? 1 : 0.5 }}
          >
            Ver pasaporte digital →
          </button>
        </div>
      )}

      {/* Acceso rápido demos */}
      <div style={{ background: 'rgba(59,31,8,0.4)', border: '1px solid rgba(196,154,108,0.1)', borderRadius: 12, padding: '1rem' }}>
        <div style={{ fontSize: '0.68rem', color: '#8B5E3C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.6rem' }}>Pasaportes demo disponibles</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {DEMO_HASHES.map(({ hash: h, label }) => (
            <button
              key={h}
              onClick={() => handleFoundHash(h)}
              style={{ background: 'rgba(59,31,8,0.8)', border: '1px solid rgba(196,154,108,0.12)', borderRadius: 8, padding: '0.6rem 0.85rem', cursor: 'pointer', textAlign: 'left', color: '#FBF6EE', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}
            >
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>{label}</div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.62rem', color: '#8B5E3C', marginTop: 1 }}>{h}</div>
              </div>
              <span style={{ color: '#C49A6C', fontSize: '0.75rem', flexShrink: 0 }}>→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
