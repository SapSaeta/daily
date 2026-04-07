'use client'

import { useState, useEffect } from 'react'

interface SwimSession {
  id: number
  date: string
  distanceMeters: number
  durationMinutes: number
  sessionType: string
  effort1to5: number
  shoulderPainBefore0to10: number
  shoulderPainAfter0to10: number
  fatigue1to5: number
  notes: string | null
  completed: boolean
}

interface BandSession {
  id: number
  date: string
  durationMinutes: number
  effort1to5: number
  shoulderPain0to10: number
  notes: string | null
  completed: boolean
}

type FilterType = 'all' | 'swim' | 'band'

const swimTypeLabels: Record<string, string> = {
  TECHNIQUE: 'Técnica',
  AEROBIC_BASE: 'Fondo aeróbico',
  INTERVALS: 'Series',
  RECOVERY: 'Recuperación',
  CONTROLLED_PACE: 'Ritmo controlado',
}

function PainBadge({ value }: { value: number }) {
  if (value === 0) return <span className="text-xs text-slate-600">Sin dolor</span>

  const color =
    value <= 2 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
    value <= 4 ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
    value <= 6 ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' :
    'bg-red-500/10 text-red-400 border-red-500/30'

  return (
    <span className={`badge border ${color}`}>
      Dolor {value}/10
    </span>
  )
}

