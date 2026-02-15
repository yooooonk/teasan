import { NextRequest, NextResponse } from 'next/server'
import { getStocks, createStock, updateStock, deleteStock } from '@/lib/db'
import {
  CreateStockRequest,
  UpdateStockRequest,
} from '@/types/stock'

// GET: 전체 종목 조회
export async function GET() {
  try {
    const stocks = await getStocks()
    return NextResponse.json({ ok: true, data: stocks })
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

    if (!body.assetGroup || !body.accountType || !body.stockName || !body.stockCode) {
      return NextResponse.json(
        { ok: false, error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      )
    }

    const newStock = await createStock(body)
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

    const updated = await updateStock(body.id, {
      stockCode: body.stockCode,
      assetGroup: body.assetGroup,
      accountType: body.accountType,
      stockName: body.stockName,
    })

    if (!updated) {
      return NextResponse.json(
        { ok: false, error: '종목을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ ok: true, data: updated })
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

    const deleted = await deleteStock(id)
    if (!deleted) {
      return NextResponse.json(
        { ok: false, error: '종목을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting stock:', error)
    return NextResponse.json(
      { ok: false, error: '종목을 삭제하는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
