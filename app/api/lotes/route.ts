import { NextResponse } from 'next/server';
import { MOCK_LOTES } from '@/lib/mock/lotes';

export async function GET() {
  return NextResponse.json(MOCK_LOTES);
}
