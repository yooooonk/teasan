'use client'

import { formatNumber, formatReturnRate } from '@/lib/calculations'
import { StockSummary } from '@/types/analytics'
import { AssetGroup } from '@/types/stock'
import { useState } from 'react'

interface StockTableProps {
  stocks: StockSummary[]
}

const assetGroups: AssetGroup[] = ['연금', '금', '해외주식', '국내주식']

export default function StockTable({ stocks }: StockTableProps) {
  const [filterAssetGroup, setFilterAssetGroup] = useState<AssetGroup | ''>('')

  const filteredStocks = stocks.filter((item) => {
    if (!filterAssetGroup) return true
    return item.stock.assetGroup === filterAssetGroup
  })

  const sortedStocks = [...filteredStocks].sort(
    (a, b) => b.totalValue - a.totalValue
  )

  if (stocks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        데이터가 없습니다.
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-base sm:text-lg font-semibold">
          종목별 상세
        </h2>
        <select
          value={filterAssetGroup}
          onChange={(e) =>
            setFilterAssetGroup((e.target.value as AssetGroup) || '')
          }
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">전체</option>
          {assetGroups.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto overflow-y-auto max-h-[400px]">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                종목명
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                매입금액
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                평가금액
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                평가손익
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                수익률
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedStocks.map((item) => (
              <tr
                key={item.stock.id}
                className="hover:bg-gray-50"
              >
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.stock.stockName}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatNumber(item.totalPurchaseAmount)}
                </td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatNumber(item.totalValue)}
                </td>
                <td
                  className={`px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium ${item.totalGainLoss >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                    }`}
                >
                  {item.totalGainLoss >= 0 ? '+' : ''}
                  {formatNumber(item.totalGainLoss)}
                </td>
                <td
                  className={`px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium ${item.returnRate >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                    }`}
                >
                  {formatReturnRate(item.returnRate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

