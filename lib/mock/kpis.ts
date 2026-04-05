import { BrewChainKPIs } from '../types/dss';

export const MOCK_KPIS: BrewChainKPIs = {
  churn_rate: 0.14,               // 14% — zona AMBER (mejorado desde 28%)
  ltv_cac_ratio: 5.8,             // excelente — >4 es target
  moat_factors: ['español', 'QR_trazabilidad', 'modulo_agronomico', 'EUDR_compliance'],
  decision_velocity_score: 7,
  runway_months: 14.6,            // >12 meses de runway

  qrs_scanned_weekly: 487,        // objetivo: 1000 — trayectoria sólida (+23% MoM)
  gmv_monthly: 38400,             // €38,400 — creciendo 22% MoM
  caficultores_gps_activos: 127,
  caficultores_total: 182,
  mrr: 19200,                     // €19,200
  mrr_growth_mom: 0.22,           // 22% MoM
  burn_rate: 9400,                // €9,400/mes — eficiente en etapa MVP

  cac_trend: 'decreasing',        // CAC bajando con efecto red
  gmv_trend: 'growing',
};

export const MOCK_FINANCIALS = {
  mrr: 19200,
  arr: 230400,
  ltv: 1740,
  cac: 300,
  payback_months: 3.2,
  gross_margin: 0.74,
  tam_usd: 5500000000,
  sam_usd: 820000000,
  som_usd: 4100000,
  seed_round_target: 750000,
  mrr_month_12_target: 50000,
};
