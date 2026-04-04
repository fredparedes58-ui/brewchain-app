export const BREWCHAIN_COLORS = {
  espresso: '#1A0D05',
  tostado: '#3B1F08',
  caramelo: '#8B5E3C',
  latte: '#C49A6C',
  crema: '#FBF6EE',
  verde_origen: '#1B5E30',
  azul_eudr: '#1A2E5C',
  amber_warn: '#D97706',
  red_alert: '#DC2626',
} as const;

export const EUDR_COLORS = {
  green: BREWCHAIN_COLORS.verde_origen,
  amber: BREWCHAIN_COLORS.amber_warn,
  red: BREWCHAIN_COLORS.red_alert,
} as const;

export const DSS_COLORS = {
  green: BREWCHAIN_COLORS.verde_origen,
  amber: BREWCHAIN_COLORS.amber_warn,
  red: BREWCHAIN_COLORS.red_alert,
} as const;
