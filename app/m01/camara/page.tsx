'use client';
import { useState } from 'react';

type DetectionResult = null | { enfermedad: string; confianza: number; accion: string; fuente: string };

export default function M01Camara() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DetectionResult>(null);

  const simularAnalisis = () => {
    setAnalyzing(true);
    setResult(null);
    setTimeout(() => {
      setResult({
        enfermedad: 'Roya (Hemileia vastatrix)',
        confianza: 0.89,
        accion: 'Riesgo de roya en tu zona. Revisa las hojas de tus plantas hoy.',
        fuente: 'YOLOv11n · Cenicafé',
      });
      setAnalyzing(false);
    }, 2000);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 600, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.75rem', color: '#C49A6C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.5rem' }}>M01 · Caficultor</div>
        <h1 style={{ fontWeight: 900, fontSize: '1.8rem', margin: 0 }}>Detectar Plagas</h1>
        <p style={{ color: '#C49A6C', marginTop: '0.5rem', marginBottom: 0 }}>Toma una foto de las hojas o frutos para detectar roya y broca</p>
      </div>

      <div style={{ background: '#3B1F08', borderRadius: 16, padding: '2rem', textAlign: 'center', marginBottom: '1.5rem', border: '2px dashed rgba(196,154,108,0.3)', minHeight: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <div style={{ fontSize: '3rem' }}>📸</div>
        <div style={{ color: '#C49A6C' }}>Toca para tomar una foto o subir desde galería</div>
        <div style={{ fontSize: '0.75rem', color: '#8B5E3C' }}>Modelo YOLOv11n · Umbral 85% confianza</div>
      </div>

      <button onClick={simularAnalisis} disabled={analyzing} style={{ width: '100%', background: analyzing ? '#3B1F08' : '#8B5E3C', color: '#FBF6EE', padding: '1rem', borderRadius: 10, border: 'none', cursor: analyzing ? 'wait' : 'pointer', fontWeight: 700, fontSize: '1rem', marginBottom: '1.5rem' }}>
        {analyzing ? '🔬 Analizando imagen...' : '🔬 Analizar foto'}
      </button>

      {result && (
        <div style={{ background: result.confianza >= 0.85 ? 'rgba(220,38,38,0.12)' : 'rgba(217,119,6,0.12)', border: `1px solid ${result.confianza >= 0.85 ? '#DC2626' : '#D97706'}`, borderRadius: 12, padding: '1.25rem' }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>
            {result.confianza >= 0.85 ? '⚠️' : '🔍'} {result.enfermedad}
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#C49A6C' }}>Confianza: <strong style={{ color: result.confianza >= 0.85 ? '#fca5a5' : '#fde68a' }}>{(result.confianza * 100).toFixed(0)}%</strong></span>
            <span style={{ fontSize: '0.8rem', color: '#8B5E3C' }}>Fuente: {result.fuente}</span>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '0.75rem', fontSize: '0.88rem', color: '#FBF6EE' }}>
            {result.accion}
          </div>
        </div>
      )}

      <div style={{ marginTop: '1.5rem', background: '#3B1F08', borderRadius: 10, padding: '1rem', border: '1px solid rgba(196,154,108,0.12)' }}>
        <div style={{ fontSize: '0.75rem', color: '#C49A6C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.5rem' }}>Sobre el modelo</div>
        <div style={{ fontSize: '0.8rem', color: '#8B5E3C', lineHeight: 1.5 }}>
          YOLOv11n detecta roya (<em>Hemileia vastatrix</em>) y broca (<em>Hypothenemus hampei</em>). Confianza mínima: 85%. Por debajo: "Imagen no concluyente. Consulta con tu agrónomo."
        </div>
      </div>
    </div>
  );
}
