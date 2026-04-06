import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(8, 0, 0, 0)
  return d
}

async function main() {
  console.log('Seeding database...')

  // Clear existing data
  await prisma.plannedWorkout.deleteMany()
  await prisma.weeklyPlan.deleteMany()
  await prisma.swimSession.deleteMany()
  await prisma.bandSession.deleteMany()
  await prisma.exercise.deleteMany()
  await prisma.userSettings.deleteMany()

  // User settings
  await prisma.userSettings.create({
    data: {
      notificationsEnabled: false,
      preferredSwimDays: 'MON,WED,FRI',
      preferredBandDays: 'TUE,THU,SAT',
      maxShoulderPainThreshold: 5,
      currentWeeklyDistanceGoal: 4000,
      updatedAt: new Date(),
    },
  })

  // Swim sessions - past 3 weeks
  const swimSessions = [
    // Week 3 ago
    { daysBack: 21, dist: 1500, dur: 50, type: 'TECHNIQUE', effort: 2, painBefore: 2, painAfter: 2, fatigue: 2, notes: 'Buena sesión de técnica, crol suave', completed: true },
    { daysBack: 19, dist: 2000, dur: 60, type: 'AEROBIC_BASE', effort: 3, painBefore: 1, painAfter: 2, fatigue: 3, notes: 'Ritmo constante, respiración controlada', completed: true },
    { daysBack: 17, dist: 1800, dur: 55, type: 'INTERVALS', effort: 4, painBefore: 2, painAfter: 4, fatigue: 4, notes: 'Series de 100m, algo de molestia al final', completed: true },
    // Week 2 ago
    { daysBack: 14, dist: 1200, dur: 45, type: 'RECOVERY', effort: 2, painBefore: 3, painAfter: 2, fatigue: 2, notes: 'Recuperación activa, hombro mejor', completed: true },
    { daysBack: 12, dist: 2000, dur: 60, type: 'AEROBIC_BASE', effort: 3, painBefore: 1, painAfter: 2, fatigue: 3, notes: 'Excelente sesión aeróbica', completed: true },
    { daysBack: 10, dist: 2000, dur: 55, type: 'CONTROLLED_PACE', effort: 3, painBefore: 2, painAfter: 2, fatigue: 3, notes: 'Ritmo controlado, bien', completed: true },
    { daysBack: 8, dist: 1500, dur: 50, type: 'TECHNIQUE', effort: 2, painBefore: 1, painAfter: 1, fatigue: 2, notes: 'Trabajo de técnica, sin dolor', completed: true },
    // Last week
    { daysBack: 7, dist: 2000, dur: 60, type: 'AEROBIC_BASE', effort: 3, painBefore: 2, painAfter: 2, fatigue: 3, notes: 'Buen fondo aeróbico', completed: true },
    { daysBack: 5, dist: 1800, dur: 55, type: 'INTERVALS', effort: 4, painBefore: 2, painAfter: 3, fatigue: 4, notes: 'Series cortas, buena velocidad', completed: true },
    { daysBack: 3, dist: 2000, dur: 58, type: 'CONTROLLED_PACE', effort: 3, painBefore: 1, painAfter: 2, fatigue: 3, notes: 'Muy buena sesión de pace', completed: true },
    { daysBack: 1, dist: 1500, dur: 50, type: 'TECHNIQUE', effort: 2, painBefore: 2, painAfter: 2, fatigue: 2, notes: 'Técnica crol, brazo derecho mejorando', completed: true },
  ]

  for (const s of swimSessions) {
    await prisma.swimSession.create({
      data: {
        date: daysAgo(s.daysBack),
        distanceMeters: s.dist,
        durationMinutes: s.dur,
        sessionType: s.type,
        effort1to5: s.effort,
        shoulderPainBefore0to10: s.painBefore,
        shoulderPainAfter0to10: s.painAfter,
        fatigue1to5: s.fatigue,
        notes: s.notes,
        completed: s.completed,
      },
    })
  }

  // Band sessions
  const bandSessions = [
    { daysBack: 20, dur: 30, effort: 2, pain: 2, notes: 'Rotadores y trapecio, suave', completed: true },
    { daysBack: 18, dur: 30, effort: 2, pain: 1, notes: 'Ejercicios de movilidad', completed: true },
    { daysBack: 16, dur: 30, effort: 3, pain: 3, notes: 'Algo de tensión al final', completed: true },
    { daysBack: 13, dur: 30, effort: 2, pain: 2, notes: 'Fortalecimiento escapular', completed: true },
    { daysBack: 11, dur: 30, effort: 2, pain: 1, notes: 'Excelente sesión, sin dolor', completed: true },
    { daysBack: 9, dur: 30, effort: 3, pain: 2, notes: 'Progresión en series', completed: true },
    { daysBack: 6, dur: 30, effort: 2, pain: 2, notes: 'Rotadores y deltoides', completed: true },
    { daysBack: 4, dur: 30, effort: 2, pain: 1, notes: 'Bien, movilidad mejorada', completed: true },
    { daysBack: 2, dur: 30, effort: 3, pain: 2, notes: 'Series pesadas con banda fuerte', completed: true },
  ]

  for (const b of bandSessions) {
    await prisma.bandSession.create({
      data: {
        date: daysAgo(b.daysBack),
        durationMinutes: b.dur,
        effort1to5: b.effort,
        shoulderPain0to10: b.pain,
        notes: b.notes,
        completed: b.completed,
      },
    })
  }

  // Exercise library
  const exercises = [
    // Warm up
    {
      name: 'Círculos de hombro',
      category: 'WARM_UP',
      description: 'De pie, brazos a los lados. Realizar círculos lentos hacia adelante y hacia atrás con ambos hombros simultáneamente.',
      sets: 2,
      reps: '10 cada dirección',
      duration: null,
      notes: 'Movimiento suave y controlado. Rango completo sin dolor.',
    },
    {
      name: 'Calentamiento con banda',
      category: 'WARM_UP',
      description: 'Con banda de resistencia ligera, realizar rotaciones externas e internas suaves para activar el manguito rotador.',
      sets: 2,
      reps: '15 cada lado',
      duration: null,
      notes: 'Codo pegado al cuerpo. Banda de poca resistencia.',
    },
    {
      name: 'Péndulos de Codman',
      category: 'WARM_UP',
      description: 'Inclinado hacia adelante, brazo colgando. Realizar movimientos pendulares suaves en círculos, adelante-atrás y lateral.',
      sets: 1,
      reps: null,
      duration: '2 minutos',
      notes: 'Sin fuerza muscular activa. Dejar que la gravedad mueva el brazo.',
    },
    // Strengthening
    {
      name: 'Rotación externa con banda',
      category: 'STRENGTHENING',
      description: 'De pie o sentado, codo en 90° pegado al costado. Tirar de la banda hacia afuera sin mover el codo.',
      sets: 3,
      reps: '12-15',
      duration: null,
      notes: 'Fundamental para síndrome subacromial. Progresión: banda más resistente cuando puedas hacer 15 sin esfuerzo.',
    },
    {
      name: 'Rotación interna con banda',
      category: 'STRENGTHENING',
      description: 'Codo en 90° pegado al costado. Tirar de la banda hacia el abdomen de forma controlada.',
      sets: 3,
      reps: '12-15',
      duration: null,
      notes: 'Equilibrar siempre con rotación externa. Ratio recomendado 2:3 (interna:externa).',
    },
    {
      name: 'Retracción escapular con banda',
      category: 'STRENGTHENING',
      description: 'Banda fijada al frente, brazos extendidos. Tirar hacia atrás juntando los omóplatos.',
      sets: 3,
      reps: '15',
      duration: null,
      notes: 'Mantener 2 segundos en posición contraída. Clave para estabilidad escapular.',
    },
    {
      name: 'Elevación lateral con banda (arco reducido)',
      category: 'STRENGTHENING',
      description: 'Banda bajo el pie, elevar el brazo lateralmente solo hasta 60-70°. No superar la horizontal.',
      sets: 3,
      reps: '12',
      duration: null,
      notes: 'En síndrome subacromial, el arco doloroso es 70-120°. Mantenerse bajo esos ángulos.',
    },
    {
      name: 'Remo con banda',
      category: 'STRENGTHENING',
      description: 'Banda fijada al frente a altura de cintura. Codos en 90°, tirar hacia atrás con codos separados.',
      sets: 3,
      reps: '15',
      duration: null,
      notes: 'Fortifica trapecio medio e inferior. Esencial para postura natación.',
    },
    {
      name: 'Press diagonal hacia arriba con banda',
      category: 'STRENGTHENING',
      description: 'Banda bajo el pie opuesto, empujar en diagonal hacia arriba imitando el movimiento de natación.',
      sets: 3,
      reps: '12 cada lado',
      duration: null,
      notes: 'Simula el patrón motor de natación. Progresión avanzada.',
    },
    // Stretching
    {
      name: 'Estiramiento cruzado de hombro',
      category: 'STRETCHING',
      description: 'Llevar el brazo extendido hacia el pecho con la ayuda del otro brazo. Mantener.',
      sets: 2,
      reps: null,
      duration: '30 segundos cada lado',
      notes: 'Estira cápsula posterior. Sensación de tracción, no dolor.',
    },
    {
      name: 'Estiramiento del pectoral en marco de puerta',
      category: 'STRETCHING',
      description: 'Apoyar el antebrazo en el marco de la puerta, girar el cuerpo hacia afuera suavemente.',
      sets: 2,
      reps: null,
      duration: '30 segundos cada lado',
      notes: 'Fundamental tras nadar crol. Contrarresta la tensión pectoral.',
    },
    {
      name: 'Estiramiento subescapular',
      category: 'STRETCHING',
      description: 'Llevar la mano a la espalda baja, empujar suavemente el codo hacia adelante con la otra mano.',
      sets: 2,
      reps: null,
      duration: '20 segundos cada lado',
      notes: 'Precaución: no forzar si hay dolor agudo.',
    },
    // Mobility
    {
      name: 'Apertura torácica con foam roller',
      category: 'MOBILITY',
      description: 'Foam roller perpendicular a la columna a nivel torácico. Extender hacia atrás con brazos detrás de la cabeza.',
      sets: 1,
      reps: null,
      duration: '2 minutos moviéndose suavemente',
      notes: 'Mejora la movilidad torácica, reduce carga en el hombro.',
    },
    {
      name: 'Rotación torácica en cuadrupedia',
      category: 'MOBILITY',
      description: 'En cuadrupedia, una mano detrás de la cabeza. Rotar el codo hacia el techo manteniendo la cadera quieta.',
      sets: 2,
      reps: '10 cada lado',
      duration: null,
      notes: 'La movilidad torácica compensa la limitación del hombro.',
    },
    {
      name: 'Movilidad glenohumeral: rotación interna-externa',
      category: 'MOBILITY',
      description: 'Tumbado boca arriba, codo en 90° apoyado. Llevar la mano al suelo hacia adelante y hacia atrás alternando.',
      sets: 2,
      reps: '10 cada dirección',
      duration: null,
      notes: 'Mantener el codo pegado al suelo. Movimiento lento y controlado.',
    },
  ]

  for (const ex of exercises) {
    await prisma.exercise.create({ data: ex })
  }

  console.log('Database seeded successfully!')
  console.log(`Created:`)
  console.log(`  - ${swimSessions.length} swim sessions`)
  console.log(`  - ${bandSessions.length} band sessions`)
  console.log(`  - ${exercises.length} exercises`)
  console.log(`  - 1 user settings record`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
