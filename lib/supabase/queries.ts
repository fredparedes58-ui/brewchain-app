import { supabase, USE_SUPABASE } from './client';
import { MOCK_LOTES } from '../mock/lotes';
import { MOCK_CAFICULTORES } from '../mock/caficultores';
import { MOCK_PRODUCTOS } from '../mock/productos';
import { Lote } from '../types/lote';
import { Actor } from '../types/actors';
import { Producto } from '../types/producto';

export async function getLotes(): Promise<Lote[]> {
  if (!USE_SUPABASE) return MOCK_LOTES;
  const { data, error } = await supabase!.from('lotes').select('*');
  if (error) {
    console.error('Supabase getLotes error:', error);
    return MOCK_LOTES;
  }
  return data ?? MOCK_LOTES;
}

export async function getLoteById(id: string): Promise<Lote | null> {
  if (!USE_SUPABASE) return MOCK_LOTES.find((l) => l.id === id) ?? null;
  const { data, error } = await supabase!
    .from('lotes')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return MOCK_LOTES.find((l) => l.id === id) ?? null;
  return data;
}

export async function getCaficultores(): Promise<Actor[]> {
  if (!USE_SUPABASE) return MOCK_CAFICULTORES;
  const { data, error } = await supabase!
    .from('actors')
    .select('*')
    .eq('role', 'M01');
  if (error) return MOCK_CAFICULTORES;
  return data ?? MOCK_CAFICULTORES;
}

export async function getProductos(): Promise<Producto[]> {
  if (!USE_SUPABASE) return MOCK_PRODUCTOS;
  const { data, error } = await supabase!
    .from('productos')
    .select('*, blend_componentes(*)');
  if (error) return MOCK_PRODUCTOS;
  return data ?? MOCK_PRODUCTOS;
}

export async function upsertLote(lote: Lote): Promise<boolean> {
  if (!USE_SUPABASE) return true; // En mock, asumir éxito
  const { error } = await supabase!.from('lotes').upsert(lote);
  return !error;
}
