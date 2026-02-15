'use client'

import { formatNumberInCheonManwon, formatNumberInManwon } from '@/lib/calculations'
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

interface TotalTargetChartProps {
  totalTarget: number
  totalPurchaseAmount: number
  totalGainLoss: number
}

export default function TotalTargetChart({
  totalTarget,
  totalPurchaseAmount,
  totalGainLoss,
}: TotalTargetChartProps) {
  const data = [
    {
      name: '총계',
      목표: totalTarget,
      매입금액: totalPurchaseAmount,
      평가손익: totalGainLoss,
    },
  ]

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(value) => formatNumberInCheonManwon(value)} />
        <Tooltip formatter={(value: number | undefined) => `${formatNumberInManwon(value ?? 0)}만원`} />
        <Legend />
        <Bar dataKey="매입금액" stackId="current" fill="#BDE0FE" />
        <Bar dataKey="평가손익" stackId="current" fill="#A2D2FF" />
        <Bar dataKey="목표" fill="#CDB4DB" />
      </BarChart>
    </ResponsiveContainer>
  )
}