function SwimSessionCard({ session }: { session: SwimSession }) {
  const [expanded, setExpanded] = useState(false)
  const pace = session.durationMinutes > 0 && session.distanceMeters > 0
    ? Math.round((session.durationMinutes / session.distanceMeters) * 100000) / 100
    : 0

  return (
    <div className="card border-l-4 border-l-sky-500">
      <button
        className="w-full text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {swimTypeLabels[session.sessionType] || session.sessionType}
              </p>
              <p className="text-xs text-slate-500">
                {new Date(session.date).toLocaleDateString('es-ES', {
                  weekday: 'short', day: 'numeric', month: 'short',
                })}
              </p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-sm font-bold text-sky-600">{session.distanceMeters}m</p>
            <p className="text-xs text-slate-500">{session.durationMinutes}min</p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs text-slate-500">RPE {session.effort1to5}/5</span>
          {pace > 0 && (
            <span className="text-xs text-slate-500">{pace.toFixed(1)} min/100m</span>
          )}
          <PainBadge value={session.shoulderPainAfter0to10} />
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="stat-card">
              <span className="text-[10px] text-slate-500">Dolor antes</span>
              <span className={`text-sm font-bold ${
                session.shoulderPainBefore0to10 <= 2 ? 'text-emerald-600' :
                session.shoulderPainBefore0to10 <= 4 ? 'text-amber-600' :
                'text-red-600'
              }`}>{session.shoulderPainBefore0to10}/10</span>
            </div>
            <div className="stat-card">
              <span className="text-[10px] text-slate-500">Dolor después</span>
              <span className={`text-sm font-bold ${
                session.shoulderPainAfter0to10 <= 2 ? 'text-emerald-600' :
                session.shoulderPainAfter0to10 <= 4 ? 'text-amber-600' :
                'text-red-600'
              }`}>{session.shoulderPainAfter0to10}/10</span>
            </div>
            <div className="stat-card">
              <span className="text-[10px] text-slate-500">Fatiga</span>
              <span className="text-sm font-bold text-slate-900">{session.fatigue1to5}/5</span>
            </div>
            <div className="stat-card">
              <span className="text-[10px] text-slate-500">Ritmo</span>
              <span className="text-sm font-bold text-slate-900">{pace > 0 ? `${pace.toFixed(1)} /100m` : '—'}</span>
            </div>
          </div>
          {session.notes && (
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-500 italic">&ldquo;{session.notes}&rdquo;</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function BandSessionCard({ session }: { session: BandSession }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="card border-l-4 border-l-violet-500">
      <button
        className="w-full text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Bandas elásticas</p>
              <p className="text-xs text-slate-500">
                {new Date(session.date).toLocaleDateString('es-ES', {
                  weekday: 'short', day: 'numeric', month: 'short',
                })}
              </p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-sm font-bold text-violet-600">{session.durationMinutes}min</p>
            <p className="text-xs text-slate-500">RPE {session.effort1to5}/5</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <PainBadge value={session.shoulderPain0to10} />
        </div>
      </button>

      {expanded && session.notes && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-500 italic">&ldquo;{session.notes}&rdquo;</p>
          </div>
        </div>
      )}
    </div>
  )
}

type CombinedSession =
  | { kind: 'swim'; data: SwimSession; date: Date }
  | { kind: 'band'; data: BandSession; date: Date }

export default function HistorialPage() {
  const [swimSessions, setSwimSessions] = useState<SwimSession[]>([])
  const [bandSessions, setBandSessions] = useState<BandSession[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')
  const [days, setDays] = useState(30)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [swimRes, bandRes] = await Promise.all([
          fetch(`/api/sessions?limit=50&days=${days}`),
          fetch(`/api/band-sessions?limit=50&days=${days}`),
        ])
        const swimData = await swimRes.json()
        const bandData = await bandRes.json()
        setSwimSessions(swimData.sessions || [])
        setBandSessions(bandData.sessions || [])
      } catch (error) {
        console.error('Error fetching sessions:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [days])

  // Combine and sort
  const combined: CombinedSession[] = [
    ...swimSessions.map(s => ({ kind: 'swim' as const, data: s, date: new Date(s.date) })),
    ...bandSessions.map(b => ({ kind: 'band' as const, data: b, date: new Date(b.date) })),
  ]
    .filter(s => {
      if (filter === 'swim') return s.kind === 'swim'
      if (filter === 'band') return s.kind === 'band'
      return true
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime())

  // Summary stats
  const totalSwimDistance = swimSessions.reduce((sum, s) => sum + s.distanceMeters, 0)
  const totalSwimTime = swimSessions.reduce((sum, s) => sum + s.durationMinutes, 0)
  const avgPain = swimSessions.length > 0
    ? swimSessions.reduce((sum, s) => sum + s.shoulderPainAfter0to10, 0) / swimSessions.length
    : 0

  return (
    <div className="px-4 pt-6 pb-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Historial</h1>
        <p className="text-sm text-slate-500 mt-0.5">Todas tus sesiones registradas</p>
      </div>

      {/* Period selector */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
        {[14, 30, 60, 90].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-150 ${
              days === d ? 'bg-sky-600 text-white' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {d}d
          </button>
        ))}
      </div>

      {/* Stats summary */}
      {!loading && (
        <div className="grid grid-cols-3 gap-2">
          <div className="stat-card">
            <span className="text-[10px] text-slate-500">Km nadados</span>
            <span className="text-lg font-bold text-sky-600">
              {(totalSwimDistance / 1000).toFixed(1)}
            </span>
          </div>
          <div className="stat-card">
            <span className="text-[10px] text-slate-500">Horas</span>
            <span className="text-lg font-bold text-slate-900">
              {(totalSwimTime / 60).toFixed(1)}h
            </span>
          </div>
          <div className="stat-card">
            <span className="text-[10px] text-slate-500">Dolor prom.</span>
            <span className={`text-lg font-bold ${
              avgPain <= 2 ? 'text-emerald-600' : avgPain <= 4 ? 'text-amber-600' : 'text-red-600'
            }`}>
              {avgPain > 0 ? avgPain.toFixed(1) : '—'}
            </span>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'swim', 'band'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
              filter === f
                ? f === 'swim' ? 'bg-sky-600 text-white' :
                  f === 'band' ? 'bg-violet-600 text-white' :
                  'bg-slate-700 text-white'
                : 'bg-white text-slate-500 hover:text-slate-700 border border-slate-200'
            }`}
          >
            {f === 'all' ? 'Todo' : f === 'swim' ? 'Natación' : 'Bandas'}
          </button>
        ))}
      </div>

      {/* Sessions list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 shimmer rounded-2xl" />
          ))}
        </div>
      ) : combined.length === 0 ? (
        <div className="card text-center py-10">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
            </svg>
          </div>
          <p className="text-slate-500 text-sm">Sin sesiones en los últimos {days} días</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="section-title">{combined.length} sesiones</p>
          {combined.map((session, i) => (
            session.kind === 'swim'
              ? <SwimSessionCard key={`swim-${session.data.id}`} session={session.data} />
              : <BandSessionCard key={`band-${session.data.id}`} session={session.data} />
          ))}
        </div>
      )}
    </div>
  )
}
