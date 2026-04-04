import { NextResponse } from 'next/server';

// Endpoint para registrar escaneos de QR
// El cliente también registra localmente via scanStore, pero este endpoint
// permite en el futuro agregar analíticas server-side en Supabase/PostHog
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { qr_hash, fuente = 'desconocido', variedad, caficultor } = body;

    if (!qr_hash) {
      return NextResponse.json({ error: 'qr_hash requerido' }, { status: 400 });
    }

    // En producción: insertar en Supabase tabla `qr_scans`
    // Por ahora: confirmar registro y devolver stats simulados
    const totalScans = Math.floor(Math.random() * 200) + 50;

    return NextResponse.json({
      ok: true,
      qr_hash,
      fuente,
      variedad,
      caficultor,
      total_scans_lote: totalScans,
      registered_at: new Date().toISOString(),
      mode: 'demo', // cambiar a 'live' al conectar Supabase
    });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
