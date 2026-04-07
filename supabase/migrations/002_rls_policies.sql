-- BREW CHAIN — Row Level Security Policies

-- Habilitar RLS en todas las tablas
ALTER TABLE actors ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE lotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pasaportes ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE blend_componentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

-- ── ACTORS ──────────────────────────────────────────────────
-- Cualquiera puede ver actores (para el marketplace)
CREATE POLICY "actors_public_read" ON actors FOR SELECT USING (true);
-- Solo el propio actor puede actualizar sus datos
CREATE POLICY "actors_own_update" ON actors FOR UPDATE USING (auth.uid()::text = id);
-- Solo admins pueden insertar (o el propio usuario vía auth trigger)
CREATE POLICY "actors_insert_own" ON actors FOR INSERT WITH CHECK (auth.uid()::text = id);

-- ── PARCELAS ────────────────────────────────────────────────
-- Caficultor solo ve sus parcelas
CREATE POLICY "parcelas_own_read" ON parcelas FOR SELECT USING (caficultor_id = auth.uid()::text);
CREATE POLICY "parcelas_own_write" ON parcelas FOR ALL USING (caficultor_id = auth.uid()::text);

-- ── LOTES ───────────────────────────────────────────────────
-- Lotes disponibles y green son públicos (marketplace)
CREATE POLICY "lotes_marketplace_public" ON lotes
  FOR SELECT USING (estado = 'disponible');
-- El caficultor propietario puede ver y editar todos sus lotes
CREATE POLICY "lotes_caficultor_all" ON lotes
  FOR ALL USING (caficultor_id = auth.uid()::text);

-- ── PASAPORTES ──────────────────────────────────────────────
-- Los pasaportes son públicos (cualquiera puede escanear el QR)
CREATE POLICY "pasaportes_public_read" ON pasaportes FOR SELECT USING (true);

-- ── PRODUCTOS ───────────────────────────────────────────────
-- Productos disponibles son públicos
CREATE POLICY "productos_public_read" ON productos FOR SELECT USING (disponible = true);
-- El vendedor puede gestionar sus propios productos
CREATE POLICY "productos_vendor_all" ON productos
  FOR ALL USING (vendedor_id = auth.uid()::text);

-- ── BLEND COMPONENTES ────────────────────────────────────────
CREATE POLICY "blend_componentes_public_read" ON blend_componentes FOR SELECT USING (true);

-- ── PEDIDOS ─────────────────────────────────────────────────
CREATE POLICY "pedidos_buyer_read" ON pedidos
  FOR SELECT USING (comprador_id = auth.uid()::text);
CREATE POLICY "pedidos_buyer_insert" ON pedidos
  FOR INSERT WITH CHECK (comprador_id = auth.uid()::text);
