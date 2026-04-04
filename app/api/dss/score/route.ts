import { NextRequest, NextResponse } from 'next/server';
import { calculateFocusScore } from '@/lib/services/s_dss';
import { MOCK_KPIS } from '@/lib/mock/kpis';

export async function GET() {
  const score = calculateFocusScore(MOCK_KPIS);
  return NextResponse.json(score);
}

export async function POST(req: NextRequest) {
  const kpis = await req.json();
  const score = calculateFocusScore({ ...MOCK_KPIS, ...kpis });
  return NextResponse.json(score);
}
