import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import AlertBanner from '@/components/AlertBanner'
import WorkoutCard from '@/components/WorkoutCard'
import WeeklySummary from '@/components/WeeklySummary'

async function getDashboardData() {
  const now = new Date()

  // Week boundaries (Mon-Sun)
  const dayOfWeek = now.getDay()
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() + diff)
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  // Today boundaries
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date(now)
  todayEnd.setHours(23, 59, 59, 999)

  // 7 days ago for "missed days" check
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(now.getDate() - 7)

  // Fetch data in parallel
  const [
    thisWeekSwims,
    thisWeekBands,
    todayPlanned,
    recentSwims,
    recentBands,
    settings,
    latestWeight,
  ] = await Promise.all([
    prisma.swimSession.findMany({
      where: { date: { gte: weekStart, lte: weekEnd }, completed: true },
      orderBy: { date: 'desc' },
    }),
    prisma.bandSession.findMany({
      where: { date: { gte: weekStart, lte: weekEnd }, completed: true },
      orderBy: { date: 'desc' },
    }),
    prisma.plannedWorkout.findMany({
      where: { date: { gte: todayStart, lte: todayEnd } },
      orderBy: { date: 'asc' },
    }),
    prisma.swimSession.findMany({
      where: { date: { gte: sevenDaysAgo }, completed: true },
      orderBy: { date: 'desc' },
      take: 5,
    }),
    prisma.bandSession.findMany({
      where: { date: { gte: sevenDaysAgo }, completed: true },
      orderBy: { date: 'desc' },
      take: 5,
    }),
    prisma.userSettings.findFirst(),
    prisma.weightEntry.findFirst({ orderBy: { date: 'desc' } }),
  ])

  // Weekly stats
  const weeklyDistance = thisWeekSwims.reduce((sum, s) => sum + s.distanceMeters, 0)
  const weeklyMinutes = thisWeekSwims.reduce((sum, s) => sum + s.durationMinutes, 0)
  const allPains = thisWeekSwims.map(s => s.shoulderPainAfter0to10)
  const avgPain = allPains.length > 0
    ? allPains.reduce((a, b) => a + b, 0) / allPains.length
    : 0

  // Alerts
  const alerts: Array<{ type: 'warning' | 'danger' | 'success' | 'info'; title: string; message: string }> = []

  // Check for high pain
  const recentHighPain = recentSwims.some(s => s.shoulderPainAfter0to10 >= 6)
  if (recentHighPain) {
    alerts.push({
      type: 'danger',
      title: 'Dolor de hombro elevado',
      message: 'Has reportado dolor >= 6/10 recientemente. Considera reducir la intensidad o hacer una sesión de recuperación.',
    })
  }

  // Check for missed days (no activity in 3+ days)
  const threeDaysAgo = new Date(now)
  threeDaysAgo.setDate(now.getDate() - 3)
  const recentActivity = recentSwims.filter(s => s.date >= threeDaysAgo).length +
    recentBands.filter(b => b.date >= threeDaysAgo).length
  if (recentActivity === 0 && dayOfWeek !== 0) { // Not Sunday
    alerts.push({
      type: 'warning',
      title: 'Sin actividad reciente',
      message: 'Llevas más de 3 días sin registrar actividad. ¡Vuelve a la piscina!',
    })
  }

  // Progress milestone
  const weeklyGoal = settings?.currentWeeklyDistanceGoal ?? 4000
  if (weeklyDistance >= weeklyGoal) {
    alerts.push({
      type: 'success',
      title: '¡Meta semanal alcanzada!',
      message: `Has nadado ${weeklyDistance.toLocaleString('es')}m esta semana. ¡Excelente trabajo!`,
    })
  }

  // Combine and sort recent sessions
  const recentSessions: Array<{
    type: 'swim' | 'band'
    date: Date
    title: string
    detail: string
    pain: number
  }> = []

  for (const s of recentSwims.slice(0, 3)) {
    const typeLabels: Record<string, string> = {
      TECHNIQUE: 'Técnica', AEROBIC_BASE: 'Aeróbico', INTERVALS: 'Series',
      RECOVERY: 'Recuperación', CONTROLLED_PACE: 'Ritmo controlado',
    }
    recentSessions.push({
      type: 'swim',
      date: s.date,
      title: typeLabels[s.sessionType] || s.sessionType,
      detail: `${s.distanceMeters}m · ${s.durationMinutes}min · Esfuerzo ${s.effort1to5}/5`,
      pain: s.shoulderPainAfter0to10,
    })
  }

  for (const b of recentBands.slice(0, 2)) {
    recentSessions.push({
      type: 'band',
      date: b.date,
      title: 'Bandas elásticas',
      detail: `${b.durationMinutes}min · Esfuerzo ${b.effort1to5}/5`,
      pain: b.shoulderPain0to10,
    })
  }

  recentSessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return {
    alerts,
    todayPlanned,
    recentSessions: recentSessions.slice(0, 4),
    weeklyDistance,
    weeklyMinutes,
    avgPain: Math.round(avgPain * 10) / 10,
    swimSessions: thisWeekSwims.length,
    bandSessions: thisWeekBands.length,
    weeklyGoal,
    currentWeight: latestWeight?.weightKg ?? null,
    currentWeightDate: latestWeight?.date ?? null,
  }
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const todayDayName = dayNames[new Date().getDay()]

