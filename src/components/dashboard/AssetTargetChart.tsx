'use client'

import { formatNumberInCheonManwon, formatNumberInManwon } from '@/lib/calculations'
import { AssetTypeSummary } from '@/types/analytics'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface AssetTargetChartProps {
  data: AssetTypeSummary[]
}

export default function AssetTargetChart({ data }: AssetTargetChartProps) {
  const chartData = data.map((item) => ({
    name: item.assetType,
    목표: item.targetAmount || 0,
    매입금액: item.totalPurchaseAmount,
    평가손익: item.totalGainLoss,
  }))

  if (chartData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        데이터가 없습니다.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(value) => formatNumberInCheonManwon(value)} />
        <Tooltip formatter={(value: number) => `${formatNumberInManwon(value)}만원`} />
        <Legend />
        <Bar dataKey="매입금액" stackId="current" fill="#BDE0FE" />
        <Bar dataKey="평가손익" stackId="current" fill="#A2D2FF" />
        <Bar dataKey="목표" fill="#CDB4DB" />
      </BarChart>
    </ResponsiveContainer>
  )
}

