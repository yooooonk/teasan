import type { Metadata } from 'next'
import SnapshotClient from './client'

export const metadata: Metadata = {
  title: '스냅샷 입력 | 투자 대시보드',
  description: '자산 스냅샷 입력 및 관리',
}

export default function SnapshotPage() {
  return <SnapshotClient />
}
