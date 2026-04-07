'use client';

import { useMemo } from 'react';
import { Lote } from '@/lib/types/lote';
import { BlendComponente } from '@/lib/types/producto';
import {
  calculateBlendEUDR,
  validateBlendPorcentajes,
  eudrStatusBadge,
} from '@/lib/services/s_blend';

interface BlendBuilderProps {
  lotes: Lote[];
  value: BlendComponente[];
  onChange: (componentes: BlendComponente[]) => void;
}

export default function BlendBuilder({ lotes, value, onChange }: BlendBuilderProps) {
  const validacion = validateBlendPorcentajes(value);

  const preview = useMemo(() => {
    if (value.length === 0) return null;
    return calculateBlendEUDR(value, lotes);
  }, [value, lotes]);

  const addComponente = () => {
    onChange([...value, { lote_id: '', porcentaje: 0 }]);
  };

  const removeComponente = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const updateLote = (idx: number, lote_id: string) => {
    const next = value.map((c, i) => (i === idx ? { ...c, lote_id } : c));
    onChange(next);
  };

  const updatePorcentaje = (idx: number, raw: string) => {
    const porcentaje = parseFloat(raw) || 0;
    const next = value.map((c, i) => (i === idx ? { ...c, porcentaje } : c));
    onChange(next);
  };

  const totalPct = value.reduce((s, c) => s + c.porcentaje, 0);
  const totalOk = Math.abs(totalPct - 100) <= 0.5;

  const badge = preview ? eudrStatusBadge(preview.eudr_status) : null;

  return (
    <div
      style={{
        background: '#3B1F08',
        border: '1px solid rgba(196,154,108,0.3)',
        borderRadius: 12,
        padding: '1.25rem',
        color: '#FBF6EE',
      }}
    >
      {/* Header */}
      <div
        style={{
          fontSize: '0.72rem',
          color: '#C49A6C',
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginBottom: '1rem',
          fontWeight: 700,
        }}
      >
        Componentes del Blend
      </div>

      {/* Filas de componentes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
        {value.map((comp, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {/* Selector de lote */}
            <select
              value={comp.lote_id}
              onChange={(e) => updateLote(idx, e.target.value)}
              style={{
                flex: 1,
                background: 'rgba(0,0,0,0.35)',
                border: '1px solid rgba(196,154,108,0.25)',
                borderRadius: 8,
                color: comp.lote_id ? '#FBF6EE' : '#8B5E3C',
                padding: '0.5rem 0.75rem',
                fontSize: '0.82rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="" disabled style={{ color: '#8B5E3C' }}>
                — Seleccionar lote —
              </option>
              {lotes.map((lote) => (
                <option key={lote.id} value={lote.id} style={{ color: '#FBF6EE', background: '#3B1F08' }}>
                  {lote.variedad} · {lote.pais} · {lote.kilos_disponibles} kg
                </option>
              ))}
            </select>

            {/* Input porcentaje */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={comp.porcentaje || ''}
                onChange={(e) => updatePorcentaje(idx, e.target.value)}
                placeholder="0"
                style={{
                  width: 72,
                  background: 'rgba(0,0,0,0.35)',
                  border: '1px solid rgba(196,154,108,0.25)',
                  borderRadius: 8,
                  color: '#FBF6EE',
                  padding: '0.5rem 0.5rem',
                  fontSize: '0.82rem',
                  textAlign: 'right',
                  outline: 'none',
                }}
              />
              <span style={{ color: '#C49A6C', fontSize: '0.82rem', minWidth: 16 }}>%</span>
            </div>

            {/* Botón eliminar */}
            <button
              onClick={() => removeComponente(idx)}
              style={{
                background: 'rgba(220,38,38,0.12)',
                border: '1px solid rgba(220,38,38,0.3)',
                borderRadius: 8,
                color: '#fca5a5',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1rem',
                flexShrink: 0,
              }}
              title="Eliminar componente"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Botón Agregar origen */}
      <button
        onClick={addComponente}
        style={{
          background: 'rgba(196,154,108,0.1)',
          border: '1px dashed rgba(196,154,108,0.4)',
          borderRadius: 8,
          color: '#C49A6C',
          padding: '0.5rem 1rem',
          fontSize: '0.82rem',
          cursor: 'pointer',
          fontWeight: 600,
          width: '100%',
          marginBottom: '1rem',
        }}
      >
        + Agregar origen
      </button>

      {/* Barra de validación */}
      {value.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: totalOk ? 'rgba(27,94,48,0.2)' : 'rgba(220,38,38,0.1)',
            border: `1px solid ${totalOk ? 'rgba(74,222,128,0.3)' : 'rgba(220,38,38,0.3)'}`,
            borderRadius: 8,
            padding: '0.6rem 0.9rem',
            marginBottom: '1rem',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: totalOk ? '#4ADE80' : '#fca5a5', fontWeight: 600 }}>
            {totalOk ? '✓ Porcentajes correctos' : validacion.error ?? `Suma: ${totalPct.toFixed(1)}%`}
          </span>
          <span
            style={{
              fontSize: '1rem',
              fontWeight: 900,
              color: totalOk ? '#4ADE80' : '#fca5a5',
            }}
          >
            {totalPct.toFixed(1)}%
          </span>
        </div>
      )}

      {/* Preview en tiempo real */}
      {preview && totalOk && (
        <div
          style={{
            background: 'rgba(0,0,0,0.25)',
            border: '1px solid rgba(196,154,108,0.15)',
            borderRadius: 10,
            padding: '0.9rem 1rem',
          }}
        >
          <div
            style={{
              fontSize: '0.7rem',
              color: '#8B5E3C',
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: '0.6rem',
              fontWeight: 700,
            }}
          >
            Preview del blend
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {/* EUDR Badge */}
            {badge && (
              <div
                style={{
                  background: badge.bg,
                  border: `1px solid ${badge.border}`,
                  borderRadius: 100,
                  padding: '0.3rem 0.75rem',
                  color: badge.color,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                {badge.icon} {badge.label}
              </div>
            )}

            {/* Cupping score */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '0.65rem', color: '#8B5E3C', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                Cupping
              </span>
              <span style={{ fontWeight: 900, color: '#C49A6C', fontSize: '1rem' }}>
                {preview.cupping_score_blend.toFixed(1)} pts
              </span>
            </div>

            {/* Precio FOB */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '0.65rem', color: '#8B5E3C', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                FOB base
              </span>
              <span style={{ fontWeight: 900, color: '#FBF6EE', fontSize: '1rem' }}>
                €{preview.precio_fob_base.toFixed(2)}/kg
              </span>
            </div>

            {/* Compliance */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '0.65rem', color: '#8B5E3C', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                EUDR %
              </span>
              <span style={{ fontWeight: 900, color: preview.blend_compliance_pct === 100 ? '#4ADE80' : '#fbbf24', fontSize: '1rem' }}>
                {preview.blend_compliance_pct}%
              </span>
            </div>
          </div>

          {/* Warning si hay alguno */}
          {preview.warning && (
            <div
              style={{
                marginTop: '0.6rem',
                fontSize: '0.75rem',
                color: '#fbbf24',
                background: 'rgba(217,119,6,0.1)',
                borderRadius: 6,
                padding: '0.4rem 0.6rem',
              }}
            >
              ⚠ {preview.warning}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
