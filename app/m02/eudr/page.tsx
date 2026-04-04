'use client';
import { useState } from 'react';
import Link from 'next/link';
import { MOCK_LOTES } from '@/lib/mock/lotes';
import { validateEUDR, loteToEUDRData, getEUDRStatusColor, getEUDRStatusLabel } from '@/lib/services/s_eudr';
import EUDRSemaforo from '@/components/brewchain/EUDRSemaforo';
import { useComercialStore } from '@/lib/stores/comercialStore';
import { Lote } from '@/lib/types/lote';

export default function M02EUDR() {
  const { eudrRecords, addEUDRRecord, updateEUDRRecordStatus } = useComercialStore();
  const [selectedLote, setSelectedLote] = useState<Lote | null>(null);
  const [generando, setGenerando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const recordActual = selectedLote
    ? eudrRecords.find(r => r.lote_id === selectedLote.id) ?? null
    : null;

  const generarDeclaracion = async () => {
    if (!selectedLote) return;
    setGenerando(true);
    try {
      const res = await fetch('/api/eudr/declaration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lote_id: selectedLote.id,
          operador_nombre: 'Green Origin SL',
          operador_pais: 'ES',
          operador_eori: 'ESB-12345678',
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Persistir en store
        const record = {
          id: `eudr-${selectedLote.id}-${Date.now()}`,
          lote_id: selectedLote.id,
          lote_variedad: selectedLote.variedad,
          lote_region: selectedLote.region,
          referencia_traces: data.referencia_traces,
          generated_at: new Date().toISOString(),
          archived_until: new Date(Date.now() + 5 * 365.25 * 24 * 3600 * 1000).toISOString().split('T')[0],
          download_filename: data.download_filename,
          status: 'local' as const,
        };
        addEUDRRecord(record);

        // Descargar JSON automáticamente
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
    if (!selectedLote || !recordActual) return;
    setEnviando(true);
    try {
      const res = await fetch('/api/eudr/traces-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referencia_local: recordActual.referencia_traces,
          lote_id: selectedLote.id,
          operador_nombre: 'Green Origin SL',
          operador_eori: 'ESB-12345678',
          operador_pais: 'ES',
          caficultor_nombre: selectedLote.caficultor_nombre,
          pais_origen: selectedLote.pais,
          gps_lat: selectedLote.gps_lat,
          gps_lng: selectedLote.gps_lng,
          kilos: selectedLote.kilos_disponibles,
          fecha_cosecha: selectedLote.fecha_cosecha,
          variedad: selectedLote.variedad,
        }),
      });
      const data = await res.json();
      if (data.success) {
        updateEUDRRecordStatus(recordActual.id, data.traces_nt_reference, data.status);
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: selectedLote ? '1fr 1fr' : '1fr', gap: '2rem' }}>
      {/* Left: lista de lotes */}
      <div>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontWeight: 900, fontSize: '1.6rem', margin: 0 }}>Lotes · Estado EUDR</h1>
          <p style={{ color: '#C49A6C', marginTop: '0.5rem', marginBottom: 0 }}>
            Haz clic en un lote para ver los 12 requisitos · <span style={{ color: '#8B5E3C' }}>{eudrRecords.length} declaración(es) guardada(s)</span>
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {MOCK_LOTES.map((lote) => {
            const statusColor = getEUDRStatusColor(lote.eudr_status);
            const statusLabel = getEUDRStatusLabel(lote.eudr_status);
            const isSelected = selectedLote?.id === lote.id;
            const record = eudrRecords.find(r => r.lote_id === lote.id);
            return (
              <div
                key={lote.id}
                onClick={() => setSelectedLote(lote)}
                style={{ background: isSelected ? 'rgba(139,94,60,0.15)' : '#3B1F08', border: `1px solid ${isSelected ? '#8B5E3C' : 'rgba(196,154,108,0.15)'}`, borderRadius: 10, padding: '1rem', cursor: 'pointer', transition: 'all 0.15s' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{lote.variedad} · {lote.region}, {lote.pais}</div>
                    <div style={{ fontSize: '0.78rem', color: '#C49A6C' }}>{lote.caficultor_nombre} · {lote.kilos_disponibles} kg</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: statusColor, background: `${statusColor}18`, border: `1px solid ${statusColor}`, borderRadius: 100, padding: '0.2rem 0.6rem' }}>
                      {lote.eudr_status === 'green' ? '🟢' : lote.eudr_status === 'amber' ? '🟡' : '🔴'} {lote.eudr_compliance_pct}%
                    </span>
                    {record && (
                      <span style={{ fontSize: '0.65rem', color: record.status === 'submitted' ? '#4ADE80' : '#C49A6C', background: record.status === 'submitted' ? 'rgba(27,94,48,0.2)' : 'rgba(139,94,60,0.15)', borderRadius: 100, padding: '0.15rem 0.5rem', border: `1px solid ${record.status === 'submitted' ? 'rgba(74,222,128,0.3)' : 'rgba(139,94,60,0.3)'}` }}>
                        {record.status === 'submitted' ? '✓ TRACES NT' : '📄 Local'}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: statusColor }}>{statusLabel}</div>
                  <Link
                    href={`/m02/eudr/${lote.id}`}
                    onClick={e => e.stopPropagation()}
                    style={{ fontSize: '0.72rem', color: '#8B5E3C', textDecoration: 'none', padding: '0.2rem 0.5rem', border: '1px solid rgba(196,154,108,0.2)', borderRadius: 6 }}
                  >
                    Ver detalle →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: detalle */}
      {selectedLote && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.2rem', margin: 0 }}>{selectedLote.variedad} — {selectedLote.region}</h2>
            <button onClick={() => setSelectedLote(null)} style={{ background: 'none', border: 'none', color: '#C49A6C', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
          </div>

          <EUDRSemaforo validation={validateEUDR(loteToEUDRData(selectedLote))} />

          {/* Estado de declaración persistida */}
          {recordActual ? (
            <div style={{ marginTop: '1rem', background: 'rgba(27,94,48,0.12)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 12, padding: '1rem' }}>
              <div style={{ color: '#4ADE80', fontWeight: 700, marginBottom: '0.6rem', fontSize: '0.9rem' }}>
                ✅ Declaración generada · guardada en esta sesión
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#C49A6C', marginBottom: '0.25rem' }}>
                Local: {recordActual.referencia_traces}
              </div>
              {recordActual.traces_nt_reference && (
                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#4ADE80', marginBottom: '0.25rem' }}>
                  TRACES NT: {recordActual.traces_nt_reference}
                </div>
              )}
              {recordActual.traces_status && (
                <div style={{ fontSize: '0.72rem', color: '#4ADE80', marginBottom: '0.25rem' }}>
                  Estado TRACES: {recordActual.traces_status}
                </div>
              )}
              <div style={{ fontSize: '0.7rem', color: '#8B5E3C' }}>
                Archivo hasta: {recordActual.archived_until} · Art. 9 Reg. (UE) 2023/1115
              </div>

              {/* Botón enviar a TRACES NT */}
              {recordActual.status === 'local' && (
                <button
                  onClick={enviarTracesNT}
                  disabled={enviando}
                  style={{ marginTop: '0.75rem', width: '100%', background: enviando ? 'rgba(26,46,92,0.5)' : '#1A2E5C', color: '#FBF6EE', padding: '0.65rem', borderRadius: 8, border: 'none', cursor: enviando ? 'wait' : 'pointer', fontWeight: 700, fontSize: '0.85rem' }}
                >
                  {enviando ? '⏳ Enviando a TRACES NT...' : '🚢 Enviar a TRACES NT (EU)'}
                </button>
              )}

              <button
                onClick={() => { addEUDRRecord({ ...recordActual, id: `eudr-${selectedLote.id}-${Date.now()}`, status: 'local', traces_nt_reference: undefined, traces_status: undefined }); generarDeclaracion(); }}
                style={{ marginTop: '0.5rem', width: '100%', background: 'none', border: '1px solid rgba(196,154,108,0.2)', color: '#8B5E3C', padding: '0.5rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.78rem' }}
              >
                Generar nueva versión
              </button>
            </div>
          ) : (
            selectedLote.eudr_status === 'green' && (
              <button
                onClick={generarDeclaracion}
                disabled={generando}
                style={{ width: '100%', marginTop: '1rem', background: generando ? '#1B5E3080' : '#1B5E30', color: 'white', padding: '0.875rem', borderRadius: 10, border: 'none', cursor: generando ? 'wait' : 'pointer', fontWeight: 700, fontSize: '0.95rem' }}
              >
                {generando ? '⏳ Generando...' : '📄 Generar Declaración TRACES (1 clic)'}
              </button>
            )
          )}

          <Link
            href={`/m02/eudr/${selectedLote.id}`}
            style={{ display: 'block', marginTop: '0.75rem', textAlign: 'center', color: '#C49A6C', fontSize: '0.82rem', textDecoration: 'none', padding: '0.5rem', border: '1px solid rgba(196,154,108,0.15)', borderRadius: 8 }}
          >
            Ver página completa →
          </Link>
        </div>
      )}
    </div>
  );
}
