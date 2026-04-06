'use client'

import Link from 'next/link'

interface WorkoutCardProps {
  id?: number
  workoutType: 'SWIM' | 'BAND' | 'REST'
  title: string
  description: string
  targetDistance?: number | null
  targetDuration?: number | null
  intensity: 'LOW' | 'MEDIUM' | 'HIGH'
  focus: string
  status?: 'PENDING' | 'COMPLETED' | 'SKIPPED'
  date?: Date | string
  showLogButton?: boolean
  compact?: boolean
}

const intensityConfig = {
  LOW:    { label: 'Baja',  color: '#34d399', bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.25)' },
  MEDIUM: { label: 'Media', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.25)' },
  HIGH:   { label: 'Alta',  color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.25)' },
}

const typeConfig = {
  SWIM: {
    label: 'Natación',
    gradient: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
    glow: 'rgba(14,165,233,0.3)',
    iconBg: 'rgba(14,165,233,0.15)',
    iconColor: '#38bdf8',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
      </svg>
    ),
  },
  BAND: {
    label: 'Bandas',
    gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
    glow: 'rgba(139,92,246,0.3)',
    iconBg: 'rgba(139,92,246,0.15)',
    iconColor: '#a78bfa',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  REST: {
    label: 'Descanso',
    gradient: 'linear-gradient(135deg, #475569, #64748b)',
    glow: 'rgba(100,116,139,0.2)',
    iconBg: 'rgba(100,116,139,0.15)',
    iconColor: '#94a3b8',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75 2.25-1.313M12 21.75V19.5m0 2.25-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
      </svg>
    ),
  },
}

export default function WorkoutCard({
  id,
  workoutType,
  title,
  description,
  targetDistance,
  targetDuration,
  intensity,
  focus,
  status = 'PENDING',
  date,
  showLogButton = false,
  compact = false,
}: WorkoutCardProps) {
  const typeInfo = typeConfig[workoutType]
  const intensityInfo = intensityConfig[intensity]

  const formattedDate = date
    ? new Date(date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })
    : null

  if (compact) {
    return (
      <div className="card-sm flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: typeInfo.iconBg, color: typeInfo.iconColor }}
        >
          {typeInfo.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-100 truncate">{title}</p>
          <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{focus}</p>
        </div>
        <div className="flex-shrink-0 text-right">
          {targetDistance && (
            <p className="text-sm font-bold" style={{ color: typeInfo.iconColor }}>{targetDistance}m</p>
          )}
          {targetDuration && (
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{targetDuration}min</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: `0 8px 32px ${typeInfo.glow}`,
      }}
    >
      {/* Gradient top stripe */}
      <div style={{ background: typeInfo.gradient, height: '3px' }} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: typeInfo.iconBg, color: typeInfo.iconColor }}
            >
              {typeInfo.icon}
            </div>
            <div>
              <p className="text-xs font-semibold mb-0.5" style={{ color: typeInfo.iconColor }}>
                {typeInfo.label}
              </p>
              <h3 className="text-base font-bold text-white leading-tight">{title}</h3>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {status === 'COMPLETED' && (
              <span className="text-xs font-semibold" style={{ color: '#34d399' }}>✓ Hecho</span>
            )}
            {status === 'SKIPPED' && (
              <span className="text-xs font-semibold" style={{ color: '#f87171' }}>Saltado</span>
            )}
            <span
              className="badge text-xs"
              style={{ background: intensityInfo.bg, color: intensityInfo.color, border: `1px solid ${intensityInfo.border}` }}
            >
              {intensityInfo.label}
            </span>
          </div>
        </div>

        {/* Date */}
        {formattedDate && (
          <p className="text-xs mb-2 capitalize" style={{ color: 'rgba(255,255,255,0.3)' }}>{formattedDate}</p>
        )}

        {/* Focus */}
        <p className="text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
          {focus}
        </p>

        {/* Description */}
        <p className="text-xs leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {description}
        </p>

        {/* Metrics row */}
        <div className="flex items-center gap-3">
          {targetDistance && (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="#38bdf8" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              <span className="text-xs font-bold" style={{ color: '#38bdf8' }}>{targetDistance}m</span>
            </div>
          )}
          {targetDuration && (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.5)" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>{targetDuration} min</span>
            </div>
          )}
        </div>

        {/* Log button */}
        {showLogButton && status === 'PENDING' && (
          <div className="mt-4">
            <Link
              href={`/registro?type=${workoutType.toLowerCase()}&planned=${id}`}
              className="btn-primary w-full text-center block text-sm py-3"
            >
              Registrar ahora →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
