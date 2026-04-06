import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const weekOf = searchParams.get('weekOf') || new Date().toISOString()

    const targetDate = new Date(weekOf)

    // Find the Monday of the given week
    const dayOfWeek = targetDate.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(targetDate)
    monday.setDate(targetDate.getDate() + diff)
    monday.setHours(0, 0, 0, 0)

    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)

    const plan = await prisma.weeklyPlan.findFirst({
      where: {
        weekStart: { gte: monday },
        weekEnd: { lte: sunday },
      },
      include: {
        workouts: {
          orderBy: { date: 'asc' },
        },
      },
    })

    return NextResponse.json({ plan })
  } catch (error) {
    console.error('GET /api/weekly-plan error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
