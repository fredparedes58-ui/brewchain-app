'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PedidoB2B, PedidoEstado, PedidoState } from '@/lib/types/pedido';
import { MOCK_PEDIDOS } from '@/lib/mock/pedidos';

export const usePedidoStore = create<PedidoState>()(
  persist(
    (set) => ({
      pedidos: MOCK_PEDIDOS,

      addPedido: (p) =>
        set((s) => ({ pedidos: [p, ...s.pedidos] })),

      updateEstado: (id, estado, extra = {}) =>
        set((s) => ({
          pedidos: s.pedidos.map((p) =>
            p.id === id
              ? { ...p, estado, updated_at: new Date().toISOString().split('T')[0], ...extra }
              : p
          ),
        })),

      removePedido: (id) =>
        set((s) => ({ pedidos: s.pedidos.filter((p) => p.id !== id) })),
    }),
    {
      name: 'brewchain-pedidos',
      partialize: (s) => ({ pedidos: s.pedidos }),
    }
  )
);
