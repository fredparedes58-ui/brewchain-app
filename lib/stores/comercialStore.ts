'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Lote } from '../types/lote';
import { SealedPassport } from '../types/passport';
import { EUDRDeclaration, EUDRDeclarationRecord } from '../types/eudr';
import { LoteTostado } from '../types/tostado';

export interface WishListItem {
  id: string;
  variedad: string;
  origen_pais: string;
  proceso?: string;
  score_min?: number;
  precio_fob_max?: number;
  kilos: number;
  fecha_necesaria: string;
  matches?: Lote[];
}

export interface PerfilTueste {
  id: string;
  nombre: string;
  lote_id: string;
  lote_origen: string;
  fecha: string;
  temp_carga: number;
  primer_crack: number;
  temp_final: number;
  tiempo_total_min: number;
  nivel: 'claro' | 'medio' | 'oscuro';
  notas: string;
}

interface ComercialState {
  lotes: Lote[];
  pasaportes: SealedPassport[];
  eudrDeclarations: EUDRDeclaration[];
  eudrRecords: EUDRDeclarationRecord[];
  wishList: WishListItem[];
  perfilesTueste: PerfilTueste[];
  lotesTostados: LoteTostado[];

  sealPassport: (passport: SealedPassport) => void;
  addWishListItem: (item: WishListItem) => void;
  removeWishListItem: (id: string) => void;
  addPerfilTueste: (perfil: PerfilTueste) => void;
  setLotes: (lotes: Lote[]) => void;
  addEUDRRecord: (record: EUDRDeclarationRecord) => void;
  removeEUDRRecord: (id: string) => void;
  updateEUDRRecordStatus: (id: string, traces_nt_reference: string, traces_status: EUDRDeclarationRecord['traces_status']) => void;
  addLoteTostado: (lote: LoteTostado) => void;
  removeLoteTostado: (id: string) => void;
}

export const useComercialStore = create<ComercialState>()(
  persist(
    (set) => ({
      lotes: [],
      pasaportes: [],
      eudrDeclarations: [],
      eudrRecords: [],
      wishList: [],
      perfilesTueste: [],
      lotesTostados: [],

      sealPassport: (passport) => set((s) => ({ pasaportes: [...s.pasaportes, passport] })),

      addWishListItem: (item) => set((s) => ({ wishList: [...s.wishList, item] })),
      removeWishListItem: (id) => set((s) => ({ wishList: s.wishList.filter(w => w.id !== id) })),

      addPerfilTueste: (perfil) => set((s) => ({ perfilesTueste: [...s.perfilesTueste, perfil] })),

      setLotes: (lotes) => set({ lotes }),

      addEUDRRecord: (record) => set((s) => ({
        eudrRecords: [...s.eudrRecords.filter(r => r.lote_id !== record.lote_id), record],
      })),
      removeEUDRRecord: (id) => set((s) => ({
        eudrRecords: s.eudrRecords.filter(r => r.id !== id),
      })),
      updateEUDRRecordStatus: (id, traces_nt_reference, traces_status) => set((s) => ({
        eudrRecords: s.eudrRecords.map(r =>
          r.id === id ? { ...r, traces_nt_reference, traces_status, status: 'submitted' as const } : r
        ),
      })),

      addLoteTostado: (lote) => set((s) => ({ lotesTostados: [...s.lotesTostados, lote] })),
      removeLoteTostado: (id) => set((s) => ({ lotesTostados: s.lotesTostados.filter(l => l.id !== id) })),
    }),
    {
      name: 'brewchain-comercial',
      partialize: (s) => ({
        pasaportes: s.pasaportes,
        eudrRecords: s.eudrRecords,
        wishList: s.wishList.map(({ matches: _m, ...rest }) => rest),
        perfilesTueste: s.perfilesTueste,
        lotesTostados: s.lotesTostados,
      }),
    }
  )
);
