'use client'

import { formatNumber } from '@/lib/calculations'
import { ASSET_GROUP_CHART_COLORS } from '@/lib/assetGroupColors'
import { AssetTypeSummary } from '@/types/analytics'
import { AssetGroup } from '@/types/stock'
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

interface AssetPieChartProps {
  data: AssetTypeSummary[]
}

export default function AssetPieChart({ data }: AssetPieChartProps) {
  const chartData = data.map((item) => ({
    name: item.assetType,
    value: item.totalValue,
    fill:
      ASSET_GROUP_CHART_COLORS[item.assetType as AssetGroup]?.primary ||
      'var(--theme-primary)',
  }))

  if (chartData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        데이터가 없습니다.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="var(--theme-primary)"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number | undefined) => formatNumber(value ?? 0)} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

