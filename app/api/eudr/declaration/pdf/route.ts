import { NextRequest, NextResponse } from 'next/server';
import { MOCK_LOTES } from '@/lib/mock/lotes';
import { loteToEUDRData, validateEUDR } from '@/lib/services/s_eudr';
import { generateDDSHtml } from '@/lib/utils/dds-html';

/**
 * GET /api/eudr/declaration/pdf?lote_id=lot-001&operador=...&eori=...
 * Retorna HTML print-ready que el browser convierte a PDF con Ctrl+P.
 * Sin dependencias externas — zero npm packages para PDF.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lote_id = searchParams.get('lote_id');
    const operador_nombre = searchParams.get('operador') ?? 'Green Origin SL';
    const operador_eori = searchParams.get('eori') ?? 'ESB-12345678';
    const operador_pais = searchParams.get('pais') ?? 'ES';

    if (!lote_id) {
      return new NextResponse('lote_id requerido', { status: 400 });
    }

    const lote = MOCK_LOTES.find(l => l.id === lote_id);
    if (!lote) {
      return new NextResponse(`Lote ${lote_id} no encontrado`, { status: 404 });
    }

    const eudrData = loteToEUDRData(lote);
    const validation = validateEUDR(eudrData);

    const now = new Date();
    const refYear = now.getFullYear();
    const refNum = Math.floor(Math.random() * 900000) + 100000;
    const referencia_traces = `TRACES-DDS-${refYear}-ES-${refNum}`;

    const declaration = {
      referencia_traces,
      tipo_documento: 'Declaración de Diligencia Debida — Reglamento UE 2023/1115',
      estado: validation.status === 'green' ? 'APROBADA' : 'PENDIENTE',
      fecha_emision: now.toISOString(),
      fecha_validez: new Date(now.getTime() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString(),
      operador: {
        nombre: operador_nombre,
        pais_establecimiento: operador_pais,
        numero_eori: operador_eori,
        tipo: 'operador_relevante',
      },
      producto: {
        descripcion: `Café verde en grano — ${lote.variedad}`,
        codigo_nc: '0901 11 00',
        pais_produccion: lote.pais,
        region_produccion: lote.region,
        peso_neto_kg: lote.kilos_disponibles,
        referencia_interna: lote.id,
      },
      parcelas: [{
        latitud: lote.gps_lat,
        longitud: lote.gps_lng,
        sistema_referencia: 'WGS84 · SRID 4326',
        eudr_gps_verificado: lote.gps_eudr_verified,
      }],
      cadena_custodia: {
        caficultor: {
          nombre: lote.caficultor_nombre,
          id_interno: lote.caficultor_id,
          gps_verificado: lote.gps_eudr_verified,
        },
        fecha_cosecha: lote.fecha_cosecha,
        proceso_beneficiado: lote.proceso,
      },
      declaracion_no_deforestacion: {
        texto: 'El operador declara que el presente producto no ha sido producido en tierras deforestadas ni ha contribuido a la degradación forestal después del 31 de diciembre de 2020, de conformidad con el artículo 3 del Reglamento (UE) 2023/1115.',
        baseline_date: '2020-12-31',
        fuentes_verificacion: [
          'Coordenadas GPS verificadas con sistema BREW CHAIN',
          'Datos satelitales Global Forest Watch · Hansen Forest Loss 2023',
          'Declaración firmada del operador responsable',
        ],
      },
      validacion_requisitos: {
        total: validation.total_count,
        aprobados: validation.satisfied_count,
        estado: validation.status,
        todos_requisitos: validation.requirements.map(r => ({
          id: String(r.id),
          label: r.label,
          cumplido: r.satisfied,
        })),
      },
      archivo: {
        duracion_minima_anos: 5,
        fecha_limite_archivo: new Date(now.getTime() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        nota: 'Este documento debe conservarse durante un mínimo de 5 años según Art. 9 Reglamento (UE) 2023/1115',
      },
      integridad: {
        hash_lote: lote.id,
        generado_por: 'BREW CHAIN v2 · S_EUDR Service',
        version_reglamento: 'Reglamento (UE) 2023/1115 del Parlamento Europeo y del Consejo',
      },
    };

    const html = generateDDSHtml(declaration);

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });

  } catch (err) {
    return new NextResponse(`Error generando DDS PDF: ${String(err)}`, { status: 500 });
  }
}
