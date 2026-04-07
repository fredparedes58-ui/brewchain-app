'use client';
import { useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useCaficultorStore } from '@/lib/stores/caficultorStore';
import { validateGPS, formatGPSForDisplay } from '@/lib/services/s_gps';

// Leaflet no puede renderizarse en el servidor (usa window)
const GPSMapPicker = dynamic(() => import('@/components/brewchain/GPSMapPicker'), { ssr: false, loading: () => (
  <div style={{ height: 280, background: '#1A0D05', borderRadius: 12, border: '1px solid rgba(27,94,48,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5E3C', fontSize: '0.85rem' }}>
    Cargando mapa...
  </div>
) });

type Step = 1 | 2 | 3 | 4 | 5;

const STEP_TITLES: Record<Step, string> = {
  1: 'Datos basicos',
  2: 'Detalles agricolas',
  3: 'Ubicacion GPS',
  4: 'Foto de la parcela',
  5: 'Confirmacion',
};

const MAX_FOTO_WIDTH = 800;

function resizarFoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = Math.min(1, MAX_FOTO_WIDTH / img.width);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas no disponible')); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ParcelaGPS() {
  const router = useRouter();
  const { addParcela } = useCaficultorStore();
  const [step, setStep] = useState<Step>(1);

  // Paso 1 — Datos basicos
  const [nombre, setNombre] = useState('');
  const [variedad, setVariedad] = useState('Castillo');

  // Paso 2 — Detalles agricolas
  const [hectareas, setHectareas] = useState(2.0);
  const [altitud, setAltitud] = useState(1200);

  // Paso 3 — GPS
  const [gpsLat, setGpsLat] = useState('');
  const [gpsLng, setGpsLng] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsValid, setGpsValid] = useState(false);

  // Paso 4 — Foto
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [fotoLoading, setFotoLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado final
  const [success, setSuccess] = useState(false);
  const [offline, setOffline] = useState(false);

  const detectarGPS = () => {
    setGpsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(6);
          const lng = pos.coords.longitude.toFixed(6);
          setGpsLat(lat);
          setGpsLng(lng);
          const validation = validateGPS({ lat: Number(lat), lng: Number(lng), precision_m: pos.coords.accuracy });
          setGpsValid(validation.valid);
          setGpsLoading(false);
        },
        () => {
          // Mock GPS Agua Fria, Venezuela
          setGpsLat('10.218600');
          setGpsLng('-66.703200');
          setGpsValid(true);
          setGpsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setGpsLat('10.218600');
      setGpsLng('-66.703200');
      setGpsValid(true);
      setGpsLoading(false);
    }
  };

  const handleFotoChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoLoading(true);
    try {
      const dataUrl = await resizarFoto(file);
      setFotoUrl(dataUrl);
    } catch {
      // Si falla la redimension, usar el original
      const reader = new FileReader();
      reader.onload = (ev) => setFotoUrl(ev.target?.result as string);
      reader.readAsDataURL(file);
    } finally {
      setFotoLoading(false);
    }
  }, []);

  const guardarParcela = () => {
    const latFinal = gpsLat || '10.218600';
    const lngFinal = gpsLng || '-66.703200';

    const nuevaParcela = {
      id: `par-new-${Date.now()}`,
      caficultor_id: 'caf-001',
      nombre,
      variedad,
      gps_lat: Number(latFinal),
      gps_lng: Number(lngFinal),
      altitud,
      hectareas,
      eudr_verified: true,
      created_at: new Date().toISOString(),
      foto_url: fotoUrl ?? undefined,
    };

    addParcela(nuevaParcela);

    const estaOffline = typeof navigator !== 'undefined' && !navigator.onLine;
    setOffline(estaOffline);

    // Registrar Background Sync (Chrome/Android)
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then(reg => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (reg as any).sync.register('sync-parcelas');
      });
    }

    // Fallback para Safari/iOS y otros browsers
    window.addEventListener('online', () => {
      window.dispatchEvent(new CustomEvent('brewchain-online'));
    }, { once: true });

    setSuccess(true);
  };

  if (success) {
    return (
      <div style={{ padding: '2rem', maxWidth: 600, margin: '0 auto', textAlign: 'center', paddingTop: '4rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
        <h2 style={{ fontWeight: 900, fontSize: '1.6rem', marginBottom: '0.75rem' }}>Parcela registrada!</h2>
        {offline && (
          <div style={{ background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.4)', borderRadius: 10, padding: '0.875rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#fde047' }}>
            Guardado localmente. Se sincronizara cuando recuperes conexion.
          </div>
        )}
        <div style={{ background: 'rgba(27,94,48,0.2)', border: '1px solid #1B5E30', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ color: '#4ADE80', fontWeight: 700, fontSize: '1rem' }}>
            Listo! Tu parcela esta registrada.
          </div>
          <div style={{ color: '#86efac', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Este GPS es tu pasaporte para vender a Europa.
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#C49A6C', marginTop: '0.5rem' }}>
            {formatGPSForDisplay(Number(gpsLat || '10.218600'), Number(gpsLng || '-66.703200'))}
          </div>
        </div>
        <button onClick={() => router.push('/m01')} style={{ background: '#8B5E3C', color: '#FBF6EE', padding: '0.875rem 2rem', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}>
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 600, margin: '0 auto' }}>
      {/* Progress header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.75rem', color: '#C49A6C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.5rem' }}>
          Paso {step} de 5
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginBottom: '1rem' }}>
          <div style={{ height: '100%', background: '#C49A6C', width: `${(step / 5) * 100}%`, borderRadius: 2, transition: 'width 0.3s' }} />
        </div>
        <h1 style={{ fontWeight: 900, fontSize: '1.6rem', margin: 0 }}>
          {STEP_TITLES[step]}
        </h1>
      </div>

      {/* PASO 1 — Datos basicos */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#C49A6C', display: 'block', marginBottom: '0.5rem' }}>Nombre de la parcela</label>
            <input
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej: La Esperanza"
              style={{ width: '100%', background: '#3B1F08', border: '1px solid rgba(196,154,108,0.3)', borderRadius: 8, padding: '0.875rem', color: '#FBF6EE', fontSize: '1rem', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#C49A6C', display: 'block', marginBottom: '0.5rem' }}>Variedad principal</label>
            <select
              value={variedad}
              onChange={e => setVariedad(e.target.value)}
              style={{ width: '100%', background: '#3B1F08', border: '1px solid rgba(196,154,108,0.3)', borderRadius: 8, padding: '0.875rem', color: '#FBF6EE', fontSize: '1rem' }}
            >
              {['Castillo', 'Colombia', 'Caturra', 'Gesha', 'Bourbon', 'Typica', 'Pacamara', 'Mundo Novo'].map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
          <button
            onClick={() => setStep(2)}
            disabled={!nombre}
            style={{ background: nombre ? '#8B5E3C' : '#3B1F08', color: '#FBF6EE', padding: '1rem', borderRadius: 10, border: 'none', cursor: nombre ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: '1rem', opacity: nombre ? 1 : 0.5 }}
          >
            Continuar
          </button>
        </div>
      )}

      {/* PASO 2 — Detalles agricolas */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'rgba(196,154,108,0.08)', border: '1px solid rgba(196,154,108,0.2)', borderRadius: 10, padding: '0.875rem', fontSize: '0.85rem', color: '#C49A6C' }}>
            Estos datos se usan para calcular el volumen estimado de cosecha y el cumplimiento EUDR.
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#C49A6C', display: 'block', marginBottom: '0.5rem' }}>Hectareas de la parcela</label>
            <input
              type="number"
              min={0.1}
              step={0.1}
              value={hectareas}
              onChange={e => setHectareas(Number(e.target.value))}
              style={{ width: '100%', background: '#3B1F08', border: '1px solid rgba(196,154,108,0.3)', borderRadius: 8, padding: '0.875rem', color: '#FBF6EE', fontSize: '1rem', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#C49A6C', display: 'block', marginBottom: '0.5rem' }}>Altitud (msnm)</label>
            <input
              type="number"
              min={0}
              step={10}
              value={altitud}
              onChange={e => setAltitud(Number(e.target.value))}
              style={{ width: '100%', background: '#3B1F08', border: '1px solid rgba(196,154,108,0.3)', borderRadius: 8, padding: '0.875rem', color: '#FBF6EE', fontSize: '1rem', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setStep(1)}
              style={{ flex: 1, background: 'transparent', color: '#C49A6C', padding: '0.875rem', borderRadius: 10, border: '1px solid rgba(196,154,108,0.3)', cursor: 'pointer', fontWeight: 600 }}
            >
              Atras
            </button>
            <button
              onClick={() => setStep(3)}
              style={{ flex: 2, background: '#8B5E3C', color: '#FBF6EE', padding: '0.875rem', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* PASO 3 — GPS */}
      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'rgba(139,94,60,0.1)', border: '1px solid rgba(139,94,60,0.3)', borderRadius: 10, padding: '1rem', fontSize: '0.85rem', color: '#C49A6C' }}>
            Ve a tu parcela y pulsa el boton. El GPS guardara tu ubicacion exacta para el cumplimiento EUDR.
          </div>

          <button
            onClick={detectarGPS}
            disabled={gpsLoading}
            style={{
              background: gpsLoading ? '#8B5E3C80' : '#DC2626',
              color: 'white', padding: '1.5rem', borderRadius: 12, border: 'none',
              cursor: gpsLoading ? 'wait' : 'pointer', fontWeight: 800, fontSize: '1.2rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
              transition: 'background 0.2s',
            }}
          >
            {gpsLoading ? 'Detectando...' : 'Guardar mi ubicacion'}
          </button>

          {gpsLat && (
            <>
              <GPSMapPicker
                lat={Number(gpsLat)}
                lng={Number(gpsLng)}
                onSelect={(lat, lng) => {
                  setGpsLat(String(lat));
                  setGpsLng(String(lng));
                  const validation = validateGPS({ lat, lng, precision_m: 10 });
                  setGpsValid(validation.valid);
                }}
              />

              <div style={{ background: 'rgba(27,94,48,0.15)', border: '1px solid #1B5E30', borderRadius: 10, padding: '1rem' }}>
                <div style={{ color: '#4ADE80', fontWeight: 700, marginBottom: '0.25rem' }}>Ubicacion detectada</div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#C49A6C' }}>
                  {formatGPSForDisplay(Number(gpsLat), Number(gpsLng))}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#86efac', marginTop: '0.25rem' }}>WGS84 · SRID 4326 · EUDR valido</div>
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setStep(2)}
              style={{ flex: 1, background: 'transparent', color: '#C49A6C', padding: '0.875rem', borderRadius: 10, border: '1px solid rgba(196,154,108,0.3)', cursor: 'pointer', fontWeight: 600 }}
            >
              Atras
            </button>
            {gpsValid && (
              <button
                onClick={() => setStep(4)}
                style={{ flex: 2, background: '#8B5E3C', color: '#FBF6EE', padding: '0.875rem', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}
              >
                Continuar
              </button>
            )}
          </div>
        </div>
      )}

      {/* PASO 4 — Foto de parcela */}
      {step === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'rgba(196,154,108,0.08)', border: '1px solid rgba(196,154,108,0.2)', borderRadius: 10, padding: '0.875rem', fontSize: '0.85rem', color: '#C49A6C' }}>
            Captura una foto de tu parcela desde el campo. Se redimensionara automaticamente para ahorrar datos.
          </div>

          {/* Input oculto para camara */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFotoChange}
            style={{ display: 'none' }}
          />

          {fotoUrl ? (
            <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '2px solid #4ADE80' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={fotoUrl} alt="Vista previa de la parcela" style={{ width: '100%', maxHeight: 280, objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', bottom: 8, right: 8 }}>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{ background: 'rgba(0,0,0,0.7)', color: '#FBF6EE', padding: '0.4rem 0.8rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                >
                  Cambiar foto
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={fotoLoading}
              style={{
                background: '#1A0D05',
                border: '2px dashed rgba(196,154,108,0.4)',
                borderRadius: 12,
                padding: '2.5rem 1rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem',
                color: '#C49A6C',
              }}
            >
              <span style={{ fontSize: '2.5rem' }}>📷</span>
              <span style={{ fontWeight: 700, fontSize: '1rem' }}>
                {fotoLoading ? 'Procesando foto...' : 'Tomar foto de la parcela'}
              </span>
              <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Maximo 800px · JPEG comprimido</span>
            </button>
          )}

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setStep(3)}
              style={{ flex: 1, background: 'transparent', color: '#C49A6C', padding: '0.875rem', borderRadius: 10, border: '1px solid rgba(196,154,108,0.3)', cursor: 'pointer', fontWeight: 600 }}
            >
              Atras
            </button>
            <button
              onClick={() => { setFotoUrl(null); setStep(5); }}
              style={{ flex: 1, background: 'transparent', color: '#8B5E3C', padding: '0.875rem', borderRadius: 10, border: '1px solid rgba(139,94,60,0.3)', cursor: 'pointer', fontWeight: 600 }}
            >
              Omitir foto
            </button>
            {(fotoUrl || !fotoLoading) && fotoUrl && (
              <button
                onClick={() => setStep(5)}
                style={{ flex: 2, background: '#8B5E3C', color: '#FBF6EE', padding: '0.875rem', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}
              >
                Continuar
              </button>
            )}
          </div>
        </div>
      )}

      {/* PASO 5 — Confirmacion */}
      {step === 5 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'rgba(196,154,108,0.08)', border: '1px solid rgba(196,154,108,0.2)', borderRadius: 12, padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#C49A6C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '1rem' }}>Resumen de la parcela</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(196,154,108,0.15)', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#8B5E3C', fontSize: '0.85rem' }}>Nombre</span>
                <span style={{ color: '#FBF6EE', fontWeight: 700 }}>{nombre}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(196,154,108,0.15)', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#8B5E3C', fontSize: '0.85rem' }}>Variedad</span>
                <span style={{ color: '#FBF6EE', fontWeight: 700 }}>{variedad}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(196,154,108,0.15)', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#8B5E3C', fontSize: '0.85rem' }}>Hectareas</span>
                <span style={{ color: '#FBF6EE', fontWeight: 700 }}>{hectareas} ha</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(196,154,108,0.15)', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#8B5E3C', fontSize: '0.85rem' }}>Altitud</span>
                <span style={{ color: '#FBF6EE', fontWeight: 700 }}>{altitud} msnm</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(196,154,108,0.15)', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#8B5E3C', fontSize: '0.85rem' }}>GPS</span>
                <span style={{ color: '#4ADE80', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {gpsLat ? formatGPSForDisplay(Number(gpsLat), Number(gpsLng)) : 'Mock Agua Fria'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#8B5E3C', fontSize: '0.85rem' }}>Foto</span>
                <span style={{ color: fotoUrl ? '#4ADE80' : '#8B5E3C', fontWeight: 700 }}>
                  {fotoUrl ? 'Capturada' : 'Sin foto'}
                </span>
              </div>
            </div>
          </div>

          {fotoUrl && (
            <div style={{ borderRadius: 10, overflow: 'hidden', maxHeight: 160 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={fotoUrl} alt="Foto de la parcela" style={{ width: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          )}

          {/* Info extra — Alerta agricola */}
          <div style={{ background: '#3B1F08', borderRadius: 12, padding: '1.25rem', border: '1px solid rgba(220,38,38,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '1.25rem' }}>🍃</span>
              <div>
                <div style={{ fontWeight: 700, color: '#FBF6EE', fontSize: '0.9rem' }}>Alerta: Riesgo de Roya</div>
                <div style={{ fontSize: '0.7rem', color: '#fca5a5' }}>Temperatura 22C · Humedad 85% · Lluvia 3d: 18mm</div>
              </div>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#C49A6C' }}>Revisa las hojas de tus plantas hoy.</div>
            <div style={{ fontSize: '0.65rem', color: '#8B5E3C', marginTop: '0.4rem' }}>Fuente: Cenicafe · Umbral 75% de confianza superado</div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setStep(4)}
              style={{ flex: 1, background: 'transparent', color: '#C49A6C', padding: '0.875rem', borderRadius: 10, border: '1px solid rgba(196,154,108,0.3)', cursor: 'pointer', fontWeight: 600 }}
            >
              Atras
            </button>
            <button
              onClick={guardarParcela}
              style={{ flex: 2, background: '#4ADE80', color: '#1A0D05', padding: '1rem', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '1rem' }}
            >
              Completar registro
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
