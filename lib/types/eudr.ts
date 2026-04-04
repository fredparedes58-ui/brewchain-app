export interface EUDRRequirement {
  id: number;
  label: string;
  description: string;
  satisfied: boolean;
  value?: string;
  mandatory: boolean;
}

export type EUDRStatus = 'green' | 'amber' | 'red';

export interface EUDRValidation {
  lote_id: string;
  requirements: EUDRRequirement[];
  satisfied_count: number;
  total_count: number;
  compliance_pct: number;
  status: EUDRStatus;
  can_generate_declaration: boolean;
  missing_fields: string[];
}

export interface EUDRDeclaration {
  id: string;
  lote_id: string;
  importador_id: string;
  validation: EUDRValidation;
  generated_at: string;
  archived_until: string;
  format: 'TRACES_EU';
  pdf_path?: string;
}

// Versión ligera para persistir en localStorage (sin validation completa)
export interface EUDRDeclarationRecord {
  id: string;
  lote_id: string;
  lote_variedad?: string;
  lote_region?: string;
  referencia_traces: string;
  traces_nt_reference?: string;   // del endpoint /api/eudr/traces-submit
  generated_at: string;
  archived_until: string;
  download_filename: string;
  status: 'local' | 'submitted';  // local = solo descargado, submitted = enviado a TRACES NT
  traces_status?: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED';
}

export const EUDR_REQUIREMENTS_LABELS = [
  'Descripción del producto (código CN 0901)',
  'País de producción y coordenadas GPS de las parcelas',
  'Nombre y dirección del proveedor (caficultor)',
  'Nombre y dirección del comprador (importador EU)',
  'Información de legalidad (legislación país de producción)',
  'Referencia a documentos justificativos (contratos/facturas)',
  'Evaluación del riesgo de deforestación (GFW API)',
  'Medidas de mitigación del riesgo',
  'Declaración de no deforestación',
  'Fecha de producción (cosecha)',
  'Geolocalización GPS de las parcelas (OBLIGATORIO)',
  'Conformidad con la legislación del país de producción',
];
