'use client';
import { useState, useEffect } from 'react';
import { useCaficultorStore } from '../stores/caficultorStore';

interface PrecioICOData {
  precio: number;
  variacion_pct: number;
  tendencia: 'up' | 'down' | 'stable';
  mercado: string;
  timestamp: string;
}

interface UsePrecioICOReturn {
  precio: number | null;
  variacion_pct: number | null;
  tendencia: 'up' | 'down' | 'stable' | null;
  ultimaActualizacion: string | null;
  isLoading: boolean;
}

const POLL_INTERVAL_MS = 30_000;
// Fallback sinusoidal cuando la API ICO no está disponible
const BASE_PRICE_ICO = 4.20; // EUR/kg (≈ 210 USD/cwt ICO NY)
function getFallbackICO() {
  const t = Date.now() / (1000 * 60 * 60 * 6); // ciclos de 6h
  const precio = BASE_PRICE_ICO + Math.sin(t) * 0.18 + Math.sin(t * 2.3) * 0.06;
  const variacion_pct = Math.sin(t + 1) * 1.8;
  const tendencia: 'up' | 'down' | 'stable' = variacion_pct > 0.3 ? 'up' : variacion_pct < -0.3 ? 'down' : 'stable';
  return { precio: Math.round(precio * 100) / 100, variacion_pct: Math.round(variacion_pct * 10) / 10, tendencia };
}

export function usePrecioICO(): UsePrecioICOReturn {
  const { precioICO, setPrecioICO } = useCaficultorStore();
  const [variacion_pct, setVariacion] = useState<number | null>(null);
  const [tendencia, setTendencia] = useState<'up' | 'down' | 'stable' | null>(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchPrecio = async () => {
      try {
        const res = await fetch('/api/ico/price');
        if (!res.ok) return;
        const data: PrecioICOData = await res.json();
        if (!mounted) return;
        setPrecioICO(data.precio);
        setVariacion(data.variacion_pct);
        setTendencia(data.tendencia);
        setUltimaActualizacion(data.timestamp);
      } catch {
        // Fallback sinusoidal si la API no responde
        if (mounted && !precioICO) {
          const fb = getFallbackICO();
          setPrecioICO(fb.precio);
          setVariacion(fb.variacion_pct);
          setTendencia(fb.tendencia);
          setUltimaActualizacion(new Date().toISOString());
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchPrecio();
    const intervalId = setInterval(fetchPrecio, POLL_INTERVAL_MS);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [setPrecioICO]);

  return {
    precio: precioICO,
    variacion_pct,
    tendencia,
    ultimaActualizacion,
    isLoading,
  };
}
