'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ActorRole } from '../types/actors';

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  nombre: string | null;
  email: string | null;
  role: ActorRole | null;
  pais: string | null;
  login: (data: { userId: string; nombre: string; email: string; role: ActorRole; pais: string }) => void;
  logout: () => void;
  switchRole: (role: ActorRole) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      userId: null,
      nombre: null,
      email: null,
      role: null,
      pais: null,
      login: (data) => set({ isAuthenticated: true, ...data }),
      logout: () => set({ isAuthenticated: false, userId: null, nombre: null, email: null, role: null, pais: null }),
      switchRole: (role) => set({ role }),
    }),
    { name: 'brewchain-auth' }
  )
);
