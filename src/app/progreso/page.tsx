'use client'

import { useState, useEffect } from 'react'
import { DistanceChart, PainChart, WeeklyBarChart, WeightChart } from '@/components/ProgressChart'

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
}

interface WeightEntry {
  id: number
  date: string
  weightKg: number
  notes?: string
}

type ChartView = 'distance' | 'pain' | 'weekly' | 'weight'

function groupByWeek(sessions: SwimSession[]) {
  const weeks: Record<string, { distance: number; sessions: number; weekLabel: string }> = {}

  for (const s of sessions) {
    const date = new Date(s.date)
    const dayOfWeek = date.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(date)
    monday.setDate(date.getDate() + diff)
    const key = monday.toISOString().split('T')[0]
    const label = monday.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })

    if (!weeks[key]) {
      weeks[key] = { distance: 0, sessions: 0, weekLabel: label }
    }
    weeks[key].distance += s.distanceMeters
    weeks[key].sessions += 1
  }

  return Object.entries(weeks)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([_, v]) => ({ week: v.weekLabel, distance: v.distance, sessions: v.sessions }))
}

export default function ProgresoPage() {
  const [sessions, setSessions] = useState<SwimSession[]>([])
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [chartView, setChartView] = useState<ChartView>('distance')
  const [days, setDays] = useState(30)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [sessionsRes, weightRes] = await Promise.all([
          fetch(`/api/sessions?limit=100&days=${days}`),
          fetch(`/api/weight?limit=100&days=${days}`),
        ])
        const sessionsData = await sessionsRes.json()
        const weightData = await weightRes.json()
        setSessions(sessionsData.sessions || [])
        setWeightEntries(weightData.entries || [])
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [days])

  // Process chart data
  const sorted = [...sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const distanceData = sorted.map(s => ({
    date: new Date(s.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
    distance: s.distanceMeters,
    type: s.sessionType,
  }))

  const painData = sorted.map(s => ({
    date: new Date(s.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
    painBefore: s.shoulderPainBefore0to10,
    painAfter: s.shoulderPainAfter0to10,
  }))

  const weeklyData = groupByWeek(sorted)

  // Stats
  const totalDistance = sessions.reduce((sum, s) => sum + s.distanceMeters, 0)
  const totalTime = sessions.reduce((sum, s) => sum + s.durationMinutes, 0)
  const avgDistance = sessions.length > 0 ? totalDistance / sessions.length : 0
  const maxDistance = sessions.length > 0 ? Math.max(...sessions.map(s => s.distanceMeters)) : 0
  const avgPainBefore = sessions.length > 0
    ? sessions.reduce((sum, s) => sum + s.shoulderPainBefore0to10, 0) / sessions.length
    : 0
  const avgPainAfter = sessions.length > 0
    ? sessions.reduce((sum, s) => sum + s.shoulderPainAfter0to10, 0) / sessions.length
    : 0

  // Pain trend (last 7 vs previous 7)
  const last7 = sessions.filter(s => {
    const d = new Date(s.date)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return d >= sevenDaysAgo
  })
  const prev7 = sessions.filter(s => {
    const d = new Date(s.date)
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return d >= fourteenDaysAgo && d < sevenDaysAgo
  })

  const last7Pain = last7.length > 0
    ? last7.reduce((sum, s) => sum + s.shoulderPainAfter0to10, 0) / last7.length
    : 0
  const prev7Pain = prev7.length > 0
    ? prev7.reduce((sum, s) => sum + s.shoulderPainAfter0to10, 0) / prev7.length
    : 0
  const painTrend = last7Pain - prev7Pain

  // Weight data
  const sortedWeight = [...weightEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const weightData = sortedWeight.map(w => ({
    date: new Date(w.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
    weight: w.weightKg,
  }))
  const latestWeight = sortedWeight.length > 0 ? sortedWeight[sortedWeight.length - 1].weightKg : null
  const firstWeight = sortedWeight.length > 1 ? sortedWeight[0].weightKg : null
  const weightChange = latestWeight != null && firstWeight != null ? latestWeight - firstWeight : null

  // Session type distribution
  const typeCount: Record<string, number> = {}
  for (const s of sessions) {
    typeCount[s.sessionType] = (typeCount[s.sessionType] || 0) + 1
  }

  const typeLabels: Record<string, string> = {
    TECHNIQUE: 'Técnica',
    AEROBIC_BASE: 'Fondo aeróbico',
    INTERVALS: 'Series',
    RECOVERY: 'Recuperación',
    CONTROLLED_PACE: 'Ritmo controlado',
  }

  const typeColors: Record<string, string> = {
    TECHNIQUE: 'bg-violet-500',
    AEROBIC_BASE: 'bg-sky-500',
    INTERVALS: 'bg-red-500',
    RECOVERY: 'bg-emerald-500',
    CONTROLLED_PACE: 'bg-amber-500',
  }

  return (
    <div className="px-4 pt-6 pb-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-100">Progreso</h1>
        <p className="text-sm text-slate-400 mt-0.5">Tu evolución en el tiempo</p>
      </div>

      {/* Period selector */}
      <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
        {[14, 30, 60, 90].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-150 ${
              days === d ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            {d}d
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 shimmer rounded-2xl" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-slate-400 text-sm">Sin datos para mostrar</p>
          <p className="text-slate-600 text-xs mt-1">Registra sesiones para ver tu progreso</p>
        </div>
      ) : (
        <>
          {/* Key metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="stat-card">
              <span className="text-[10px] text-slate-500 uppercase tracking-wide">Total nadado</span>
              <span className="text-xl font-bold text-sky-400">{(totalDistance / 1000).toFixed(1)}km</span>
              <span className="text-[10px] text-slate-600">{sessions.length} sesiones</span>
            </div>
            <div className="stat-card">
              <span className="text-[10px] text-slate-500 uppercase tracking-wide">Tiempo total</span>
              <span className="text-xl font-bold text-slate-100">{Math.floor(totalTime / 60)}h {totalTime % 60}m</span>
              <span className="text-[10px] text-slate-600">~{Math.round(avgDistance)}m/sesión</span>
            </div>
            <div className="stat-card">
              <span className="text-[10px] text-slate-500 uppercase tracking-wide">Mejor sesión</span>
              <span className="text-xl font-bold text-emerald-400">{maxDistance}m</span>
            </div>
            <div className="stat-card">
              <span className="text-[10px] text-slate-500 uppercase tracking-wide">Tendencia dolor</span>
              <div className="flex items-center gap-1">
                <span className={`text-xl font-bold ${
                  painTrend < 0 ? 'text-emerald-400' :
                  painTrend === 0 ? 'text-slate-400' :
                  'text-red-400'
                }`}>
                  {painTrend === 0 ? '=' : painTrend > 0 ? '+' : ''}{painTrend.toFixed(1)}
                </span>
                {painTrend < 0 && (
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6 9 12.75l4.286-4.286a11.948 11.948 0 0 1 4.306 6.43l.776 2.898m0 0 3.182-5.511m-3.182 5.51-5.511-3.181" />
                  </svg>
                )}
                {painTrend > 0 && (
                  <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.286 4.286a11.948 11.948 0 0 1 4.306-6.43l.776-2.897m0 0 3.182 5.51m-3.182-5.51-5.511 3.181" />
                  </svg>
                )}
              </div>
              <span className="text-[10px] text-slate-600">vs semana anterior</span>
            </div>
          </div>

          {/* Charts */}
          <div className="card">
            {/* Chart selector */}
            <div className="flex gap-1 bg-slate-800 p-1 rounded-xl mb-4">
              {(['distance', 'pain', 'weekly', 'weight'] as ChartView[]).map((view) => (
                <button
                  key={view}
                  onClick={() => setChartView(view)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                    chartView === view ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {view === 'distance' ? 'Distancia' : view === 'pain' ? 'Dolor' : view === 'weekly' ? 'Semanas' : 'Peso'}
                </button>
              ))}
            </div>

            {chartView === 'distance' && distanceData.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-3">Distancia por sesión (metros)</p>
                <DistanceChart data={distanceData} />
              </div>
            )}

            {chartView === 'pain' && painData.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-3">Evolución del dolor de hombro (0-10)</p>
                <PainChart data={painData} />
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="stat-card">
                    <span className="text-[10px] text-slate-500">Dolor promedio antes</span>
                    <span className={`text-lg font-bold ${
                      avgPainBefore <= 2 ? 'text-emerald-400' : avgPainBefore <= 4 ? 'text-amber-400' : 'text-red-400'
                    }`}>{avgPainBefore.toFixed(1)}/10</span>
                  </div>
                  <div className="stat-card">
                    <span className="text-[10px] text-slate-500">Dolor promedio después</span>
                    <span className={`text-lg font-bold ${
                      avgPainAfter <= 2 ? 'text-emerald-400' : avgPainAfter <= 4 ? 'text-amber-400' : 'text-red-400'
                    }`}>{avgPainAfter.toFixed(1)}/10</span>
                  </div>
                </div>
              </div>
            )}

            {chartView === 'weekly' && weeklyData.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-3">Distancia total por semana (metros)</p>
                <WeeklyBarChart data={weeklyData} />
              </div>
            )}

            {chartView === 'weight' && (
              <div>
                <p className="text-xs text-slate-500 mb-3">Evolución del peso corporal (kg)</p>
                {weightData.length > 0 ? (
                  <>
                    <WeightChart data={weightData} />
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <div className="stat-card">
                        <span className="text-[10px] text-slate-500">Actual</span>
                        <span className="text-lg font-bold text-emerald-400">
                          {latestWeight != null ? `${latestWeight} kg` : '—'}
                        </span>
                      </div>
                      <div className="stat-card">
                        <span className="text-[10px] text-slate-500">Inicio</span>
                        <span className="text-lg font-bold text-slate-300">
                          {firstWeight != null ? `${firstWeight} kg` : latestWeight != null ? `${latestWeight} kg` : '—'}
                        </span>
                      </div>
                      <div className="stat-card">
                        <span className="text-[10px] text-slate-500">Cambio</span>
                        <span className={`text-lg font-bold ${
                          weightChange == null ? 'text-slate-400' :
                          weightChange < 0 ? 'text-emerald-400' :
                          weightChange > 0 ? 'text-amber-400' : 'text-slate-400'
                        }`}>
                          {weightChange != null
                            ? `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} kg`
                            : '—'}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-500 text-sm">Sin registros de peso</p>
                    <p className="text-slate-600 text-xs mt-1">Registra tu peso en la sección de registro</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Session type distribution */}
          {Object.keys(typeCount).length > 0 && (
            <div className="card">
              <p className="section-title">Distribución de sesiones</p>
              <div className="space-y-2">
                {Object.entries(typeCount)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${typeColors[type] || 'bg-slate-500'}`} />
                      <span className="text-xs text-slate-300 flex-1">{typeLabels[type] || type}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${typeColors[type] || 'bg-slate-500'}`}
                            style={{ width: `${(count / sessions.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500 w-8 text-right">
                          {count}x
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Shoulder health summary */}
          <div className="card">
            <p className="section-title">Salud del hombro</p>
            <div className="space-y-3">
              {/* Pain comparison */}
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                  <span>Dolor promedio antes de nadar</span>
                  <span className={avgPainBefore <= 3 ? 'text-emerald-400' : 'text-amber-400'}>
                    {avgPainBefore.toFixed(1)}/10
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full">
                  <div
                    className={`h-full rounded-full ${avgPainBefore <= 3 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${(avgPainBefore / 10) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                  <span>Dolor promedio después de nadar</span>
                  <span className={avgPainAfter <= 3 ? 'text-emerald-400' : avgPainAfter <= 6 ? 'text-amber-400' : 'text-red-400'}>
                    {avgPainAfter.toFixed(1)}/10
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full">
                  <div
                    className={`h-full rounded-full ${
                      avgPainAfter <= 3 ? 'bg-emerald-500' : avgPainAfter <= 6 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${(avgPainAfter / 10) * 100}%` }}
                  />
                </div>
              </div>

              {/* Interpretation */}
              <div className={`rounded-xl p-3 text-xs ${
                avgPainAfter <= 2 ? 'bg-emerald-500/10 text-emerald-300' :
                avgPainAfter <= 4 ? 'bg-amber-500/10 text-amber-300' :
                'bg-red-500/10 text-red-300'
              }`}>
                {avgPainAfter <= 2
                  ? 'Excelente control del dolor. Continúa con la progresión actual.'
                  : avgPainAfter <= 4
                  ? 'Dolor leve-moderado. Mantén la carga actual y prioriza la técnica.'
                  : 'Dolor elevado. Considera reducir intensidad y consultar fisioterapeuta.'}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
