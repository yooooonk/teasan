import type { Metadata } from 'next'
import TargetsClient from './client'

export const metadata: Metadata = {
  title: '목표금액 입력 | 투자 대시보드',
  description: '자산군별 목표금액 입력 및 관리',
}

export default function TargetsPage() {
  return <TargetsClient />
}

