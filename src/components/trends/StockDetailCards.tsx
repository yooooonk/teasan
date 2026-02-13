'use client'

import {
  calculateReturnRate,
  formatNumber,
  formatReturnRate,
} from '@/lib/calculations'
import type { SnapshotItem } from '@/types/snapshot'

type Props = {
  item: SnapshotItem
}

export function StockDetailCards({ item }: Props) {
  const returnRate = calculateReturnRate(item.gainLoss, item.purchaseAmount)

  return (
    <div className="space-y-3 sm:space-y-4 mb-6">
      <div className="bg-gray-50 dark:bg-gray-700/50 p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-gray-600">
        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">
          평가금액
        </div>
        <div className="text-center text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
          {formatNumber(item.valuationAmount)} 원
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-gray-600">
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">
            평가손익
          </div>
          <div
            className={`text-center text-lg sm:text-2xl font-bold ${item.gainLoss >= 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
              }`}
          >
            {item.gainLoss >= 0 ? '+' : ''}
            {formatNumber(item.gainLoss)} 원
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-gray-600">
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">
            수익률
          </div>
          <div
            className={`text-center text-lg sm:text-2xl font-bold ${returnRate >= 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
              }`}
          >
            {formatReturnRate(returnRate)}
          </div>
        </div>
      </div>
    </div>
  )
}
