// S_QR — Generador QR + Pasaporte Inmutable
// REGLA: Mismo pasaporte = mismo hash SIEMPRE. INMUTABLE post-sello.

import { PassportData, SealedPassport, QRResult } from '../types/passport';

// Canonicalizar JSON (reproducible)
function canonicalize(obj: object): string {
  return JSON.stringify(obj, Object.keys(obj).sort());
}

// SHA-256 en el navegador usando Web Crypto API
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Validar campos mínimos del pasaporte
export function validatePassportMinimum(data: PassportData): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!data.caficultor_gps || !data.caficultor_gps.verified) missing.push('GPS del caficultor verificado');
  if (!data.caficultor_nombre) missing.push('Nombre del caficultor');
  if (!data.tostador_nombre) missing.push('Nombre del tostador');
  if (!data.fecha_tueste) missing.push('Fecha de tueste');
  if (!data.variedad) missing.push('Variedad de café');
  if (!data.fecha_cosecha) missing.push('Fecha de cosecha');
  return { valid: missing.length === 0, missing };
}

// Generar QR — PASO CRÍTICO (irreversible)
export async function generateQR(lote_id: string, data: PassportData): Promise<QRResult> {
  // REGLA ABSOLUTA: GPS debe estar verificado
  if (!data.caficultor_gps?.verified) {
    throw new Error('❌ GPS del caficultor requerido. El QR no puede generarse sin GPS verificado.');
  }

  const validation = validatePassportMinimum(data);
  if (!validation.valid) {
    throw new Error(`❌ Campos obligatorios faltantes: ${validation.missing.join(', ')}`);
  }

  // Serialización canónica (reproducible)
  const canonical = canonicalize(data);

  // Hash SHA-256
  const hash_sha256 = await sha256(canonical);
  const hash_corto = hash_sha256.substring(0, 12);
  const public_url = `https://brewchain.app/lote/${hash_corto}`;

  // Sello inmutable
  const sealed_passport: SealedPassport = {
    id: `pas-${Date.now()}`,
    lote_id,
    data,
    hash_sha256,
    hash_corto,
    public_url,
    sealed: true,
    sealed_at: new Date().toISOString(),
    version: 1,
  };

  return {
    hash_sha256,
    hash_corto,
    public_url,
    sealed_passport,
  };
}

// Verificar integridad del pasaporte
export async function verifyPassport(passport: SealedPassport): Promise<boolean> {
  const canonical = canonicalize(passport.data);
  const recalculated = await sha256(canonical);
  return recalculated === passport.hash_sha256;
}

// Generar QR code como data URL (string base64 SVG)
export async function generateQRDataURL(url: string): Promise<string> {
  if (typeof window === 'undefined') return '';
  try {
    const QRCode = (await import('qrcode')).default;
    return await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'M',
      margin: 4,
      width: 300,
      color: { dark: '#1A0D05', light: '#FBF6EE' },
    });
  } catch {
    return '';
  }
}
