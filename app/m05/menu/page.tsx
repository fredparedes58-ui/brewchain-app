'use client';
import Link from 'next/link';

const MENU_ITEMS = [
  { nombre: 'Espresso — Colombia Anaeróbico', hash: 'a3f2e1b4c9d8', origen: 'Huila, Colombia · Carlos H. Muñoz', proceso: 'Anaeróbico', precio: 2.80, desc: 'Piña, maracuyá, fermentación tropical' },
  { nombre: 'Pour Over — Gesha Natural', hash: 'b4e3f2a1d0c7', origen: 'Nariño, Colombia · Rosa Elena Vargas', proceso: 'Natural', precio: 4.50, desc: 'Jazmín, melocotón, bergamota' },
  { nombre: 'V60 — Guatemala Pacamara', hash: 'c5d4e3b2a1f8', origen: 'Antigua, Guatemala · José M. Alvarado', proceso: 'Lavado', precio: 3.80, desc: 'Ciruela, cacao, acidez cítrica' },
  { nombre: 'Flat White — Colombia Castillo', hash: 'd6e5f4c3b2a1', origen: 'Huila, Colombia · Carlos H. Muñoz', proceso: 'Lavado', precio: 3.20, desc: 'Chocolate amargo, frutos rojos' },
];

export default function M05Menu() {
  return (
    <div style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontWeight: 900, fontSize: '1.8rem', margin: '0 0 0.5rem' }}>Carta Digital</h1>
      <p style={{ color: '#C49A6C', marginBottom: '2rem' }}>Cada café tiene su pasaporte digital. Escanea el QR para conocer al caficultor.</p>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {MENU_ITEMS.map(item => (
          <div key={item.hash} style={{ background: '#3B1F08', borderRadius: 12, padding: '1.25rem', border: '1px solid rgba(196,154,108,0.15)', display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'start' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>{item.nombre}</div>
              <div style={{ fontSize: '0.78rem', color: '#C49A6C', marginBottom: '0.25rem' }}>{item.origen} · {item.proceso}</div>
              <div style={{ fontSize: '0.82rem', color: '#FBF6EE', fontStyle: 'italic', marginBottom: '0.75rem' }}>"{item.desc}"</div>
              <Link href={`/lote/${item.hash}`} target="_blank" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(27,94,48,0.2)', border: '1px solid #1B5E30', borderRadius: 100, padding: '0.3rem 0.75rem', color: '#4ADE80', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600 }}>
                📱 Ver pasaporte QR
              </Link>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 900, fontSize: '1.3rem', color: '#C49A6C' }}>€{item.precio.toFixed(2)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
