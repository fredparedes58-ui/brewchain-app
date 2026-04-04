'use client';
import { useState } from 'react';
import { MOCK_PASAPORTES } from '@/lib/mock/pasaportes';
import Link from 'next/link';
import { usePlacesRating } from '@/lib/hooks/usePlacesRating';
import { useScanStore } from '@/lib/stores/scanStore';

export default function M05QRSala() {
  const { eventos } = useScanStore();
  const rating = usePlacesRating();

  const hace30 = new Date();
  hace30.setDate(hace30.getDate() - 30);
  const scans = eventos.filter(e => new Date(e.timestamp) >= hace30).length;
  const [menuQRs] = useState([
    { nombre: 'Colombia Anaeróbico · Carlos Muñoz', hash: 'a3f2e1b4c9d8', cupping: 91.0, precio: '€3.80', notas: 'Piña, maracuyá, fermentación controlada' },
    { nombre: 'Gesha Natural · Rosa Vargas', hash: 'b4e3f2a1d0c7', cupping: 92.0, precio: '€4.50', notas: 'Jazmín, melocotón, bergamota' },
    { nombre: 'Guatemala Pacamara · José Alvarado', hash: 'c5d4e3b2a1f8', cupping: 89.5, precio: '€3.60', notas: 'Ciruela, cacao, acidez cítrica' },
  ]);

  return (
    <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.75rem', color: '#C49A6C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.5rem' }}>M05 · Cafetería</div>
        <h1 style={{ fontWeight: 900, fontSize: '1.8rem', margin: 0 }}>QR en Sala</h1>
        <p style={{ color: '#C49A6C', marginTop: '0.5rem', marginBottom: 0 }}>Coloca los QR en la mesa para máximo engagement (+10-20% vs. solo en bolsa)</p>
      </div>

      {/* Tip engagement */}
      <div style={{ background: 'rgba(139,94,60,0.1)', border: '1px solid rgba(139,94,60,0.3)', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ fontWeight: 700, color: '#FBF6EE', marginBottom: '0.5rem' }}>💡 Tip de engagement</div>
        <div style={{ fontSize: '0.85rem', color: '#C49A6C' }}>Los QR en mesa generan <strong style={{ color: '#FBF6EE' }}>+10-20% más escaneos</strong> que el QR solo en la bolsa (datos Odeko). Coloca la tarjeta junto al café que sirves.</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'QRs escaneados este mes', value: scans, icon: '📊', color: '#C49A6C' },
          { label: 'Cafés con pasaporte', value: menuQRs.length, icon: '📱', color: '#4ADE80' },
          { label: `Google Maps · ${rating.user_ratings_total} reseñas`, value: rating.loading ? '...' : `${rating.rating} ⭐`, icon: '🗺️', color: '#FBF6EE' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} style={{ background: '#3B1F08', borderRadius: 12, padding: '1.25rem', border: '1px solid rgba(196,154,108,0.15)' }}>
            <div style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{icon}</div>
            <div style={{ fontWeight: 900, fontSize: '1.6rem', color }}>{value}</div>
            <div style={{ fontSize: '0.72rem', color: '#8B5E3C', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* QRs en carta */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.75rem', color: '#C49A6C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.75rem' }}>Cafés con QR activo</div>
        {menuQRs.map((item) => (
          <div key={item.hash} style={{ background: '#3B1F08', borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '0.5rem', border: '1px solid rgba(196,154,108,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.nombre}</div>
              <div style={{ fontSize: '0.78rem', color: '#C49A6C', fontStyle: 'italic', marginTop: 2 }}>"{item.notas}"</div>
              <div style={{ fontSize: '0.72rem', color: '#8B5E3C', marginTop: 4, fontFamily: 'monospace' }}>brewchain.app/lote/{item.hash}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontWeight: 700, color: '#FBF6EE' }}>{item.precio}</div>
              <div style={{ fontSize: '0.72rem', color: '#C49A6C' }}>CVA {item.cupping}</div>
            </div>
            <Link href={`/lote/${item.hash}`} target="_blank" style={{ background: '#1B5E30', color: 'white', padding: '0.5rem 0.75rem', borderRadius: 8, textDecoration: 'none', fontSize: '0.78rem', fontWeight: 600, flexShrink: 0 }}>
              Ver →
            </Link>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <Link href="/m05/menu" style={{ display: 'block', background: '#8B5E3C', color: '#FBF6EE', padding: '1rem', borderRadius: 10, textDecoration: 'none', textAlign: 'center', fontWeight: 700, fontSize: '1rem' }}>
          📋 Carta digital
        </Link>
        <Link href="/m05/analytics" style={{ display: 'block', background: '#3B1F08', color: '#FBF6EE', padding: '1rem', borderRadius: 10, textDecoration: 'none', textAlign: 'center', fontWeight: 700, fontSize: '1rem', border: '1px solid rgba(196,154,108,0.2)' }}>
          📊 Analytics QR
        </Link>
      </div>
    </div>
  );
}
