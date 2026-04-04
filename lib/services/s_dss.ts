// S_DSS — Software de Decisión (Focus Score BREWCHAIN)
// DETERMINISTA: mismos datos = mismo score siempre
// El LLM solo interpreta el resultado — nunca calcula la fórmula

import { BrewChainKPIs, FocusScore, FocusColor, FocusScoreAlert } from '../types/dss';

export function calculateFocusScore(kpis: BrewChainKPIs): FocusScore {
  // Variable 1: Retención (30%)
  const retention_score = Math.max(0, Math.min(10, 10 - (kpis.churn_rate * 100 / 10)));

  // Variable 2: LTV/CAC (20%)
  const ltv_cac_score = Math.min(10, kpis.ltv_cac_ratio * 2);

  // Variable 3: Moat competitivo (15%)
  const moat_score = Math.min(10, kpis.moat_factors.length * 2.5);

  // Variable 4: Tracción QR — North Star (15%)
  const qr_traction = Math.min(10, kpis.qrs_scanned_weekly / 100); // 1000 scans/semana = 10/10

  // Variable 5: Salud marketplace (10%)
  const marketplace_health = Math.min(10, kpis.gmv_monthly / 5000); // €50K GMV = 10/10

  // Variable 6: Cobertura EUDR (10%)
  const eudr_coverage = kpis.caficultores_gps_activos / kpis.caficultores_total * 10;

  // Score final BREWCHAIN
  const score = Math.round((
    retention_score    * 0.30 +
    ltv_cac_score      * 0.20 +
    moat_score         * 0.15 +
    qr_traction        * 0.15 +
    marketplace_health * 0.10 +
    eudr_coverage      * 0.10
  ) * 10) / 10;

  // Determinar color
  let color: FocusColor;
  if (score < 4 || kpis.churn_rate > 0.20 || kpis.ltv_cac_ratio < 2 || kpis.runway_months < 3) {
    color = 'red';
  } else if (score < 7 || kpis.churn_rate > 0.10 || kpis.cac_trend === 'growing') {
    color = 'amber';
  } else {
    color = 'green';
  }

  // Alertas (máximo 3)
  const all_alerts: FocusScoreAlert[] = [];

  if (kpis.churn_rate > 0.20) {
    all_alerts.push({
      variable: 'Churn rate',
      value: `${(kpis.churn_rate * 100).toFixed(0)}%`,
      threshold: '20%',
      severity: 'red',
      action: 'BLOQUEAR adquisición. Activar protocolo retención inmediato.',
    });
  } else if (kpis.churn_rate > 0.10) {
    all_alerts.push({
      variable: 'Churn rate',
      value: `${(kpis.churn_rate * 100).toFixed(0)}%`,
      threshold: '10%',
      severity: 'amber',
      action: 'No escalar marketing. Priorizar retención esta semana.',
    });
  }

  if (kpis.qrs_scanned_weekly < 100) {
    all_alerts.push({
      variable: 'QRs escaneados/semana',
      value: String(kpis.qrs_scanned_weekly),
      threshold: '100',
      severity: kpis.qrs_scanned_weekly < 20 ? 'red' : 'amber',
      action: 'Activar campaña QR en sala. Objetivo: 100 scans/semana.',
    });
  }

  if (kpis.runway_months < 6) {
    all_alerts.push({
      variable: 'Runway',
      value: `${kpis.runway_months.toFixed(1)} meses`,
      threshold: '6 meses',
      severity: kpis.runway_months < 3 ? 'red' : 'amber',
      action: kpis.runway_months < 3 ? 'URGENTE: Activar proceso fundraising.' : 'Preparar pitch deck para inversores.',
    });
  }

  const eudr_coverage_pct = kpis.caficultores_gps_activos / kpis.caficultores_total;
  if (eudr_coverage_pct < 0.7) {
    all_alerts.push({
      variable: 'Cobertura EUDR',
      value: `${(eudr_coverage_pct * 100).toFixed(0)}%`,
      threshold: '70%',
      severity: 'amber',
      action: 'Activar onboarding GPS para caficultores. Deadline EUDR: junio 2026.',
    });
  }

  // Solo las 3 más críticas
  const alerts = all_alerts.slice(0, 3);

  // Acción recomendada principal
  const recommended_action = alerts.length > 0
    ? alerts[0].action
    : 'Sistema saludable. Monitorear KPIs mensualmente.';

  return {
    score,
    color,
    components: {
      retention: Math.round(retention_score * 10) / 10,
      ltv_cac: Math.round(ltv_cac_score * 10) / 10,
      moat: Math.round(moat_score * 10) / 10,
      qr_traction: Math.round(qr_traction * 10) / 10,
      marketplace_health: Math.round(marketplace_health * 10) / 10,
      eudr_coverage: Math.round(eudr_coverage * 10) / 10,
    },
    alerts,
    recommended_action,
    timestamp: new Date().toISOString(),
  };
}

export function getFocusColorHex(color: FocusColor): string {
  return { red: '#DC2626', amber: '#D97706', green: '#1B5E30' }[color];
}

export function getFocusLabel(color: FocusColor): string {
  return { red: 'Actuar esta semana', amber: 'Actuar este mes', green: 'Sistema saludable' }[color];
}
