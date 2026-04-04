import { Actor } from '../types/actors';
import { Parcela } from '../types/lote';

export const MOCK_CAFICULTORES: Actor[] = [
  { id: 'caf-001', email: 'carlos@finca.co', nombre: 'Carlos Humberto Muñoz', role: 'M01', pais: 'Colombia', plan: 'freemium', created_at: '2024-11-15' },
  { id: 'caf-002', email: 'rosa@huila.co', nombre: 'Rosa Elena Vargas', role: 'M01', pais: 'Colombia', plan: 'freemium', created_at: '2024-12-01' },
  { id: 'caf-003', email: 'miguel@jalisco.mx', nombre: 'Miguel Ángel López', role: 'M01', pais: 'México', plan: 'freemium', created_at: '2025-01-10' },
  { id: 'caf-004', email: 'ana@oaxaca.mx', nombre: 'Ana Lucía Pérez', role: 'M01', pais: 'México', plan: 'freemium', created_at: '2025-01-22' },
  { id: 'caf-005', email: 'jose@antigua.gt', nombre: 'José María Alvarado', role: 'M01', pais: 'Guatemala', plan: 'freemium', created_at: '2025-02-05' },
];

export const MOCK_PARCELAS: Parcela[] = [
  { id: 'par-001', caficultor_id: 'caf-001', nombre: 'La Esperanza', gps_lat: 2.5359, gps_lng: -75.8931, variedad: 'Castillo', altitud: 1680, hectareas: 3.5, eudr_verified: true, created_at: '2024-11-15' },
  { id: 'par-002', caficultor_id: 'caf-001', nombre: 'El Mirador', gps_lat: 2.5421, gps_lng: -75.8876, variedad: 'Colombia', altitud: 1720, hectareas: 2.1, eudr_verified: true, created_at: '2024-11-20' },
  { id: 'par-003', caficultor_id: 'caf-002', nombre: 'La Palma', gps_lat: 1.9782, gps_lng: -75.9654, variedad: 'Gesha', altitud: 1850, hectareas: 1.8, eudr_verified: true, created_at: '2024-12-05' },
  { id: 'par-004', caficultor_id: 'caf-003', nombre: 'Finca Alta', gps_lat: 20.6843, gps_lng: -103.3488, variedad: 'Bourbon', altitud: 1450, hectareas: 4.2, eudr_verified: false, created_at: '2025-01-12' },
  { id: 'par-005', caficultor_id: 'caf-005', nombre: 'El Quetzal', gps_lat: 14.6599, gps_lng: -90.5133, variedad: 'Pacamara', altitud: 1600, hectareas: 2.8, eudr_verified: true, created_at: '2025-02-08' },
];

export const CURRENT_CAFICULTOR = MOCK_CAFICULTORES[0];
export const CURRENT_PARCELA = MOCK_PARCELAS[0];
