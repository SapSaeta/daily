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
  LOW: { label: 'Baja', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  MEDIUM: { label: 'Media', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
  HIGH: { label: 'Alta', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
}

const typeConfig = {
  SWIM: {
    label: 'Natación',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
      </svg>
    ),
  },
  BAND: {
    label: 'Bandas',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  REST: {
    label: 'Descanso',
    color: 'text-slate-400',
    bg: 'bg-slate-500/10',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75 2.25-1.313M12 21.75V19.5m0 2.25-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
      </svg>
    ),
  },
}

const statusConfig = {
  PENDING: { label: 'Pendiente', color: 'text-slate-400' },
  COMPLETED: { label: 'Completado', color: 'text-emerald-400' },
  SKIPPED: { label: 'Saltado', color: 'text-red-400' },
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
  const statusInfo = statusConfig[status]

  const formattedDate = date
    ? new Date(date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })
    : null

  if (compact) {
    return (
      <div className="card-sm flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg ${typeInfo.bg} flex items-center justify-center flex-shrink-0 ${typeInfo.color}`}>
          {typeInfo.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-100 truncate">{title}</p>
          <p className="text-xs text-slate-500 truncate">{focus}</p>
        </div>
        <div className="flex-shrink-0 text-right">
          {targetDistance && <p className="text-xs font-semibold text-sky-400">{targetDistance}m</p>}
          {targetDuration && <p className="text-xs text-slate-500">{targetDuration}min</p>}
        </div>
      </div>
    )
  }

  return (
    <div className={`card border-l-4 ${
      workoutType === 'SWIM' ? 'border-l-sky-500' :
      workoutType === 'BAND' ? 'border-l-violet-500' :
      'border-l-slate-600'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-9 h-9 rounded-xl ${typeInfo.bg} flex items-center justify-center ${typeInfo.color}`}>
            {typeInfo.icon}
          </div>
          <div>
            <p className={`text-xs font-medium ${typeInfo.color}`}>{typeInfo.label}</p>
            <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {status !== 'PENDING' && (
            <span className={`text-xs font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
          )}
          <span className={`badge border ${intensityInfo.bg} ${intensityInfo.color} text-xs`}>
            {intensityInfo.label}
          </span>
        </div>
      </div>

      {/* Date */}
      {formattedDate && (
        <p className="text-xs text-slate-500 mb-2 capitalize">{formattedDate}</p>
      )}

      {/* Focus */}
      <p className="text-xs font-medium text-slate-400 mb-2">
        <span className="text-slate-600">Objetivo:</span> {focus}
      </p>

      {/* Description */}
      <p className="text-xs text-slate-400 leading-relaxed mb-3">{description}</p>

      {/* Stats */}
      <div className="flex items-center gap-3">
        {targetDistance && (
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            <span className="text-xs font-semibold text-sky-400">{targetDistance}m</span>
          </div>
        )}
        {targetDuration && (
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span className="text-xs text-slate-400">{targetDuration} min</span>
          </div>
        )}
      </div>

      {/* Log button */}
      {showLogButton && status === 'PENDING' && (
        <div className="mt-3 pt-3 border-t border-slate-800">
          <Link
            href={`/registro?type=${workoutType.toLowerCase()}&planned=${id}`}
            className="btn-primary w-full text-center block text-sm py-2"
          >
            Registrar sesión
          </Link>
        </div>
      )}
    </div>
  )
}
