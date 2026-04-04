import { NextRequest, NextResponse } from 'next/server';
import { validateGPS } from '@/lib/services/s_gps';

export async function POST(req: NextRequest) {
  const { lat, lng, precision_m } = await req.json();
  const result = validateGPS({ lat: Number(lat), lng: Number(lng), precision_m: Number(precision_m || 0) });
  return NextResponse.json(result);
}
