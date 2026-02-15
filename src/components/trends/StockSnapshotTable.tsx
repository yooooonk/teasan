'use client'

import {
  calculateReturnRate,
  formatNumber,
  formatReturnRate,
} from '@/lib/calculations'
import { toLocalDateString } from '@/lib/date'
import type { Snapshot, SnapshotItem } from '@/types/snapshot'

export type SnapshotWithItem = {
  snapshot: Snapshot
  item: SnapshotItem
}

type Props = {
  items: SnapshotWithItem[]
  accentColor?: string
}

function toDateOnly(date: string | Date): string {
  if (typeof date === 'string' && !date.includes('T')) {
    return date
  }
  return toLocalDateString(date)
}

export function StockSnapshotTable({ items, accentColor = '#F7A8B7' }: Props) {
  const sorted = [...items].sort((a, b) =>
    toDateOnly(b.snapshot.date).localeCompare(toDateOnly(a.snapshot.date))
  )

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 overflow-hidden">
      <h2
        className="p-4 text-base sm:text-lg font-semibold"
        style={{ color: accentColor }}
      >
        최근 스냅샷
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                기준일
              </th>
              <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                평가금액
              </th>
              <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                평가손익
              </th>
              <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                수익률
              </th>
              <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                매입금액
              </th>
              <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                수량
              </th>
              <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                현재가
              </th>
              <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                평균단가
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sorted.map(({ snapshot, item }) => {
              const rowReturnRate = calculateReturnRate(
                item.gainLoss,
                item.purchaseAmount
              )
              return (
                <tr
                  key={snapshot.id}
                  className="hover:bg-gray-50"
                >
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {toDateOnly(snapshot.date)}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {formatNumber(item.valuationAmount)}
                  </td>
                  <td
                    className={`px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${item.gainLoss >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                      }`}
                  >
                    {item.gainLoss >= 0 ? '+' : ''}
                    {formatNumber(item.gainLoss)}
                  </td>
                  <td
                    className={`px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${rowReturnRate >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                      }`}
                  >
                    {formatReturnRate(rowReturnRate)}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {formatNumber(item.purchaseAmount)}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {formatNumber(item.quantity)}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {formatNumber(
                      item.currentPrice,
                      item.exchangeRate !== 1 ? 2 : 0
                    )}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {formatNumber(
                      item.averagePrice,
                      item.exchangeRate !== 1 ? 2 : 0
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
