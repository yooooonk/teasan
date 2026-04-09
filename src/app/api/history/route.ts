import { NextRequest, NextResponse } from 'next/server'
import {
  createHistoryEntry,
  deleteHistoryEntry,
  getHistoryEntries,
  updateHistoryEntry,
} from '@/lib/db'
import type { CreateHistoryRequest, UpdateHistoryRequest } from '@/types/history'

// GET: 매매일지 목록
export async function GET() {
  try {
    const entries = await getHistoryEntries()
    return NextResponse.json({ ok: true, data: entries })
  } catch (error) {
    console.error('Error reading history:', error)
    return NextResponse.json(
      { ok: false, error: '매매일지를 읽는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// POST: 매매일지 생성
export async function POST(req: NextRequest) {
  try {
    const body: CreateHistoryRequest = await req.json()
    if (!body.title?.trim() || !body.content?.trim()) {
      return NextResponse.json(
        { ok: false, error: '제목과 내용이 필요합니다.' },
        { status: 400 }
      )
    }

    const created = await createHistoryEntry({
      title: body.title.trim(),
      content: body.content.trim(),
    })
    return NextResponse.json({ ok: true, data: created })
  } catch (error) {
    console.error('Error creating history:', error)
    return NextResponse.json(
      { ok: false, error: '매매일지를 생성하는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// PUT: 매매일지 수정
export async function PUT(req: NextRequest) {
  try {
    const body: UpdateHistoryRequest = await req.json()
    if (!body.id) {
      return NextResponse.json({ ok: false, error: 'ID가 필요합니다.' }, { status: 400 })
    }
    const title = body.title?.trim()
    const content = body.content?.trim()
    if (title === '' || content === '') {
      return NextResponse.json(
        { ok: false, error: '제목/내용은 비어있을 수 없습니다.' },
        { status: 400 }
      )
    }

    const updated = await updateHistoryEntry(body.id, {
      title,
      content,
    })
    if (!updated) {
      return NextResponse.json({ ok: false, error: '매매일지를 찾을 수 없습니다.' }, { status: 404 })
    }
    return NextResponse.json({ ok: true, data: updated })
  } catch (error) {
    console.error('Error updating history:', error)
    return NextResponse.json(
      { ok: false, error: '매매일지를 수정하는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE: 매매일지 삭제
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ ok: false, error: 'ID가 필요합니다.' }, { status: 400 })
    }

    const deleted = await deleteHistoryEntry(id)
    if (!deleted) {
      return NextResponse.json({ ok: false, error: '매매일지를 찾을 수 없습니다.' }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting history:', error)
    return NextResponse.json(
      { ok: false, error: '매매일지를 삭제하는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

