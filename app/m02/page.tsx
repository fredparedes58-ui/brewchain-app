'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MOCK_LOTES } from '@/lib/mock/lotes';
import { useAuthStore } from '@/lib/stores/authStore';

export default function M02Dashboard() {
  const { nombre } = useAuthStore();
  const verde = MOCK_LOTES.filter(l => l.eudr_status === 'green').length;
  const amber = MOCK_LOTES.filter(l => l.eudr_status === 'amber').length;
  const rojo = MOCK_LOTES.filter(l => l.eudr_status === 'red').length;

  return (
    <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.75rem', color: '#C49A6C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.5rem' }}>M02 · Importadora · EUDR Dashboard</div>
        <h1 style={{ fontWeight: 900, fontSize: '1.8rem', margin: 0 }}>Dashboard EUDR</h1>
        <p style={{ color: '#C49A6C', marginTop: '0.5rem', marginBottom: 0 }}>Reglamento EU 2023/1115 · {MOCK_LOTES.length} lotes en seguimiento</p>
      </div>

      {/* EUDR Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { color: '#1B5E30', label: 'EUDR Compliant', value: verde, emoji: '🟢', desc: '12/12 requisitos' },
          { color: '#D97706', label: 'Datos incompletos', value: amber, emoji: '🟡', desc: '9-11/12 requisitos' },
          { color: '#DC2626', label: 'Sin GPS — Bloqueado', value: rojo, emoji: '🔴', desc: 'No exportable EU' },
        ].map(({ color, label, value, emoji, desc }) => (
          <div key={label} style={{ background: '#3B1F08', borderRadius: 12, padding: '1.25rem', border: `1px solid ${color}30` }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{emoji}</div>
            <div style={{ fontWeight: 900, fontSize: '2rem', color }}>{value}</div>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#FBF6EE', marginTop: 2 }}>{label}</div>
            <div style={{ fontSize: '0.72rem', color: '#8B5E3C' }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* Deadline EUDR */}
      <div style={{ background: 'rgba(26,46,92,0.2)', border: '1px solid #1A2E5C', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ fontWeight: 700, color: '#93c5fd', marginBottom: '0.5rem' }}>🇪🇺 Plazos EUDR</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div><div style={{ fontSize: '0.75rem', color: '#C49A6C' }}>Grandes operadores ({'>'}250 emp.)</div><div style={{ fontWeight: 700, color: '#fca5a5' }}>30 dic 2025 — ¡Ya activo!</div></div>
          <div><div style={{ fontSize: '0.75rem', color: '#C49A6C' }}>PYMEs</div><div style={{ fontWeight: 700, color: '#fde68a' }}>30 jun 2026</div></div>
        </div>
        <div style={{ fontSize: '0.8rem', color: '#8B5E3C', marginTop: '0.75rem' }}>Penalización: hasta el 4% del volumen de negocio anual en la UE</div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Link href="/m02/eudr" style={{ background: '#1A2E5C', borderRadius: 12, padding: '1.25rem', textDecoration: 'none', color: '#FBF6EE', border: '1px solid rgba(147,197,253,0.2)', display: 'block' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📋</div>
          <div style={{ fontWeight: 700 }}>Ver lotes por estado EUDR</div>
          <div style={{ fontSize: '0.8rem', color: '#93c5fd', marginTop: 4 }}>{rojo > 0 ? `⚠️ ${rojo} lote(s) bloqueado(s)` : '✓ Sin bloqueos críticos'}</div>
        </Link>
        <Link href="/m02/wish-list" style={{ background: '#3B1F08', borderRadius: 12, padding: '1.25rem', textDecoration: 'none', color: '#FBF6EE', border: '1px solid rgba(196,154,108,0.15)', display: 'block' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⭐</div>
          <div style={{ fontWeight: 700 }}>Wish List Inversa</div>
          <div style={{ fontSize: '0.8rem', color: '#C49A6C', marginTop: 4 }}>Publicar perfil buscado · IA matching</div>
        </Link>
        <Link href="/m02/pedidos" style={{ background: '#3B1F08', borderRadius: 12, padding: '1.25rem', textDecoration: 'none', color: '#FBF6EE', border: '1px solid rgba(196,154,108,0.15)', display: 'block' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📦</div>
          <div style={{ fontWeight: 700 }}>Pedidos B2B</div>
          <div style={{ fontSize: '0.8rem', color: '#C49A6C', marginTop: 4 }}>Gestión completa · estados · tracking</div>
        </Link>
        <Link href="/m02/catalogo" style={{ background: '#3B1F08', borderRadius: 12, padding: '1.25rem', textDecoration: 'none', color: '#FBF6EE', border: '1px solid rgba(196,154,108,0.15)', display: 'block' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🗂️</div>
          <div style={{ fontWeight: 700 }}>Catálogo de lotes</div>
          <div style={{ fontSize: '0.8rem', color: '#C49A6C', marginTop: 4 }}>Filtrar por EUDR · disponibilidad</div>
        </Link>
      </div>
    </div>
  );
}
