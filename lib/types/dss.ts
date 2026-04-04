export interface BrewChainKPIs {
  churn_rate: number;           // 0.0-1.0
  ltv_cac_ratio: number;
  moat_factors: string[];
  decision_velocity_score: number; // 1-10
  runway_months: number;

  // BREWCHAIN specific
  qrs_scanned_weekly: number;
  gmv_monthly: number;
  caficultores_gps_activos: number;
  caficultores_total: number;
  mrr: number;
  mrr_growth_mom: number;       // e.g. 0.18 = 18%
  burn_rate: number;

  // Trends
  cac_trend: 'growing' | 'stable' | 'decreasing';
  gmv_trend: 'growing' | 'flat' | 'decreasing';
}

export type FocusColor = 'red' | 'amber' | 'green';

export interface FocusScoreAlert {
  variable: string;
  value: string;
  threshold: string;
  severity: FocusColor;
  action: string;
}

export interface FocusScore {
  score: number;              // 0-10
  color: FocusColor;
  components: {
    retention: number;
    ltv_cac: number;
    moat: number;
    qr_traction: number;
    marketplace_health: number;
    eudr_coverage: number;
  };
  alerts: FocusScoreAlert[];
  recommended_action: string;
  timestamp: string;
  interpretation?: string;
}
