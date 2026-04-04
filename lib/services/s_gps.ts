// S_GPS — Validación GPS determinista (WGS84)
// REGLA: El GPS del caficultor es INMUTABLE una vez verificado

export interface GPSInput {
  lat: number;
  lng: number;
  precision_m?: number;
}

export interface GPSValidationResult {
  valid: boolean;
  srid: 4326;
  format: 'WGS84';
  precision_ok: boolean;
  precision_m: number;
  error?: string;
  eudr_compliant: boolean;
}

export const GPS_MIN_PRECISION_M = 25;

// Rangos válidos de café de especialidad (zonas productoras)
const COFFEE_BELT_LAT = { min: -25, max: 25 };

export function validateGPS(input: GPSInput): GPSValidationResult {
  const { lat, lng, precision_m = 0 } = input;

  // Validar rango WGS84
  if (lat < -90 || lat > 90) {
    return { valid: false, srid: 4326, format: 'WGS84', precision_ok: false, precision_m, eudr_compliant: false, error: 'Latitud fuera de rango (-90 a 90)' };
  }
  if (lng < -180 || lng > 180) {
    return { valid: false, srid: 4326, format: 'WGS84', precision_ok: false, precision_m, eudr_compliant: false, error: 'Longitud fuera de rango (-180 a 180)' };
  }

  // Precisión mínima
  const precision_ok = precision_m === 0 || precision_m <= GPS_MIN_PRECISION_M;

  // Zona cafetera (alerta, no bloqueo)
  const in_coffee_belt = lat >= COFFEE_BELT_LAT.min && lat <= COFFEE_BELT_LAT.max;
  if (!in_coffee_belt) {
    console.warn(`GPS fuera del coffee belt: lat=${lat}. Verificar.`);
  }

  return {
    valid: true,
    srid: 4326,
    format: 'WGS84',
    precision_ok,
    precision_m: precision_m || GPS_MIN_PRECISION_M,
    eudr_compliant: true,
  };
}

export function formatGPSForDisplay(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'O';
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
}

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // metros
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
