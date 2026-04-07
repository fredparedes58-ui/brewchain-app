import { Actor } from '../types/actors';
import { Parcela } from '../types/lote';

export const MOCK_CAFICULTORES: Actor[] = [
  {
    id: 'caf-001',
    email: 'jose@aguafria.ve',
    nombre: 'José Tomás Carrillo',
    role: 'M01',
    pais: 'Venezuela',
    plan: 'premium',
    created_at: '2024-10-01',
    finca_nombre: 'Agua Fría',
    estado_region: 'Miranda',
    municipio: 'Triángulo de los Mocotíes',
    asociacion: 'Asociación Triángulo de los Mocotíes',
  },
  { id: 'caf-002', email: 'rosa@huila.co', nombre: 'Rosa Elena Vargas', role: 'M01', pais: 'Colombia', plan: 'premium', created_at: '2024-12-01' },
  { id: 'caf-003', email: 'miguel@jalisco.mx', nombre: 'Miguel Ángel López', role: 'M01', pais: 'México', plan: 'freemium', created_at: '2025-01-10' },
  { id: 'caf-004', email: 'ana@oaxaca.mx', nombre: 'Ana Lucía Pérez', role: 'M01', pais: 'México', plan: 'freemium', created_at: '2025-01-22' },
  { id: 'caf-005', email: 'jose@antigua.gt', nombre: 'José María Alvarado', role: 'M01', pais: 'Guatemala', plan: 'premium', created_at: '2025-02-05' },
  { id: 'caf-006', email: 'amara@yirga.et', nombre: 'Amara Tadesse Bekele', role: 'M01', pais: 'Etiopía', plan: 'premium', created_at: '2024-10-20' },
  { id: 'caf-007', email: 'peter@kirinyaga.ke', nombre: 'Peter Kamau Njoroge', role: 'M01', pais: 'Kenia', plan: 'premium', created_at: '2024-09-15' },
  { id: 'caf-008', email: 'lucia@cajamarca.pe', nombre: 'Lucía Quispe Huanca', role: 'M01', pais: 'Perú', plan: 'freemium', created_at: '2025-01-30' },
  { id: 'caf-009', email: 'roberto@copan.hn', nombre: 'Roberto Antonio Flores', role: 'M01', pais: 'Honduras', plan: 'freemium', created_at: '2025-02-15' },
  { id: 'caf-010', email: 'maria@santa-ana.sv', nombre: 'María de los Ángeles Cruz', role: 'M01', pais: 'El Salvador', plan: 'premium', created_at: '2024-11-01' },
];

export const MOCK_PARCELAS: Parcela[] = [
  {
    // GPS aproximado estado Miranda, Venezuela — pendiente verificación GPS exacto en campo
    id: 'par-001',
    caficultor_id: 'caf-001',
    nombre: 'Bloque Pink Bourbon',
    gps_lat: 10.2186,
    gps_lng: -66.7032,
    variedad: 'Pink Bourbon',
    altitud: 1200,
    hectareas: 4.0,
    eudr_verified: false, // pendiente verificación GPS oficial
    created_at: '2024-10-01',
  },
  {
    // GPS aproximado estado Miranda, Venezuela — pendiente verificación GPS exacto en campo
    id: 'par-002',
    caficultor_id: 'caf-001',
    nombre: 'Bloque Tabi',
    gps_lat: 10.2201,
    gps_lng: -66.7018,
    variedad: 'Tabi',
    altitud: 1200,
    hectareas: 3.5,
    eudr_verified: false, // pendiente verificación GPS oficial
    created_at: '2024-10-01',
  },
  { id: 'par-003', caficultor_id: 'caf-002', nombre: 'La Palma', gps_lat: 1.9782, gps_lng: -75.9654, variedad: 'Gesha', altitud: 1850, hectareas: 1.8, eudr_verified: true, created_at: '2024-12-05' },
  { id: 'par-004', caficultor_id: 'caf-003', nombre: 'Finca Alta', gps_lat: 20.6843, gps_lng: -103.3488, variedad: 'Bourbon', altitud: 1450, hectareas: 4.2, eudr_verified: false, created_at: '2025-01-12' },
  { id: 'par-005', caficultor_id: 'caf-005', nombre: 'El Quetzal', gps_lat: 14.6599, gps_lng: -90.5133, variedad: 'Pacamara', altitud: 1600, hectareas: 2.8, eudr_verified: true, created_at: '2025-02-08' },
  { id: 'par-006', caficultor_id: 'caf-006', nombre: 'Chelelektu Estate', gps_lat: 6.1667, gps_lng: 38.2000, variedad: 'Heirloom Etíope', altitud: 2100, hectareas: 5.0, eudr_verified: true, created_at: '2024-10-20' },
  { id: 'par-007', caficultor_id: 'caf-007', nombre: 'Kirinyaga AA Farm', gps_lat: -0.5000, gps_lng: 37.3000, variedad: 'SL28', altitud: 1750, hectareas: 6.3, eudr_verified: true, created_at: '2024-09-15' },
  { id: 'par-008', caficultor_id: 'caf-008', nombre: 'Finca San Francisco', gps_lat: -6.9800, gps_lng: -79.1200, variedad: 'Caturra', altitud: 1900, hectareas: 2.3, eudr_verified: true, created_at: '2025-01-30' },
  { id: 'par-009', caficultor_id: 'caf-009', nombre: 'Cerro Azul', gps_lat: 15.3200, gps_lng: -88.7700, variedad: 'Lempira', altitud: 1550, hectareas: 3.8, eudr_verified: true, created_at: '2025-02-15' },
  { id: 'par-010', caficultor_id: 'caf-010', nombre: 'Finca La Ilusión', gps_lat: 13.9800, gps_lng: -89.5600, variedad: 'Bourbon Rojo', altitud: 1650, hectareas: 4.0, eudr_verified: true, created_at: '2024-11-01' },
];

export const CURRENT_CAFICULTOR = MOCK_CAFICULTORES[0];
export const CURRENT_PARCELA = MOCK_PARCELAS[0];
