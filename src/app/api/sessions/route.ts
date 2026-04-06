import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const days = parseInt(searchParams.get('days') || '30')

    const since = new Date()
    since.setDate(since.getDate() - days)

    const sessions = await prisma.swimSession.findMany({
      where: {
        date: { gte: since },
      },
      orderBy: { date: 'desc' },
      take: limit,
    })

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error('GET /api/sessions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      date,
      distanceMeters,
      durationMinutes,
      sessionType,
      effort1to5,
      shoulderPainBefore0to10 = 0,
      shoulderPainAfter0to10 = 0,
      fatigue1to5 = 3,
      notes,
    } = body

    // Validation
    if (!date || !distanceMeters || !durationMinutes || !sessionType || !effort1to5) {
      return NextResponse.json(
        { error: 'Missing required fields: date, distanceMeters, durationMinutes, sessionType, effort1to5' },
        { status: 400 }
      )
    }

    if (effort1to5 < 1 || effort1to5 > 5) {
      return NextResponse.json({ error: 'effort1to5 must be between 1 and 5' }, { status: 400 })
    }

    if (shoulderPainBefore0to10 < 0 || shoulderPainBefore0to10 > 10 ||
        shoulderPainAfter0to10 < 0 || shoulderPainAfter0to10 > 10) {
      return NextResponse.json({ error: 'Shoulder pain must be between 0 and 10' }, { status: 400 })
    }

    const validTypes = ['TECHNIQUE', 'AEROBIC_BASE', 'INTERVALS', 'RECOVERY', 'CONTROLLED_PACE']
    if (!validTypes.includes(sessionType)) {
      return NextResponse.json({ error: 'Invalid session type' }, { status: 400 })
    }

    const session = await prisma.swimSession.create({
      data: {
        date: new Date(date),
        distanceMeters: parseInt(distanceMeters),
        durationMinutes: parseInt(durationMinutes),
        sessionType,
        effort1to5: parseInt(effort1to5),
        shoulderPainBefore0to10: parseInt(shoulderPainBefore0to10),
        shoulderPainAfter0to10: parseInt(shoulderPainAfter0to10),
        fatigue1to5: parseInt(fatigue1to5),
        notes: notes || null,
        completed: true,
      },
    })

    return NextResponse.json({ session }, { status: 201 })
  } catch (error) {
    console.error('POST /api/sessions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
