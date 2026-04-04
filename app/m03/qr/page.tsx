'use client';
import { useState, useEffect } from 'react';
import { MOCK_LOTES } from '@/lib/mock/lotes';
import { generateQRDataURL } from '@/lib/services/s_qr';
import { Lote } from '@/lib/types/lote';
import { PassportData } from '@/lib/types/passport';
import { useAuthStore } from '@/lib/stores/authStore';
import { useComercialStore } from '@/lib/stores/comercialStore';
import { LoteTostado, calcularMerma } from '@/lib/types/tostado';

type Stage = 'select' | 'form' | 'gate_l2' | 'generating' | 'done';

export default function QRGenerator() {
  const { nombre } = useAuthStore();
  const { sealPassport, addLoteTostado } = useComercialStore();

  const [stage, setStage] = useState<Stage>('select');
  const [selectedLote, setSelectedLote] = useState<Lote | null>(null);
  const [nivelTueste, setNivelTueste] = useState<'claro' | 'medio' | 'oscuro'>('claro');
  const [fechaTueste, setFechaTueste] = useState(new Date().toISOString().split('T')[0]);
  const [notasCata, setNotasCata] = useState('');
  const [perfilTueste, setPerfilTueste] = useState('');
  const [gateConfirmed, setGateConfirmed] = useState(false);
  const [gateSignature, setGateSignature] = useState('');
  const [result, setResult] = useState<{ hash_corto: string; public_url: string; qr_data_url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [kilosEntrada, setKilosEntrada] = useState('');
  const [kilosSalida, setKilosSalida] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Solo lotes con GPS verificado
  const lotesSinQR = MOCK_LOTES.filter(l => l.gps_eudr_verified && !l.qr_sealed && l.kilos_disponibles > 0);

  const handleGenerarQR = async () => {
    if (!selectedLote || !nombre) return;
    setStage('generating');
    setError(null);

    try {
      const passportData: PassportData = {
        caficultor_nombre: selectedLote.caficultor_nombre,
        caficultor_id: selectedLote.caficultor_id,
        caficultor_gps: { lat: selectedLote.gps_lat, lng: selectedLote.gps_lng, verified: true, verified_at: new Date().toISOString(), precision_m: 5 },
        pais_region: `${selectedLote.pais} · ${selectedLote.region}`,
        variedad: selectedLote.variedad,
        proceso_beneficiado: selectedLote.proceso,
        fecha_cosecha: selectedLote.fecha_cosecha,
        altitud_msnm: selectedLote.altitud_msnm,
        tostador_nombre: nombre,
        tostador_id: 'tos-001',
        fecha_tueste: fechaTueste,
        nivel_tueste: nivelTueste,
        perfil_tueste: perfilTueste,
        notas_cata: notasCata,
        eudr_compliant: selectedLote.eudr_status === 'green',
        lote_id: selectedLote.id,
        version: 1,
      };

      const response = await fetch('/api/qr/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lote_id: selectedLote.id, data: passportData }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error);
      }

      const data = await response.json();
      const qr_data_url = await generateQRDataURL(data.public_url);

      sealPassport(data.sealed_passport);

      // Persistir LoteTostado en comercialStore
      const ke = parseFloat(kilosEntrada) || 0;
      const ks = parseFloat(kilosSalida) || (ke * 0.84);
      const loteTostado: LoteTostado = {
        id: `lt-${data.hash_corto}-${Date.now()}`,
        lote_id_origen: selectedLote.id,
        caficultor_nombre: selectedLote.caficultor_nombre,
        variedad: selectedLote.variedad,
        pais: selectedLote.pais,
        region: selectedLote.region,
        fecha_tueste: fechaTueste,
        nivel_tueste: nivelTueste,
        perfil_nombre: perfilTueste || undefined,
        kilos_entrada: ke,
        kilos_salida: Math.round(ks * 100) / 100,
        merma_pct: calcularMerma(ke, ks),
        notas_cata: notasCata || undefined,
        qr_hash: data.hash_corto,
        qr_url: data.public_url,
        origen: 'manual',
      };
      addLoteTostado(loteTostado);

      setResult({ ...data, qr_data_url });
      setStage('done');
    } catch (e: any) {
      setError(e.message);
      setStage('gate_l2');
    }
  };

  // STEP: Select lote
  if (stage === 'select') {
    return (
      <div style={{ padding: '2rem', maxWidth: 700, margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#C49A6C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.5rem' }}>M03 · Generador QR</div>
          <h1 style={{ fontWeight: 900, fontSize: '1.8rem', margin: 0 }}>Generar Pasaporte QR</h1>
          <p style={{ color: '#C49A6C', marginTop: '0.5rem', marginBottom: 0 }}>Solo lotes con GPS verificado pueden generar QR · Pasaporte INMUTABLE post-sello</p>
        </div>

        {/* Regla crítica */}
        <div style={{ background: 'rgba(139,94,60,0.1)', border: '1px solid rgba(139,94,60,0.3)', borderRadius: 10, padding: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#C49A6C' }}>
          <strong style={{ color: '#FBF6EE' }}>⚠️ Regla absoluta:</strong> El QR NUNCA se genera sin GPS verificado del caficultor. Una vez sellado, el pasaporte es INMUTABLE. Los errores generan una nueva versión.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {lotesSinQR.map((lote) => (
            <button
              key={lote.id}
              onClick={() => { setSelectedLote(lote); setStage('form'); }}
              style={{ background: '#3B1F08', border: '1px solid rgba(196,154,108,0.15)', borderRadius: 10, padding: '1rem', cursor: 'pointer', textAlign: 'left', color: '#FBF6EE', width: '100%', transition: 'border-color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(196,154,108,0.4)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(196,154,108,0.15)')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{lote.variedad} · {lote.proceso}</div>
                  <div style={{ color: '#C49A6C', fontSize: '0.82rem' }}>{lote.caficultor_nombre} · {lote.region}, {lote.pais}</div>
                  <div style={{ fontSize: '0.75rem', color: '#8B5E3C', marginTop: 4, fontFamily: 'monospace' }}>📍 {lote.gps_lat.toFixed(4)}, {lote.gps_lng.toFixed(4)}</div>
                </div>
                <span style={{ padding: '0.25rem 0.6rem', borderRadius: 100, fontSize: '0.7rem', background: 'rgba(27,94,48,0.2)', color: '#4ADE80', border: '1px solid #1B5E30', flexShrink: 0 }}>✓ GPS</span>
              </div>
            </button>
          ))}
        </div>

        {lotesSinQR.length === 0 && (
          <div style={{ background: '#3B1F08', borderRadius: 12, padding: '2rem', textAlign: 'center', color: '#C49A6C' }}>
            Sin lotes disponibles para QR. Los lotes sin GPS verificado no pueden generar QR.
          </div>
        )}
      </div>
    );
  }

  // STEP: Fill roast data
  if (stage === 'form' && selectedLote) {
    return (
      <div style={{ padding: '2rem', maxWidth: 600, margin: '0 auto' }}>
        <button onClick={() => setStage('select')} style={{ background: 'none', border: 'none', color: '#C49A6C', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.85rem' }}>← Volver</button>
        <h1 style={{ fontWeight: 900, fontSize: '1.6rem', margin: '0 0 0.5rem' }}>Datos de Tueste</h1>
        <div style={{ color: '#C49A6C', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Lote: {selectedLote.variedad} · {selectedLote.caficultor_nombre}</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#C49A6C', display: 'block', marginBottom: '0.4rem' }}>Fecha de tueste *</label>
            <input type="date" value={fechaTueste} onChange={e => setFechaTueste(e.target.value)} style={{ width: '100%', background: '#3B1F08', border: '1px solid rgba(196,154,108,0.3)', borderRadius: 8, padding: '0.75rem', color: '#FBF6EE', fontSize: '0.95rem', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#C49A6C', display: 'block', marginBottom: '0.4rem' }}>Nivel de tueste *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {(['claro', 'medio', 'oscuro'] as const).map((nivel) => (
                <button key={nivel} onClick={() => setNivelTueste(nivel)} style={{ background: nivelTueste === nivel ? '#8B5E3C' : '#3B1F08', border: `1px solid ${nivelTueste === nivel ? '#C49A6C' : 'rgba(196,154,108,0.3)'}`, borderRadius: 8, padding: '0.75rem', color: '#FBF6EE', cursor: 'pointer', fontWeight: nivelTueste === nivel ? 700 : 400 }}>
                  {nivel === 'claro' ? '☀️ Claro' : nivel === 'medio' ? '🌤️ Medio' : '🌑 Oscuro'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#C49A6C', display: 'block', marginBottom: '0.4rem' }}>Perfil de tueste (opcional)</label>
            <input value={perfilTueste} onChange={e => setPerfilTueste(e.target.value)} placeholder="Ej: Desarrollo 21%, carga 185°C, 1er crack 196°C" style={{ width: '100%', background: '#3B1F08', border: '1px solid rgba(196,154,108,0.3)', borderRadius: 8, padding: '0.75rem', color: '#FBF6EE', fontSize: '0.9rem', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#C49A6C', display: 'block', marginBottom: '0.4rem' }}>Notas de cata (opcional)</label>
            <textarea value={notasCata} onChange={e => setNotasCata(e.target.value)} rows={3} placeholder="Ej: Frutos rojos, chocolate amargo, acidez brillante..." style={{ width: '100%', background: '#3B1F08', border: '1px solid rgba(196,154,108,0.3)', borderRadius: 8, padding: '0.75rem', color: '#FBF6EE', fontSize: '0.9rem', boxSizing: 'border-box', resize: 'vertical' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: '#C49A6C', display: 'block', marginBottom: '0.4rem' }}>Kg entrada (verde)</label>
              <input type="number" value={kilosEntrada} onChange={e => setKilosEntrada(e.target.value)} placeholder="Ej: 22" min={0} step={0.1} style={{ width: '100%', background: '#3B1F08', border: '1px solid rgba(196,154,108,0.3)', borderRadius: 8, padding: '0.75rem', color: '#FBF6EE', fontSize: '0.9rem', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: '#C49A6C', display: 'block', marginBottom: '0.4rem' }}>Kg salida (tostado)</label>
              <input type="number" value={kilosSalida} onChange={e => setKilosSalida(e.target.value)} placeholder="Ej: 18.5" min={0} step={0.1} style={{ width: '100%', background: '#3B1F08', border: '1px solid rgba(196,154,108,0.3)', borderRadius: 8, padding: '0.75rem', color: '#FBF6EE', fontSize: '0.9rem', boxSizing: 'border-box' }} />
            </div>
          </div>
          <button onClick={() => setStage('gate_l2')} style={{ background: '#8B5E3C', color: '#FBF6EE', padding: '1rem', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', marginTop: '0.5rem' }}>
            Continuar → Revisión final
          </button>
        </div>
      </div>
    );
  }

  // GATE L2 — El más crítico del sistema
  if (stage === 'gate_l2' && selectedLote) {
    return (
      <div style={{ padding: '2rem', maxWidth: 640, margin: '0 auto' }}>
        <button onClick={() => setStage('form')} style={{ background: 'none', border: 'none', color: '#C49A6C', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.85rem' }}>← Volver</button>

        {/* Gate L2 Header */}
        <div style={{ background: 'rgba(220,38,38,0.1)', border: '2px solid #DC2626', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#fca5a5', marginBottom: '0.5rem' }}>
            🔒 GATE L2 — Aprobación requerida
          </div>
          <div style={{ fontSize: '0.85rem', color: '#FBF6EE', lineHeight: 1.5 }}>
            Estás a punto de <strong>sellar este pasaporte digital de forma PERMANENTE e IRREVERSIBLE</strong>. Una vez confirmado, el pasaporte no puede modificarse. Los errores requerirán una nueva versión con nuevo QR.
          </div>
        </div>

        {/* Resumen del pasaporte */}
        <div style={{ background: '#3B1F08', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid rgba(196,154,108,0.2)' }}>
          <div style={{ fontSize: '0.7rem', color: '#8B5E3C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.75rem' }}>Datos del pasaporte a sellar</div>
          {[
            { label: 'Caficultor', value: selectedLote.caficultor_nombre },
            { label: 'GPS', value: `${selectedLote.gps_lat.toFixed(4)}, ${selectedLote.gps_lng.toFixed(4)} ✓` },
            { label: 'Origen', value: `${selectedLote.variedad} · ${selectedLote.region}, ${selectedLote.pais}` },
            { label: 'Proceso', value: selectedLote.proceso },
            { label: 'Cosecha', value: selectedLote.fecha_cosecha },
            { label: 'Tostador', value: nombre || '' },
            { label: 'Fecha tueste', value: fechaTueste },
            { label: 'Nivel tueste', value: nivelTueste },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', gap: '0.75rem', padding: '0.35rem 0', borderBottom: '1px solid rgba(196,154,108,0.08)' }}>
              <span style={{ fontSize: '0.78rem', color: '#8B5E3C', width: 100, flexShrink: 0 }}>{label}</span>
              <span style={{ fontSize: '0.82rem', color: '#FBF6EE', fontWeight: 600 }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Firma del tostador */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.82rem', color: '#C49A6C', display: 'block', marginBottom: '0.5rem' }}>
            Escribe tu nombre completo para confirmar el sign-off:
          </label>
          <input
            value={gateSignature}
            onChange={e => setGateSignature(e.target.value)}
            placeholder={nombre || 'Tu nombre completo'}
            style={{ width: '100%', background: '#3B1F08', border: '1px solid rgba(196,154,108,0.4)', borderRadius: 8, padding: '0.875rem', color: '#FBF6EE', fontSize: '0.95rem', boxSizing: 'border-box' }}
          />
        </div>

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.5rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={gateConfirmed} onChange={e => setGateConfirmed(e.target.checked)} style={{ marginTop: 3, accentColor: '#8B5E3C', width: 18, height: 18 }} />
          <span style={{ fontSize: '0.85rem', color: '#C49A6C', lineHeight: 1.5 }}>
            Confirmo que he verificado todos los datos. Entiendo que el pasaporte será <strong style={{ color: '#FBF6EE' }}>inmutable</strong> una vez sellado. Los errores requerirán una nueva versión.
          </span>
        </label>

        {error && (
          <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid #DC2626', borderRadius: 8, padding: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#fca5a5' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleGenerarQR}
          disabled={!gateConfirmed || gateSignature.trim().length < 3}
          style={{
            width: '100%', background: gateConfirmed && gateSignature.trim().length >= 3 ? '#DC2626' : '#3B1F08',
            color: '#FBF6EE', padding: '1rem', borderRadius: 10, border: 'none',
            cursor: gateConfirmed && gateSignature.trim().length >= 3 ? 'pointer' : 'not-allowed',
            fontWeight: 800, fontSize: '1rem',
            opacity: gateConfirmed && gateSignature.trim().length >= 3 ? 1 : 0.5,
          }}
        >
          🔒 Sellar Pasaporte y Generar QR
        </button>
      </div>
    );
  }

  // Generating
  if (stage === 'generating') {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Calculando hash SHA-256...</div>
        <div style={{ color: '#C49A6C', marginTop: '0.5rem' }}>Sellando pasaporte digital</div>
      </div>
    );
  }

  // DONE — QR generado
  if (stage === 'done' && result && selectedLote) {
    return (
      <div style={{ padding: '2rem', maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
        <h2 style={{ fontWeight: 900, fontSize: '1.6rem', margin: '0 0 0.5rem' }}>Pasaporte Sellado</h2>
        <div style={{ color: '#4ADE80', marginBottom: '1.5rem' }}>El pasaporte digital está activo. Inmutable.</div>

        {/* QR Code */}
        {result.qr_data_url && (
          <div style={{ background: '#FBF6EE', borderRadius: 16, padding: '1.5rem', display: 'inline-block', marginBottom: '1.5rem' }}>
            <img src={result.qr_data_url} alt="QR BREW CHAIN" style={{ width: 200, height: 200 }} />
          </div>
        )}

        {/* Hash */}
        <div style={{ background: '#3B1F08', borderRadius: 10, padding: '1rem', marginBottom: '1rem', border: '1px solid rgba(196,154,108,0.2)' }}>
          <div style={{ fontSize: '0.7rem', color: '#8B5E3C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.5rem' }}>URL del pasaporte</div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#C49A6C', wordBreak: 'break-all' }}>{result.public_url}</div>
          <div style={{ fontSize: '0.72rem', color: '#8B5E3C', marginTop: '0.5rem' }}>Hash corto: {result.hash_corto}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <a href={`/lote/${result.hash_corto}`} target="_blank" rel="noreferrer" style={{ background: '#1B5E30', color: 'white', padding: '0.875rem', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', display: 'block' }}>
            👁️ Ver pasaporte público
          </a>
          <button onClick={() => { setStage('select'); setResult(null); setGateConfirmed(false); setGateSignature(''); setKilosEntrada(''); setKilosSalida(''); }} style={{ background: '#3B1F08', color: '#FBF6EE', padding: '0.875rem', borderRadius: 10, border: '1px solid rgba(196,154,108,0.3)', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}>
            Generar otro QR
          </button>
        </div>

        {/* Compartir */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`☕ Pasaporte digital BREWCHAIN\n${selectedLote.variedad} · ${selectedLote.caficultor_nombre}\n${result.public_url}`)}`}
            target="_blank"
            rel="noreferrer"
            style={{ background: 'rgba(37,211,102,0.12)', color: '#25D366', border: '1px solid rgba(37,211,102,0.3)', padding: '0.875rem', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
          >
            <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'currentColor' }}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.116 1.533 5.845L0 24l6.362-1.51A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.895 0-3.67-.5-5.217-1.378l-.374-.217-3.777.895.944-3.69-.24-.388A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
            WhatsApp
          </a>
          <button
            onClick={async () => {
              await navigator.clipboard.writeText(result.public_url);
              setCopiedUrl(true);
              setTimeout(() => setCopiedUrl(false), 2500);
            }}
            style={{ background: copiedUrl ? 'rgba(74,222,128,0.1)' : 'rgba(59,31,8,0.8)', color: copiedUrl ? '#4ADE80' : '#C49A6C', border: `1px solid ${copiedUrl ? 'rgba(74,222,128,0.3)' : 'rgba(196,154,108,0.3)'}`, padding: '0.875rem', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}
          >
            {copiedUrl ? '✓ ¡Copiado!' : '📋 Copiar URL'}
          </button>
        </div>

        <div style={{ fontSize: '0.72rem', color: '#8B5E3C', textAlign: 'center' }}>
          ✅ Lote registrado en historial · QR persistido en sesión
        </div>
      </div>
    );
  }

  return null;
}
