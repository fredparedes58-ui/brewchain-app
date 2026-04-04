'use client';
import { useState, useEffect } from 'react';

interface PlacesRating {
  rating: number;
  user_ratings_total: number;
  name: string;
  source: 'google_places' | 'fallback';
  loading: boolean;
}

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6h
let cachedRating: Omit<PlacesRating, 'loading'> | null = null;
let cacheTimestamp = 0;

export function usePlacesRating(placeId?: string): PlacesRating {
  const [data, setData] = useState<Omit<PlacesRating, 'loading'>>({
    rating: 4.7,
    user_ratings_total: 312,
    name: 'BREW CHAIN Cafetería',
    source: 'fallback',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchRating = async () => {
      // Usar caché si es reciente
      if (cachedRating && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
        if (mounted) {
          setData(cachedRating);
          setLoading(false);
        }
        return;
      }

      try {
        const params = placeId ? `?place_id=${encodeURIComponent(placeId)}` : '';
        const res = await fetch(`/api/places/rating${params}`);
        if (res.ok) {
          const json = await res.json();
          const result = {
            rating: json.rating,
            user_ratings_total: json.user_ratings_total,
            name: json.name,
            source: json.source as 'google_places' | 'fallback',
          };
          cachedRating = result;
          cacheTimestamp = Date.now();
          if (mounted) setData(result);
        }
      } catch {
        // mantener valores default
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchRating();
    // refresh cada 6 horas
    const interval = setInterval(fetchRating, CACHE_TTL_MS);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [placeId]);

  return { ...data, loading };
}
