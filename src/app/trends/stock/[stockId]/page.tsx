import type { Metadata } from 'next'
import StockDetailClient from './client'

type Props = {
  params: Promise<{ stockId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { stockId } = await params
  return {
    title: `종목 상세 (${stockId}) | 투자 대시보드`,
    description: '종목별 평가금액·손익·스냅샷 추이',
  }
}

export default async function StockDetailPage({ params }: Props) {
  const { stockId } = await params
  return <StockDetailClient stockId={stockId} />
}
