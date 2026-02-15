'use client'

import { formatNumber } from '@/lib/calculations'
import type { Stock } from '@/types/stock'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

export type MiniChartPoint = {
  date: string
  value: number
  actualValue: number
}

type Props = {
  stock: Stock
  value: number
  isPositive: boolean
  miniChartData: MiniChartPoint[]
  chartColor: string
  bgColor: string
  onClick: () => void
}

export function StockTrendCard({
  stock,
  value,
  isPositive,
  miniChartData,
  chartColor,
  bgColor,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-shrink-0 w-48 rounded-xl shadow-sm p-4 text-left hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
      style={{ backgroundColor: bgColor }}
    >
      <div className="mb-2">
        <div className="text-sm font-medium text-gray-900 mb-1">
          {stock.stockName}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-900">
            {formatNumber(value)}
          </span>
          <span className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '▲' : '▼'}
          </span>
        </div>
      </div>
      <div
        className="h-12"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={miniChartData}>
            <Tooltip
              labelFormatter={(_label: string, payload: { payload?: { date?: string } }[]) => {
                const date = payload?.[0]?.payload?.date
                return date ?? ''
              }}
              formatter={(
                _value: number | undefined,
                _name: string | undefined,
                item: { payload?: { actualValue?: number } }
              ) => [formatNumber(item?.payload?.actualValue ?? 0), '평가금액']}
              contentStyle={{ fontSize: 12 }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={chartColor}
              fill={chartColor}
              fillOpacity={0.4}
              strokeWidth={1.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </button>
  )
}
