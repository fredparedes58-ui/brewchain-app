'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ScanEvent, ScanAnalyticsState, ScanFuente } from '@/lib/types/scanAnalytics';

// Seed: 30 días de eventos simulados
function generarSeedScans(): ScanEvent[] {
  const hashes = [
    { hash: 'a3f2e1b4c9d8', variedad: 'Colombia Anaeróbico', caficultor: 'Carlos Muñoz' },
    { hash: 'b4e3f2a1d0c7', variedad: 'Gesha Natural', caficultor: 'Rosa Vargas' },
    { hash: 'c5d4e3b2a1f8', variedad: 'Guatemala Pacamara', caficultor: 'José Alvarado' },
  ];
  const fuentes: ScanFuente[] = ['sala', 'sala', 'sala', 'bolsa', 'compartido', 'web'];
  const eventos: ScanEvent[] = [];

  const hoy = new Date();
  for (let dia = 29; dia >= 0; dia--) {
    const fecha = new Date(hoy);
    fecha.setDate(fecha.getDate() - dia);
    const esFinDeSemana = fecha.getDay() === 0 || fecha.getDay() === 6;
    const nScans = esFinDeSemana
      ? Math.floor(Math.random() * 8) + 5
      : Math.floor(Math.random() * 5) + 2;

    for (let i = 0; i < nScans; i++) {
      const lote = hashes[Math.floor(Math.random() * hashes.length)];
      const hora = Math.floor(Math.random() * 14) + 8; // 8-22h
      const minuto = Math.floor(Math.random() * 60);
      const ts = new Date(fecha);
      ts.setHours(hora, minuto, 0, 0);

      eventos.push({
        id: `sc-${dia}-${i}`,
        qr_hash: lote.hash,
        variedad: lote.variedad,
        caficultor: lote.caficultor,
        timestamp: ts.toISOString(),
        fuente: fuentes[Math.floor(Math.random() * fuentes.length)],
        convertido: Math.random() < 0.18,
      });
    }
  }
  return eventos;
}

export const useScanStore = create<ScanAnalyticsState>()(
  persist(
    (set) => ({
      eventos: generarSeedScans(),

      addScan: (qr_hash, fuente = 'desconocido', extra = {}) => {
        const ev: ScanEvent = {
          id: `sc-${Date.now()}`,
          qr_hash,
          timestamp: new Date().toISOString(),
          fuente,
          convertido: false,
          ...extra,
        };
        set((s) => ({ eventos: [ev, ...s.eventos] }));
      },

      marcarConversion: (id) =>
        set((s) => ({
          eventos: s.eventos.map((e) => (e.id === id ? { ...e, convertido: true } : e)),
        })),
    }),
    {
      name: 'brewchain-scans',
      partialize: (s) => ({ eventos: s.eventos }),
    }
  )
);
