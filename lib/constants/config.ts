export const CONFIG = {
  GPS_MIN_PRECISION_M: 25,
  GPS_TTFV_TARGET_S: 180,         // 3 minutos onboarding M01
  M03_TTFV_TARGET_S: 900,          // 15 min hasta primer QR
  M05_TTFV_TARGET_S: 300,          // 5 min hasta QR en sala
  M06_TTFV_TARGET_S: 180,          // 3 min hasta primera recomendación

  CHURN_CRITICAL: 0.20,
  CHURN_WARNING: 0.10,
  LTV_CAC_MINIMUM: 2.0,
  RUNWAY_CRITICAL_MONTHS: 3,
  RUNWAY_WARNING_MONTHS: 6,
  QR_SCANS_TARGET_WEEKLY: 1000,
  CAFICULTORES_GPS_TARGET_MONTH_1: 200,

  EUDR_ARCHIVE_YEARS: 5,
  EUDR_PENALTY_PCT: 4,            // 4% del volumen anual
  EUDR_LARGE_DEADLINE: '2025-12-30',
  EUDR_SME_DEADLINE: '2026-06-30',

  ICO_PRICE_REFRESH_H: 1,         // Cada hora
  MAX_NOTIF_PER_DAY: 3,

  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
} as const;
