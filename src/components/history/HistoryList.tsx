import type { HistoryEntry } from '@/types/history'
import HistoryCard from './HistoryCard'

type Props = {
  entries: HistoryEntry[]
  deletingId?: string | null
  onEdit: (entry: HistoryEntry) => void
  onDelete: (id: string) => void
}

export default function HistoryList({ entries, deletingId, onEdit, onDelete }: Props) {
  return (
    <div className="space-y-3">
      {entries.map((e) => (
        <HistoryCard
          key={e.id}
          entry={e}
          deleting={deletingId === e.id}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

