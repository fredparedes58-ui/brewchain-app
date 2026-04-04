'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Compra } from '@/lib/types/compra';

// 3 compras de ejemplo — se llenarán con Supabase en producción
const SEED_COMPRAS: Compra[] = [
  {
    id: 'ord-001',
    numero: 'ORD-2025-001',
    items: [
      {
        lote_id: 'lot-005',
        variedad: 'Colombia Anaeróbico',
        caficultor_nombre: 'Carlos Muñoz',
        pais: 'Colombia',
        region: 'Huila',
        cantidad_g: 250,
        precio_eur: 14.50,
        qr_hash: 'a3f2e1b4c9d8',
      },
    ],
    total_eur: 14.50,
    fecha: '2025-03-18',
    estado: 'entregado',
    metodo_pago: 'Tarjeta · **** 4242',
    direccion_envio: 'Calle Mayor 12, Madrid',
  },
  {
    id: 'ord-002',
    numero: 'ORD-2025-002',
    items: [
      {
        lote_id: 'lot-006',
        variedad: 'Gesha Natural',
        caficultor_nombre: 'Rosa Vargas',
        pais: 'Etiopía',
        region: 'Yirgacheffe',
        cantidad_g: 100,
        precio_eur: 9.80,
        qr_hash: 'b4e3f2a1d0c7',
      },
      {
        lote_id: 'lot-007',
        variedad: 'Guatemala Pacamara',
        caficultor_nombre: 'José Alvarado',
        pais: 'Guatemala',
        region: 'Antigua',
        cantidad_g: 250,
        precio_eur: 13.20,
        qr_hash: 'c5d4e3b2a1f8',
      },
    ],
    total_eur: 23.00,
    fecha: '2025-03-29',
    estado: 'enviado',
    metodo_pago: 'Tarjeta · **** 4242',
    direccion_envio: 'Calle Mayor 12, Madrid',
  },
  {
    id: 'ord-003',
    numero: 'ORD-2025-003',
    items: [
      {
        lote_id: 'lot-005',
        variedad: 'Colombia Anaeróbico',
        caficultor_nombre: 'Carlos Muñoz',
        pais: 'Colombia',
        region: 'Huila',
        cantidad_g: 500,
        precio_eur: 27.00,
        qr_hash: 'a3f2e1b4c9d8',
      },
    ],
    total_eur: 27.00,
    fecha: '2025-04-02',
    estado: 'confirmado',
    metodo_pago: 'Tarjeta · **** 4242',
    direccion_envio: 'Calle Mayor 12, Madrid',
  },
];

interface CompraState {
  compras: Compra[];
  addCompra: (c: Compra) => void;
}

export const useCompraStore = create<CompraState>()(
  persist(
    (set) => ({
      compras: SEED_COMPRAS,
      addCompra: (c) => set((s) => ({ compras: [c, ...s.compras] })),
    }),
    {
      name: 'brewchain-compras',
      partialize: (s) => ({ compras: s.compras }),
    }
  )
);
