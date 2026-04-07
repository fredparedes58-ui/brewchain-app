/**
 * dds-html.ts — Generador de HTML print-ready para la DDS EUDR
 * Ítem 5 del Plan Brewchain
 *
 * Sin dependencias externas. El browser nativo convierte el HTML a PDF
 * via Ctrl+P → Guardar como PDF (Chrome / Edge / Safari).
 */

interface DDSDeclaration {
  referencia_traces: string;
  tipo_documento: string;
  estado: string;
  fecha_emision: string;
  fecha_validez: string;
  operador: {
    nombre: string;
    pais_establecimiento: string;
    numero_eori: string;
    tipo: string;
  };
  producto: {
    descripcion: string;
    codigo_nc: string;
    pais_produccion: string;
    region_produccion: string;
    peso_neto_kg: number;
    referencia_interna: string;
  };
  parcelas: Array<{
    latitud: number;
    longitud: number;
    sistema_referencia: string;
    eudr_gps_verificado: boolean;
  }>;
  cadena_custodia: {
    caficultor: { nombre: string; id_interno: string; gps_verificado: boolean };
    fecha_cosecha: string;
    proceso_beneficiado: string;
  };
  declaracion_no_deforestacion: {
    texto: string;
    baseline_date: string;
    fuentes_verificacion: string[];
  };
  validacion_requisitos: {
    total: number;
    aprobados: number;
    estado: string;
    todos_requisitos: Array<{ id: string; label: string; cumplido: boolean }>;
  };
  archivo: {
    duracion_minima_anos: number;
    fecha_limite_archivo: string;
    nota: string;
  };
  integridad: {
    hash_lote: string;
    generado_por: string;
    version_reglamento: string;
  };
}

