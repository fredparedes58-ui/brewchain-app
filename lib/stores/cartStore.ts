'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '../types/cart';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (productoId: string) => void;
  updateCantidad: (productoId: string, cantidad: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  closeCart: () => void;
  totalItems: () => number;
  totalEuros: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) => set((state) => {
        const existing = state.items.find(i => i.productoId === newItem.productoId);
        if (existing) {
          // Si ya está en el carrito, sumar cantidad
          return {
            items: state.items.map(i =>
              i.productoId === newItem.productoId
                ? { ...i, cantidad: i.cantidad + newItem.cantidad }
                : i
            ),
            isOpen: true,
          };
        }
        return { items: [...state.items, newItem], isOpen: true };
      }),

      removeItem: (productoId) => set((state) => ({
        items: state.items.filter(i => i.productoId !== productoId),
      })),

      updateCantidad: (productoId, cantidad) => set((state) => {
        if (cantidad <= 0) {
          return { items: state.items.filter(i => i.productoId !== productoId) };
        }
        return {
          items: state.items.map(i =>
            i.productoId === productoId ? { ...i, cantidad } : i
          ),
        };
      }),

      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      closeCart: () => set({ isOpen: false }),

      // Getters derivados usando get()
      totalItems: () => get().items.reduce((sum, i) => sum + i.cantidad, 0),
      totalEuros: () => get().items.reduce((sum, i) => sum + i.precio_unitario * i.cantidad, 0),
    }),
    {
      name: 'brewchain-cart',
      // No persistir isOpen — siempre empieza cerrado
      partialize: (state) => ({ items: state.items }),
    }
  )
);
