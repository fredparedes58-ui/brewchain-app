// @ts-ignore — instalar con: npm install @supabase/supabase-js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Solo crear cliente si tenemos credenciales
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const USE_SUPABASE =
  process.env.NEXT_PUBLIC_USE_SUPABASE === 'true' && !!supabase;
