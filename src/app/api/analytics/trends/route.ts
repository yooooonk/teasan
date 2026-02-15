import { NextRequest, NextResponse } from 'next/server'
import { getStocks, getSnapshots } from '@/lib/db'
import { AssetTrend, TrendQuery } from '@/types/analytics'

// GET: 자산 변화 추이 조회
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query: TrendQuery = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      accountType: searchParams.get('accountType') || undefined,
      stockId: searchParams.get('stockId') || undefined,
    }

    const [stocks, snapshots] = await Promise.all([
      getStocks(),
      getSnapshots({
        startDate: query.startDate,
        endDate: query.endDate,
      }),
    ])

    const stockMap = new Map(stocks.map((stock) => [stock.id, stock]))

    const toDateStr = (d: string | Date) =>
      typeof d === 'string' ? d : new Date(d).toISOString().slice(0, 10)
    const sortedSnapshots = [...snapshots].sort((a, b) =>
      toDateStr(a.date).localeCompare(toDateStr(b.date))
    )

    const trends: AssetTrend[] = sortedSnapshots.map((snapshot) => {
      let totalValue = 0
      let totalPurchaseAmount = 0
      let totalGainLoss = 0
      const byAccount: Record<string, number> = {}
      const byStock: Record<string, number> = {}

      for (const item of snapshot.items) {
        const stock = stockMap.get(item.stockId)
        if (!stock) continue

        if (query.accountType && stock.accountType !== query.accountType) {
          continue
        }
        if (query.stockId && item.stockId !== query.stockId) {
          continue
        }

        totalValue += item.valuationAmount
        totalPurchaseAmount += item.purchaseAmount
        totalGainLoss += item.gainLoss

        const accountKey = stock.accountType
        byAccount[accountKey] = (byAccount[accountKey] || 0) + item.valuationAmount
        byStock[item.stockId] = (byStock[item.stockId] || 0) + item.valuationAmount
      }

      const trend: AssetTrend = {
        date: toDateStr(snapshot.date),
        totalValue,
        totalPurchaseAmount,
        totalGainLoss,
      }

      if (!query.accountType && !query.stockId) {
        if (Object.keys(byAccount).length > 0) trend.byAccount = byAccount
        if (Object.keys(byStock).length > 0) trend.byStock = byStock
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
