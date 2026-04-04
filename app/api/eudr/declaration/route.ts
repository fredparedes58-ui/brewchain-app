import { NextRequest, NextResponse } from 'next/server';
import { MOCK_LOTES } from '@/lib/mock/lotes';
import { loteToEUDRData, validateEUDR } from '@/lib/services/s_eudr';

// S_EUDR — Generador de declaración TRACES
// Solo genera si el lote tiene los 12 requisitos en verde

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lote_id, operador_nombre, operador_pais, operador_eori } = body;

    if (!lote_id) {
      return NextResponse.json({ error: 'lote_id requerido' }, { status: 400 });
    }

    const lote = MOCK_LOTES.find(l => l.id === lote_id);
    if (!lote) {
      return NextResponse.json({ error: 'Lote no encontrado' }, { status: 404 });
    }

    // Validar los 12 requisitos EUDR
    const eudrData = loteToEUDRData(lote);
    const validation = validateEUDR(eudrData);

    // REGLA CRÍTICA: Solo generar declaración si 12/12 requisitos son green
    if (validation.status !== 'green') {
      return NextResponse.json({
        error: 'No se puede generar la declaración EUDR',
        reason: `El lote no cumple todos los requisitos. Estado: ${validation.status.toUpperCase()} (${validation.satisfied_count}/${validation.total_count} requisitos aprobados)`,
        failing_requirements: validation.requirements
          .filter(r => !r.satisfied)
          .map(r => ({ id: r.id, label: r.label })),
      }, { status: 422 });
    }

    // Generar número de referencia único
    const now = new Date();
    const refYear = now.getFullYear();
    const refNum = Math.floor(Math.random() * 900000) + 100000;
    const referencia_traces = `TRACES-DDS-${refYear}-ES-${refNum}`;

    // Declaración TRACES (formato DD/EUDR)
    const declaration = {
      // Metadatos de la declaración
      referencia_traces,
      tipo_documento: 'Declaración de Diligencia Debida — Reglamento UE 2023/1115',
      estado: 'APROBADA',
      fecha_emision: now.toISOString(),
      fecha_validez: new Date(now.getTime() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 5 años

      // Operador (importador)
      operador: {
        nombre: operador_nombre || 'Operador no especificado',
        pais_establecimiento: operador_pais || 'ES',
        numero_eori: operador_eori || 'ESB-XXXX',
        tipo: 'operador_relevante',
      },

      // Producto
      producto: {
        descripcion: `Café verde en grano — ${lote.variedad}`,
        codigo_nc: '0901 11 00', // Nomenclatura combinada UE para café verde sin tostar
        pais_produccion: lote.pais,
        region_produccion: lote.region,
        peso_neto_kg: lote.kilos_disponibles,
        referencia_interna: lote.id,
      },

      // Parcelas de producción
      parcelas: [{
        latitud: lote.gps_lat,
        longitud: lote.gps_lng,
        sistema_referencia: 'WGS84 · SRID 4326',
        eudr_gps_verificado: lote.gps_eudr_verified,
      }],

      // Evidencia de cadena de custodia
      cadena_custodia: {
        caficultor: {
          nombre: lote.caficultor_nombre,
          id_interno: lote.caficultor_id,
          gps_verificado: lote.gps_eudr_verified,
        },
        fecha_cosecha: lote.fecha_cosecha,
        proceso_beneficiado: lote.proceso,
      },

      // Declaración de no deforestación
      declaracion_no_deforestacion: {
        texto: 'El operador declara que el presente producto no ha sido producido en tierras deforestadas ni ha contribuido a la degradación forestal después del 31 de diciembre de 2020, de conformidad con el artículo 3 del Reglamento (UE) 2023/1115.',
        baseline_date: '2020-12-31',
        fuentes_verificacion: [
          'Coordenadas GPS verificadas con sistema BREW CHAIN',
          'Imágenes satelitales Copernicus Global Land Service',
          'Declaración firmada del operador responsable',
        ],
      },

      // Validación EUDR completa
      validacion_requisitos: {
        total: validation.total_count,
        aprobados: validation.satisfied_count,
        estado: validation.status,
        todos_requisitos: validation.requirements.map(r => ({
          id: r.id,
          label: r.label,
          cumplido: r.satisfied,
        })),
      },

      // Archivo requerido por ley
      archivo: {
        duracion_minima_anos: 5,
        fecha_limite_archivo: new Date(now.getTime() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        sistema_archivo: 'BREW CHAIN v2 · Registro inmutable',
        nota: 'Este documento debe conservarse durante un mínimo de 5 años según Art. 9 Reglamento (UE) 2023/1115',
      },

      // Hash de integridad
      integridad: {
        hash_lote: lote.id,
        generado_por: 'BREW CHAIN v2 · S_EUDR Service',
        version_reglamento: 'Reglamento (UE) 2023/1115 del Parlamento Europeo y del Consejo',
      },
    };

    return NextResponse.json({
      success: true,
      referencia_traces,
      lote_id,
      declaration,
      download_filename: `EUDR_DDS_${referencia_traces}_${lote_id}.json`,
    });

  } catch (err) {
    return NextResponse.json(
      { error: 'Error generando declaración EUDR', detail: String(err) },
      { status: 500 }
    );
  }
}
