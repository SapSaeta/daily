import { prisma } from '@/lib/prisma'

interface Exercise {
  id: number
  name: string
  category: string
  description: string
  sets: number | null
  reps: string | null
  duration: string | null
  notes: string | null
}

type CategoryType = 'WARM_UP' | 'STRENGTHENING' | 'STRETCHING' | 'MOBILITY'

const categoryConfig: Record<CategoryType, {
  label: string
  color: string
  bg: string
  border: string
  icon: React.ReactNode
}> = {
  WARM_UP: {
    label: 'Calentamiento',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-l-amber-500',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
      </svg>
    ),
  },
  STRENGTHENING: {
    label: 'Fortalecimiento',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-l-sky-500',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  STRETCHING: {
    label: 'Estiramientos',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-l-violet-500',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
      </svg>
    ),
  },
  MOBILITY: {
    label: 'Movilidad',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-l-emerald-500',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
  },
}

function ExerciseCard({ exercise }: { exercise: Exercise }) {
  const cat = categoryConfig[exercise.category as CategoryType] || categoryConfig.STRENGTHENING

  return (
    <div className={`card border-l-4 ${cat.border}`}>
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-8 h-8 rounded-lg ${cat.bg} flex items-center justify-center flex-shrink-0 ${cat.color}`}>
          {cat.icon}
        </div>
        <div className="flex-1">
          <p className={`text-[10px] font-medium uppercase tracking-wide ${cat.color}`}>{cat.label}</p>
          <h3 className="text-sm font-semibold text-slate-100 leading-tight">{exercise.name}</h3>
        </div>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed mb-3">{exercise.description}</p>

      {/* Sets/Reps/Duration */}
      <div className="flex flex-wrap gap-2 mb-3">
        {exercise.sets && (
          <span className="badge bg-slate-800 text-slate-300">
            {exercise.sets} series
          </span>
        )}
        {exercise.reps && (
          <span className="badge bg-slate-800 text-slate-300">
            {exercise.reps} reps
          </span>
        )}
        {exercise.duration && (
          <span className="badge bg-slate-800 text-slate-300">
            {exercise.duration}
          </span>
        )}
      </div>

      {/* Notes */}
      {exercise.notes && (
        <div className={`rounded-xl p-2.5 ${cat.bg}`}>
          <p className={`text-xs leading-relaxed ${cat.color} opacity-90`}>
            <span className="font-semibold">Nota:</span> {exercise.notes}
          </p>
        </div>
      )}
    </div>
  )
}

async function getExercises() {
  const exercises = await prisma.exercise.findMany({
    orderBy: [
      { category: 'asc' },
      { name: 'asc' },
    ],
  })
  return exercises
}

export default async function EjerciciosPage() {
  const exercises = await getExercises()

  const byCategory: Record<string, Exercise[]> = {}
  for (const ex of exercises) {
    if (!byCategory[ex.category]) byCategory[ex.category] = []
    byCategory[ex.category].push(ex)
  }

  const categoryOrder: CategoryType[] = ['WARM_UP', 'STRENGTHENING', 'STRETCHING', 'MOBILITY']

  return (
    <div className="px-4 pt-6 pb-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Biblioteca de ejercicios</h1>
        <p className="text-sm text-slate-500 mt-0.5">Programa de hombro para síndrome subacromial</p>
      </div>

      {/* Info banner */}
      <div className="card bg-sky-500/5 border-sky-500/20">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
          </svg>
          <div>
            <p className="text-xs font-semibold text-sky-300 mb-1">Protocolo para síndrome subacromial</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Progresión gradual: primero calentamiento, luego fortalecimiento, después estiramientos.
              Si hay dolor &gt; 5/10 durante un ejercicio, redúcelo o elimínalo temporalmente.
            </p>
          </div>
        </div>
      </div>

      {/* Routine suggestion */}
      <div className="card">
        <p className="section-title">Rutina sugerida (30 min)</p>
        <div className="space-y-2">
          {[
            { emoji: '1', time: '5 min', text: 'Calentamiento: péndulos + círculos de hombro', color: 'text-amber-400' },
            { emoji: '2', time: '20 min', text: 'Fortalecimiento: 3-4 ejercicios con banda, 3 series cada uno', color: 'text-sky-400' },
            { emoji: '3', time: '5 min', text: 'Estiramientos: pectoral + cruzado + subescapular', color: 'text-violet-400' },
          ].map((step) => (
            <div key={step.emoji} className="flex items-start gap-3">
              <div className={`w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 text-xs font-bold ${step.color}`}>
                {step.emoji}
              </div>
              <div>
                <span className={`text-xs font-semibold ${step.color}`}>{step.time}</span>
                <p className="text-xs text-slate-400 mt-0.5">{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Exercises by category */}
      {categoryOrder.map((category) => {
        const exList = byCategory[category]
        if (!exList || exList.length === 0) return null
        const cat = categoryConfig[category]

        return (
          <div key={category}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-6 h-6 rounded-lg ${cat.bg} flex items-center justify-center ${cat.color}`}>
                {cat.icon}
              </div>
              <h2 className={`text-sm font-bold ${cat.color}`}>{cat.label}</h2>
              <span className="text-xs text-slate-600">({exList.length})</span>
            </div>
            <div className="space-y-3">
              {exList.map((ex) => (
                <ExerciseCard key={ex.id} exercise={ex} />
              ))}
            </div>
          </div>
        )
      })}

      {/* Disclaimer */}
      <div className="card bg-slate-800/50 border-slate-700/50">
        <p className="text-xs text-slate-500 leading-relaxed">
          <span className="font-semibold text-slate-400">Aviso médico:</span> Estos ejercicios son orientativos.
          Si el dolor aumenta o persiste, consulta con tu médico o fisioterapeuta. No sustituye el consejo médico profesional.
        </p>
      </div>
    </div>
  )
}
