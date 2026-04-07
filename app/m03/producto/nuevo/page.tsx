'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MOCK_LOTES } from '@/lib/mock/lotes';
import { BlendComponente, CategoriaMarketplace, Producto } from '@/lib/types/producto';
import BlendBuilder from '@/components/brewchain/BlendBuilder';
import {
  calculateBlendEUDR,
  validateBlendPorcentajes,
  eudrStatusBadge,
} from '@/lib/services/s_blend';
import { useAuthStore } from '@/lib/stores/authStore';

const CATEGORIAS: { value: CategoriaMarketplace; label: string; emoji: string }[] = [
  { value: 'b2b_granel', label: 'B2B Granel', emoji: '🏭' },
  { value: 'capsula', label: 'Cápsulas', emoji: '💊' },
  { value: 'lote_tostado', label: 'Lote Tostado', emoji: '☕' },
  { value: 'suscripcion', label: 'Suscripción', emoji: '📦' },
];

const UNIDADES: Record<CategoriaMarketplace, string[]> = {
  b2b_granel: ['saco 25 kg', 'saco 60 kg', 'saco 10 kg', 'kg'],
  capsula: ['caja 10 cápsulas', 'caja 50 cápsulas', 'caja 100 cápsulas'],
  lote_tostado: ['250 g', '500 g', '1 kg', 'saco 5 kg'],
  suscripcion: ['/mes', '/semana · 3kg', '/trimestre'],
  lote_verde: ['kg', 'saco 60 kg'],
  accesorio: ['unidad', 'kit'],
};

type EudrStatus = 'green' | 'amber' | 'red';

interface FormState {
  categoria: CategoriaMarketplace;
  nombre: string;
  descripcion: string;
  precio: string;
  unidad: string;
  imagen_emoji: string;
  is_blend: boolean;
  blend_componentes: BlendComponente[];
  lote_unico_id: string;
}

const DEFAULT_FORM: FormState = {
  categoria: 'b2b_granel',
  nombre: '',
  descripcion: '',
  precio: '',
  unidad: 'saco 25 kg',
  imagen_emoji: '🏭',
  is_blend: false,
  blend_componentes: [],
  lote_unico_id: '',
};

function inputStyle(focused?: boolean) {
  return {
    width: '100%',
    background: 'rgba(0,0,0,0.35)',
    border: `1px solid ${focused ? 'rgba(196,154,108,0.6)' : 'rgba(196,154,108,0.25)'}`,
    borderRadius: 8,
    color: '#FBF6EE',
    padding: '0.6rem 0.75rem',
    fontSize: '0.88rem',
    outline: 'none',
    boxSizing: 'border-box' as const,
  };
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: '0.7rem',
        color: '#C49A6C',
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontWeight: 700,
        marginBottom: '0.75rem',
        paddingBottom: '0.4rem',
        borderBottom: '1px solid rgba(196,154,108,0.15)',
      }}
    >
      {children}
    </div>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: '#3B1F08',
        border: '1px solid rgba(196,154,108,0.15)',
        borderRadius: 12,
        padding: '1.25rem',
        marginBottom: '1.25rem',
      }}
    >
      {children}
    </div>
  );
}

