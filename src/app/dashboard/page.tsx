import type { Metadata } from 'next'
import DashboardClient from './client'

export const metadata: Metadata = {
  title: '대시보드 | 투자 대시보드',
  description: '자산 목표 현황 및 분석',
}

export default function DashboardPage() {
  return <DashboardClient />
}
