'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lote } from '@/lib/types/lote';
import { validateEUDR, loteToEUDRData } from '@/lib/services/s_eudr';
import EUDRSemaforo from '@/components/brewchain/EUDRSemaforo';
import { useComercialStore } from '@/lib/stores/comercialStore';
import { EUDRDeclarationRecord } from '@/lib/types/eudr';

interface GFWResult {
  loss_ha: number;
  risk_level: 'standard' | 'elevated' | 'high';
  source: string;
  real_api: boolean;
}

const RISK_CONFIG = {
  standard: { color: '#4ADE80', bg: 'rgba(27,94,48,0.2)', border: 'rgba(74,222,128,0.3)', label: '✓ Sin deforestación detectada' },
  elevated:  { color: '#fbbf24', bg: 'rgba(217,119,6,0.15)', border: 'rgba(217,119,6,0.3)', label: '⚠ Riesgo elevado detectado' },
  high:      { color: '#fca5a5', bg: 'rgba(220,38,38,0.15)', border: 'rgba(220,38,38,0.3)', label: '✗ Alto riesgo de deforestación' },
};

const TRACES_STATUS_CONFIG = {
  SUBMITTED:     { color: '#fbbf24', label: '⏳ Enviado · Bajo revisión' },
  UNDER_REVIEW:  { color: '#93c5fd', label: '🔍 En revisión por la CE' },
  APPROVED:      { color: '#4ADE80', label: '✅ Aprobado por TRACES NT' },
};

