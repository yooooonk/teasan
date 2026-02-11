/**
 * 스냅샷 아이템
 */
export interface SnapshotItem {
  metadataId: string        // 메타데이터 참조
  currentPrice: number       // 현재가
  averagePrice: number       // 평균단가
  quantity: number           // 수량
  exchangeRate: number       // 환율 (해당 통화의 경우)
  purchaseAmount: number     // 매입금액
  valuationAmount: number    // 평가금액
  gainLoss: number          // 평가손익
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