export default function NuevoProductoPage() {
  const router = useRouter();
  const { nombre: userName, role } = useAuthStore();
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [publicado, setPublicado] = useState(false);
  const [productoCreado, setProductoCreado] = useState<Producto | null>(null);

  const set = (key: keyof FormState, val: unknown) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  // Calcular EUDR
  const eudrInfo = useMemo((): { status: EudrStatus; compliance: number; cupping?: number; fob?: number } => {
    if (form.is_blend) {
      if (form.blend_componentes.length === 0) return { status: 'amber', compliance: 0 };
      const v = validateBlendPorcentajes(form.blend_componentes);
      if (!v.valid) return { status: 'amber', compliance: 0 };
      const result = calculateBlendEUDR(form.blend_componentes, MOCK_LOTES);
      return {
        status: result.eudr_status,
        compliance: result.blend_compliance_pct,
        cupping: result.cupping_score_blend,
        fob: result.precio_fob_base,
      };
    } else {
      const lote = MOCK_LOTES.find((l) => l.id === form.lote_unico_id);
      if (!lote) return { status: 'amber', compliance: 0 };
      return {
        status: lote.eudr_status,
        compliance: lote.eudr_compliance_pct,
        cupping: lote.cupping_score,
        fob: lote.precio_fob,
      };
    }
  }, [form.is_blend, form.blend_componentes, form.lote_unico_id]);

  const canPublish = useMemo(() => {
    if (!form.nombre.trim() || !form.precio || !form.categoria) return false;
    if (form.is_blend) {
      if (form.blend_componentes.length === 0) return false;
      return validateBlendPorcentajes(form.blend_componentes).valid;
    } else {
      return !!form.lote_unico_id;
    }
  }, [form]);

  const handlePublish = () => {
    const id = `prod-${Date.now()}`;
    const producto: Producto = {
      id,
      nombre: form.nombre,
      descripcion: form.descripcion,
      categoria: form.categoria,
      precio: parseFloat(form.precio) || 0,
      unidad: form.unidad,
      imagen_emoji: form.imagen_emoji,
      vendedor_nombre: userName || 'Tostadería',
      vendedor_rol: (role as Producto['vendedor_rol']) ?? 'M03',
      disponible: true,
      fecha_creacion: new Date().toISOString(),
      cupping_score: eudrInfo.cupping,
      eudr_status: eudrInfo.status,
      is_blend: form.is_blend,
      blend_componentes: form.is_blend ? form.blend_componentes : undefined,
      blend_compliance_pct: form.is_blend ? eudrInfo.compliance : undefined,
    };
    setProductoCreado(producto);
    setPublicado(true);
  };

  const badge = eudrStatusBadge(eudrInfo.status);

  // ── ÉXITO ───────────────────────────────────────────────
  if (publicado && productoCreado) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: 'linear-gradient(135deg, #1a0a00 0%, #2d1507 100%)',
        }}
      >
        <div
          style={{
            maxWidth: 480,
            width: '100%',
            background: '#3B1F08',
            border: '1px solid rgba(74,222,128,0.4)',
            borderRadius: 16,
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>✅</div>
          <h2 style={{ color: '#4ADE80', fontWeight: 900, marginBottom: '0.5rem', fontSize: '1.4rem' }}>
            Producto publicado
          </h2>
          <div style={{ color: '#C49A6C', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            {productoCreado.nombre} · {productoCreado.categoria}
          </div>

          <div
            style={{
              background: 'rgba(0,0,0,0.25)',
              borderRadius: 10,
              padding: '1rem',
              marginBottom: '1.5rem',
              textAlign: 'left',
            }}
          >
            {[
              ['ID', productoCreado.id],
              ['Precio', `€${productoCreado.precio.toFixed(2)} / ${productoCreado.unidad}`],
              ['Vendedor', productoCreado.vendedor_nombre],
              ['EUDR', eudrInfo.status.toUpperCase()],
              ...(eudrInfo.cupping ? [['Cupping', `${eudrInfo.cupping.toFixed(1)} pts`]] : []),
              ...(eudrInfo.fob ? [['FOB base', `€${eudrInfo.fob.toFixed(2)}/kg`]] : []),
              ...(productoCreado.is_blend
                ? [['Blend', `${productoCreado.blend_componentes!.length} orígenes · ${eudrInfo.compliance}% compliance`]]
                : []),
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.3rem 0', borderBottom: '1px solid rgba(196,154,108,0.1)' }}>
                <span style={{ color: '#8B5E3C' }}>{k}</span>
                <span style={{ color: '#FBF6EE', fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link
              href="/m03"
              style={{
                flex: 1,
                background: 'rgba(196,154,108,0.15)',
                border: '1px solid rgba(196,154,108,0.3)',
                borderRadius: 8,
                color: '#C49A6C',
                padding: '0.7rem',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.82rem',
                textAlign: 'center',
                display: 'block',
              }}
            >
              ← Volver a M03
            </Link>
            <button
              onClick={() => { setPublicado(false); setForm(DEFAULT_FORM); setProductoCreado(null); }}
              style={{
                flex: 1,
                background: '#8B5E3C',
                border: 'none',
                borderRadius: 8,
                color: '#FBF6EE',
                padding: '0.7rem',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              + Nuevo producto
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── FORMULARIO ──────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a0a00 0%, #2d1507 100%)',
        padding: '2rem 1rem',
      }}
    >
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.78rem', color: '#8B5E3C' }}>
          <Link href="/m03" style={{ color: '#8B5E3C', textDecoration: 'none' }}>M03 · Tostaduria</Link>
          <span>/</span>
          <span style={{ color: '#C49A6C' }}>Nuevo Producto</span>
        </div>

        <h1 style={{ fontWeight: 900, fontSize: '1.6rem', marginBottom: '0.25rem', color: '#FBF6EE' }}>
          Nuevo Producto
        </h1>
        <p style={{ color: '#C49A6C', fontSize: '0.85rem', marginBottom: '1.75rem', margin: '0 0 1.75rem' }}>
          Publica un nuevo producto en el marketplace BREW CHAIN.
        </p>

        {/* ── SECCIÓN 1: TIPO ── */}
        <Section>
          <SectionTitle>1 · Tipo de producto</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
            {CATEGORIAS.map((cat) => {
              const active = form.categoria === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => {
                    set('categoria', cat.value);
                    set('imagen_emoji', cat.emoji);
                    const unidades = UNIDADES[cat.value];
                    set('unidad', unidades[0]);
                  }}
                  style={{
                    background: active ? 'rgba(139,94,60,0.4)' : 'rgba(0,0,0,0.2)',
                    border: `1px solid ${active ? '#8B5E3C' : 'rgba(196,154,108,0.2)'}`,
                    borderRadius: 8,
                    color: active ? '#FBF6EE' : '#C49A6C',
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontWeight: active ? 700 : 400,
                    fontSize: '0.85rem',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ marginRight: 6 }}>{cat.emoji}</span>
                  {cat.label}
                </button>
              );
            })}
          </div>
        </Section>

        {/* ── SECCIÓN 2: INFO BÁSICA ── */}
        <Section>
          <SectionTitle>2 · Información básica</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#C49A6C', display: 'block', marginBottom: 4 }}>Nombre del producto *</label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => set('nombre', e.target.value)}
                placeholder="Ej. Blend Espresso House · 25kg"
                style={inputStyle()}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#C49A6C', display: 'block', marginBottom: 4 }}>Descripción</label>
              <textarea
                value={form.descripcion}
                onChange={(e) => set('descripcion', e.target.value)}
                placeholder="Notas de sabor, perfil, uso recomendado…"
                rows={3}
                style={{ ...inputStyle(), resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#C49A6C', display: 'block', marginBottom: 4 }}>Precio (€) *</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.precio}
                  onChange={(e) => set('precio', e.target.value)}
                  placeholder="0.00"
                  style={inputStyle()}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#C49A6C', display: 'block', marginBottom: 4 }}>Unidad</label>
                <select
                  value={form.unidad}
                  onChange={(e) => set('unidad', e.target.value)}
                  style={{ ...inputStyle(), cursor: 'pointer' }}
                >
                  {(UNIDADES[form.categoria] ?? ['unidad']).map((u) => (
                    <option key={u} value={u} style={{ background: '#3B1F08' }}>{u}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Section>

        {/* ── SECCIÓN 3: ORIGEN ── */}
        <Section>
          <SectionTitle>3 · Origen del café</SectionTitle>

          {/* Toggle blend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <button
              onClick={() => set('is_blend', !form.is_blend)}
              style={{
                width: 44,
                height: 24,
                borderRadius: 100,
                background: form.is_blend ? '#8B5E3C' : 'rgba(196,154,108,0.2)',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.2s',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 3,
                  left: form.is_blend ? 22 : 3,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#FBF6EE',
                  transition: 'left 0.2s',
                }}
              />
            </button>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FBF6EE' }}>
                {form.is_blend ? '¿Es un blend multi-origen?' : '¿Es un blend multi-origen?'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#8B5E3C' }}>
                {form.is_blend ? 'Blend activo — configura los componentes abajo' : 'Desactivado — selecciona un lote único'}
              </div>
            </div>
          </div>

          {form.is_blend ? (
            <BlendBuilder
              lotes={MOCK_LOTES}
              value={form.blend_componentes}
              onChange={(componentes) => set('blend_componentes', componentes)}
            />
          ) : (
            <div>
              <label style={{ fontSize: '0.75rem', color: '#C49A6C', display: 'block', marginBottom: 4 }}>Lote origen *</label>
              <select
                value={form.lote_unico_id}
                onChange={(e) => set('lote_unico_id', e.target.value)}
                style={{ ...inputStyle(), cursor: 'pointer' }}
              >
                <option value="" disabled style={{ color: '#8B5E3C' }}>— Seleccionar lote —</option>
                {MOCK_LOTES.map((lote) => (
                  <option key={lote.id} value={lote.id} style={{ background: '#3B1F08', color: '#FBF6EE' }}>
                    {lote.variedad} · {lote.pais} · {lote.kilos_disponibles} kg
                  </option>
                ))}
              </select>
            </div>
          )}
        </Section>

        {/* ── SECCIÓN 4: EUDR STATUS ── */}
        <Section>
          <SectionTitle>4 · EUDR Status (calculado)</SectionTitle>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div
              style={{
                background: badge.bg,
                border: `1px solid ${badge.border}`,
                borderRadius: 100,
                padding: '0.4rem 1rem',
                color: badge.color,
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {badge.icon} {badge.label}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#8B5E3C' }}>
              Compliance: <span style={{ color: eudrInfo.compliance === 100 ? '#4ADE80' : '#fbbf24', fontWeight: 700 }}>{eudrInfo.compliance}%</span>
            </div>
            {eudrInfo.cupping != null && (
              <div style={{ fontSize: '0.8rem', color: '#8B5E3C' }}>
                Cupping: <span style={{ color: '#C49A6C', fontWeight: 700 }}>{eudrInfo.cupping.toFixed(1)} pts</span>
              </div>
            )}
            {eudrInfo.fob != null && (
              <div style={{ fontSize: '0.8rem', color: '#8B5E3C' }}>
                FOB base: <span style={{ color: '#FBF6EE', fontWeight: 700 }}>€{eudrInfo.fob.toFixed(2)}/kg</span>
              </div>
            )}
          </div>
          <div style={{ marginTop: '0.6rem', fontSize: '0.72rem', color: '#8B5E3C' }}>
            El status EUDR se calcula automáticamente según la normativa CE 2023/1115. Un solo origen no conforme hace el blend no conforme.
          </div>
        </Section>

        {/* ── SECCIÓN 5: CONFIRMAR ── */}
        <Section>
          <SectionTitle>5 · Confirmar y publicar</SectionTitle>
          {/* Resumen */}
          <div
            style={{
              background: 'rgba(0,0,0,0.2)',
              borderRadius: 8,
              padding: '0.9rem 1rem',
              marginBottom: '1rem',
              fontSize: '0.82rem',
            }}
          >
            {[
              ['Categoría', CATEGORIAS.find((c) => c.value === form.categoria)?.label ?? form.categoria],
              ['Nombre', form.nombre || '—'],
              ['Precio', form.precio ? `€${parseFloat(form.precio).toFixed(2)} / ${form.unidad}` : '—'],
              ['Origen', form.is_blend ? `Blend · ${form.blend_componentes.length} orígenes` : (MOCK_LOTES.find((l) => l.id === form.lote_unico_id)?.variedad ?? '—')],
              ['EUDR', `${eudrInfo.status.toUpperCase()} · ${eudrInfo.compliance}% compliance`],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid rgba(196,154,108,0.08)', color: '#C49A6C' }}>
                <span style={{ color: '#8B5E3C' }}>{k}</span>
                <span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handlePublish}
            disabled={!canPublish}
            style={{
              width: '100%',
              background: canPublish ? '#8B5E3C' : 'rgba(139,94,60,0.25)',
              border: 'none',
              borderRadius: 10,
              color: canPublish ? '#FBF6EE' : '#5a3a20',
              padding: '0.9rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: canPublish ? 'pointer' : 'not-allowed',
              transition: 'all 0.15s',
            }}
          >
            {canPublish ? '🚀 Publicar en marketplace' : 'Completa los campos requeridos'}
          </button>
        </Section>
      </div>
    </div>
  );
}
