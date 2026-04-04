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
        // silencioso — mantiene el último valor conocido
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
