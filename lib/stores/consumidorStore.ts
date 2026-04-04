'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Intensidad = 'suave' | 'medio' | 'intenso';
type Acidez = 'baja' | 'media' | 'alta';
type Sabor = 'frutal' | 'chocolate' | 'nuez' | 'floral' | 'caramelo';

interface PerfilSensorial {
  intensidad: Intensidad;
  acidez: Acidez;
  sabores_preferidos: Sabor[];
  proceso_preferido: string;
  origen_preferido: string;
  completado: boolean;
}

interface ConsumidorState {
  perfil: PerfilSensorial | null;
  qrEscaneados: string[];
  setPerfil: (p: PerfilSensorial) => void;
  addQRescaneado: (hash: string) => void;
}

export const useConsumidorStore = create<ConsumidorState>()(
  persist(
    (set) => ({
      perfil: null,
      qrEscaneados: [],
      setPerfil: (p) => set({ perfil: p }),
      addQRescaneado: (hash) => set((s) => ({ qrEscaneados: [...s.qrEscaneados, hash] })),
    }),
    { name: 'brewchain-consumidor' }
  )
);
