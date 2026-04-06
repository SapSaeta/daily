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
    avgShoulderPain === 0 ? '#34d399' :
    avgShoulderPain <= 2 ? '#34d399' :
    avgShoulderPain <= 4 ? '#fbbf24' :
    avgShoulderPain <= 6 ? '#fb923c' :
    '#f87171'

  const painLabel =
    avgShoulderPain === 0 ? '—' :
    avgShoulderPain <= 2 ? 'Muy leve' :
    avgShoulderPain <= 4 ? 'Leve' :
    avgShoulderPain <= 6 ? 'Moderado' :
    'Alto'

  const ringColor =
    progressPercent >= 100 ? '#34d399' :
    progressPercent >= 70  ? '#0ea5e9' :
    progressPercent >= 40  ? '#fbbf24' :
    '#475569'

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Semana actual
        </p>
        {progressPercent >= 100 && (
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}
          >
            ✓ Meta lograda
          </span>
        )}
      </div>

      {/* Main content */}
      <div className="px-4 pb-4 flex items-center gap-4">
        {/* Ring */}
        <div className="flex-shrink-0 relative flex items-center justify-center" style={{ width: size, height: size }}>
          <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx={size / 2} cy={size / 2} r={r}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
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
            <p className="text-xl font-black text-white leading-none">
              {progressPercent}%
            </p>
            <p className="text-[9px] font-semibold mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {(totalDistanceMeters / 1000).toFixed(1)}km
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 space-y-2.5">
          {/* Time */}
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Tiempo</span>
            <span className="text-sm font-bold text-white">
              {hoursSwum > 0 ? `${hoursSwum}h ${minsSwum}m` : minsSwum > 0 ? `${minsSwum}m` : '—'}
            </span>
          </div>
          {/* Sessions */}
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Sesiones</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold" style={{ color: '#38bdf8' }}>
                {swimSessions} nado
              </span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
              <span className="text-xs font-semibold" style={{ color: '#a78bfa' }}>
                {bandSessions} bandas
              </span>
            </div>
          </div>
          {/* Shoulder */}
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Hombro</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: painColor }} />
              <span className="text-sm font-bold" style={{ color: painColor }}>
                {avgShoulderPain > 0 ? `${avgShoulderPain.toFixed(1)}/10` : '—'}
              </span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{avgShoulderPain > 0 ? painLabel : ''}</span>
            </div>
          </div>
          {/* Goal bar */}
          <div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progressPercent}%`,
                  background: ringColor,
                  transition: 'width 0.6s ease',
                }}
              />
            </div>
            <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Meta: {(weeklyGoalMeters / 1000).toFixed(1)}km
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