export default function EUDRLoteClient({ lote }: { lote: Lote }) {
  const { eudrRecords, addEUDRRecord, updateEUDRRecordStatus } = useComercialStore();
  const [gfw, setGfw] = useState<GFWResult | null>(null);
  const [cargandoGfw, setCargandoGfw] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const record: EUDRDeclarationRecord | null = eudrRecords.find(r => r.lote_id === lote.id) ?? null;
  const eudrData = loteToEUDRData(lote, gfw ?? undefined);
  const validation = validateEUDR(eudrData);

  // Consultar GFW al montar
  useEffect(() => {
    const fetchGFW = async () => {
      try {
        const res = await fetch(`/api/gfw/forest-loss?lat=${lote.gps_lat}&lng=${lote.gps_lng}&since=2020`);
        if (res.ok) {
          const data: GFWResult = await res.json();
          setGfw(data);
        }
      } catch {
        // silencioso
      } finally {
        setCargandoGfw(false);
      }
    };
    fetchGFW();
  }, [lote.gps_lat, lote.gps_lng]);

  const generarDeclaracion = async () => {
    setGenerando(true);
    try {
      const res = await fetch('/api/eudr/declaration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lote_id: lote.id,
          operador_nombre: 'Green Origin SL',
          operador_pais: 'ES',
          operador_eori: 'ESB-12345678',
        }),
      });
      const data = await res.json();
      if (data.success) {
        const newRecord: EUDRDeclarationRecord = {
          id: `eudr-${lote.id}-${Date.now()}`,
          lote_id: lote.id,
          lote_variedad: lote.variedad,
          lote_region: lote.region,
          referencia_traces: data.referencia_traces,
          generated_at: new Date().toISOString(),
          archived_until: new Date(Date.now() + 5 * 365.25 * 24 * 3600 * 1000).toISOString().split('T')[0],
          download_filename: data.download_filename,
          status: 'local',
        };
        addEUDRRecord(newRecord);

        const blob = new Blob([JSON.stringify(data.declaration, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.download_filename;
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setGenerando(false);
    }
  };

  const enviarTracesNT = async () => {
    if (!record) return;
    setEnviando(true);
    try {
      const res = await fetch('/api/eudr/traces-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referencia_local: record.referencia_traces,
          lote_id: lote.id,
          operador_nombre: 'Green Origin SL',
          operador_eori: 'ESB-12345678',
          operador_pais: 'ES',
          caficultor_nombre: lote.caficultor_nombre,
          pais_origen: lote.pais,
          gps_lat: lote.gps_lat,
          gps_lng: lote.gps_lng,
          kilos: lote.kilos_disponibles,
          fecha_cosecha: lote.fecha_cosecha,
          variedad: lote.variedad,
        }),
      });
      const data = await res.json();
      if (data.success) {
        updateEUDRRecordStatus(record.id, data.traces_nt_reference, data.status);
      }
    } finally {
      setEnviando(false);
    }
  };

  const riskCfg = gfw ? RISK_CONFIG[gfw.risk_level] : null;

  return (
    <div style={{ padding: '2rem', maxWidth: 780, margin: '0 auto' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.82rem', color: '#8B5E3C' }}>
        <Link href="/m02/eudr" style={{ color: '#8B5E3C', textDecoration: 'none' }}>← Todos los lotes</Link>
        <span>/</span>
        <span style={{ color: '#C49A6C' }}>{lote.variedad} · {lote.region}</span>
      </div>

      {/* Header del lote */}
      <div style={{ background: 'linear-gradient(135deg, rgba(59,31,8,0.95) 0%, rgba(26,13,5,0.98) 100%)', border: '1px solid rgba(196,154,108,0.15)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#8B5E3C', letterSpacing: 2, textTransform: 'uppercase', marginBottom: '0.3rem' }}>DECLARACIÓN DDS · EUDR 2023/1115</div>
            <h1 style={{ fontWeight: 900, fontSize: '1.6rem', margin: '0 0 0.25rem', color: '#FBF6EE' }}>{lote.variedad}</h1>
            <div style={{ fontSize: '0.88rem', color: '#C49A6C' }}>{lote.caficultor_nombre} · {lote.region}, {lote.pais}</div>
            <div style={{ fontSize: '0.78rem', color: '#8B5E3C', marginTop: '0.2rem' }}>
              {lote.altitud_msnm}m · {lote.proceso} · {lote.kilos_disponibles} kg · €{lote.precio_fob}/kg
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: lote.eudr_status === 'green' ? '#4ADE80' : lote.eudr_status === 'amber' ? '#fbbf24' : '#fca5a5', background: lote.eudr_status === 'green' ? 'rgba(27,94,48,0.25)' : lote.eudr_status === 'amber' ? 'rgba(217,119,6,0.15)' : 'rgba(220,38,38,0.15)', border: `1px solid ${lote.eudr_status === 'green' ? 'rgba(74,222,128,0.3)' : lote.eudr_status === 'amber' ? 'rgba(217,119,6,0.3)' : 'rgba(220,38,38,0.3)'}`, borderRadius: 100, padding: '0.35rem 0.85rem' }}>
              {lote.eudr_status === 'green' ? '🟢' : lote.eudr_status === 'amber' ? '🟡' : '🔴'} {lote.eudr_compliance_pct}% Compliance
            </span>
            {lote.cupping_score && (
              <span style={{ fontSize: '0.78rem', color: '#C49A6C' }}>☕ {lote.cupping_score} pts CVA</span>
            )}
          </div>
        </div>

        {/* GPS */}
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(27,94,48,0.2)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 8, padding: '0.4rem 0.75rem', fontSize: '0.72rem', color: '#4ADE80' }}>
            📍 {lote.gps_lat.toFixed(4)}, {lote.gps_lng.toFixed(4)}
          </div>
          <div style={{ background: 'rgba(139,94,60,0.15)', border: '1px solid rgba(196,154,108,0.2)', borderRadius: 8, padding: '0.4rem 0.75rem', fontSize: '0.72rem', color: '#C49A6C' }}>
            🌱 {lote.fecha_cosecha}
          </div>
          <div style={{ background: 'rgba(139,94,60,0.15)', border: '1px solid rgba(196,154,108,0.2)', borderRadius: 8, padding: '0.4rem 0.75rem', fontSize: '0.72rem', color: '#C49A6C' }}>
            CN: 0901 11 00
          </div>
        </div>
      </div>

      {/* GFW Card */}
      <div style={{ background: 'linear-gradient(135deg, rgba(59,31,8,0.95) 0%, rgba(26,13,5,0.98) 100%)', border: `1px solid ${riskCfg ? riskCfg.border : 'rgba(196,154,108,0.15)'}`, borderRadius: 14, padding: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <div style={{ fontSize: '0.65rem', color: '#8B5E3C', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700 }}>
            REQ. 7 · GLOBAL FOREST WATCH
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: cargandoGfw ? '#fbbf24' : '#4ADE80', display: 'inline-block' }} />
            <span style={{ fontSize: '0.62rem', color: '#8B5E3C' }}>{cargandoGfw ? 'Consultando GFW...' : gfw?.real_api ? 'GFW API' : 'Hansen 2023'}</span>
          </div>
        </div>
        {cargandoGfw ? (
          <div style={{ fontSize: '0.85rem', color: '#8B5E3C' }}>⏳ Consultando Global Forest Watch...</div>
        ) : gfw ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
              <span style={{ fontWeight: 900, fontSize: '1.4rem', color: riskCfg!.color }}>{gfw.loss_ha} ha</span>
              <span style={{ fontSize: '0.8rem', color: '#8B5E3C' }}>pérdida forestal desde 2020</span>
            </div>
            <div style={{ background: riskCfg!.bg, border: `1px solid ${riskCfg!.border}`, borderRadius: 8, padding: '0.45rem 0.85rem', display: 'inline-block', fontSize: '0.78rem', color: riskCfg!.color, fontWeight: 700, marginBottom: '0.4rem' }}>
              {riskCfg!.label}
            </div>
            <div style={{ fontSize: '0.65rem', color: '#8B5E3C', marginTop: '0.3rem' }}>{gfw.source}</div>
          </>
        ) : (
          <div style={{ fontSize: '0.85rem', color: '#8B5E3C' }}>No se pudo consultar GFW</div>
        )}
      </div>

      {/* Semáforo 12 requisitos */}
      <div style={{ marginBottom: '1.5rem' }}>
        <EUDRSemaforo validation={validation} />
      </div>

      {/* Estado declaración / Acciones */}
      {record ? (
        <div style={{ background: 'rgba(27,94,48,0.12)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 14, padding: '1.25rem', marginBottom: '1rem' }}>
          <div style={{ fontWeight: 700, color: '#4ADE80', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
            ✅ Declaración DDS generada y persistida
          </div>

          <div style={{ display: 'grid', gap: '0.35rem', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
              <span style={{ color: '#8B5E3C' }}>Referencia local:</span>
              <span style={{ fontFamily: 'monospace', color: '#C49A6C' }}>{record.referencia_traces}</span>
            </div>
            {record.traces_nt_reference && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <span style={{ color: '#8B5E3C' }}>TRACES NT:</span>
                <span style={{ fontFamily: 'monospace', color: '#4ADE80' }}>{record.traces_nt_reference}</span>
              </div>
            )}
            {record.traces_status && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <span style={{ color: '#8B5E3C' }}>Estado:</span>
                <span style={{ color: TRACES_STATUS_CONFIG[record.traces_status]?.color ?? '#C49A6C', fontWeight: 700 }}>
                  {TRACES_STATUS_CONFIG[record.traces_status]?.label ?? record.traces_status}
                </span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
              <span style={{ color: '#8B5E3C' }}>Generado:</span>
              <span style={{ color: '#C49A6C' }}>{new Date(record.generated_at).toLocaleString('es-ES')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
              <span style={{ color: '#8B5E3C' }}>Archivar hasta:</span>
              <span style={{ color: '#C49A6C' }}>{record.archived_until} · Art. 9 Reg. UE 2023/1115</span>
            </div>
          </div>

          {record.status === 'local' && (
            <button
              onClick={enviarTracesNT}
              disabled={enviando}
              style={{ width: '100%', background: enviando ? 'rgba(26,46,92,0.5)' : '#1A2E5C', color: '#FBF6EE', padding: '0.875rem', borderRadius: 10, border: 'none', cursor: enviando ? 'wait' : 'pointer', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem' }}
            >
              {enviando ? '⏳ Enviando a TRACES NT EU...' : '🚢 Enviar a TRACES NT (Comisión Europea)'}
            </button>
          )}

          <button
            onClick={generarDeclaracion}
            style={{ width: '100%', background: 'none', border: '1px solid rgba(196,154,108,0.2)', color: '#8B5E3C', padding: '0.6rem', borderRadius: 10, cursor: 'pointer', fontSize: '0.82rem' }}
          >
            Generar nueva versión
          </button>
        </div>
      ) : (
        <div>
          {lote.eudr_status === 'green' ? (
            <button
              onClick={generarDeclaracion}
              disabled={generando}
              style={{ width: '100%', background: generando ? '#1B5E3080' : '#1B5E30', color: 'white', padding: '1rem', borderRadius: 12, border: 'none', cursor: generando ? 'wait' : 'pointer', fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem' }}
            >
              {generando ? '⏳ Generando declaración...' : '📄 Generar Declaración TRACES (1 clic)'}
            </button>
          ) : (
            <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem', fontSize: '0.85rem', color: '#fca5a5' }}>
              ✗ No se puede generar declaración. El lote debe estar 100% EUDR compliant.
              {validation.missing_fields.length > 0 && (
                <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem', fontSize: '0.78rem' }}>
                  {validation.missing_fields.map(f => <li key={f}>{f}</li>)}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
