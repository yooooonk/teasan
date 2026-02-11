import { Stock } from './stock'
import { SnapshotItem } from './snapshot'

/**
 * 현재 자산 현황
 */
export interface CurrentAssetStatus {
  totalValue: number              // 총 평가금액
  totalPurchaseAmount: number      // 총 매입금액
  totalGainLoss: number            // 총 평가손익
  totalReturnRate: number          // 총 수익률 (%)
  byAssetType: AssetTypeSummary[]  // 자산 종류별 요약
  byAccount: AccountSummary[]     // 계좌별 요약
  byStock: StockSummary[]          // 종목별 요약
}

/**
 * 자산 종류별 요약
 */
export interface AssetTypeSummary {
  assetType: string
  totalValue: number
  totalPurchaseAmount: number
  totalGainLoss: number
  returnRate: number
  targetAmount?: number            // 목표 금액 (선택사항)
}

/**
 * 계좌별 요약
 */
export interface AccountSummary {
  accountType: string
  totalValue: number
  totalPurchaseAmount: number
  totalGainLoss: number
  returnRate: number
}

/**
 * 종목별 요약
 */
export interface StockSummary {
  stock: Stock
  totalValue: number
  totalPurchaseAmount: number
  totalGainLoss: number
  returnRate: number
  quantity: number
}

/**
 * 자산 변화 추이 데이터
 */
export interface AssetTrend {
  date: string
  totalValue: number
  totalPurchaseAmount: number
  totalGainLoss: number
  byAccount?: Record<string, number>  // 계좌별 평가금액
  byStock?: Record<string, number>    // 종목별 평가금액
}

/**
 * 변화 추이 조회 쿼리
 */
export interface TrendQuery {
  startDate?: string
  endDate?: string
  accountType?: string
  stockId?: string
}

