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
        className="px-8 py-3 text-white rounded-2xl font-medium min-h-[44px] transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
        style={{
          backgroundColor: saving ? '#d1a0a6' : '#FBA2AB',
        }}
        onMouseEnter={(e) => {
          if (saving) return
          e.currentTarget.style.backgroundColor = '#FEA38E'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = saving ? '#d1a0a6' : '#FBA2AB'
        }}
        onMouseDown={(e) => {
          if (saving) return
          e.currentTarget.style.backgroundColor = '#F3B5A0'
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.backgroundColor = saving ? '#d1a0a6' : '#FBA2AB'
        }}
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

