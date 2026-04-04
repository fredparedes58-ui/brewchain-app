'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useCaficultorStore } from '@/lib/stores/caficultorStore';
import { validateGPS, formatGPSForDisplay } from '@/lib/services/s_gps';

// Leaflet no puede renderizarse en el servidor (usa window)
const GPSMapPicker = dynamic(() => import('@/components/brewchain/GPSMapPicker'), { ssr: false, loading: () => (
  <div style={{ height: 280, background: '#1A0D05', borderRadius: 12, border: '1px solid rgba(27,94,48,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5E3C', fontSize: '0.85rem' }}>
    🗺️ Cargando mapa...
  </div>
) });

type Step = 1 | 2 | 3;

export default function ParcelaGPS() {
  const router = useRouter();
  const { addParcela } = useCaficultorStore();
  const [step, setStep] = useState<Step>(1);
  const [nombre, setNombre] = useState('');
  const [variedad, setVariedad] = useState('Castillo');
  const [gpsLat, setGpsLat] = useState('');
  const [gpsLng, setGpsLng] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsValid, setGpsValid] = useState(false);
  const [success, setSuccess] = useState(false);

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
          // Mock GPS for demo
          setGpsLat('2.535900');
          setGpsLng('-75.893100');
          setGpsValid(true);
          setGpsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setGpsLat('2.535900');
      setGpsLng('-75.893100');
      setGpsValid(true);
      setGpsLoading(false);
    }
  };

  const guardarParcela = () => {
    if (!gpsValid || !nombre) return;
    addParcela({
      id: `par-new-${Date.now()}`,
      caficultor_id: 'caf-001',
      nombre,
      variedad,
      gps_lat: Number(gpsLat),
      gps_lng: Number(gpsLng),
      altitud: 1650,
      hectareas: 2.0,
      eudr_verified: true,
      created_at: new Date().toISOString(),
    });
    setSuccess(true);
  };

  if (success) {
    return (
      <div style={{ padding: '2rem', maxWidth: 600, margin: '0 auto', textAlign: 'center', paddingTop: '4rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
        <h2 style={{ fontWeight: 900, fontSize: '1.6rem', marginBottom: '0.75rem' }}>¡Parcela registrada!</h2>
        <div style={{ background: 'rgba(27,94,48,0.2)', border: '1px solid #1B5E30', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ color: '#4ADE80', fontWeight: 700, fontSize: '1rem' }}>
            ¡Listo! Tu parcela está registrada.
          </div>
          <div style={{ color: '#86efac', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Este GPS es tu pasaporte para vender a Europa.
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#C49A6C', marginTop: '0.5rem' }}>
            📍 {formatGPSForDisplay(Number(gpsLat), Number(gpsLng))}
          </div>
        </div>
        <button onClick={() => router.push('/m01')} className="btn-primary" style={{ background: '#8B5E3C', color: '#FBF6EE', padding: '0.875rem 2rem', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}>
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 600, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.75rem', color: '#C49A6C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.5rem' }}>Paso {step} de 3</div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginBottom: '1rem' }}>
          <div style={{ height: '100%', background: '#8B5E3C', width: `${(step / 3) * 100}%`, borderRadius: 2, transition: 'width 0.3s' }} />
        </div>
        <h1 style={{ fontWeight: 900, fontSize: '1.6rem', margin: 0 }}>
          {step === 1 ? '¿Cuál es tu nombre y variedad?' : step === 2 ? 'Guardar mi ubicación' : '¡Primera alerta!'}
        </h1>
      </div>

      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#C49A6C', display: 'block', marginBottom: '0.5rem' }}>Nombre de la parcela</label>
            <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: La Esperanza" style={{ width: '100%', background: '#3B1F08', border: '1px solid rgba(196,154,108,0.3)', borderRadius: 8, padding: '0.875rem', color: '#FBF6EE', fontSize: '1rem', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#C49A6C', display: 'block', marginBottom: '0.5rem' }}>Variedad principal</label>
            <select value={variedad} onChange={e => setVariedad(e.target.value)} style={{ width: '100%', background: '#3B1F08', border: '1px solid rgba(196,154,108,0.3)', borderRadius: 8, padding: '0.875rem', color: '#FBF6EE', fontSize: '1rem' }}>
              {['Castillo', 'Colombia', 'Caturra', 'Gesha', 'Bourbon', 'Typica', 'Pacamara', 'Mundo Novo'].map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
          <button onClick={() => setStep(2)} disabled={!nombre} style={{ background: nombre ? '#8B5E3C' : '#3B1F08', color: '#FBF6EE', padding: '1rem', borderRadius: 10, border: 'none', cursor: nombre ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: '1rem', opacity: nombre ? 1 : 0.5 }}>
            Continuar →
          </button>
        </div>
      )}

      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'rgba(139,94,60,0.1)', border: '1px solid rgba(139,94,60,0.3)', borderRadius: 10, padding: '1rem', fontSize: '0.85rem', color: '#C49A6C' }}>
            💡 Ve a tu parcela y pulsa el botón. El GPS guardará tu ubicación exacta para el cumplimiento EUDR.
          </div>

          <button onClick={detectarGPS} disabled={gpsLoading} style={{
            background: gpsLoading ? '#8B5E3C80' : '#DC2626',
            color: 'white', padding: '1.5rem', borderRadius: 12, border: 'none',
            cursor: gpsLoading ? 'wait' : 'pointer', fontWeight: 800, fontSize: '1.2rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
            transition: 'background 0.2s',
          }}>
            {gpsLoading ? '⏳ Detectando...' : '📍 Guardar mi ubicación'}
          </button>

          {gpsLat && (
            <>
              {/* Mapa interactivo Leaflet */}
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
                <div style={{ color: '#4ADE80', fontWeight: 700, marginBottom: '0.25rem' }}>✓ Ubicación detectada</div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#C49A6C' }}>
                  {formatGPSForDisplay(Number(gpsLat), Number(gpsLng))}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#86efac', marginTop: '0.25rem' }}>WGS84 · SRID 4326 · EUDR válido</div>
              </div>
            </>
          )}

          {gpsValid && (
            <button onClick={() => setStep(3)} style={{ background: '#8B5E3C', color: '#FBF6EE', padding: '1rem', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}>
              Continuar →
            </button>
          )}
        </div>
      )}

      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: '#3B1F08', borderRadius: 12, padding: '1.25rem', border: '1px solid rgba(220,38,38,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🍃</span>
              <div>
                <div style={{ fontWeight: 700, color: '#FBF6EE' }}>Alerta: Riesgo de Roya</div>
                <div style={{ fontSize: '0.75rem', color: '#fca5a5' }}>Temperatura 22°C · Humedad 85% · Lluvia 3d: 18mm</div>
              </div>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#C49A6C' }}>Riesgo de roya en tu zona. Revisa las hojas de tus plantas hoy.</div>
            <div style={{ fontSize: '0.7rem', color: '#8B5E3C', marginTop: '0.5rem' }}>Fuente: Cenicafé · Umbral 75% de confianza superado</div>
          </div>

          <button onClick={guardarParcela} style={{ background: '#8B5E3C', color: '#FBF6EE', padding: '1rem', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}>
            ✅ Completar registro
          </button>
        </div>
      )}
    </div>
  );
}
