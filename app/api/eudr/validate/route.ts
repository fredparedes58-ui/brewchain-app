import { NextRequest, NextResponse } from 'next/server';
import { validateEUDR, loteToEUDRData } from '@/lib/services/s_eudr';
import { MOCK_LOTES } from '@/lib/mock/lotes';

export async function POST(req: NextRequest) {
  const { lote_id } = await req.json();
  const lote = MOCK_LOTES.find(l => l.id === lote_id);
  if (!lote) return NextResponse.json({ error: 'Lote no encontrado' }, { status: 404 });
  const eudrData = loteToEUDRData(lote);
  const result = validateEUDR(eudrData);
  return NextResponse.json(result);
}
