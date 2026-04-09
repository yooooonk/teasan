import type { Metadata } from 'next'
import HistoryClient from './client'

export const metadata: Metadata = {
  title: '투자 복기',
  description: '간단한 매매일지 기록',
}

export default function HistoryPage() {
  return <HistoryClient />
}

