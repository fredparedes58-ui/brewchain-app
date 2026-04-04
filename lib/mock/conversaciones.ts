import { Conversacion } from '../types/chat';

export const MOCK_CONVERSACIONES: Conversacion[] = [
  {
    id: 'conv-001',
    contraparte: {
      id: 'imp-001',
      nombre: 'Ana García',
      rol: 'M02',
      pais: 'España',
      empresa: 'Green Origin GmbH',
    },
    lote_referencia: 'lot-001',
    lote_variedad: 'Castillo · Huila',
    mensajes: [
      {
        id: 'msg-001',
        autor: 'contraparte',
        texto: 'Hola Carlos, he revisado tu lote Castillo de Huila y me parece muy interesante. El cupping score de 87.5 está muy bien. ¿Tienes más disponibilidad además de los 500 kg listados?',
        timestamp: '2025-03-28T09:15:00Z',
        leido: true,
      },
      {
        id: 'msg-002',
        autor: 'yo',
        texto: 'Hola Ana, gracias por tu interés. Actualmente tenemos esos 500 kg disponibles. Para la próxima cosecha en octubre podríamos tener hasta 800 kg más del mismo lote.',
        timestamp: '2025-03-28T10:30:00Z',
        leido: true,
      },
      {
        id: 'msg-003',
        autor: 'contraparte',
        texto: 'Perfecto. ¿El precio de €6.80/kg es negociable para un pedido de 400 kg o más? Tenemos clientes tostadores en Alemania que pagan bien por Castillo lavado con trazabilidad EUDR.',
        timestamp: '2025-03-28T11:05:00Z',
        leido: true,
      },
      {
        id: 'msg-004',
        autor: 'yo',
        texto: 'Para 400 kg puedo ajustarlo a €6.60/kg. Toda la trazabilidad EUDR está completa y el GPS verificado. ¿Cuándo necesitarías el envío?',
        timestamp: '2025-03-28T14:20:00Z',
        leido: true,
      },
      {
        id: 'msg-005',
        autor: 'contraparte',
        texto: 'Excelente, trato hecho. Necesitaríamos embarque en las próximas 3 semanas. Te envío el contrato formal por email. ¡Muy contenta de trabajar con BREW CHAIN!',
        timestamp: '2025-03-29T08:45:00Z',
        leido: true,
      },
    ],
    no_leidos: 0,
    archivada: false,
  },
  {
    id: 'conv-002',
    contraparte: {
      id: 'tos-001',
      nombre: 'Pedro Ruiz',
      rol: 'M03',
      pais: 'España',
      empresa: 'Nordic Roasters Barcelona',
    },
    lote_referencia: 'lot-hist-003',
    lote_variedad: 'Colombia Anaeróbico',
    mensajes: [
      {
        id: 'msg-006',
        autor: 'contraparte',
        texto: 'Carlos, el lote Colombia anaeróbico que compramos en noviembre fue un hit con nuestros clientes. El 90.5 de cupping se nota en taza. ¿Tienes algo similar en camino?',
        timestamp: '2025-03-30T10:00:00Z',
        leido: true,
      },
      {
        id: 'msg-007',
        autor: 'yo',
        texto: 'Qué buena noticia Pedro! Tenemos una parcela nueva con proceso anaeróbico que estará lista en la cosecha de mayo. Estamos experimentando con fermentación de 72h. ¿Te interesa reservarlo?',
        timestamp: '2025-03-30T11:30:00Z',
        leido: true,
      },
      {
        id: 'msg-008',
        autor: 'contraparte',
        texto: 'Totalmente. Quiero reservar mínimo 100 kg. Podemos hacer un contrato ahora con precio tentativo y ajustar post-cupping. ¿Te parece bien €12/kg de base?',
        timestamp: '2025-03-30T12:15:00Z',
        leido: true,
      },
      {
        id: 'msg-009',
        autor: 'yo',
        texto: 'Me parece justo. Voy a preparar el contrato de reserva. Te lo paso por aquí antes de fin de semana.',
        timestamp: '2025-03-30T14:00:00Z',
        leido: true,
      },
    ],
    no_leidos: 0,
    archivada: false,
  },
  {
    id: 'conv-003',
    contraparte: {
      id: 'imp-002',
      nombre: 'Thomas Bauer',
      rol: 'M02',
      pais: 'Alemania',
      empresa: 'Origin Trade BV',
    },
    lote_referencia: 'lot-001',
    lote_variedad: 'Castillo · Huila',
    mensajes: [
      {
        id: 'msg-010',
        autor: 'contraparte',
        texto: 'Guten Tag Carlos. I found your Castillo lot on BREW CHAIN. The EUDR compliance is 100% — exactly what we need for our German customers. What is the minimum order quantity?',
        timestamp: '2025-04-02T07:30:00Z',
        leido: true,
      },
      {
        id: 'msg-011',
        autor: 'contraparte',
        texto: '¿Podrías enviarme también el documento de declaración EUDR? Mis clientes tostadores en Munich lo requieren para importación.',
        timestamp: '2025-04-02T15:45:00Z',
        leido: false,
      },
      {
        id: 'msg-012',
        autor: 'contraparte',
        texto: 'Estoy muy interesado en establecer una relación a largo plazo. Compramos regularmente 500-800 kg/mes de cafés colombianos con certificación EUDR. Cuéntame más sobre tu finca.',
        timestamp: '2025-04-03T08:10:00Z',
        leido: false,
      },
    ],
    no_leidos: 2,
    archivada: false,
  },
];

// Pool de mensajes entrantes simulados (se rotan en el polling)
export const MENSAJES_ENTRANTES_POOL = [
  { conversacionId: 'conv-003', texto: 'Carlos, ¿cuál es el lead time desde Colombia hasta Rotterdam? Necesito planificar el inventario.' },
  { conversacionId: 'conv-001', texto: 'Todo confirmado con el departamento de compras. ¡Procede con el envío cuando puedas!' },
  { conversacionId: 'conv-002', texto: 'Perfecto, esperamos el contrato de reserva. Nuestros clientes están muy entusiasmados.' },
  { conversacionId: 'conv-003', texto: 'Thomas Bauer: También me interesa conocer tu disponibilidad de Caturra para el Q3. ¿Tienes proyecciones?' },
];
