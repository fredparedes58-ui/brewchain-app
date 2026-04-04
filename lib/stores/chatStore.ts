'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatState, Mensaje, Conversacion } from '../types/chat';
import { MOCK_CONVERSACIONES } from '../mock/conversaciones';

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversaciones: MOCK_CONVERSACIONES,
      conversacionActivaId: null,
      mensajesNuevosTotal: MOCK_CONVERSACIONES.reduce((s, c) => s + c.no_leidos, 0),

      setConversacionActiva: (id: string) => {
        set({ conversacionActivaId: id });
        get().marcarLeida(id);
      },

      marcarLeida: (conversacionId: string) => {
        set(s => {
          const convs = s.conversaciones.map((c: Conversacion) =>
            c.id === conversacionId
              ? { ...c, no_leidos: 0, mensajes: c.mensajes.map((m: Mensaje) => ({ ...m, leido: true })) }
              : c
          );
          return {
            conversaciones: convs,
            mensajesNuevosTotal: convs.reduce((sum: number, c: Conversacion) => sum + c.no_leidos, 0),
          };
        });
      },

      enviarMensaje: (conversacionId: string, texto: string) => {
        const mensaje: Mensaje = {
          id: `msg-${Date.now()}`,
          autor: 'yo',
          texto,
          timestamp: new Date().toISOString(),
          leido: true,
        };
        set(s => ({
          conversaciones: s.conversaciones.map((c: Conversacion) =>
            c.id === conversacionId
              ? { ...c, mensajes: [...c.mensajes, mensaje] }
              : c
          ),
        }));
      },

      addMensajeEntrante: (conversacionId: string, mensaje: Mensaje) => {
        const isActiva = get().conversacionActivaId === conversacionId;
        set(s => {
          const convs = s.conversaciones.map((c: Conversacion) =>
            c.id === conversacionId
              ? {
                  ...c,
                  mensajes: [...c.mensajes, mensaje],
                  no_leidos: isActiva ? c.no_leidos : c.no_leidos + 1,
                }
              : c
          );
          return {
            conversaciones: convs,
            mensajesNuevosTotal: convs.reduce((sum: number, c: Conversacion) => sum + c.no_leidos, 0),
          };
        });
      },
    }),
    {
      name: 'brewchain-chat',
      partialize: (s) => ({ conversaciones: s.conversaciones }),
    }
  )
);
