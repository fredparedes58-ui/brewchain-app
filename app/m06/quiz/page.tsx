'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useConsumidorStore } from '@/lib/stores/consumidorStore';

type Step = 0 | 1 | 2 | 3 | 4 | 5;

const QUESTIONS = [
  {
    q: '¿Qué intensidad de café prefieres?',
    key: 'intensidad',
    options: [
      { value: 'suave', label: '🌸 Suave', desc: 'Delicado, ligero' },
      { value: 'medio', label: '☕ Medio', desc: 'Equilibrado' },
      { value: 'intenso', label: '💪 Intenso', desc: 'Potente, cuerpo alto' },
    ],
  },
  {
    q: '¿Qué acidez te gusta más?',
    key: 'acidez',
    options: [
      { value: 'baja', label: '😌 Baja acidez', desc: 'Redondo, suave' },
      { value: 'media', label: '⚖️ Media', desc: 'Fresco, equilibrado' },
      { value: 'alta', label: '⚡ Alta acidez', desc: 'Brillante, vibrante' },
    ],
  },
  {
    q: '¿Cuál es tu sabor favorito en el café?',
    key: 'sabor',
    options: [
      { value: 'frutal', label: '🍓 Frutal', desc: 'Frutos rojos, cítricos' },
      { value: 'chocolate', label: '🍫 Chocolate', desc: 'Cacao, caramelo' },
      { value: 'floral', label: '🌸 Floral', desc: 'Jazmín, rosa, bergamota' },
      { value: 'nuez', label: '🥜 Nuez', desc: 'Almendra, avellana' },
    ],
  },
  {
    q: '¿Qué proceso de beneficiado prefieres?',
    key: 'proceso',
    options: [
      { value: 'lavado', label: '💧 Lavado', desc: 'Limpio, transparente' },
      { value: 'natural', label: '☀️ Natural', desc: 'Dulce, afrutado' },
      { value: 'honey', label: '🍯 Honey', desc: 'Equilibrado, meloso' },
      { value: 'anaerobico', label: '🧪 Anaeróbico', desc: 'Exótico, fermentado' },
    ],
  },
  {
    q: '¿De qué origen te gustaría explorar?',
    key: 'origen',
    options: [
      { value: 'colombia', label: '🇨🇴 Colombia', desc: 'Cauca, Huila, Nariño' },
      { value: 'etiopia', label: '🇪🇹 Etiopía', desc: 'Yirgacheffe, Sidama' },
      { value: 'guatemala', label: '🇬🇹 Guatemala', desc: 'Antigua, Huehuetenango' },
      { value: 'cualquiera', label: '🌍 Cualquier origen', desc: 'Sorpréndeme' },
    ],
  },
];

export default function SensoryQuiz() {
  const router = useRouter();
  const { setPerfil } = useConsumidorStore();
  const [step, setStep] = useState<Step>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  if (done) {
    const resultMap: Record<string, string> = {
      frutal: 'Estético — Te gustan los cafés expresivos y brillantes',
      floral: 'Estético — Paletas florales y aromáticas',
      chocolate: 'Explorador — Cuerpo y profundidad',
      nuez: 'Tradicional — Clásico y reconfortante',
    };
    const sabor = answers['sabor'] || 'chocolate';
    const perfil_result = resultMap[sabor] || 'Explorador';

    return (
      <div style={{ padding: '2rem', maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎯</div>
        <h2 style={{ fontWeight: 900, fontSize: '1.6rem', margin: '0 0 0.5rem' }}>Tu perfil sensorial</h2>
        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#C49A6C', marginBottom: '1rem' }}>{perfil_result}</div>
        <div style={{ background: '#3B1F08', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid rgba(196,154,108,0.2)', textAlign: 'left' }}>
          {Object.entries(answers).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: '0.75rem', padding: '0.3rem 0' }}>
              <span style={{ fontSize: '0.75rem', color: '#8B5E3C', width: 80, flexShrink: 0, textTransform: 'capitalize' }}>{k}</span>
              <span style={{ fontSize: '0.85rem', color: '#FBF6EE', fontWeight: 600, textTransform: 'capitalize' }}>{v}</span>
            </div>
          ))}
        </div>
        <button onClick={() => router.push('/m06')} style={{ background: '#8B5E3C', color: '#FBF6EE', padding: '1rem 2rem', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}>
          Ver mis recomendaciones →
        </button>
      </div>
    );
  }

  if (step >= QUESTIONS.length) {
    setPerfil({ intensidad: answers['intensidad'] as any, acidez: answers['acidez'] as any, sabores_preferidos: [answers['sabor'] as any], proceso_preferido: answers['proceso'], origen_preferido: answers['origen'], completado: true });
    setDone(true);
    return null;
  }

  const q = QUESTIONS[step];

  return (
    <div style={{ padding: '2rem', maxWidth: 560, margin: '0 auto' }}>
      {/* Progress */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#C49A6C', textTransform: 'uppercase', letterSpacing: 1 }}>Pregunta {step + 1} de {QUESTIONS.length}</div>
          <div style={{ fontSize: '0.75rem', color: '#8B5E3C' }}>~{(QUESTIONS.length - step) * 30} seg</div>
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
          <div style={{ height: '100%', background: '#8B5E3C', width: `${(step / QUESTIONS.length) * 100}%`, borderRadius: 2, transition: 'width 0.3s' }} />
        </div>
      </div>

      <h2 style={{ fontWeight: 900, fontSize: '1.5rem', marginBottom: '1.5rem' }}>{q.q}</h2>

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {q.options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => {
              setAnswers(a => ({ ...a, [q.key]: opt.value }));
              setStep((s) => (s + 1) as Step);
            }}
            style={{ background: '#3B1F08', border: '1px solid rgba(196,154,108,0.2)', borderRadius: 10, padding: '1rem 1.25rem', cursor: 'pointer', textAlign: 'left', color: '#FBF6EE', width: '100%', transition: 'border-color 0.15s, background 0.15s', display: 'flex', gap: '1rem', alignItems: 'center' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#C49A6C'; e.currentTarget.style.background = 'rgba(139,94,60,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(196,154,108,0.2)'; e.currentTarget.style.background = '#3B1F08'; }}
          >
            <span style={{ fontSize: '1.3rem' }}>{opt.label.split(' ')[0]}</span>
            <div>
              <div style={{ fontWeight: 600 }}>{opt.label.split(' ').slice(1).join(' ')}</div>
              <div style={{ fontSize: '0.78rem', color: '#C49A6C', marginTop: 2 }}>{opt.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
