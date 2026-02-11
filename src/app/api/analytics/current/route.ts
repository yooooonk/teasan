import { NextResponse } from 'next/server'
import { readJsonFile } from '@/lib/jsonStorage'
import { StockStore } from '@/types/stock'
import { SnapshotStore } from '@/types/snapshot'
import { CurrentAssetStatus, AssetTypeSummary, AccountSummary, StockSummary } from '@/types/analytics'
import { calculateReturnRate } from '@/lib/calculations'

const STOCK_FILE = 'stock.json'
const SNAPSHOT_FILE = 'snapshots.json'

// GET: 현재 자산 현황 조회
export async function GET() {
  try {
    const [stockStore, snapshotStore] = await Promise.all([
      readJsonFile<StockStore>(STOCK_FILE),
      readJsonFile<SnapshotStore>(SNAPSHOT_FILE),
    ])

    // 최신 스냅샷 찾기
    if (snapshotStore.snapshots.length === 0) {
      return NextResponse.json({
        ok: true,
        data: {
          totalValue: 0,
          totalPurchaseAmount: 0,
          totalGainLoss: 0,
          totalReturnRate: 0,
          byAssetType: [],
          byAccount: [],
          byStock: [],
        } as CurrentAssetStatus,
      })
    }

    // 날짜순 정렬 후 최신 스냅샷
    const latestSnapshot = [...snapshotStore.snapshots].sort(
      (a, b) => b.date.localeCompare(a.date)
    )[0]

    // 종목 맵 생성
    const stockMap = new Map(
      stockStore.stocks.map((stock) => [stock.id, stock])
    )

    // 총합 계산
    let totalValue = 0
    let totalPurchaseAmount = 0
    let totalGainLoss = 0

    // 자산 종류별 집계
    const assetTypeMap = new Map<string, { purchase: number; value: number; gainLoss: number }>()
    
    // 계좌별 집계
    const accountMap = new Map<string, { purchase: number; value: number; gainLoss: number }>()
    
    // 종목별 집계
    const stockSummaryMap = new Map<string, { purchase: number; value: number; gainLoss: number; quantity: number; stock: any }>()

    for (const item of latestSnapshot.items) {
      const stock = stockMap.get(item.stockId)
      if (!stock) continue

      totalValue += item.valuationAmount
      totalPurchaseAmount += item.purchaseAmount
      totalGainLoss += item.gainLoss

      // 자산 종류별
      const assetTypeKey = stock.assetGroup
      const assetTypeData = assetTypeMap.get(assetTypeKey) || { purchase: 0, value: 0, gainLoss: 0 }
      assetTypeData.purchase += item.purchaseAmount
      assetTypeData.value += item.valuationAmount
      assetTypeData.gainLoss += item.gainLoss
      assetTypeMap.set(assetTypeKey, assetTypeData)

      // 계좌별
      const accountKey = stock.accountType
      const accountData = accountMap.get(accountKey) || { purchase: 0, value: 0, gainLoss: 0 }
      accountData.purchase += item.purchaseAmount
      accountData.value += item.valuationAmount
      accountData.gainLoss += item.gainLoss
      accountMap.set(accountKey, accountData)

      // 종목별
      const stockSummaryData = stockSummaryMap.get(item.stockId) || {
        purchase: 0,
        value: 0,
        gainLoss: 0,
        quantity: 0,
        stock,
      }
      stockSummaryData.purchase += item.purchaseAmount
      stockSummaryData.value += item.valuationAmount
      stockSummaryData.gainLoss += item.gainLoss
      stockSummaryData.quantity += item.quantity
      stockSummaryMap.set(item.stockId, stockSummaryData)
    }

    // 자산 종류별 요약
    const byAssetType: AssetTypeSummary[] = Array.from(assetTypeMap.entries()).map(
      ([assetType, data]) => ({
        assetType,
        totalValue: data.value,
        totalPurchaseAmount: data.purchase,
        totalGainLoss: data.gainLoss,
        returnRate: calculateReturnRate(data.gainLoss, data.purchase),
      })
    )

    // 계좌별 요약
    const byAccount: AccountSummary[] = Array.from(accountMap.entries()).map(
      ([accountName, data]) => ({
        accountName,
        totalValue: data.value,
        totalPurchaseAmount: data.purchase,
        totalGainLoss: data.gainLoss,
        returnRate: calculateReturnRate(data.gainLoss, data.purchase),
      })
    )

    // 종목별 요약
    const byStock: StockSummary[] = Array.from(stockSummaryMap.values()).map((data) => ({
      stock: data.stock,
      totalValue: data.value,
      totalPurchaseAmount: data.purchase,
      totalGainLoss: data.gainLoss,
      returnRate: calculateReturnRate(data.gainLoss, data.purchase),
      quantity: data.quantity,
    }))

    const result: CurrentAssetStatus = {
      totalValue,
      totalPurchaseAmount,
      totalGainLoss,
      totalReturnRate: calculateReturnRate(totalGainLoss, totalPurchaseAmount),
      byAssetType,
      byAccount,
      byStock,
    }

    return NextResponse.json({ ok: true, data: result })
  } catch (error) {
    console.error('Error calculating current status:', error)
    return NextResponse.json(
      { ok: false, error: '현재 자산 현황을 계산하는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

