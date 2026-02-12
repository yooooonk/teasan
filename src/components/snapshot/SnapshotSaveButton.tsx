interface SnapshotSaveButtonProps {
  onClick: () => void
}

export default function SnapshotSaveButton({ onClick }: SnapshotSaveButtonProps) {
  return (
    <div className="flex justify-end">
      <button
        onClick={onClick}
        className="px-8 py-3 text-white rounded-2xl font-medium min-h-[44px] transition-colors"
        style={{
          backgroundColor: '#FBA2AB',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#FEA38E'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#FBA2AB'
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.backgroundColor = '#F3B5A0'
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.backgroundColor = '#FBA2AB'
        }}
      >
        저장
      </button>
    </div>
  )
}

