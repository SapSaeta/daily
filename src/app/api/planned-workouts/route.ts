import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const weekStart = searchParams.get('weekStart')
    const today = searchParams.get('today')

    let whereClause: Record<string, unknown> = {}

    if (today === 'true') {
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const todayEnd = new Date()
      todayEnd.setHours(23, 59, 59, 999)
      whereClause = { date: { gte: todayStart, lte: todayEnd } }
    } else if (weekStart) {
      const start = new Date(weekStart)
      const end = new Date(weekStart)
      end.setDate(end.getDate() + 6)
      end.setHours(23, 59, 59, 999)
      whereClause = { date: { gte: start, lte: end } }
    }

    const workouts = await prisma.plannedWorkout.findMany({
      where: whereClause,
      orderBy: { date: 'asc' },
      include: { weeklyPlan: true },
    })

    return NextResponse.json({ workouts })
  } catch (error) {
    console.error('GET /api/planned-workouts error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 })
    }

    const validStatuses = ['PENDING', 'COMPLETED', 'SKIPPED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const workout = await prisma.plannedWorkout.update({
      where: { id: parseInt(id) },
      data: { status },
    })

    return NextResponse.json({ workout })
  } catch (error) {
    console.error('PATCH /api/planned-workouts error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
