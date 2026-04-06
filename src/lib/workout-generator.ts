import { prisma } from './prisma'

export type SessionType = 'TECHNIQUE' | 'AEROBIC_BASE' | 'INTERVALS' | 'RECOVERY' | 'CONTROLLED_PACE'
export type Intensity = 'LOW' | 'MEDIUM' | 'HIGH'
export type WorkoutType = 'SWIM' | 'BAND' | 'REST'

interface SessionTemplate {
  type: SessionType
  targetDistance: number
  targetDuration: number
  intensity: Intensity
  focus: string
  title: string
  description: string
}

const SESSION_TEMPLATES: Record<SessionType, SessionTemplate> = {
  RECOVERY: {
    type: 'RECOVERY',
    targetDistance: 1200,
    targetDuration: 45,
    intensity: 'LOW',
    focus: 'Técnica y recuperación',
    title: 'Sesión de Recuperación',
    description: 'Nado suave sin esfuerzo. Técnica libre, espalda o braza. Ritmo muy tranquilo, disfruta el agua.',
  },
  TECHNIQUE: {
    type: 'TECHNIQUE',
    targetDistance: 1500,
    targetDuration: 50,
    intensity: 'LOW',
    focus: 'Técnica crol y respiración',
    title: 'Trabajo de Técnica',
    description: 'Drills de crol: dedos al agua, codo alto, catch-up. Respiración bilateral. Series cortas con descanso.',
  },
  AEROBIC_BASE: {
    type: 'AEROBIC_BASE',
    targetDistance: 2000,
    targetDuration: 60,
    intensity: 'MEDIUM',
    focus: 'Fondo aeróbico base',
    title: 'Fondo Aeróbico',
    description: 'Nado continuo a ritmo conversacional. Mantener técnica durante todo el recorrido. Respiración bilateral.',
  },
  CONTROLLED_PACE: {
    type: 'CONTROLLED_PACE',
    targetDistance: 2000,
    targetDuration: 55,
    intensity: 'MEDIUM',
    focus: 'Ritmo controlado',
    title: 'Ritmo Controlado',
    description: 'Series de 400m a ritmo objetivo. Descanso 30s entre series. Mantener frecuencia de brazada constante.',
  },
  INTERVALS: {
    type: 'INTERVALS',
    targetDistance: 1800,
    targetDuration: 55,
    intensity: 'HIGH',
    focus: 'Series y velocidad',
    title: 'Series de Velocidad',
    description: 'Calentamiento 400m. Series 10x100m con 20s descanso. Enfriamiento 200m. Técnica en fatiga.',
  },
}

const SESSION_ROTATION: SessionType[] = [
  'TECHNIQUE',
  'AEROBIC_BASE',
  'INTERVALS',
  'RECOVERY',
  'CONTROLLED_PACE',
]

interface AnalysisResult {
  adherencePercent: number
  avgShoulderPainAfter: number
  totalDistanceLast14Days: number
  sessionCount14Days: number
  shouldReduceIntensity: boolean
  shouldIncreaseDistance: boolean
  lastSessionType: SessionType | null
  currentDistanceGoal: number
}

async function analyzeRecentSessions(): Promise<AnalysisResult> {
  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

  const recentSwims = await prisma.swimSession.findMany({
    where: { date: { gte: fourteenDaysAgo } },
    orderBy: { date: 'desc' },
  })

  const settings = await prisma.userSettings.findFirst()
  const currentDistanceGoal = settings?.currentWeeklyDistanceGoal ?? 4000

  // Calculate adherence: expect 3 swims per week = 6 in 14 days
  const expectedSessions = 6
  const completedSessions = recentSwims.filter(s => s.completed).length
  const adherencePercent = Math.min(100, (completedSessions / expectedSessions) * 100)

  const totalDistanceLast14Days = recentSwims
    .filter(s => s.completed)
    .reduce((sum, s) => sum + s.distanceMeters, 0)

  const avgShoulderPainAfter = recentSwims.length > 0
    ? recentSwims.reduce((sum, s) => sum + s.shoulderPainAfter0to10, 0) / recentSwims.length
    : 0

  const shouldReduceIntensity = avgShoulderPainAfter > 5

  // Increase distance if adherence >= 80% for last 2 weeks
  const shouldIncreaseDistance = adherencePercent >= 80 && !shouldReduceIntensity

  const lastSession = recentSwims[0]
  const lastSessionType = lastSession ? (lastSession.sessionType as SessionType) : null

  return {
    adherencePercent,
    avgShoulderPainAfter,
    totalDistanceLast14Days,
    sessionCount14Days: recentSwims.length,
    shouldReduceIntensity,
    shouldIncreaseDistance,
    lastSessionType,
    currentDistanceGoal,
  }
}

function getNextSessionType(lastType: SessionType | null, dayIndex: number): SessionType {
  if (!lastType) {
    return SESSION_ROTATION[dayIndex % SESSION_ROTATION.length]
  }
  const lastIndex = SESSION_ROTATION.indexOf(lastType)
  return SESSION_ROTATION[(lastIndex + 1) % SESSION_ROTATION.length]
}

function adjustTemplateForConditions(
  template: SessionTemplate,
  analysis: AnalysisResult,
  distanceMultiplier: number
): SessionTemplate {
  const adjusted = { ...template }

  if (analysis.shouldReduceIntensity) {
    // Downgrade high intensity to medium, medium to low
    if (adjusted.intensity === 'HIGH') {
      adjusted.intensity = 'MEDIUM'
      adjusted.targetDistance = Math.round(adjusted.targetDistance * 0.85)
      adjusted.description = '⚠️ Intensidad reducida por dolor de hombro. ' + adjusted.description
    } else if (adjusted.intensity === 'MEDIUM') {
      adjusted.intensity = 'LOW'
      adjusted.targetDistance = Math.round(adjusted.targetDistance * 0.85)
    }
  }

  adjusted.targetDistance = Math.round(adjusted.targetDistance * distanceMultiplier)

  // Cap distances to reasonable limits
  adjusted.targetDistance = Math.min(3000, Math.max(800, adjusted.targetDistance))

  return adjusted
}

