-- BREW CHAIN — Migración inicial
-- Ejecutar en Supabase Dashboard > SQL Editor

-- ── ACTORS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS actors (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('M01','M02','M03','M04','M05','M06')),
  pais TEXT,
  estado_region TEXT,
  municipio TEXT,
  asociacion TEXT,
  finca_nombre TEXT,
  id_documento TEXT,
  telefono TEXT,
  plan TEXT DEFAULT 'freemium',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── PARCELAS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS parcelas (
  id TEXT PRIMARY KEY,
  caficultor_id TEXT REFERENCES actors(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  gps_lat FLOAT8 NOT NULL,
  gps_lng FLOAT8 NOT NULL,
  variedad TEXT,
  altitud INTEGER,
  hectareas FLOAT4,
  eudr_verified BOOLEAN DEFAULT FALSE,
  foto_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── LOTES ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lotes (
  id TEXT PRIMARY KEY,
  caficultor_id TEXT REFERENCES actors(id),
  caficultor_nombre TEXT,
  parcela_id TEXT REFERENCES parcelas(id),
  pais TEXT,
  region TEXT,
  variedad TEXT,
  proceso TEXT CHECK (proceso IN ('lavado','natural','honey','anaerobico')),
  altitud_msnm INTEGER,
  fecha_cosecha DATE,
  kilos_disponibles FLOAT4,
  precio_fob FLOAT4,
  notas_cata TEXT,
  cupping_score FLOAT4,
  gps_lat FLOAT8,
  gps_lng FLOAT8,
  gps_eudr_verified BOOLEAN DEFAULT FALSE,
  eudr_status TEXT DEFAULT 'amber' CHECK (eudr_status IN ('green','amber','red')),
  eudr_compliance_pct INTEGER DEFAULT 0 CHECK (eudr_compliance_pct BETWEEN 0 AND 100),
  estado TEXT DEFAULT 'disponible' CHECK (estado IN ('disponible','reservado','tostado','agotado')),
  imagen_url TEXT,
  tostador_id TEXT,
  fecha_tueste DATE,
  nivel_tueste TEXT CHECK (nivel_tueste IN ('claro','medio','oscuro')),
  qr_hash TEXT,
  qr_url TEXT,
  qr_sealed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── PASAPORTES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pasaportes (
  id TEXT PRIMARY KEY,
  lote_id TEXT REFERENCES lotes(id),
  hash_sha256 TEXT UNIQUE NOT NULL,
  hash_corto TEXT UNIQUE NOT NULL,
  public_url TEXT,
  data JSONB NOT NULL,
  eudr_compliant BOOLEAN NOT NULL DEFAULT FALSE,
  sealed_at TIMESTAMPTZ DEFAULT NOW(),
  version INTEGER DEFAULT 1
);

-- ── PRODUCTOS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS productos (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  categoria TEXT CHECK (categoria IN ('lote_verde','lote_tostado','capsula','accesorio','suscripcion','b2b_granel')),
  precio FLOAT4,
  unidad TEXT,
  imagen_emoji TEXT,
  vendedor_id TEXT REFERENCES actors(id),
  vendedor_nombre TEXT,
  vendedor_rol TEXT,
  is_blend BOOLEAN DEFAULT FALSE,
  blend_compliance_pct INTEGER,
  cupping_score FLOAT4,
  eudr_status TEXT CHECK (eudr_status IN ('green','amber','red')),
  disponible BOOLEAN DEFAULT TRUE,
  destacado BOOLEAN DEFAULT FALSE,
  suscripcion_frecuencia TEXT,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- ── BLEND COMPONENTES ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blend_componentes (
  id SERIAL PRIMARY KEY,
  producto_id TEXT REFERENCES productos(id) ON DELETE CASCADE,
  lote_id TEXT REFERENCES lotes(id),
  porcentaje FLOAT4 NOT NULL CHECK (porcentaje > 0 AND porcentaje <= 100)
);

-- ── PEDIDOS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pedidos (
  id TEXT PRIMARY KEY,
  comprador_id TEXT REFERENCES actors(id),
  producto_id TEXT REFERENCES productos(id),
  cantidad FLOAT4,
  precio_total FLOAT4,
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente','confirmado','enviado','entregado','cancelado')),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
