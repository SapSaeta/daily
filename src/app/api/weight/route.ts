import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get('days') || '90')
  const limit = parseInt(searchParams.get('limit') || '100')

  const since = new Date()
  since.setDate(since.getDate() - days)

  const entries = await prisma.weightEntry.findMany({
    where: { date: { gte: since } },
    orderBy: { date: 'desc' },
    take: limit,
  })

  return NextResponse.json({ entries })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, weightKg, notes } = body

    if (!date || weightKg == null) {
      return NextResponse.json({ error: 'Fecha y peso son obligatorios.' }, { status: 400 })
    }

    const weight = parseFloat(weightKg)
    if (isNaN(weight) || weight < 20 || weight > 300) {
      return NextResponse.json({ error: 'Peso fuera de rango (20–300 kg).' }, { status: 400 })
    }

    const entry = await prisma.weightEntry.create({
      data: {
        date: new Date(date),
        weightKg: weight,
        notes: notes || null,
      },
    })

    return NextResponse.json({ entry }, { status: 201 })
  } catch (error) {
    console.error('Error saving weight entry:', error)
    return NextResponse.json({ error: 'Error al guardar el peso.' }, { status: 500 })
  }
}
