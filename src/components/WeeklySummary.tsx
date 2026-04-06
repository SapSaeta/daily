'use client'

interface WeeklySummaryProps {
  totalDistanceMeters: number
  totalMinutes: number
  swimSessions: number
  bandSessions: number
  avgShoulderPain: number
  weeklyGoalMeters: number
}

export default function WeeklySummary({
  totalDistanceMeters,
  totalMinutes,
  swimSessions,
  bandSessions,
  avgShoulderPain,
  weeklyGoalMeters,
}: WeeklySummaryProps) {
  const progressPercent = Math.min(100, Math.round((totalDistanceMeters / weeklyGoalMeters) * 100))
  const hoursSwum = Math.floor(totalMinutes / 60)
  const minsSwum = totalMinutes % 60

  const painColor =
    avgShoulderPain <= 2 ? 'text-emerald-400' :
    avgShoulderPain <= 4 ? 'text-amber-400' :
    avgShoulderPain <= 6 ? 'text-orange-400' :
    'text-red-400'

  const painLabel =
    avgShoulderPain <= 2 ? 'Sin molestia' :
    avgShoulderPain <= 4 ? 'Leve' :
    avgShoulderPain <= 6 ? 'Moderado' :
    'Alto'

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-100">Resumen semanal</h2>
        <span className="text-xs text-slate-500">Esta semana</span>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-slate-400">Distancia semanal</span>
          <span className="text-xs font-semibold text-sky-400">{progressPercent}%</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              progressPercent >= 100 ? 'bg-emerald-500' :
              progressPercent >= 70 ? 'bg-sky-500' :
              progressPercent >= 40 ? 'bg-amber-500' :
              'bg-slate-600'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-slate-500">{totalDistanceMeters.toLocaleString('es')}m</span>
          <span className="text-xs text-slate-500">Meta: {weeklyGoalMeters.toLocaleString('es')}m</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="stat-card">
          <span className="text-[10px] text-slate-500 uppercase tracking-wide">Tiempo en agua</span>
          <span className="text-lg font-bold text-slate-100">
            {hoursSwum > 0 ? `${hoursSwum}h ${minsSwum}m` : `${minsSwum}m`}
          </span>
        </div>

        <div className="stat-card">
          <span className="text-[10px] text-slate-500 uppercase tracking-wide">Dolor hombro</span>
          <div className="flex items-baseline gap-1">
            <span className={`text-lg font-bold ${painColor}`}>
              {avgShoulderPain > 0 ? avgShoulderPain.toFixed(1) : '—'}
            </span>
            <span className={`text-[10px] ${painColor}`}>{avgShoulderPain > 0 ? painLabel : ''}</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="text-[10px] text-slate-500 uppercase tracking-wide">Sesiones natación</span>
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-bold text-sky-400">{swimSessions}</span>
            <div className="flex gap-0.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${i < swimSessions ? 'bg-sky-500' : 'bg-slate-700'}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <span className="text-[10px] text-slate-500 uppercase tracking-wide">Sesiones bandas</span>
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-bold text-violet-400">{bandSessions}</span>
            <div className="flex gap-0.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${i < bandSessions ? 'bg-violet-500' : 'bg-slate-700'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
