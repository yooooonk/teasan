import { NextRequest, NextResponse } from 'next/server'
import {
  getSnapshots,
  createSnapshot,
  updateSnapshot,
  deleteSnapshot,
  getStocks,
} from '@/lib/db'
import {
  CreateSnapshotRequest,
  UpdateSnapshotRequest,
  SnapshotQuery,
} from '@/types/snapshot'
import { calculateSnapshotItem, calculateValuationAmount, calculateGainLoss } from '@/lib/calculations'
import type { SnapshotItem } from '@/types/snapshot'

// GET: 스냅샷 조회 (날짜별 필터링)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query: SnapshotQuery = {
      date: searchParams.get('date') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    }

    const snapshots = await getSnapshots(query)
    return NextResponse.json({ ok: true, data: snapshots })
  } catch (error) {
    console.error('Error reading snapshots:', error)
    return NextResponse.json(
      { ok: false, error: '스냅샷을 읽는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

function buildSnapshotItems(
  bodyItems: CreateSnapshotRequest['items'],
  stockMap: Map<string, { assetGroup: string }>
): SnapshotItem[] {
  return bodyItems.map((item) => {
    const stock = stockMap.get(item.stockId)
    const isGold = stock?.assetGroup === '금'

    if (isGold) {
      const purchaseAmount = item.averagePrice || 0
      const valuationAmount = calculateValuationAmount(item.currentPrice, item.quantity, item.exchangeRate)
      const gainLoss = calculateGainLoss(valuationAmount, purchaseAmount)
      return {
        ...item,
        purchaseAmount,
        valuationAmount,
        gainLoss,
      }
    }
    const calculated = calculateSnapshotItem(
      item.currentPrice,
      item.averagePrice,
      item.quantity,
      item.exchangeRate
    )
    return { ...item, ...calculated }
  })
}

// POST: 새 스냅샷 추가
export async function POST(req: NextRequest) {
  try {
    const body: CreateSnapshotRequest = await req.json()

    if (!body.date || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { ok: false, error: '날짜와 아이템이 필요합니다.' },
        { status: 400 }
      )
    }

    const [existingSnapshots, stocks] = await Promise.all([
      getSnapshots({ date: body.date }),
      getStocks(),
    ])
    const stockMap = new Map(stocks.map((s) => [s.id, { assetGroup: s.assetGroup }]))

    const id = `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()
    const items = buildSnapshotItems(body.items, stockMap)

    const snapshotPayload = { id, date: body.date, items, createdAt: now }

    if (existingSnapshots.length > 0) {
      const updated = await updateSnapshot(existingSnapshots[0].id, { date: body.date, items })
      return NextResponse.json({ ok: true, data: updated })
    }

    const newSnapshot = await createSnapshot(snapshotPayload)
    return NextResponse.json({ ok: true, data: newSnapshot })
  } catch (error) {
    console.error('Error creating snapshot:', error)
    return NextResponse.json(
      { ok: false, error: '스냅샷을 생성하는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// PUT: 스냅샷 수정
export async function PUT(req: NextRequest) {
  try {
    const body: UpdateSnapshotRequest = await req.json()

    if (!body.id) {
      return NextResponse.json(
        { ok: false, error: 'ID가 필요합니다.' },
        { status: 400 }
      )
    }

    const stocks = await getStocks()
    const stockMap = new Map(stocks.map((s) => [s.id, { assetGroup: s.assetGroup }]))

    const updateData: { date?: string; items?: SnapshotItem[] } = {}
    if (body.date) updateData.date = body.date
    if (body.items) {
      updateData.items = buildSnapshotItems(body.items, stockMap)
    }

    const updated = await updateSnapshot(body.id, updateData)
    if (!updated) {
      return NextResponse.json(
        { ok: false, error: '스냅샷을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ ok: true, data: updated })
  } catch (error) {
    console.error('Error updating snapshot:', error)
    return NextResponse.json(
      { ok: false, error: '스냅샷을 수정하는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE: 스냅샷 삭제
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { ok: false, error: 'ID가 필요합니다.' },
        { status: 400 }
      )
    }

    const deleted = await deleteSnapshot(id)
    if (!deleted) {
      return NextResponse.json(
        { ok: false, error: '스냅샷을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting snapshot:', error)
    return NextResponse.json(
      { ok: false, error: '스냅샷을 삭제하는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
