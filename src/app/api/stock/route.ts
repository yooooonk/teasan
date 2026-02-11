import { NextRequest, NextResponse } from 'next/server'
import { readJsonFile, writeJsonFile } from '@/lib/jsonStorage'
import {
  StockStore,
  Stock,
  CreateStockRequest,
  UpdateStockRequest,
} from '@/types/stock'

const STOCK_FILE = 'stock.json'

// GET: 전체 종목 조회
export async function GET() {
  try {
    const store = await readJsonFile<StockStore>(STOCK_FILE)
    return NextResponse.json({ ok: true, data: store.stocks })
  } catch (error) {
    console.error('Error reading stocks:', error)
    return NextResponse.json(
      { ok: false, error: '종목을 읽는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// POST: 새 종목 추가
export async function POST(req: NextRequest) {
  try {
    const body: CreateStockRequest = await req.json()
    
    // 유효성 검사
    if (!body.assetGroup || !body.accountType || !body.stockName || !body.stockCode) {
      return NextResponse.json(
        { ok: false, error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      )
    }

    const store = await readJsonFile<StockStore>(STOCK_FILE)
    
    // ID 생성
    const id = `stock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()
    
    const newStock: Stock = {
      id,
      stockCode: body.stockCode,
      assetGroup: body.assetGroup,
      accountType: body.accountType,
      stockName: body.stockName,
      createdAt: now,
      updatedAt: now,
    }
    
    store.stocks.push(newStock)
    await writeJsonFile(STOCK_FILE, store)
    
    return NextResponse.json({ ok: true, data: newStock })
  } catch (error) {
    console.error('Error creating stock:', error)
    return NextResponse.json(
      { ok: false, error: '종목을 생성하는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// PUT: 종목 수정
export async function PUT(req: NextRequest) {
  try {
    const body: UpdateStockRequest = await req.json()
    
    if (!body.id) {
      return NextResponse.json(
        { ok: false, error: 'ID가 필요합니다.' },
        { status: 400 }
      )
    }

    const store = await readJsonFile<StockStore>(STOCK_FILE)
    const index = store.stocks.findIndex((stock) => stock.id === body.id)
    
    if (index === -1) {
      return NextResponse.json(
        { ok: false, error: '종목을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 업데이트
    store.stocks[index] = {
      ...store.stocks[index],
      ...(body.stockCode && { stockCode: body.stockCode }),
      ...(body.assetGroup && { assetGroup: body.assetGroup }),
      ...(body.accountType && { accountType: body.accountType }),
      ...(body.stockName && { stockName: body.stockName }),
      updatedAt: new Date().toISOString(),
    }
    
    await writeJsonFile(STOCK_FILE, store)
    
    return NextResponse.json({ ok: true, data: store.stocks[index] })
  } catch (error) {
    console.error('Error updating stock:', error)
    return NextResponse.json(
      { ok: false, error: '종목을 수정하는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE: 종목 삭제
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

    const store = await readJsonFile<StockStore>(STOCK_FILE)
    const index = store.stocks.findIndex((stock) => stock.id === id)
    
    if (index === -1) {
      return NextResponse.json(
        { ok: false, error: '종목을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    store.stocks.splice(index, 1)
    await writeJsonFile(STOCK_FILE, store)
    
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting stock:', error)
    return NextResponse.json(
      { ok: false, error: '종목을 삭제하는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

