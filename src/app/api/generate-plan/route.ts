import { NextRequest, NextResponse } from 'next/server'
import { generateWeeklyPlan, getWeekAnalysis } from '@/lib/workout-generator'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const result = await generateWeeklyPlan()

    if (!result.success) {
      return NextResponse.json(
        { error: result.message || 'Failed to generate plan' },
        { status: 500 }
      )
    }

    return NextResponse.json({ planId: result.planId, message: 'Plan generated successfully' })
  } catch (error) {
    console.error('POST /api/generate-plan error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const analysis = await getWeekAnalysis()
    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('GET /api/generate-plan error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
