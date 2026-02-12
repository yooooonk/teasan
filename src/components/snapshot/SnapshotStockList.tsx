import { SnapshotItemForm } from '@/types/snapshot'
import SnapshotStockCard from './SnapshotStockCard'

interface SnapshotStockListProps {
    items: SnapshotItemForm[]
    onItemChange: (index: number, updatedItem: SnapshotItemForm) => void
}

export default function SnapshotStockList({ items, onItemChange }: SnapshotStockListProps) {
    return (
        <div className="mb-6 bg-white/80 dark:bg-gray-800 rounded-xl shadow-sm p-6 backdrop-blur-sm">
            {items.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    종목이 없습니다.
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map((item, index) => (
                        <SnapshotStockCard
                            key={item.id}
                            item={item}
                            onChange={(updatedItem) => onItemChange(index, updatedItem)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

