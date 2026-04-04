import { BrewChainKPIs } from '../types/dss';

export const MOCK_KPIS: BrewChainKPIs = {
  churn_rate: 0.28,               // 28% — zona ROJA
  ltv_cac_ratio: 4.2,
  moat_factors: ['español', 'QR_trazabilidad', 'modulo_agronomico'],
  decision_velocity_score: 6,
  runway_months: 8.2,

  qrs_scanned_weekly: 42,         // objetivo: 1000
  gmv_monthly: 8400,              // €8,400
  caficultores_gps_activos: 87,
  caficultores_total: 150,
  mrr: 12000,                     // €12,000
  mrr_growth_mom: 0.18,           // 18% MoM
  burn_rate: 6800,                // €6,800/mes

  cac_trend: 'stable',
  gmv_trend: 'growing',
};

export const MOCK_FINANCIALS = {
  mrr: 12000,
  arr: 144000,
  ltv: 1260,
  cac: 300,
  payback_months: 4.2,
  gross_margin: 0.72,
  tam_usd: 5500000000,
  sam_usd: 820000000,
  som_usd: 4100000,
  seed_round_target: 750000,
  mrr_month_12_target: 50000,
};
