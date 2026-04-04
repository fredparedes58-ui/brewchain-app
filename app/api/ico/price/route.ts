import { NextResponse } from 'next/server';

// Precio base ICO Arábica Suaves Colombianos (USD/quintal 46 kg)
// Mercado NY C, referencia real: ~340-380 en Q1 2025
const BASE_PRICE = 358;
const SESSION_SEED = Math.floor(Math.random() * 1000);

function calcularPrecio(): { precio: number; variacion_pct: number; tendencia: 'up' | 'down' | 'stable' } {
  // Fluctuación determinista basada en minutos del día + seed de sesión
  const minutosDelDia = Math.floor(Date.now() / 60_000);
  const onda1 = Math.sin((minutosDelDia + SESSION_SEED) * 0.13) * 8;   // ciclo ~48 min
  const onda2 = Math.sin((minutosDelDia + SESSION_SEED) * 0.031) * 15; // ciclo ~3 h
  const precio = Math.round((BASE_PRICE + onda1 + onda2) * 100) / 100;

  // Variación respecto al minuto anterior
  const precioAnterior = BASE_PRICE +
    Math.sin(((minutosDelDia - 1) + SESSION_SEED) * 0.13) * 8 +
    Math.sin(((minutosDelDia - 1) + SESSION_SEED) * 0.031) * 15;
  const diff = precio - precioAnterior;
  const variacion_pct = Math.round((diff / precioAnterior) * 10000) / 100;

  const tendencia: 'up' | 'down' | 'stable' =
    variacion_pct > 0.05 ? 'up' : variacion_pct < -0.05 ? 'down' : 'stable';

  return { precio, variacion_pct, tendencia };
}

export async function GET() {
  const { precio, variacion_pct, tendencia } = calcularPrecio();

  return NextResponse.json({
    precio,
    variacion_pct,
    tendencia,
    moneda: 'USD',
    unidad: 'quintal (46 kg)',
    mercado: 'ICO NY · Suaves Colombianos',
    timestamp: new Date().toISOString(),
    proxima_actualizacion_seg: 30,
  });
}
