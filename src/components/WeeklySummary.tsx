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

  // SVG ring params
  const size = 110
  const stroke = 8
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const dash = (progressPercent / 100) * circ

  const painColor =
    avgShoulderPain === 0 ? '#059669' :
    avgShoulderPain <= 2 ? '#059669' :
    avgShoulderPain <= 4 ? '#d97706' :
    avgShoulderPain <= 6 ? '#d97706' :
    '#dc2626'

  const painLabel =
    avgShoulderPain === 0 ? '—' :
    avgShoulderPain <= 2 ? 'Muy leve' :
    avgShoulderPain <= 4 ? 'Leve' :
    avgShoulderPain <= 6 ? 'Moderado' :
    'Alto'

  const ringColor =
    progressPercent >= 100 ? '#059669' :
    progressPercent >= 70  ? '#0284c7' :
    progressPercent >= 40  ? '#d97706' :
    '#94a3b8'

  return (
    <div
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-slate-100">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Semana actual
        </p>
        {progressPercent >= 100 && (
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: '#d1fae5', color: '#059669' }}
          >
            Meta lograda
          </span>
        )}
      </div>

      {/* Main content */}
      <div className="px-4 pb-4 pt-3 flex items-center gap-4">
        {/* Ring */}
        <div className="flex-shrink-0 relative flex items-center justify-center" style={{ width: size, height: size }}>
          <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx={size / 2} cy={size / 2} r={r}
              fill="none"
              stroke="#f1f5f9"
              strokeWidth={stroke}
            />
            <circle
              cx={size / 2} cy={size / 2} r={r}
              fill="none"
              stroke={ringColor}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circ}`}
              style={{ transition: 'stroke-dasharray 0.6s ease' }}
            />
          </svg>
          <div className="absolute text-center">
            <p className="text-xl font-black text-slate-900 leading-none">
              {progressPercent}%
            </p>
            <p className="text-[9px] font-semibold mt-0.5 text-slate-400">
              {(totalDistanceMeters / 1000).toFixed(1)}km
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 space-y-2.5">
          {/* Time */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Tiempo</span>
            <span className="text-sm font-bold text-slate-900">
              {hoursSwum > 0 ? `${hoursSwum}h ${minsSwum}m` : minsSwum > 0 ? `${minsSwum}m` : '—'}
            </span>
          </div>
          {/* Sessions */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Sesiones</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-sky-600">
                {swimSessions} nado
              </span>
              <span className="text-xs text-slate-300">·</span>
              <span className="text-xs font-semibold text-violet-600">
                {bandSessions} bandas
              </span>
            </div>
          </div>
          {/* Shoulder */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Hombro</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: painColor }} />
              <span className="text-sm font-bold" style={{ color: painColor }}>
                {avgShoulderPain > 0 ? `${avgShoulderPain.toFixed(1)}/10` : '—'}
              </span>
              <span className="text-xs text-slate-400">{avgShoulderPain > 0 ? painLabel : ''}</span>
            </div>
          </div>
          {/* Goal bar */}
          <div>
            <div className="h-1.5 rounded-full overflow-hidden bg-slate-100">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progressPercent}%`,
                  background: ringColor,
                  transition: 'width 0.6s ease',
                }}
              />
            </div>
            <p className="text-[10px] mt-1 text-slate-400">
              Meta: {(weeklyGoalMeters / 1000).toFixed(1)}km
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
