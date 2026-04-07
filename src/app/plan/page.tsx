'use client'

import { useState, useEffect } from 'react'
import WorkoutCard from '@/components/WorkoutCard'
import AlertBanner from '@/components/AlertBanner'

interface PlannedWorkout {
  id: number
  date: string
  workoutType: 'SWIM' | 'BAND' | 'REST'
  title: string
  description: string
  targetDistance: number | null
  targetDuration: number | null
  intensity: 'LOW' | 'MEDIUM' | 'HIGH'
  focus: string
  status: 'PENDING' | 'COMPLETED' | 'SKIPPED'
}

interface WeeklyPlan {
  id: number
  weekStart: string
  weekEnd: string
  workouts: PlannedWorkout[]
}

interface Analysis {
  adherencePercent: number
  avgShoulderPainAfter: number
  totalDistanceLast14Days: number
  sessionCount14Days: number
  shouldReduceIntensity: boolean
  shouldIncreaseDistance: boolean
}

const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export default function PlanPage() {
  const [plan, setPlan] = useState<WeeklyPlan | null>(null)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null)

  const fetchPlan = async () => {
    try {
      const [planRes, analysisRes] = await Promise.all([
        fetch('/api/weekly-plan'),
        fetch('/api/generate-plan'),
      ])
      const planData = await planRes.json()
      const analysisData = await analysisRes.json()
      setPlan(planData.plan)
      setAnalysis(analysisData.analysis)
    } catch (error) {
      console.error('Error fetching plan:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlan()
  }, [])

  const handleGeneratePlan = async () => {
    setGenerating(true)
    setMessage(null)
    try {
      const res = await fetch('/api/generate-plan', { method: 'POST' })
      if (res.ok) {
        setMessage({ type: 'success', text: 'Plan generado correctamente para la próxima semana.' })
        await fetchPlan()
      } else {
        const err = await res.json()
        setMessage({ type: 'danger', text: err.error || 'Error al generar el plan.' })
      }
    } catch {
      setMessage({ type: 'danger', text: 'Error de conexión.' })
    } finally {
      setGenerating(false)
    }
  }

  const handleStatusChange = async (workoutId: number, status: string) => {
    try {
      await fetch('/api/planned-workouts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: workoutId, status }),
      })
      await fetchPlan()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const formatWeekRange = (start: string, end: string) => {
    const s = new Date(start).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    const e = new Date(end).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    return `${s} – ${e}`
  }

  return (
    <div className="px-4 pt-6 pb-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-100">Plan semanal</h1>
        <p className="text-sm text-slate-400 mt-0.5">Tu programa de entrenamiento personalizado</p>
      </div>

      {/* Message */}
      {message && (
        <AlertBanner
          type={message.type}
          title={message.type === 'success' ? 'Éxito' : 'Error'}
          message={message.text}
          onDismiss={() => setMessage(null)}
        />
      )}

      {/* Analysis card */}
      {analysis && (
        <div className="card">
          <p className="section-title">Análisis (últimas 2 semanas)</p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="stat-card">
              <span className="text-[10px] text-slate-500 uppercase tracking-wide">Adherencia</span>
              <span className={`text-lg font-bold ${
                analysis.adherencePercent >= 80 ? 'text-emerald-400' :
                analysis.adherencePercent >= 60 ? 'text-amber-400' :
                'text-red-400'
              }`}>
                {Math.round(analysis.adherencePercent)}%
              </span>
            </div>
            <div className="stat-card">
              <span className="text-[10px] text-slate-500 uppercase tracking-wide">Dolor promedio</span>
              <span className={`text-lg font-bold ${
                analysis.avgShoulderPainAfter <= 2 ? 'text-emerald-400' :
                analysis.avgShoulderPainAfter <= 4 ? 'text-amber-400' :
                'text-red-400'
              }`}>
                {analysis.avgShoulderPainAfter.toFixed(1)}/10
              </span>
            </div>
            <div className="stat-card">
              <span className="text-[10px] text-slate-500 uppercase tracking-wide">Distancia 14d</span>
              <span className="text-lg font-bold text-sky-400">
                {(analysis.totalDistanceLast14Days / 1000).toFixed(1)}km
              </span>
            </div>
            <div className="stat-card">
              <span className="text-[10px] text-slate-500 uppercase tracking-wide">Sesiones 14d</span>
              <span className="text-lg font-bold text-slate-100">{analysis.sessionCount14Days}</span>
            </div>
          </div>

          {/* Recommendations */}
          <div className="space-y-2">
            {analysis.shouldReduceIntensity && (
              <AlertBanner
                type="danger"
                title="Intensidad reducida"
                message="El plan siguiente reducirá la intensidad para proteger tu hombro."
              />
            )}
            {analysis.shouldIncreaseDistance && (
              <AlertBanner
                type="success"
                title="Progresión activada"
                message="¡Excelente adherencia! El plan incrementará la distancia un 7%."
              />
            )}
          </div>
        </div>
      )}

      {/* Generate plan button */}
      <button
        onClick={handleGeneratePlan}
        disabled={generating}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {generating ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Generando plan...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Generar plan próxima semana
          </>
        )}
      </button>

      {/* Weekly plan */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-32 shimmer rounded-2xl" />
          ))}
        </div>
      ) : plan ? (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="section-title mb-0">
              Plan: {formatWeekRange(plan.weekStart, plan.weekEnd)}
            </p>
          </div>
          <div className="space-y-3">
            {plan.workouts.map((workout, i) => {
              const workoutDate = new Date(workout.date)
              const isToday = workoutDate.toDateString() === new Date().toDateString()
              const isPast = workoutDate < new Date() && !isToday

              return (
                <div key={workout.id}>
                  {/* Day label */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-xs font-semibold ${isToday ? 'text-sky-400' : 'text-slate-500'}`}>
                      {dayNames[i] || ''}
                    </span>
                    {isToday && (
                      <span className="badge bg-sky-500/10 border-sky-500/30 text-sky-400 border text-[10px]">Hoy</span>
                    )}
                  </div>

                  <WorkoutCard
                    id={workout.id}
                    workoutType={workout.workoutType}
                    title={workout.title}
                    description={workout.description}
                    targetDistance={workout.targetDistance}
                    targetDuration={workout.targetDuration}
                    intensity={workout.intensity}
                    focus={workout.focus}
                    status={workout.status}
                    date={workout.date}
                    showLogButton={isToday || isPast}
                  />

                  {/* Status controls */}
                  {workout.status === 'PENDING' && (isPast || isToday) && (
                    <div className="flex gap-2 mt-1.5 px-0.5">
                      <button
                        onClick={() => handleStatusChange(workout.id, 'COMPLETED')}
                        className="flex-1 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 rounded-lg hover:bg-emerald-500/20 transition-colors"
                      >
                        Marcar completado
                      </button>
                      <button
                        onClick={() => handleStatusChange(workout.id, 'SKIPPED')}
                        className="flex-1 py-1.5 text-xs font-medium text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        Marcar saltado
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="card text-center py-10">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
          </div>
          <p className="text-slate-400 text-sm mb-1">No hay plan activo</p>
          <p className="text-slate-600 text-xs">Genera tu primer plan de entrenamiento</p>
        </div>
      )}
    </div>
  )
}
