'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Parcela, Lote } from '../types/lote';

export interface AgriAlert {
  id: string;
  tipo: 'roya' | 'broca' | 'precio' | 'cupping';
  mensaje: string;
  urgente: boolean;
  timestamp: string;
  leida: boolean;
}

interface CaficultorState {
  parcelas: Parcela[];
  lotes: Lote[];
  alertas: AgriAlert[];
  precioICO: number | null;
  precioICOTimestamp: string | null;
  pendingSyncParcelas: Parcela[];
  addParcela: (p: Parcela) => void;
  addLote: (l: Lote) => void;
  addAlerta: (a: AgriAlert) => void;
  marcarAlertaLeida: (id: string) => void;
  setPrecioICO: (precio: number) => void;
  clearPersistedState: () => void;
  addPendingSyncParcela: (p: Parcela) => void;
  flushPendingSyncParcelas: () => void;
}

export const useCaficultorStore = create<CaficultorState>()(
  persist(
    (set) => ({
      parcelas: [],
      lotes: [],
      alertas: [
        {
          id: 'alert-001',
          tipo: 'roya',
          mensaje: 'Riesgo de roya en tu zona. Revisa las hojas de tus plantas hoy.',
          urgente: true,
          timestamp: new Date().toISOString(),
          leida: false,
        },
        {
          id: 'alert-002',
          tipo: 'precio',
          mensaje: 'Precio ICO hoy: $320/quintal. Los tostadores en BREW CHAIN pagan $380/quintal.',
          urgente: false,
          timestamp: new Date().toISOString(),
          leida: false,
        },
      ],
      precioICO: 320,
      precioICOTimestamp: new Date().toISOString(),
      pendingSyncParcelas: [],
      addParcela: (p) => set((s) => {
        const newParcelas = [...s.parcelas, p];
        // Si no hay conexión, también guardar en pendingSyncParcelas
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          return { parcelas: newParcelas, pendingSyncParcelas: [...s.pendingSyncParcelas, p] };
        }
        return { parcelas: newParcelas };
      }),
      addLote: (l) => set((s) => ({ lotes: [...s.lotes, l] })),
      addAlerta: (a) => set((s) => ({ alertas: [a, ...s.alertas] })),
      marcarAlertaLeida: (id) => set((s) => ({ alertas: s.alertas.map(a => a.id === id ? { ...a, leida: true } : a) })),
      setPrecioICO: (precio) => set({ precioICO: precio, precioICOTimestamp: new Date().toISOString() }),
      clearPersistedState: () => set({ precioICO: null, precioICOTimestamp: null }),
      addPendingSyncParcela: (p) => set((s) => ({ pendingSyncParcelas: [...s.pendingSyncParcelas, p] })),
      flushPendingSyncParcelas: () => set({ pendingSyncParcelas: [] }),
    }),
    { name: 'brewchain-caficultor' }
  )
);
