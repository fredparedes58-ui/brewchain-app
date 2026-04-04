import { NextRequest, NextResponse } from 'next/server';
import { MOCK_PASAPORTES } from '@/lib/mock/pasaportes';

// S_QR — Verificación de integridad de pasaporte digital
// Verifica que el hash del QR coincide con los datos del pasaporte sellado

async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { hash, lote_id } = body;

    if (!hash) {
      return NextResponse.json({ error: 'hash requerido' }, { status: 400 });
    }

    // Buscar pasaporte por hash_corto o hash_sha256
    const passport = MOCK_PASAPORTES.find(
      p => p.hash_corto === hash || p.hash_sha256 === hash
    );

    if (!passport) {
      return NextResponse.json({
        valid: false,
        reason: 'Pasaporte no encontrado. El QR puede ser falso o el lote no existe.',
        hash_provided: hash,
        scanned_at: new Date().toISOString(),
      }, { status: 404 });
    }

    // Verificar que el pasaporte está sellado
    if (!passport.sealed) {
      return NextResponse.json({
        valid: false,
        reason: 'El pasaporte existe pero no está sellado. Proceso incompleto.',
        hash_provided: hash,
        scanned_at: new Date().toISOString(),
      }, { status: 422 });
    }

    // Si se proporciona lote_id, verificar que coincide
    if (lote_id && passport.lote_id !== lote_id) {
      return NextResponse.json({
        valid: false,
        reason: `El hash corresponde al lote ${passport.lote_id}, no a ${lote_id}.`,
        hash_provided: hash,
        scanned_at: new Date().toISOString(),
      }, { status: 422 });
    }

    // Re-calcular hash para verificar integridad de datos
    const canonicalPayload = JSON.stringify(passport.data, Object.keys(passport.data).sort());
    const computedHash = await sha256(canonicalPayload);
    const hashIntact = computedHash === passport.hash_sha256;

    // Resultado de verificación
    return NextResponse.json({
      valid: true,
      integrity_ok: hashIntact,
      passport: {
        lote_id: passport.lote_id,
        hash_corto: passport.hash_corto,
        hash_sha256: passport.hash_sha256,
        sealed: passport.sealed,
        sealed_at: passport.sealed_at,
        version: passport.version,
        public_url: passport.public_url,
      },
      summary: {
        caficultor: passport.data.caficultor_nombre,
        origen: passport.data.pais_region,
        variedad: passport.data.variedad,
        tostador: passport.data.tostador_nombre,
        cupping_score: passport.data.cupping_score,
        eudr_compliant: passport.data.eudr_compliant,
        nivel_tueste: passport.data.nivel_tueste,
      },
      integrity_check: hashIntact
        ? '✓ Hash verificado — datos originales e intactos desde el sellado'
        : '⚠️ Hash no coincide — los datos pueden haber sido modificados',
      scanned_at: new Date().toISOString(),
    });

  } catch (err) {
    return NextResponse.json(
      { error: 'Error verificando QR', detail: String(err) },
      { status: 500 }
    );
  }
}

// GET también disponible para verificar por URL param
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const hash = searchParams.get('hash');

  if (!hash) {
    return NextResponse.json({ error: 'Parámetro hash requerido: /api/qr/verify?hash=xxxx' }, { status: 400 });
  }

  // Reusar la lógica POST
  const mockReq = new Request(req.url, {
    method: 'POST',
    body: JSON.stringify({ hash }),
    headers: { 'Content-Type': 'application/json' },
  });

  return POST(mockReq as NextRequest);
}