export function generateDDSHtml(declaration: DDSDeclaration): string {
  const fechaEmision = new Date(declaration.fecha_emision).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const fechaValidez = new Date(declaration.fecha_validez).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const fechaGenerado = new Date().toLocaleString('es-ES');

  const requisitosRows = declaration.validacion_requisitos.todos_requisitos
    .map(r => `
      <tr>
        <td style="padding:5px 8px;border-bottom:1px solid #e5e7eb;font-size:11px;color:#374151">${r.id}</td>
        <td style="padding:5px 8px;border-bottom:1px solid #e5e7eb;font-size:11px;color:#374151">${r.label}</td>
        <td style="padding:5px 8px;border-bottom:1px solid #e5e7eb;text-align:center">
          <span style="color:${r.cumplido ? '#16a34a' : '#dc2626'};font-weight:700;font-size:13px">
            ${r.cumplido ? '✓' : '✗'}
          </span>
        </td>
      </tr>`)
    .join('');

  const parcelasRows = declaration.parcelas
    .map((p, i) => `
      <tr>
        <td style="padding:5px 8px;border-bottom:1px solid #e5e7eb;font-size:11px;color:#374151">${i + 1}</td>
        <td style="padding:5px 8px;border-bottom:1px solid #e5e7eb;font-size:11px;font-family:monospace;color:#374151">${p.latitud.toFixed(6)}</td>
        <td style="padding:5px 8px;border-bottom:1px solid #e5e7eb;font-size:11px;font-family:monospace;color:#374151">${p.longitud.toFixed(6)}</td>
        <td style="padding:5px 8px;border-bottom:1px solid #e5e7eb;font-size:11px;color:#374151">${p.sistema_referencia}</td>
        <td style="padding:5px 8px;border-bottom:1px solid #e5e7eb;text-align:center">
          <span style="color:${p.eudr_gps_verificado ? '#16a34a' : '#d97706'};font-weight:700;font-size:11px">
            ${p.eudr_gps_verificado ? '✓ Verificado' : '⚠ Pendiente'}
          </span>
        </td>
      </tr>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DDS EUDR · ${declaration.referencia_traces}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #111827;
      background: #fff;
      padding: 32px;
      max-width: 860px;
      margin: 0 auto;
    }
    @media print {
      body { padding: 16px; }
      .no-print { display: none !important; }
      @page { margin: 1.5cm; size: A4; }
    }

    /* ── Botón imprimir ── */
    .print-btn {
      display: inline-flex; align-items: center; gap: 8px;
      background: #1B5E30; color: white;
      border: none; border-radius: 8px;
      padding: 10px 20px; font-size: 14px; font-weight: 700;
      cursor: pointer; margin-bottom: 24px;
    }
    .print-btn:hover { background: #14532d; }

    /* ── Header ── */
    .header {
      display: flex; justify-content: space-between; align-items: flex-start;
      border-bottom: 3px solid #1B5E30; padding-bottom: 16px; margin-bottom: 20px;
    }
    .header-left h1 { font-size: 22px; font-weight: 900; color: #1B5E30; }
    .header-left p { font-size: 11px; color: #6b7280; margin-top: 2px; }
    .header-right { text-align: right; }
    .ref-badge {
      background: #f0fdf4; border: 1px solid #86efac;
      border-radius: 6px; padding: 6px 12px;
      font-family: monospace; font-size: 12px; font-weight: 700; color: #15803d;
    }
    .status-badge {
      display: inline-block; margin-top: 6px;
      background: #16a34a; color: white;
      border-radius: 4px; padding: 3px 10px;
      font-size: 11px; font-weight: 700; letter-spacing: 0.5px;
    }

    /* ── Secciones ── */
    .section { margin-bottom: 18px; }
    .section-title {
      font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
      text-transform: uppercase; color: #6b7280;
      border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; margin-bottom: 10px;
    }

    /* ── Grid de datos ── */
    .data-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px;
    }
    .data-item label {
      display: block; font-size: 10px; color: #9ca3af; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 1px;
    }
    .data-item span {
      font-size: 12px; color: #111827; font-weight: 500;
    }

    /* ── Tablas ── */
    table { width: 100%; border-collapse: collapse; }
    th {
      background: #f9fafb; padding: 6px 8px;
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.5px; color: #6b7280;
      border-bottom: 2px solid #e5e7eb; text-align: left;
    }

    /* ── Declaración ── */
    .declaration-box {
      background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px;
      padding: 14px; font-size: 11.5px; line-height: 1.6; color: #166534;
    }
    .declaration-sources { margin-top: 8px; }
    .declaration-sources li {
      font-size: 10.5px; color: #16a34a; margin-left: 16px; margin-top: 3px;
    }

    /* ── Integridad ── */
    .integrity-box {
      background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;
      padding: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
    }
    .integrity-box label {
      font-size: 10px; color: #9ca3af; font-weight: 600;
      text-transform: uppercase; display: block; margin-bottom: 2px;
    }
    .integrity-box span {
      font-size: 11px; color: #374151; font-family: monospace;
    }

    /* ── Footer ── */
    .footer {
      margin-top: 24px; padding-top: 12px; border-top: 1px solid #e5e7eb;
      display: flex; justify-content: space-between;
      font-size: 9.5px; color: #9ca3af;
    }

    /* ── Stats summary ── */
    .req-summary {
      display: inline-flex; align-items: center; gap: 8px;
      background: #f0fdf4; border: 1px solid #86efac; border-radius: 6px;
      padding: 6px 12px; margin-bottom: 10px;
    }
    .req-summary .req-count {
      font-size: 18px; font-weight: 900; color: #16a34a;
    }
    .req-summary .req-label {
      font-size: 11px; color: #166534;
    }
  </style>
</head>
<body>

  <!-- Botón imprimir (no aparece en PDF) -->
  <div class="no-print">
    <button class="print-btn" onclick="window.print()">
      🖨️ Guardar como PDF (Ctrl+P)
    </button>
    <p style="font-size:11px;color:#6b7280;margin-bottom:20px">
      En el diálogo de impresión selecciona "Guardar como PDF" como destino.
    </p>
  </div>

  <!-- ── ENCABEZADO ── -->
  <div class="header">
    <div class="header-left">
      <h1>☕ BREW CHAIN</h1>
      <p>Declaración de Diligencia Debida · Reglamento (UE) 2023/1115</p>
      <p style="font-size:10px;color:#9ca3af;margin-top:4px">Sistema de Trazabilidad de Café · brewchain.app</p>
    </div>
    <div class="header-right">
      <div class="ref-badge">${declaration.referencia_traces}</div>
      <div class="status-badge">✓ ${declaration.estado}</div>
      <p style="font-size:10px;color:#9ca3af;margin-top:6px">Emitida: ${fechaEmision}</p>
      <p style="font-size:10px;color:#9ca3af">Válida hasta: ${fechaValidez}</p>
    </div>
  </div>

  <!-- ── 1. OPERADOR ── -->
  <div class="section">
    <div class="section-title">1. Operador Responsable</div>
    <div class="data-grid">
      <div class="data-item">
        <label>Nombre / Razón Social</label>
        <span>${declaration.operador.nombre}</span>
      </div>
      <div class="data-item">
        <label>Número EORI</label>
        <span style="font-family:monospace">${declaration.operador.numero_eori}</span>
      </div>
      <div class="data-item">
        <label>País de Establecimiento</label>
        <span>${declaration.operador.pais_establecimiento}</span>
      </div>
      <div class="data-item">
        <label>Tipo de Operador</label>
        <span style="text-transform:capitalize">${declaration.operador.tipo.replace(/_/g, ' ')}</span>
      </div>
    </div>
  </div>

  <!-- ── 2. PRODUCTO ── -->
  <div class="section">
    <div class="section-title">2. Descripción del Producto</div>
    <div class="data-grid">
      <div class="data-item">
        <label>Descripción</label>
        <span>${declaration.producto.descripcion}</span>
      </div>
      <div class="data-item">
        <label>Código NC (Nomenclatura Combinada UE)</label>
        <span style="font-family:monospace">${declaration.producto.codigo_nc}</span>
      </div>
      <div class="data-item">
        <label>País de Producción</label>
        <span>${declaration.producto.pais_produccion}</span>
      </div>
      <div class="data-item">
        <label>Región de Producción</label>
        <span>${declaration.producto.region_produccion}</span>
      </div>
      <div class="data-item">
        <label>Peso Neto (kg)</label>
        <span>${declaration.producto.peso_neto_kg.toLocaleString('es-ES')} kg</span>
      </div>
      <div class="data-item">
        <label>Referencia Interna</label>
        <span style="font-family:monospace">${declaration.producto.referencia_interna}</span>
      </div>
    </div>
  </div>

  <!-- ── 3. PARCELAS / GPS ── -->
  <div class="section">
    <div class="section-title">3. Parcelas de Producción · Coordenadas GPS (WGS84)</div>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Latitud</th>
          <th>Longitud</th>
          <th>Sistema de Referencia</th>
          <th>Verificación GPS</th>
        </tr>
      </thead>
      <tbody>${parcelasRows}</tbody>
    </table>
  </div>

  <!-- ── 4. CADENA DE CUSTODIA ── -->
  <div class="section">
    <div class="section-title">4. Cadena de Custodia</div>
    <div class="data-grid">
      <div class="data-item">
        <label>Productor / Caficultor</label>
        <span>${declaration.cadena_custodia.caficultor.nombre}</span>
      </div>
      <div class="data-item">
        <label>ID Interno Productor</label>
        <span style="font-family:monospace">${declaration.cadena_custodia.caficultor.id_interno}</span>
      </div>
      <div class="data-item">
        <label>Fecha de Cosecha</label>
        <span>${declaration.cadena_custodia.fecha_cosecha}</span>
      </div>
      <div class="data-item">
        <label>Proceso de Beneficiado</label>
        <span style="text-transform:capitalize">${declaration.cadena_custodia.proceso_beneficiado}</span>
      </div>
    </div>
  </div>

  <!-- ── 5. DECLARACIÓN DE NO DEFORESTACIÓN ── -->
  <div class="section">
    <div class="section-title">5. Declaración de No Deforestación · Art. 3 Reg. (UE) 2023/1115</div>
    <div class="declaration-box">
      <p>${declaration.declaracion_no_deforestacion.texto}</p>
      <p style="margin-top:6px;font-size:10.5px;color:#166534">
        <strong>Fecha base de referencia:</strong> ${declaration.declaracion_no_deforestacion.baseline_date}
      </p>
      <ul class="declaration-sources">
        ${declaration.declaracion_no_deforestacion.fuentes_verificacion
          .map(f => `<li>• ${f}</li>`).join('')}
      </ul>
    </div>
  </div>

  <!-- ── 6. VALIDACIÓN 12 REQUISITOS EUDR ── -->
  <div class="section">
    <div class="section-title">6. Validación de Requisitos EUDR</div>
    <div class="req-summary">
      <span class="req-count">${declaration.validacion_requisitos.aprobados}/${declaration.validacion_requisitos.total}</span>
      <span class="req-label">requisitos aprobados · Estado: <strong>${declaration.validacion_requisitos.estado.toUpperCase()}</strong></span>
    </div>
    <table>
      <thead>
        <tr>
          <th style="width:60px">ID</th>
          <th>Requisito</th>
          <th style="width:80px;text-align:center">Estado</th>
        </tr>
      </thead>
      <tbody>${requisitosRows}</tbody>
    </table>
  </div>

  <!-- ── 7. OBLIGACIÓN DE ARCHIVO ── -->
  <div class="section">
    <div class="section-title">7. Obligación de Archivo · Art. 9 Reg. (UE) 2023/1115</div>
    <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:6px;padding:10px 14px;font-size:11.5px;color:#92400e">
      ${declaration.archivo.nota}<br>
      <strong>Fecha límite de archivo:</strong> ${declaration.archivo.fecha_limite_archivo}
    </div>
  </div>

  <!-- ── 8. INTEGRIDAD ── -->
  <div class="section">
    <div class="section-title">8. Integridad del Documento</div>
    <div class="integrity-box">
      <div>
        <label>Hash del Lote</label>
        <span>${declaration.integridad.hash_lote}</span>
      </div>
      <div>
        <label>Generado por</label>
        <span>${declaration.integridad.generado_por}</span>
      </div>
      <div>
        <label>Versión del Reglamento</label>
        <span>${declaration.integridad.version_reglamento}</span>
      </div>
      <div>
        <label>Fecha de Generación</label>
        <span>${fechaGenerado}</span>
      </div>
    </div>
  </div>

  <!-- ── FOOTER ── -->
  <div class="footer">
    <span>BREW CHAIN · Sistema de Trazabilidad de Café · brewchain.app</span>
    <span>${declaration.referencia_traces} · ${fechaEmision}</span>
  </div>

</body>
</html>`;
}
