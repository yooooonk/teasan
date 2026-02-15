interface SnapshotDateInputProps {
  date: string
  onChange: (date: string) => void
}

export default function SnapshotDateInput({ date, onChange }: SnapshotDateInputProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2">
        날짜 *
      </label>
      <input
        type="date"
        value={date}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}

