import { useEffect, useState } from 'react'

type Props = {
  initialTitle?: string
  initialContent?: string
  submitting?: boolean
  submitLabel: string
  onSubmit: (data: { title: string; content: string }) => void
  onCancel?: () => void
}

export default function HistoryForm({
  initialTitle = '',
  initialContent = '',
  submitting = false,
  submitLabel,
  onSubmit,
  onCancel,
}: Props) {
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)

  useEffect(() => {
    setTitle(initialTitle)
    setContent(initialContent)
  }, [initialTitle, initialContent])

  const canSubmit = title.trim().length > 0 && content.trim().length > 0 && !submitting

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!canSubmit) return
        onSubmit({ title: title.trim(), content: content.trim() })
      }}
      className="rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] p-4"
    >
      <div className="space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목"
          className="w-full px-4 py-3 text-base bg-white rounded-xl border border-[var(--theme-border)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
          disabled={submitting}
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용"
          className="w-full min-h-[140px] px-4 py-3 text-base bg-white rounded-xl border border-[var(--theme-border)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] resize-y"
          disabled={submitting}
        />
      </div>

      <div className="mt-4 flex gap-3">
        <button
          type="submit"
          disabled={!canSubmit}
          className="flex-1 px-6 py-2 text-white rounded-2xl font-medium min-h-[44px] transition-colors bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-deep)] disabled:opacity-60 disabled:pointer-events-none"
        >
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 px-6 py-2 rounded-2xl font-medium min-h-[44px] transition-colors bg-[var(--theme-surface)] text-[var(--theme-text)] hover:bg-[var(--nav-bar-bg)] disabled:opacity-60 disabled:pointer-events-none border border-[var(--theme-border)]"
          >
            취소
          </button>
        )}
      </div>
    </form>
  )
}

