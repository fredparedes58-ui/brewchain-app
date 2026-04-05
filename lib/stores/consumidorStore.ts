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
      // Perfil sensorial por defecto — se sobreescribe al completar el quiz
      perfil: {
        intensidad: 'medio' as Intensidad,
        acidez: 'media' as Acidez,
        sabores_preferidos: ['chocolate', 'caramelo'] as Sabor[],
        proceso_preferido: 'lavado',
        origen_preferido: 'Colombia',
        completado: false,
      },
      qrEscaneados: ['a3f2e1b4c9d8', 'b7d4c2e1f9a3'], // hashes demo pre-escaneados
      setPerfil: (p) => set({ perfil: p }),
      addQRescaneado: (hash) => set((s) => ({
        qrEscaneados: s.qrEscaneados.includes(hash) ? s.qrEscaneados : [...s.qrEscaneados, hash],
      })),
    }),
    { name: 'brewchain-consumidor' }
  )
);
