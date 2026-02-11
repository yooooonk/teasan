import { NextRequest, NextResponse } from 'next/server'
import { readJsonFile } from '@/lib/jsonStorage'
import { MetadataStore } from '@/types/metadata'
import { SnapshotStore } from '@/types/snapshot'
import { AssetTrend, TrendQuery } from '@/types/analytics'

const METADATA_FILE = 'metadata.json'
const SNAPSHOT_FILE = 'snapshots.json'

// GET: 자산 변화 추이 조회
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query: TrendQuery = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      accountName: searchParams.get('accountName') || undefined,
      stockId: searchParams.get('stockId') || undefined,
    }

    const [metadataStore, snapshotStore] = await Promise.all([
      readJsonFile<MetadataStore>(METADATA_FILE),
      readJsonFile<SnapshotStore>(SNAPSHOT_FILE),
    ])

    // 메타데이터 맵 생성
    const metadataMap = new Map(
      metadataStore.stocks.map((stock) => [stock.id, stock])
    )

    // 필터링된 스냅샷 가져오기
    let snapshots = [...snapshotStore.snapshots]

    // 날짜 필터링
    if (query.startDate) {
      snapshots = snapshots.filter((s) => s.date >= query.startDate!)
    }
    if (query.endDate) {
      snapshots = snapshots.filter((s) => s.date <= query.endDate!)
    }

    // 날짜순 정렬
    snapshots.sort((a, b) => a.date.localeCompare(b.date))

    // 트렌드 데이터 생성
    const trends: AssetTrend[] = snapshots.map((snapshot) => {
      let totalValue = 0
      let totalPurchaseAmount = 0
      let totalGainLoss = 0
      const byAccount: Record<string, number> = {}
      const byStock: Record<string, number> = {}

      for (const item of snapshot.items) {
        const metadata = metadataMap.get(item.metadataId)
        if (!metadata) continue

        // 필터링 적용
        if (query.accountName && metadata.accountName !== query.accountName) {
          continue
        }
        if (query.stockId && item.metadataId !== query.stockId) {
          continue
        }

        totalValue += item.valuationAmount
        totalPurchaseAmount += item.purchaseAmount
        totalGainLoss += item.gainLoss

        // 계좌별 집계
        const accountKey = metadata.accountName
        byAccount[accountKey] = (byAccount[accountKey] || 0) + item.valuationAmount

        // 종목별 집계
        byStock[item.metadataId] = (byStock[item.metadataId] || 0) + item.valuationAmount
      }

      const trend: AssetTrend = {
        date: snapshot.date,
        totalValue,
        totalPurchaseAmount,
        totalGainLoss,
      }

      // 필터가 없을 때만 상세 집계 포함
      if (!query.accountName && !query.stockId) {
        if (Object.keys(byAccount).length > 0) {
          trend.byAccount = byAccount
        }
        if (Object.keys(byStock).length > 0) {
          trend.byStock = byStock
        }
      }

      return trend
    })

    return NextResponse.json({ ok: true, data: trends })
  } catch (error) {
    console.error('Error calculating trends:', error)
    return NextResponse.json(
      { ok: false, error: '자산 변화 추이를 계산하는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

