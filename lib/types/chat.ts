export type ChatRol = 'M01' | 'M02' | 'M03';

export interface Mensaje {
  id: string;
  autor: 'yo' | 'contraparte';
  texto: string;
  timestamp: string;
  leido: boolean;
}

export interface Contraparte {
  id: string;
  nombre: string;
  rol: ChatRol;
  pais: string;
  empresa: string;
}

export interface Conversacion {
  id: string;
  contraparte: Contraparte;
  lote_referencia?: string;
  lote_variedad?: string;
  mensajes: Mensaje[];
  no_leidos: number;
  archivada: boolean;
}

export interface ChatState {
  conversaciones: Conversacion[];
  conversacionActivaId: string | null;
  mensajesNuevosTotal: number;
  setConversacionActiva: (id: string) => void;
  marcarLeida: (conversacionId: string) => void;
  enviarMensaje: (conversacionId: string, texto: string) => void;
  addMensajeEntrante: (conversacionId: string, mensaje: Mensaje) => void;
}