export default async function DashboardPage() {
  const data = await getDashboardData()
  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div className="pb-4 space-y-5">
      {/* Top bar */}
      <div
        className="px-5 pt-10 pb-5 bg-white"
        style={{ borderBottom: '1px solid #e2e8f0' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 mb-0.5 uppercase tracking-wide">
              {getGreeting()}
            </p>
            <h1 className="text-xl font-extrabold text-slate-900 capitalize leading-tight">{today}</h1>
          </div>
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #0284c7, #7c3aed)' }}
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-5">
        {/* Alerts */}
        {data.alerts.length > 0 && (
          <div className="space-y-2">
            {data.alerts.map((alert, i) => (
              <AlertBanner key={i} type={alert.type} title={alert.title} message={alert.message} />
            ))}
          </div>
        )}

        {/* Today's workout */}
        <div>
          <p className="section-title">Entrenamiento de hoy</p>
          {data.todayPlanned.length > 0 ? (
            <div className="space-y-3">
              {data.todayPlanned.map((workout) => (
                <WorkoutCard
                  key={workout.id}
                  id={workout.id}
                  workoutType={workout.workoutType as 'SWIM' | 'BAND' | 'REST'}
                  title={workout.title}
                  description={workout.description}
                  targetDistance={workout.targetDistance}
                  targetDuration={workout.targetDuration}
                  intensity={workout.intensity as 'LOW' | 'MEDIUM' | 'HIGH'}
                  focus={workout.focus}
                  status={workout.status as 'PENDING' | 'COMPLETED' | 'SKIPPED'}
                  showLogButton={true}
                />
              ))}
            </div>
          ) : (
            <div
              className="bg-white rounded-2xl border border-slate-200 p-6 text-center"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: '#ede9fe' }}
              >
                <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
              </div>
              <p className="text-base font-bold text-slate-900 mb-1">Sin plan para hoy</p>
              <p className="text-sm text-slate-500 mb-5">Genera un plan semanal para ver tus entrenos</p>
              <Link href="/plan" className="btn-primary inline-block text-sm py-3 px-8">
                Generar plan
              </Link>
            </div>
          )}
        </div>

        {/* Quick log */}
        <div>
          <p className="section-title">Registro rápido</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                href: '/registro?type=swim',
                label: 'Nado',
                sublabel: 'Natación',
                iconBg: '#e0f2fe',
                iconColor: '#0284c7',
                iconPath: 'M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z',
              },
              {
                href: '/registro?type=band',
                label: 'Bandas',
                sublabel: 'Hombro',
                iconBg: '#ede9fe',
                iconColor: '#7c3aed',
                iconPath: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z',
              },
              {
                href: '/registro?type=weight',
                label: data.currentWeight != null ? `${data.currentWeight}kg` : 'Peso',
                sublabel: data.currentWeight != null ? 'Actualizar' : 'Registrar',
                iconBg: '#d1fae5',
                iconColor: '#059669',
                iconPath: 'M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.589-1.202L18.75 4.97Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.589-1.202L5.25 4.97Z',
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col gap-3 active:opacity-70 transition-opacity"
                style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: item.iconBg }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={item.iconColor} strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.iconPath} />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 leading-none">{item.label}</p>
                  <p className="text-xs mt-0.5 text-slate-400">{item.sublabel}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Weekly summary */}
        <WeeklySummary
          totalDistanceMeters={data.weeklyDistance}
          totalMinutes={data.weeklyMinutes}
          swimSessions={data.swimSessions}
          bandSessions={data.bandSessions}
          avgShoulderPain={data.avgPain}
          weeklyGoalMeters={data.weeklyGoal}
        />

        {/* Recent sessions */}
        {data.recentSessions.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="section-title mb-0">Últimas sesiones</p>
              <Link href="/historial" className="text-xs font-semibold text-sky-600">
                Ver todo →
              </Link>
            </div>
            <div className="space-y-2">
              {data.recentSessions.map((session, i) => {
                const isSwim = session.type === 'swim'
                const painColor = session.pain === 0 ? '#94a3b8' :
                  session.pain <= 2 ? '#059669' : session.pain <= 4 ? '#d97706' :
                  session.pain <= 6 ? '#d97706' : '#dc2626'
                return (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-slate-200 p-3.5 flex items-center gap-3"
                    style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: isSwim ? '#e0f2fe' : '#ede9fe' }}
                    >
                      {isSwim ? (
                        <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900">{session.title}</p>
                      <p className="text-xs truncate mt-0.5 text-slate-500">{session.detail}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs capitalize mb-0.5 text-slate-400">{formatDate(session.date)}</p>
                      {session.pain > 0 && (
                        <span className="text-xs font-bold" style={{ color: painColor }}>
                          {session.pain}/10
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Exercise library link */}
        <Link
          href="/ejercicios"
          className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 active:opacity-70 transition-opacity"
          style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
        >
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: '#d1fae5' }}
          >
            <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-900">Biblioteca de ejercicios</p>
            <p className="text-xs mt-0.5 text-slate-500">15 ejercicios para el hombro</p>
          </div>
          <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
