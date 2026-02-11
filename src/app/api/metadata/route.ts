import { NextRequest, NextResponse } from 'next/server'
import { readJsonFile, writeJsonFile } from '@/lib/jsonStorage'
import {
  MetadataStore,
  StockMetadata,
  CreateMetadataRequest,
  UpdateMetadataRequest,
} from '@/types/metadata'

const METADATA_FILE = 'metadata.json'

// GET: 전체 메타데이터 조회
export async function GET() {
  try {
    const store = await readJsonFile<MetadataStore>(METADATA_FILE)
    return NextResponse.json({ ok: true, data: store.stocks })
  } catch (error) {
    console.error('Error reading metadata:', error)
    return NextResponse.json(
      { ok: false, error: '메타데이터를 읽는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// POST: 새 메타데이터 추가
export async function POST(req: NextRequest) {
  try {
    const body: CreateMetadataRequest = await req.json()
    
    // 유효성 검사
    if (!body.name || !body.code || !body.assetType || !body.currency || !body.accountName) {
      return NextResponse.json(
        { ok: false, error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      )
    }

    const store = await readJsonFile<MetadataStore>(METADATA_FILE)
    
    // ID 생성
    const id = `stock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()
    
    const newStock: StockMetadata = {
      id,
      name: body.name,
      code: body.code,
      assetType: body.assetType,
      currency: body.currency,
      accountName: body.accountName,
      createdAt: now,
      updatedAt: now,
    }
    
    store.stocks.push(newStock)
    await writeJsonFile(METADATA_FILE, store)
    
    return NextResponse.json({ ok: true, data: newStock })
  } catch (error) {
    console.error('Error creating metadata:', error)
    return NextResponse.json(
      { ok: false, error: '메타데이터를 생성하는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// PUT: 메타데이터 수정
export async function PUT(req: NextRequest) {
  try {
    const body: UpdateMetadataRequest = await req.json()
    
    if (!body.id) {
      return NextResponse.json(
        { ok: false, error: 'ID가 필요합니다.' },
        { status: 400 }
      )
    }

    const store = await readJsonFile<MetadataStore>(METADATA_FILE)
    const index = store.stocks.findIndex((stock) => stock.id === body.id)
    
    if (index === -1) {
      return NextResponse.json(
        { ok: false, error: '메타데이터를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 업데이트
    store.stocks[index] = {
      ...store.stocks[index],
      ...(body.name && { name: body.name }),
      ...(body.code && { code: body.code }),
      ...(body.assetType && { assetType: body.assetType }),
      ...(body.currency && { currency: body.currency }),
      ...(body.accountName && { accountName: body.accountName }),
      updatedAt: new Date().toISOString(),
    }
    
    await writeJsonFile(METADATA_FILE, store)
    
    return NextResponse.json({ ok: true, data: store.stocks[index] })
  } catch (error) {
    console.error('Error updating metadata:', error)
    return NextResponse.json(
      { ok: false, error: '메타데이터를 수정하는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE: 메타데이터 삭제
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

    const store = await readJsonFile<MetadataStore>(METADATA_FILE)
    const index = store.stocks.findIndex((stock) => stock.id === id)
    
    if (index === -1) {
      return NextResponse.json(
        { ok: false, error: '메타데이터를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    store.stocks.splice(index, 1)
    await writeJsonFile(METADATA_FILE, store)
    
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting metadata:', error)
    return NextResponse.json(
      { ok: false, error: '메타데이터를 삭제하는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

