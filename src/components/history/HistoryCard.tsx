import type { HistoryEntry } from '@/types/history'
import { useEffect, useMemo, useRef, useState } from 'react'
import { HiPencil, HiTrash } from 'react-icons/hi'

type Props = {
  entry: HistoryEntry
  onEdit: (entry: HistoryEntry) => void
  onDelete: (id: string) => void
  deleting?: boolean
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function HistoryCard({ entry, onEdit, onDelete, deleting = false }: Props) {
  const contentRef = useRef<HTMLDivElement | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [canExpand, setCanExpand] = useState(false)

  const collapsedStyle = useMemo<React.CSSProperties>(
    () => ({
      display: '-webkit-box',
      WebkitLineClamp: 3,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    }),
    []
  )

  useEffect(() => {
    const el = contentRef.current
    if (!el) return

    // next tick for accurate layout
    const id = window.requestAnimationFrame(() => {
      const isOverflowing = el.scrollHeight > el.clientHeight + 1
      setCanExpand(isOverflowing)
      if (!isOverflowing) {
        setExpanded(false)
      }
    })

    return () => window.cancelAnimationFrame(id)
  }, [entry.content])

  return (
    <div className="rounded-2xl bg-white border border-[var(--theme-border)] p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 flex flex-col gap-1">
          <div className="font-semibold text-[var(--theme-text)] truncate">
            {entry.title}
          </div>
          <div className="text-xs text-[var(--theme-text-muted)]">
            {formatDateTime(entry.createdAt)}
          </div>
        </div>
        <div className="flex gap-2 shrink-0 justify-end">
          <button
            type="button"
            onClick={() => onEdit(entry)}
            className="w-5 h-5 min-h-0 min-w-0 p-0 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors inline-flex items-center justify-center text-sm"
            aria-label="수정"
          >
            <HiPencil />
          </button>
          <button
            type="button"
            onClick={() => onDelete(entry.id)}
            disabled={deleting}
            className="w-5 h-5 min-h-0 min-w-0 p-0 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors inline-flex items-center justify-center text-sm disabled:opacity-60 disabled:pointer-events-none"
            aria-label="삭제"
          >
            <HiTrash />
          </button>
        </div>
      </div>

      <div
        ref={contentRef}
        className="mt-3 text-sm text-[var(--theme-text)] whitespace-pre-wrap break-words"
        style={expanded ? undefined : collapsedStyle}
      >
        {entry.content}
      </div>

      {canExpand && (
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-xs font-medium text-[var(--theme-primary-deep)] hover:text-[var(--theme-primary)] transition-colors min-h-0 min-w-0"
          >
            {expanded ? '접기' : '펼쳐보기'}
          </button>
        </div>
      )}
    </div>
  )
}

