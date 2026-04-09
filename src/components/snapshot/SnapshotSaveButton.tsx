interface SnapshotSaveButtonProps {
  onClick: () => void
  saving?: boolean
}

export default function SnapshotSaveButton({ onClick, saving = false }: SnapshotSaveButtonProps) {
  return (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={() => {
          if (saving) return
          onClick()
        }}
        disabled={saving}
        className="px-8 py-3 text-white rounded-2xl font-medium min-h-[44px] transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-deep)] active:bg-[var(--theme-primary-deep)]"
      >
        {saving ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            저장 중…
          </>
        ) : (
          '저장'
        )}
      </button>
    </div>
  )
}

