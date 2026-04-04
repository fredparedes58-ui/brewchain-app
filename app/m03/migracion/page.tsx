'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { parseCropsterCSV, parseCropsterAlog, mapToLoteTostado, mapToPerfilTueste } from '@/lib/services/s_cropster';
import { useComercialStore } from '@/lib/stores/comercialStore';
import { CropsterCSVRow } from '@/lib/types/tostado';

type ImportMode = 'lotes' | 'perfiles' | 'ambos';
type ImportStage = 'idle' | 'parsing' | 'preview' | 'saving' | 'done' | 'error';

const NIVEL_ICON = { claro: '☀️', medio: '🌤️', oscuro: '🌑' };

export default function MigracionCropsterPage() {
  const { addLoteTostado, addPerfilTueste } = useComercialStore();

  const [dragging, setDragging] = useState(false);
  const [stage, setStage] = useState<ImportStage>('idle');
  const [importMode, setImportMode] = useState<ImportMode>('ambos');
  const [rows, setRows] = useState<CropsterCSVRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  const [savedCount, setSavedCount] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setFileName(file.name);
    setStage('parsing');
    setErrors([]);

    try {
      const text = await file.text();
      const isAlog = file.name.endsWith('.alog') || file.name.endsWith('.json');
      const result = isAlog ? parseCropsterAlog(text) : parseCropsterCSV(text);

      if (result.errors.length > 0 && result.rows.length === 0) {
        setErrors(result.errors);
        setStage('error');
        return;
      }

      setErrors(result.errors); // puede haber warnings parciales
      setRows(result.rows);
      setStage('preview');
    } catch (e: unknown) {
      setErrors([`Error al leer archivo: ${e instanceof Error ? e.message : 'desconocido'}`]);
      setStage('error');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleImportar = () => {
    setStage('saving');
    let count = 0;

    for (const row of rows) {
      try {
        if (importMode === 'lotes' || importMode === 'ambos') {
          const lote = mapToLoteTostado(row);
          addLoteTostado({ ...lote, id: `lt-cropster-${row.batch_id}-${Date.now()}-${count}` });
          count++;
        }
        if (importMode === 'perfiles' || importMode === 'ambos') {
          const perfil = mapToPerfilTueste(row);
          addPerfilTueste({ ...perfil, id: `pf-cropster-${row.batch_id}-${Date.now()}-${count}` });
          if (importMode === 'perfiles') count++;
        }
      } catch {
        // skip row silently
      }
    }

    setSavedCount(count);
    setStage('done');
  };

  const resetear = () => {
    setStage('idle');
    setRows([]);
    setErrors([]);
    setFileName('');
    setSavedCount(0);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Link href="/m03" style={{ color: '#8B5E3C', textDecoration: 'none', fontSize: '1.2rem' }}>←</Link>
        <div>
          <h1 style={{ fontWeight: 900, fontSize: '1.5rem', margin: 0 }}>Migración desde Cropster</h1>
          <div style={{ fontSize: '0.72rem', color: '#8B5E3C', letterSpacing: 1, marginTop: 2 }}>M03 · TOSTADURIA · IMPORTACIÓN CSV / ALOG</div>
        </div>
      </div>

      {/* Ventaja competitiva */}
      <div style={{ background: 'rgba(27,94,48,0.08)', border: '1px solid rgba(27,94,48,0.3)', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ fontWeight: 700, color: '#4ADE80', marginBottom: '0.4rem', fontSize: '0.88rem' }}>¿Por qué migrar desde Cropster?</div>
        <div style={{ color: '#C49A6C', fontSize: '0.78rem', lineHeight: 1.7 }}>
          Cropster post-PE Verdane: precios punitivos para micro-tostadores · BREW CHAIN: precio flat + QR trazabilidad + marketplace · Soportamos tu historial .CSV (v10.x) y .alog (JSON)
        </div>
      </div>

      {/* STAGE: idle */}
      {stage === 'idle' && (
        <div>
          {/* Modo de importación */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#C49A6C', marginBottom: '0.5rem' }}>¿Qué quieres importar?</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {([
                { k: 'ambos', l: 'Lotes + Perfiles' },
                { k: 'lotes', l: 'Solo lotes tostados' },
                { k: 'perfiles', l: 'Solo perfiles de tueste' },
              ] as { k: ImportMode; l: string }[]).map(({ k, l }) => (
                <button
                  key={k}
                  onClick={() => setImportMode(k)}
                  style={{
                    background: importMode === k ? '#8B5E3C' : 'rgba(59,31,8,0.6)',
                    color: importMode === k ? '#FBF6EE' : '#C49A6C',
                    border: `1px solid ${importMode === k ? '#8B5E3C' : 'rgba(196,154,108,0.2)'}`,
                    borderRadius: 8,
                    padding: '0.4rem 0.85rem',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    fontWeight: importMode === k ? 700 : 400,
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Drop zone */}
          <label
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            style={{
              display: 'block',
              background: dragging ? 'rgba(139,94,60,0.15)' : 'rgba(59,31,8,0.6)',
              border: `2px dashed ${dragging ? '#8B5E3C' : 'rgba(196,154,108,0.3)'}`,
              borderRadius: 16,
              padding: '3rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: '1rem',
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📂</div>
            <div style={{ fontWeight: 700, color: '#FBF6EE', marginBottom: '0.3rem' }}>Arrastra tu archivo Cropster</div>
            <div style={{ color: '#C49A6C', fontSize: '0.82rem' }}>o haz clic para seleccionar · .csv (v10.x) o .alog (JSON)</div>
            <input ref={fileRef} type="file" accept=".csv,.alog,.json" onChange={handleInputChange} style={{ display: 'none' }} />
          </label>

          <div style={{ background: 'rgba(59,31,8,0.4)', borderRadius: 10, padding: '0.85rem 1rem', border: '1px solid rgba(196,154,108,0.1)', fontSize: '0.78rem', color: '#8B5E3C' }}>
            <strong style={{ color: '#C49A6C' }}>Columnas CSV soportadas:</strong> Date, Batch ID, Green Coffee, Roast Color, Charge Temperature, First Crack Time, End Temperature, Weight In, Weight Out, Total Roast Time
          </div>
        </div>
      )}

      {/* STAGE: parsing */}
      {stage === 'parsing' && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏳</div>
          <div style={{ fontWeight: 700 }}>Parseando {fileName}...</div>
          <div style={{ color: '#C49A6C', fontSize: '0.85rem', marginTop: '0.5rem' }}>Detectando columnas y mapeando datos</div>
        </div>
      )}

      {/* STAGE: error */}
      {stage === 'error' && (
        <div>
          <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
            <div style={{ fontWeight: 700, color: '#f87171', marginBottom: '0.5rem' }}>❌ Error al procesar el archivo</div>
            {errors.map((e, i) => <div key={i} style={{ fontSize: '0.82rem', color: '#fca5a5' }}>{e}</div>)}
          </div>
          <button onClick={resetear} style={{ background: '#8B5E3C', color: '#FBF6EE', border: 'none', borderRadius: 10, padding: '0.75rem 1.5rem', cursor: 'pointer', fontWeight: 700 }}>
            Intentar con otro archivo
          </button>
        </div>
      )}

      {/* STAGE: preview */}
      {stage === 'preview' && (
        <div>
          <div style={{ background: 'rgba(27,94,48,0.1)', border: '1px solid rgba(27,94,48,0.3)', borderRadius: 12, padding: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>📋</span>
            <div>
              <div style={{ fontWeight: 700, color: '#4ADE80' }}>{rows.length} registros detectados en {fileName}</div>
              <div style={{ fontSize: '0.78rem', color: '#86efac' }}>
                Revisa la vista previa · Modo: <strong>{importMode === 'ambos' ? 'Lotes + Perfiles' : importMode === 'lotes' ? 'Solo lotes' : 'Solo perfiles'}</strong>
              </div>
            </div>
          </div>

          {errors.length > 0 && (
            <div style={{ background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.25)', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 600, marginBottom: '0.25rem' }}>⚠️ Advertencias ({errors.length})</div>
              {errors.map((e, i) => <div key={i} style={{ fontSize: '0.72rem', color: '#fde68a' }}>{e}</div>)}
            </div>
          )}

          {/* Preview tabla */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 400, overflowY: 'auto', marginBottom: '1.25rem' }}>
            {rows.map((row, i) => {
              const nivel = row.roast_color?.toLowerCase().includes('light') ? 'claro'
                : row.roast_color?.toLowerCase().includes('dark') ? 'oscuro' : 'medio';
              return (
                <div key={i} style={{ background: 'linear-gradient(135deg, rgba(59,31,8,0.95) 0%, rgba(26,13,5,0.98) 100%)', border: '1px solid rgba(196,154,108,0.1)', borderRadius: 10, padding: '0.85rem 1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#FBF6EE', marginBottom: '0.15rem' }}>
                        {row.green_coffee || 'Sin nombre'} <span style={{ color: '#8B5E3C', fontWeight: 400, fontSize: '0.8rem' }}>· {row.batch_id}</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#8B5E3C', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {row.date && <span>📅 {row.date}</span>}
                        {row.weight_in_kg && <span>⚖️ {row.weight_in_kg}kg</span>}
                        {row.weight_out_kg && <span>→ {row.weight_out_kg}kg</span>}
                        {row.end_temperature && <span>🌡️ {row.end_temperature}°C</span>}
                        {row.total_roast_time && <span>⏱️ {row.total_roast_time}</span>}
                      </div>
                    </div>
                    <span style={{ background: 'rgba(139,94,60,0.15)', color: '#C49A6C', border: '1px solid rgba(196,154,108,0.2)', borderRadius: 100, padding: '0.15rem 0.5rem', fontSize: '0.68rem', flexShrink: 0, whiteSpace: 'nowrap' }}>
                      {NIVEL_ICON[nivel as keyof typeof NIVEL_ICON] || '🌤️'} {row.roast_color}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={resetear}
              style={{ background: 'rgba(59,31,8,0.6)', color: '#C49A6C', border: '1px solid rgba(196,154,108,0.2)', borderRadius: 10, padding: '0.75rem 1.25rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' }}
            >
              Cancelar
            </button>
            <button
              onClick={handleImportar}
              style={{ flex: 1, background: '#8B5E3C', color: '#FBF6EE', border: 'none', borderRadius: 10, padding: '0.75rem', cursor: 'pointer', fontWeight: 800, fontSize: '0.95rem' }}
            >
              ✅ Importar {rows.length} registros a BREWCHAIN
            </button>
          </div>
        </div>
      )}

      {/* STAGE: saving */}
      {stage === 'saving' && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💾</div>
          <div style={{ fontWeight: 700 }}>Guardando en BREWCHAIN...</div>
        </div>
      )}

      {/* STAGE: done */}
      {stage === 'done' && (
        <div>
          <div style={{ background: 'rgba(27,94,48,0.12)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 14, padding: '1.5rem', textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎉</div>
            <div style={{ fontWeight: 900, fontSize: '1.2rem', color: '#4ADE80', marginBottom: '0.4rem' }}>
              ¡{savedCount} registros importados con éxito!
            </div>
            <div style={{ fontSize: '0.82rem', color: '#86efac' }}>
              Disponibles en Historial de Lotes Tostados · Sin pérdida de datos
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link
              href="/m03/historial"
              style={{ flex: 1, background: '#1B5E30', color: '#FBF6EE', borderRadius: 10, padding: '0.875rem', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', textAlign: 'center', display: 'block' }}
            >
              Ver Historial →
            </Link>
            <button
              onClick={resetear}
              style={{ flex: 1, background: 'rgba(59,31,8,0.6)', color: '#C49A6C', border: '1px solid rgba(196,154,108,0.2)', borderRadius: 10, padding: '0.875rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}
            >
              Importar otro archivo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
