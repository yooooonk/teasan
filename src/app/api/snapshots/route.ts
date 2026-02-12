import { NextRequest, NextResponse } from 'next/server'
import { readJsonFile, writeJsonFile } from '@/lib/jsonStorage'
import {
  SnapshotStore,
  Snapshot,
  CreateSnapshotRequest,
  UpdateSnapshotRequest,
  SnapshotQuery,
} from '@/types/snapshot'
import { StockStore } from '@/types/stock'
import { calculateSnapshotItem, calculateValuationAmount, calculateGainLoss } from '@/lib/calculations'

const SNAPSHOT_FILE = 'snapshots.json'
const STOCK_FILE = 'stock.json'

// GET: 스냅샷 조회 (날짜별 필터링)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query: SnapshotQuery = {
      date: searchParams.get('date') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    }

    const store = await readJsonFile<SnapshotStore>(SNAPSHOT_FILE)
    let snapshots = store.snapshots

    // 날짜 필터링
    if (query.date) {
      snapshots = snapshots.filter((s) => s.date === query.date)
    } else {
      if (query.startDate) {
        snapshots = snapshots.filter((s) => s.date >= query.startDate!)
      }
      if (query.endDate) {
        snapshots = snapshots.filter((s) => s.date <= query.endDate!)
      }
    }

    // 날짜순 정렬 (최신순)
    snapshots.sort((a, b) => b.date.localeCompare(a.date))

    return NextResponse.json({ ok: true, data: snapshots })
  } catch (error) {
    console.error('Error reading snapshots:', error)
    return NextResponse.json(
      { ok: false, error: '스냅샷을 읽는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// POST: 새 스냅샷 추가
export async function POST(req: NextRequest) {
  try {
    const body: CreateSnapshotRequest = await req.json()
    
    // 유효성 검사
    if (!body.date || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { ok: false, error: '날짜와 아이템이 필요합니다.' },
        { status: 400 }
      )
    }

    const store = await readJsonFile<SnapshotStore>(SNAPSHOT_FILE)
    
    // 동일한 날짜의 스냅샷이 있는지 확인
    const existingIndex = store.snapshots.findIndex((s) => s.date === body.date)
    
    // ID 생성
    const id = `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()
    
    // Stock 정보 가져오기
    const stockStore = await readJsonFile<StockStore>(STOCK_FILE)
    const stockMap = new Map(stockStore.stocks.map((stock) => [stock.id, stock]))
    
    // 아이템 계산 (매입금액, 평가금액, 평가손익)
    const items = body.items.map((item) => {
      const stock = stockMap.get(item.stockId)
      const isGold = stock?.assetGroup === '금'
      
      if (isGold) {
        // 금인 경우: 매입금액은 클라이언트에서 직접 입력받음 (averagePrice에 저장되어 있음)
        // 하지만 현재 구조상 averagePrice가 0으로 오므로, 별도로 처리 필요
        // 임시로 averagePrice를 매입금액으로 사용 (클라이언트에서 이미 처리)
        const purchaseAmount = item.averagePrice || 0 // 클라이언트에서 매입금액을 averagePrice에 넣어서 보냄
        const valuationAmount = calculateValuationAmount(item.currentPrice, item.quantity, item.exchangeRate)
        const gainLoss = calculateGainLoss(valuationAmount, purchaseAmount)
        
        return {
          ...item,
          purchaseAmount,
          valuationAmount,
          gainLoss,
        }
      } else {
        // 금이 아닌 경우: 기존 계산 로직
        const calculated = calculateSnapshotItem(
          item.currentPrice,
          item.averagePrice,
          item.quantity,
          item.exchangeRate
        )
        
        return {
          ...item,
          ...calculated,
        }
      }
    })
    
    const newSnapshot: Snapshot = {
      id,
      date: body.date,
      items,
      createdAt: now,
    }
    
    if (existingIndex !== -1) {
      // 기존 스냅샷 업데이트
      store.snapshots[existingIndex] = newSnapshot
    } else {
      // 새 스냅샷 추가
      store.snapshots.push(newSnapshot)
    }
    
    await writeJsonFile(SNAPSHOT_FILE, store)
    
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

    const store = await readJsonFile<SnapshotStore>(SNAPSHOT_FILE)
    const index = store.snapshots.findIndex((s) => s.id === body.id)
    
    if (index === -1) {
      return NextResponse.json(
        { ok: false, error: '스냅샷을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 아이템이 있으면 재계산
    let items = store.snapshots[index].items
    if (body.items) {
      // Stock 정보 가져오기
      const stockStore = await readJsonFile<StockStore>(STOCK_FILE)
      const stockMap = new Map(stockStore.stocks.map((stock) => [stock.id, stock]))
      
      items = body.items.map((item) => {
        const stock = stockMap.get(item.stockId)
        const isGold = stock?.assetGroup === '금'
        
        if (isGold) {
          // 금인 경우
          const purchaseAmount = item.averagePrice || 0
          const valuationAmount = calculateValuationAmount(item.currentPrice, item.quantity, item.exchangeRate)
          const gainLoss = calculateGainLoss(valuationAmount, purchaseAmount)
          
          return {
            ...item,
            purchaseAmount,
            valuationAmount,
            gainLoss,
          }
        } else {
          // 금이 아닌 경우
          const calculated = calculateSnapshotItem(
            item.currentPrice,
            item.averagePrice,
            item.quantity,
            item.exchangeRate
          )
          
          return {
            ...item,
            ...calculated,
          }
        }
      })
    }

    // 업데이트
    store.snapshots[index] = {
      ...store.snapshots[index],
      ...(body.date && { date: body.date }),
      ...(body.items && { items }),
    }
    
    await writeJsonFile(SNAPSHOT_FILE, store)
    
    return NextResponse.json({ ok: true, data: store.snapshots[index] })
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

    const store = await readJsonFile<SnapshotStore>(SNAPSHOT_FILE)
    const index = store.snapshots.findIndex((s) => s.id === id)
    
    if (index === -1) {
      return NextResponse.json(
        { ok: false, error: '스냅샷을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    store.snapshots.splice(index, 1)
    await writeJsonFile(SNAPSHOT_FILE, store)
    
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting snapshot:', error)
    return NextResponse.json(
      { ok: false, error: '스냅샷을 삭제하는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

