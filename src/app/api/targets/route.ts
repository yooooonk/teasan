import { NextRequest, NextResponse } from 'next/server'
import { getTargets, setTargets } from '@/lib/db'
import { TargetStore } from '@/types/target'

// GET: 목표 조회
export async function GET() {
  try {
    const store = await getTargets()
    return NextResponse.json({ ok: true, data: store })
  } catch (error) {
    console.error('Error reading targets:', error)
    return NextResponse.json(
      { ok: false, error: '목표를 읽는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// POST: 목표 저장 (배치)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const store: TargetStore = {
      연금: 0,
      금: 0,
      해외주식: 0,
      국내주식: 0,
      ...body,
    }

    await setTargets(store)

    return NextResponse.json({
      ok: true,
      data: store,
    })
  } catch (error) {
    console.error('Error saving targets:', error)
    return NextResponse.json(
      { ok: false, error: '목표를 저장하는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
