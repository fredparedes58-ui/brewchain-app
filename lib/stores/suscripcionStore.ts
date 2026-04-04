'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Suscriptor } from '../types/tostado';

// Datos iniciales mock
const MOCK_INICIAL: Suscriptor[] = [
  {
    id: 'sub-001',
    consumidor: 'Demo Consumidor',
    email: 'demo@consumer.es',
    plan: 'mensual',
    productos: 'Gesha Natural · 250g',
    precio: 24,
    estado: 'activa',
    proxima_fecha: '2025-04-28',
    creada_at: '2025-01-15',
    total_cobrado: 72,
  },
  {
    id: 'sub-002',
    consumidor: 'María García',
    email: 'maria@ejemplo.es',
    plan: 'quincenal',
    productos: 'Castillo Lavado · 200g',
    precio: 18,
    estado: 'activa',
    proxima_fecha: '2025-04-14',
    creada_at: '2025-02-01',
    total_cobrado: 54,
  },
  {
    id: 'sub-003',
    consumidor: 'Pablo López',
    plan: 'mensual',
    productos: 'Box Mixto · 3 × 100g',
    precio: 32,
    estado: 'pausada',
    proxima_fecha: '—',
    creada_at: '2025-01-20',
    total_cobrado: 64,
  },
];

interface SuscripcionState {
  suscriptores: Suscriptor[];
  simCobroId: string | null;  // id del suscriptor siendo cobrado (para feedback visual)

  addSuscriptor: (s: Suscriptor) => void;
  pausar: (id: string) => void;
  reactivar: (id: string) => void;
  cancelar: (id: string) => void;
  simularCobro: (id: string) => Promise<void>;
  calcularProximaFecha: (plan: Suscriptor['plan']) => string;
}

function calcularProximaFecha(plan: Suscriptor['plan']): string {
  const hoy = new Date();
  const dias = plan === 'semanal' ? 7 : plan === 'quincenal' ? 14 : plan === 'mensual' ? 30 : 90;
  hoy.setDate(hoy.getDate() + dias);
  return hoy.toISOString().split('T')[0];
}

export const useSuscripcionStore = create<SuscripcionState>()(
  persist(
    (set, get) => ({
      suscriptores: MOCK_INICIAL,
      simCobroId: null,

      addSuscriptor: (s) => set((state) => ({
        suscriptores: [...state.suscriptores, s],
      })),

      pausar: (id) => set((state) => ({
        suscriptores: state.suscriptores.map(s =>
          s.id === id ? { ...s, estado: 'pausada' as const, proxima_fecha: '—' } : s
        ),
      })),

      reactivar: (id) => set((state) => ({
        suscriptores: state.suscriptores.map(s => {
          if (s.id !== id) return s;
          return { ...s, estado: 'activa' as const, proxima_fecha: calcularProximaFecha(s.plan) };
        }),
      })),

      cancelar: (id) => set((state) => ({
        suscriptores: state.suscriptores.map(s =>
          s.id === id ? { ...s, estado: 'cancelada' as const, proxima_fecha: '—' } : s
        ),
      })),

      simularCobro: async (id) => {
        set({ simCobroId: id });
        await new Promise(r => setTimeout(r, 1500));
        set((state) => ({
          simCobroId: null,
          suscriptores: state.suscriptores.map(s => {
            if (s.id !== id || s.estado !== 'activa') return s;
            return {
              ...s,
              ultimo_cobro: new Date().toISOString().split('T')[0],
              proxima_fecha: calcularProximaFecha(s.plan),
              total_cobrado: (s.total_cobrado ?? 0) + s.precio,
            };
          }),
        }));
      },

      calcularProximaFecha,
    }),
    {
      name: 'brewchain-suscripciones',
      partialize: (s) => ({ suscriptores: s.suscriptores }),
    }
  )
);
