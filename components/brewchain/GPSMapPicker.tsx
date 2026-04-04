'use client';
import { useEffect, useRef } from 'react';

interface GPSMapPickerProps {
  lat: number;
  lng: number;
  onSelect?: (lat: number, lng: number) => void;
  readonly?: boolean;
  height?: number;
}

export default function GPSMapPicker({ lat, lng, onSelect, readonly = false, height = 280 }: GPSMapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletMapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    // Dynamic import to avoid SSR issues with Leaflet
    import('leaflet').then((L) => {
      // Fix default icon path (Leaflet issue with bundlers)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!, {
        center: [lat, lng],
        zoom: 14,
        zoomControl: true,
      });

      leafletMapRef.current = map;

      // OpenStreetMap tiles — 100% gratuito, sin API key
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Marcador inicial
      const icon = L.divIcon({
        html: `<div style="
          background: #DC2626;
          width: 20px; height: 20px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid #FBF6EE;
          box-shadow: 0 2px 8px rgba(0,0,0,0.5);
        "></div>`,
        className: '',
        iconSize: [20, 20],
        iconAnchor: [10, 20],
      });

      const marker = L.marker([lat, lng], { icon, draggable: !readonly }).addTo(map);
      markerRef.current = marker;

      if (!readonly) {
        // Click en el mapa mueve el marcador
        map.on('click', (e: { latlng: { lat: number; lng: number } }) => {
          marker.setLatLng([e.latlng.lat, e.latlng.lng]);
          onSelect?.(
            Math.round(e.latlng.lat * 1000000) / 1000000,
            Math.round(e.latlng.lng * 1000000) / 1000000
          );
        });

        // Drag del marcador
        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          onSelect?.(
            Math.round(pos.lat * 1000000) / 1000000,
            Math.round(pos.lng * 1000000) / 1000000
          );
        });

        // Popup de ayuda
        marker.bindPopup('<b>Tu parcela</b><br>Arrastra para ajustar la posición').openPopup();
      } else {
        marker.bindPopup('<b>📍 Parcela verificada EUDR</b><br>Coordenadas WGS84 · SRID 4326').openPopup();
      }
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Actualizar marcador si lat/lng cambian externamente
  useEffect(() => {
    if (markerRef.current && lat && lng) {
      markerRef.current.setLatLng([lat, lng]);
      leafletMapRef.current?.setView([lat, lng], 14);
    }
  }, [lat, lng]);

  return (
    <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(27,94,48,0.4)' }}>
      {/* Leaflet CSS via style tag */}
      <style>{`
        @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
        .leaflet-container { background: #1A0D05; }
        .leaflet-popup-content-wrapper { background: #3B1F08; color: #FBF6EE; border: 1px solid rgba(196,154,108,0.3); }
        .leaflet-popup-tip { background: #3B1F08; }
        .leaflet-popup-close-button { color: #C49A6C !important; }
      `}</style>

      <div ref={mapRef} style={{ height, width: '100%' }} />

      {/* Badge EUDR overlay */}
      {readonly && (
        <div style={{
          position: 'absolute', top: 10, right: 10,
          background: 'rgba(27,94,48,0.9)', border: '1px solid #1B5E30',
          borderRadius: 8, padding: '0.25rem 0.75rem',
          fontSize: '0.72rem', fontWeight: 700, color: '#4ADE80',
          backdropFilter: 'blur(4px)', zIndex: 1000,
        }}>
          ✓ GPS EUDR Verificado
        </div>
      )}

      {!readonly && (
        <div style={{
          position: 'absolute', bottom: 10, left: 10,
          background: 'rgba(26,13,5,0.85)', border: '1px solid rgba(196,154,108,0.3)',
          borderRadius: 8, padding: '0.35rem 0.75rem',
          fontSize: '0.72rem', color: '#C49A6C',
          backdropFilter: 'blur(4px)', zIndex: 1000,
        }}>
          🗺️ Toca el mapa o arrastra el pin para ajustar
        </div>
      )}
    </div>
  );
}
