import { Stock } from './stock'

/**
 * 스냅샷 아이템
 */
export interface SnapshotItem {
  stockId: string          // 종목 참조
  currentPrice: number       // 현재가
  averagePrice: number       // 평균단가
  quantity: number           // 수량
  exchangeRate: number       // 환율 (해당 통화의 경우)
  purchaseAmount: number     // 매입금액
  valuationAmount: number    // 평가금액
  gainLoss: number          // 평가손익
}

/**
 * 스냅샷 입력 폼 아이템 (Stock을 extends)
 */
export interface SnapshotItemForm extends Stock {
  currentPrice: number       // 현재가
  averagePrice: number       // 평균단가 (금이 아닌 경우)
  quantity: number           // 수량
  exchangeRate: number       // 환율 (해외주식일 때만 입력, 그 외는 1)
  purchaseAmount?: number     // 매입금액 (금인 경우 직접 입력, 그 외는 계산값)
  valuationAmount?: number    // 평가금액 (계산값)
  gainLoss?: number          // 평가손익 (계산값)
}

/**
 * 스냅샷
 */
export interface Snapshot {
  id: string
  date: string              // YYYY-MM-DD
  items: SnapshotItem[]
  createdAt: string
}

/**
 * 스냅샷 저장소 구조
 */
export interface SnapshotStore {
  snapshots: Snapshot[]
}

/**
 * 스냅샷 생성 요청
 */
export interface CreateSnapshotRequest {
  date: string
  items: Omit<SnapshotItem, 'purchaseAmount' | 'valuationAmount' | 'gainLoss'>[]
}

/**
 * 스냅샷 수정 요청
 */
export interface UpdateSnapshotRequest {
  id: string
  date?: string
  items?: Omit<SnapshotItem, 'purchaseAmount' | 'valuationAmount' | 'gainLoss'>[]
}

/**
 * 스냅샷 조회 쿼리
 */
export interface SnapshotQuery {
  date?: string
  startDate?: string
  endDate?: string
}

