import { NextResponse } from 'next/server';
import { MOCK_LOTES } from '@/lib/mock/lotes';

interface PerfilSensorial {
  intensidad: 'suave' | 'medio' | 'intenso';
  acidez: 'baja' | 'media' | 'alta';
  sabores_preferidos: string[];
  proceso_preferido: string;
  origen_preferido: string;
}

// Mapeo de características de lote → sabores
const PROCESO_SABORES: Record<string, string[]> = {
  natural:    ['frutal', 'chocolate', 'caramelo'],
  lavado:     ['floral', 'nuez', 'caramelo'],
  washed:     ['floral', 'nuez', 'caramelo'],
  honey:      ['caramelo', 'frutal', 'chocolate'],
  anaerobico: ['frutal', 'floral', 'caramelo'],
};

const NIVEL_INTENSIDAD: Record<string, 'suave' | 'medio' | 'intenso'> = {
  claro:  'suave',
  medio:  'medio',
  oscuro: 'intenso',
};

const VARIEDAD_ACIDEZ: Record<string, 'baja' | 'media' | 'alta'> = {
  gesha:           'alta',
  yirgacheffe:     'alta',
  sidama:          'alta',
  washed:          'alta',
  castillo:        'media',
  colombia:        'media',
  caturra:         'media',
  bourbon:         'media',
  natural:         'baja',
  gayo:            'baja',
  pacamara:        'media',
};

function inferirAcidezLote(lote: typeof MOCK_LOTES[0]): 'baja' | 'media' | 'alta' {
  const texto = `${lote.variedad} ${lote.proceso}`.toLowerCase();
  for (const [clave, acidez] of Object.entries(VARIEDAD_ACIDEZ)) {
    if (texto.includes(clave)) return acidez;
  }
  return 'media';
}

function scorarLote(lote: typeof MOCK_LOTES[0], perfil: PerfilSensorial): number {
  let score = 0;

  // 1. Cupping base (0-40 pts)
  if (lote.cupping_score) {
    score += ((lote.cupping_score - 80) / 15) * 40; // 80-95 → 0-40
  }

  // 2. EUDR compliance (0-15 pts)
  if (lote.eudr_status === 'green') score += 15;
  else if (lote.eudr_status === 'amber') score += 5;

  // 3. Match intensidad (0-15 pts)
  const intensidadLote = lote.nivel_tueste ? NIVEL_INTENSIDAD[lote.nivel_tueste] : 'medio';
  if (intensidadLote === perfil.intensidad) score += 15;
  else if (Math.abs(['suave','medio','intenso'].indexOf(intensidadLote) - ['suave','medio','intenso'].indexOf(perfil.intensidad)) === 1) score += 7;

  // 4. Match acidez (0-15 pts)
  const acidezLote = inferirAcidezLote(lote);
  if (acidezLote === perfil.acidez) score += 15;
  else if (Math.abs(['baja','media','alta'].indexOf(acidezLote) - ['baja','media','alta'].indexOf(perfil.acidez)) === 1) score += 6;

  // 5. Match sabores (0-15 pts)
  const saboresLote = PROCESO_SABORES[lote.proceso?.toLowerCase() ?? ''] ?? [];
  const matchSabores = perfil.sabores_preferidos.filter(s => saboresLote.includes(s)).length;
  score += (matchSabores / Math.max(perfil.sabores_preferidos.length, 1)) * 15;

  return Math.round(score);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const perfil: PerfilSensorial = body.perfil;

    if (!perfil) {
      // Sin perfil: devolver top por cupping
      const top = [...MOCK_LOTES]
        .filter(l => l.cupping_score && l.eudr_status !== 'red')
        .sort((a, b) => (b.cupping_score ?? 0) - (a.cupping_score ?? 0))
        .slice(0, 4)
        .map(l => ({
          lote_id: l.id,
          variedad: l.variedad,
          caficultor_nombre: l.caficultor_nombre,
          pais: l.pais,
          region: l.region,
          proceso: l.proceso,
          cupping_score: l.cupping_score,
          eudr_status: l.eudr_status,
          notas_cata: l.notas_cata,
          kilos_disponibles: l.kilos_disponibles,
          match_score: null,
          motivo: 'Top puntuación CVA',
        }));
      return NextResponse.json({ recomendaciones: top, modo: 'top_cupping' });
    }

    // Con perfil: scoring personalizado
    const scorados = MOCK_LOTES
      .filter(l => l.kilos_disponibles > 0 && l.eudr_status !== 'red')
      .map(l => ({ lote: l, score: scorarLote(l, perfil) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    // Generar motivo textual
    const motivoTexto = (lote: typeof MOCK_LOTES[0], score: number): string => {
      const partes: string[] = [];
      if (lote.nivel_tueste && NIVEL_INTENSIDAD[lote.nivel_tueste] === perfil.intensidad) partes.push(`intensidad ${perfil.intensidad} ✓`);
      if (inferirAcidezLote(lote) === perfil.acidez) partes.push(`acidez ${perfil.acidez} ✓`);
      const saboresMatch = (PROCESO_SABORES[lote.proceso?.toLowerCase() ?? ''] ?? []).filter(s => perfil.sabores_preferidos.includes(s));
      if (saboresMatch.length > 0) partes.push(saboresMatch.join(', '));
      if (score > 60) partes.push('excelente match');
      return partes.join(' · ') || 'Recomendado por calidad';
    };

    const recomendaciones = scorados.map(({ lote: l, score }) => ({
      lote_id: l.id,
      variedad: l.variedad,
      caficultor_nombre: l.caficultor_nombre,
      pais: l.pais,
      region: l.region,
      proceso: l.proceso,
      cupping_score: l.cupping_score,
      eudr_status: l.eudr_status,
      notas_cata: l.notas_cata,
      kilos_disponibles: l.kilos_disponibles,
      match_score: score,
      match_pct: Math.min(100, Math.round((score / 100) * 100)),
      motivo: motivoTexto(l, score),
    }));

    return NextResponse.json({ recomendaciones, modo: 'personalizado' });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
