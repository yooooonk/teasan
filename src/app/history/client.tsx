'use client'

import HistoryForm from '@/components/history/HistoryForm'
import HistoryList from '@/components/history/HistoryList'
import Spinner from '@/components/ui/Spinner'
import type { CreateHistoryRequest, HistoryEntry, UpdateHistoryRequest } from '@/types/history'
import { useEffect, useMemo, useState } from 'react'

type ApiOk<T> = { ok: true; data: T }
type ApiErr = { ok: false; error: string }

async function apiJson<T>(input: RequestInfo, init?: RequestInit): Promise<ApiOk<T> | ApiErr> {
  const res = await fetch(input, init)
  const data = (await res.json()) as ApiOk<T> | ApiErr
  if (!res.ok) {
    return { ok: false, error: (data as ApiErr).error ?? '요청에 실패했습니다.' }
  }
  return data
}

export default function HistoryClient() {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editing, setEditing] = useState<HistoryEntry | null>(null)

  const formTitle = useMemo(() => (editing ? '수정' : '기록하기'), [editing])

  async function load() {
    setLoading(true)
    const data = await apiJson<HistoryEntry[]>('/api/history', { cache: 'no-store' })
    if (data.ok) {
      setEntries(data.data)
    } else {
      alert(data.error)
    }
    setLoading(false)
  }

  async function handleSubmit(payload: { title: string; content: string }) {
    setSubmitting(true)
    try {
      if (editing) {
        const body: UpdateHistoryRequest = {
          id: editing.id,
          title: payload.title,
          content: payload.content,
        }
        const res = await apiJson<HistoryEntry>('/api/history', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          alert(res.error)
          return
        }
        setEditing(null)
        await load()
        return
      }

      const body: CreateHistoryRequest = payload
      const res = await apiJson<HistoryEntry>('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        alert(res.error)
        return
      }
      await load()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    const ok = confirm('삭제할까요?')
    if (!ok) return
    setDeletingId(id)
    try {
      const res = await apiJson<unknown>(`/api/history?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        alert(res.error)
        return
      }
      await load()
    } finally {
      setDeletingId(null)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--theme-text)]">투자복기</h1>
      </div>

      <HistoryForm
        initialTitle={editing?.title ?? ''}
        initialContent={editing?.content ?? ''}
        submitting={submitting}
        submitLabel={formTitle}
        onSubmit={handleSubmit}
        onCancel={editing ? () => setEditing(null) : undefined}
      />

      {entries.length === 0 ? (
        <div className="rounded-2xl bg-white border border-[var(--theme-border)] p-6 text-center text-[var(--theme-text-muted)]">
          아직 기록이 없습니다. 첫 매매일지를 남겨보세요.
        </div>
      ) : (
        <HistoryList
          entries={entries}
          deletingId={deletingId}
          onEdit={(e) => setEditing(e)}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}

