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

    const sessions = await prisma.bandSession.findMany({
      where: {
        date: { gte: since },
      },
      orderBy: { date: 'desc' },
      take: limit,
    })

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error('GET /api/band-sessions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      date,
      durationMinutes,
      effort1to5,
      shoulderPain0to10 = 0,
      notes,
    } = body

    // Validation
    if (!date || !durationMinutes || !effort1to5) {
      return NextResponse.json(
        { error: 'Missing required fields: date, durationMinutes, effort1to5' },
        { status: 400 }
      )
    }

    if (effort1to5 < 1 || effort1to5 > 5) {
      return NextResponse.json({ error: 'effort1to5 must be between 1 and 5' }, { status: 400 })
    }

    if (shoulderPain0to10 < 0 || shoulderPain0to10 > 10) {
      return NextResponse.json({ error: 'Shoulder pain must be between 0 and 10' }, { status: 400 })
    }

    const session = await prisma.bandSession.create({
      data: {
        date: new Date(date),
        durationMinutes: parseInt(durationMinutes),
        effort1to5: parseInt(effort1to5),
        shoulderPain0to10: parseInt(shoulderPain0to10),
        notes: notes || null,
        completed: true,
      },
    })

    return NextResponse.json({ session }, { status: 201 })
  } catch (error) {
    console.error('POST /api/band-sessions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
