'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  FidelizacionState,
  PuntoEvento,
  Sello,
  EventoFidelizacion,
  PUNTOS_POR_EVENTO,
  RECOMPENSAS,
} from '@/lib/types/fidelizacion';

const SEED_HISTORIAL: PuntoEvento[] = [
  { id: 'ev-001', tipo: 'quiz_completado', puntos: 25, descripcion: 'Quiz sensorial completado', fecha: '2024-09-10' },
  { id: 'ev-002', tipo: 'escaneo_qr', puntos: 10, descripcion: 'Escaneaste: Gesha Natural · Carlos Muñoz', fecha: '2024-09-15', referencia: 'a3f2e1b4c9d8' },
  { id: 'ev-003', tipo: 'compra', puntos: 50, descripcion: 'Compra en marketplace · Colombia Anaeróbico', fecha: '2024-09-20' },
  { id: 'ev-004', tipo: 'escaneo_qr', puntos: 10, descripcion: 'Escaneaste: Washed Yirgacheffe · Rosa Vargas', fecha: '2024-10-01', referencia: 'b4e3f2a1d0c7' },
  { id: 'ev-005', tipo: 'cupping', puntos: 30, descripcion: 'Participaste en sesión de cupping', fecha: '2024-10-08' },
  { id: 'ev-006', tipo: 'escaneo_qr', puntos: 10, descripcion: 'Escaneaste: Guatemala Pacamara · José Alvarado', fecha: '2024-10-12', referencia: 'c5d4e3b2a1f8' },
];

const SEED_SELLOS: Sello[] = [
  { id: 'sel-001', lote_hash: 'a3f2e1b4c9d8', variedad: 'Gesha Natural', caficultor_nombre: 'Carlos Muñoz', fecha: '2024-09-15' },
  { id: 'sel-002', lote_hash: 'b4e3f2a1d0c7', variedad: 'Washed Yirgacheffe', caficultor_nombre: 'Rosa Vargas', fecha: '2024-10-01' },
  { id: 'sel-003', lote_hash: 'c5d4e3b2a1f8', variedad: 'Guatemala Pacamara', caficultor_nombre: 'José Alvarado', fecha: '2024-10-12' },
];

const PUNTOS_SEED = SEED_HISTORIAL.reduce((a, e) => a + e.puntos, 0); // 135

export const useFidelizacionStore = create<FidelizacionState>()(
  persist(
    (set, get) => ({
      puntos: PUNTOS_SEED,
      sellos: SEED_SELLOS,
      historial: SEED_HISTORIAL,
      canjesRealizados: [],

      addEvento: (tipo, extra = {}) => {
        const puntos = PUNTOS_POR_EVENTO[tipo];
        const ev: PuntoEvento = {
          id: `ev-${Date.now()}`,
          tipo,
          puntos,
          descripcion: extra.descripcion ?? tipo.replace('_', ' '),
          fecha: new Date().toISOString().split('T')[0],
          ...extra,
        };
        set((s) => ({
          puntos: s.puntos + puntos,
          historial: [ev, ...s.historial],
        }));
      },

      addSello: (sello) => {
        set((s) => ({ sellos: [...s.sellos, sello] }));
      },

      canjear: (recompensaId) => {
        const recompensa = RECOMPENSAS.find((r) => r.id === recompensaId);
        if (!recompensa) return false;
        const { puntos } = get();
        if (puntos < recompensa.puntos_necesarios) return false;
        const ev: PuntoEvento = {
          id: `ev-canje-${Date.now()}`,
          tipo: 'canje',
          puntos: -recompensa.puntos_necesarios,
          descripcion: `Canje: ${recompensa.nombre}`,
          fecha: new Date().toISOString().split('T')[0],
          referencia: recompensaId,
        };
        set((s) => ({
          puntos: s.puntos - recompensa.puntos_necesarios,
          historial: [ev, ...s.historial],
          canjesRealizados: [...s.canjesRealizados, recompensaId],
        }));
        return true;
      },
    }),
    {
      name: 'brewchain-fidelizacion',
      partialize: (s) => ({
        puntos: s.puntos,
        sellos: s.sellos,
        historial: s.historial,
        canjesRealizados: s.canjesRealizados,
      }),
    }
  )
);
