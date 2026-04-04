import { NextRequest, NextResponse } from 'next/server';

// Simula la respuesta oficial de TRACES NT (Trade Control and Expert System - New Technology)
// Comisión Europea · DG SANTE · https://webgate.ec.europa.eu/tracesnt
// Formato de referencia real: TRA.NT.YYYY.XXXXXXX

function generarReferenciaTracesNT(): string {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 9_000_000) + 1_000_000);
  return `TRA.NT.${year}.${seq}`;
}

function generarOperadorId(eori: string): string {
  // Formato TRACES NT: EORI + sufijo de registro
  return `OPR-${eori.replace(/[^A-Z0-9]/g, '')}-${Date.now().toString(36).toUpperCase()}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      referencia_local,
      lote_id,
      operador_nombre,
      operador_eori,
      operador_pais,
      caficultor_nombre,
      pais_origen,
      gps_lat,
      gps_lng,
      kilos,
      fecha_cosecha,
      variedad,
    } = body;

    if (!lote_id || !operador_eori) {
      return NextResponse.json({ error: 'lote_id y operador_eori son requeridos' }, { status: 400 });
    }

    // Simular latencia de red real (~600-1200ms)
    await new Promise(r => setTimeout(r, 700 + Math.random() * 500));

    const traces_nt_reference = generarReferenciaTracesNT();
    const operator_id = generarOperadorId(operador_eori);
    const now = new Date().toISOString();
    const archiveUntil = new Date(Date.now() + 5 * 365.25 * 24 * 3600 * 1000).toISOString().split('T')[0];

    return NextResponse.json({
      success: true,
      traces_nt_reference,
      operator_id,
      // Campos reales de TRACES NT v4.2
      traces_nt_version: '4.2',
      regulation: 'EU 2023/1115',
      status: 'SUBMITTED',
      submission_timestamp: now,
      estimated_review_completion: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
      // Datos del commodity
      commodity: {
        hs_code: '0901 11 00',
        cn_code: '0901',
        description: 'Café sin tostar, sin descafeinar',
        species: 'Coffea arabica',
        variety: variedad ?? 'No especificada',
        net_weight_kg: kilos ?? 0,
        country_of_origin: pais_origen ?? 'CO',
        production_date: fecha_cosecha ?? null,
        gps_coordinates: gps_lat && gps_lng ? { latitude: gps_lat, longitude: gps_lng } : null,
      },
      // Datos del operador
      operator: {
        id: operator_id,
        name: operador_nombre ?? 'Operador UE',
        eori: operador_eori,
        country: operador_pais ?? 'ES',
        role: 'FIRST_PLACER',
      },
      // Datos del proveedor
      supplier: {
        name: caficultor_nombre ?? 'No especificado',
        country: pais_origen ?? 'CO',
      },
      // Trazabilidad
      traceability: {
        internal_reference: referencia_local,
        lote_id,
        eudr_compliant: true,
        gfw_assessment: 'COMPLETED',
        deforestation_risk: 'STANDARD',
      },
      // Obligaciones de archivo
      archival: {
        mandatory_until: archiveUntil,
        legal_basis: 'Art. 9 Reglamento (UE) 2023/1115',
        format: 'TRACES_NT_JSON',
      },
      // Audit trail TRACES
      audit_trail: {
        created_at: now,
        created_by: 'BREWCHAIN_SYSTEM',
        traces_nt_endpoint: 'webgate.ec.europa.eu/tracesnt/api/v1/eudr/dds',
        ip_logged: '::1',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Error procesando la solicitud' }, { status: 500 });
  }
}
