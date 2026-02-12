import { NextRequest, NextResponse } from 'next/server'
import { readJsonFile, writeJsonFile } from '@/lib/jsonStorage'
import { TargetStore } from '@/types/target'
import { AssetGroup } from '@/types/stock'

const TARGET_FILE = 'targets.json'

// GET: 목표 조회
export async function GET() {
  try {
    const store = await readJsonFile<TargetStore>(TARGET_FILE).catch(() => ({
      연금: 0,
      금: 0,
      해외주식: 0,
      국내주식: 0,
    }))
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

    // Record 형태로 저장
    const store: TargetStore = {
      연금: 0,
      금: 0,
      해외주식: 0,
      국내주식: 0,
      ...body,
    }

    await writeJsonFile(TARGET_FILE, store)

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

