-- BREW CHAIN — Seed con datos reales de Agua Fría
-- Ejecutar DESPUÉS de 001_initial_schema.sql

INSERT INTO actors (id, email, nombre, role, pais, estado_region, municipio, asociacion, finca_nombre, plan, created_at)
VALUES (
  'caf-001',
  'jose@aguafria.ve',
  'José Tomás Carrillo',
  'M01',
  'Venezuela',
  'Miranda',
  'Triángulo de los Mocotíes',
  'Asociación Triángulo de los Mocotíes',
  'Agua Fría',
  'premium',
  '2024-10-01'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO parcelas (id, caficultor_id, nombre, gps_lat, gps_lng, variedad, altitud, hectareas, eudr_verified, created_at)
VALUES
  ('par-001', 'caf-001', 'Bloque Pink Bourbon', 10.2186, -66.7032, 'Pink Bourbon', 1200, 4.0, false, '2024-10-01'),
  ('par-002', 'caf-001', 'Bloque Tabi', 10.2201, -66.7018, 'Tabi', 1200, 3.5, false, '2024-10-01')
ON CONFLICT (id) DO NOTHING;

INSERT INTO lotes (id, caficultor_id, caficultor_nombre, parcela_id, pais, region, variedad, proceso, altitud_msnm, fecha_cosecha, kilos_disponibles, precio_fob, notas_cata, cupping_score, gps_lat, gps_lng, gps_eudr_verified, eudr_status, eudr_compliance_pct, estado)
VALUES (
  'lot-001',
  'caf-001',
  'José Tomás Carrillo',
  'par-001',
  'Venezuela',
  'Miranda · Triángulo de los Mocotíes',
  'Pink Bourbon',
  'anaerobico',
  1200,
  '2024-10-15',
  120,
  14.85,
  'Caramelo, vainilla, naranja, cereza, grosella negra, frambuesa, nuez moscada, almendra',
  85.75,
  10.2186,
  -66.7032,
  false,
  'amber',
  75,
  'disponible'
) ON CONFLICT (id) DO NOTHING;