export async function generateWeeklyPlan(): Promise<{ success: boolean; planId?: number; message?: string }> {
  try {
    const analysis = await analyzeRecentSessions()

    // Calculate distance multiplier
    let distanceMultiplier = 1.0
    if (analysis.shouldIncreaseDistance) {
      distanceMultiplier = 1.07 // 7% increase
    } else if (analysis.shouldReduceIntensity) {
      distanceMultiplier = 0.85 // 15% reduction for pain
    }

    // Update weekly distance goal if needed
    if (analysis.shouldIncreaseDistance) {
      const settings = await prisma.userSettings.findFirst()
      if (settings) {
        await prisma.userSettings.update({
          where: { id: settings.id },
          data: {
            currentWeeklyDistanceGoal: Math.round(settings.currentWeeklyDistanceGoal * 1.07),
          },
        })
      }
    }

    // Calculate week start (next Monday)
    const today = new Date()
    const dayOfWeek = today.getDay()
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() + daysUntilMonday)
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)

    // Delete existing plan for this week if any
    const existingPlan = await prisma.weeklyPlan.findFirst({
      where: {
        weekStart: { gte: weekStart },
        weekEnd: { lte: weekEnd },
      },
    })
    if (existingPlan) {
      await prisma.plannedWorkout.deleteMany({ where: { weeklyPlanId: existingPlan.id } })
      await prisma.weeklyPlan.delete({ where: { id: existingPlan.id } })
    }

    // Create weekly plan
    const weeklyPlan = await prisma.weeklyPlan.create({
      data: {
        weekStart,
        weekEnd,
        generated: true,
      },
    })

    // Generate 7-day schedule
    // Default schedule: MON=SWIM, TUE=BAND, WED=SWIM, THU=BAND, FRI=SWIM, SAT=BAND, SUN=REST
    const daySchedule: Array<{ workoutType: WorkoutType; swimIndex?: number }> = [
      { workoutType: 'SWIM', swimIndex: 0 }, // Monday
      { workoutType: 'BAND' },               // Tuesday
      { workoutType: 'SWIM', swimIndex: 1 }, // Wednesday
      { workoutType: 'BAND' },               // Thursday
      { workoutType: 'SWIM', swimIndex: 2 }, // Friday
      { workoutType: 'BAND' },               // Saturday
      { workoutType: 'REST' },               // Sunday
    ]

    let swimTypeIndex = analysis.lastSessionType
      ? SESSION_ROTATION.indexOf(analysis.lastSessionType)
      : 0

    let swimCount = 0

    for (let i = 0; i < 7; i++) {
      const schedule = daySchedule[i]
      const workoutDate = new Date(weekStart)
      workoutDate.setDate(weekStart.getDate() + i)
      workoutDate.setHours(8, 0, 0, 0)

      if (schedule.workoutType === 'SWIM') {
        const sessionType = SESSION_ROTATION[(swimTypeIndex + swimCount + 1) % SESSION_ROTATION.length]
        swimCount++
        const rawTemplate = SESSION_TEMPLATES[sessionType]
        const template = adjustTemplateForConditions(rawTemplate, analysis, distanceMultiplier)

        await prisma.plannedWorkout.create({
          data: {
            weeklyPlanId: weeklyPlan.id,
            date: workoutDate,
            workoutType: 'SWIM',
            title: template.title,
            description: template.description,
            targetDistance: template.targetDistance,
            targetDuration: template.targetDuration,
            intensity: template.intensity,
            focus: template.focus,
            status: 'PENDING',
          },
        })
      } else if (schedule.workoutType === 'BAND') {
        const bandIntensity: Intensity = analysis.shouldReduceIntensity ? 'LOW' : 'MEDIUM'
        await prisma.plannedWorkout.create({
          data: {
            weeklyPlanId: weeklyPlan.id,
            date: workoutDate,
            workoutType: 'BAND',
            title: 'Ejercicios con Banda Elástica',
            description: analysis.shouldReduceIntensity
              ? 'Sesión suave de fortalecimiento y movilidad. Enfoque en rotadores y estabilizadores escapulares con carga reducida.'
              : 'Fortalecimiento de hombro: rotadores, trapecio, romboides. 3 series por ejercicio. Incluir calentamiento y estiramientos.',
            targetDistance: null,
            targetDuration: 30,
            intensity: bandIntensity,
            focus: analysis.shouldReduceIntensity ? 'Movilidad y recuperación' : 'Fortalecimiento y estabilidad',
            status: 'PENDING',
          },
        })
      } else {
        await prisma.plannedWorkout.create({
          data: {
            weeklyPlanId: weeklyPlan.id,
            date: workoutDate,
            workoutType: 'REST',
            title: 'Descanso Activo',
            description: 'Paseo de 30 minutos. Estiramientos suaves. Hidratación y nutrición adecuadas.',
            targetDistance: null,
            targetDuration: 30,
            intensity: 'LOW',
            focus: 'Recuperación y bienestar',
            status: 'PENDING',
          },
        })
      }
    }

    return { success: true, planId: weeklyPlan.id }
  } catch (error) {
    console.error('Error generating plan:', error)
    return { success: false, message: String(error) }
  }
}

export async function getWeekAnalysis(): Promise<AnalysisResult> {
  return analyzeRecentSessions()
}
