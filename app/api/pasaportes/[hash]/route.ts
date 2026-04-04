import { NextRequest, NextResponse } from 'next/server';
import { MOCK_PASAPORTES } from '@/lib/mock/pasaportes';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ hash: string }> }) {
  const { hash } = await params;
  const passport = MOCK_PASAPORTES.find(p => p.hash_corto === hash || p.hash_sha256 === hash);
  if (!passport) return NextResponse.json({ error: 'Pasaporte no encontrado' }, { status: 404 });
  return NextResponse.json(passport);
}
