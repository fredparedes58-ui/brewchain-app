import { NextRequest, NextResponse } from 'next/server';
import { sha256 } from '@/lib/services/s_qr';

export async function POST(req: NextRequest) {
  const { lote_id, data } = await req.json();

  // REGLA ABSOLUTA: GPS verificado
  if (!data?.caficultor_gps?.verified) {
    return NextResponse.json({ error: 'GPS del caficultor requerido antes de generar QR' }, { status: 400 });
  }

  const required = ['caficultor_gps', 'caficultor_nombre', 'tostador_nombre', 'fecha_tueste', 'variedad', 'fecha_cosecha'];
  const missing = required.filter(f => !data[f]);
  if (missing.length > 0) {
    return NextResponse.json({ error: `Campos obligatorios faltantes: ${missing.join(', ')}` }, { status: 400 });
  }

  const canonical = JSON.stringify(data, Object.keys(data).sort());
  const hash_sha256 = await sha256(canonical);
  const hash_corto = hash_sha256.substring(0, 12);
  const public_url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/lote/${hash_corto}`;

  const sealed_passport = {
    id: `pas-${Date.now()}`,
    lote_id,
    data,
    hash_sha256,
    hash_corto,
    public_url,
    sealed: true,
    sealed_at: new Date().toISOString(),
    version: 1,
  };

  return NextResponse.json({ hash_sha256, hash_corto, public_url, sealed_passport });
}
