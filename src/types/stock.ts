/**
 * 자산군 타입
 */
export type AssetGroup = '연금' | '금' | '해외주식' | '국내주식'

/**
 * 계좌종류 타입
 */
export type AccountType = '연금저축계좌' | '퇴직연금IRP' | '금현물' | '일반' | 'ISA'

/**
 * 종목 정보
 */
export interface Stock {
  id: string
  stockCode: string           // 종목코드
  assetGroup: AssetGroup        // 자산군
  accountType: AccountType      // 계좌종류
  stockName: string            // 종목명
  createdAt: string
  updatedAt: string
}

/**
 * 종목 저장소 구조
 */
export interface StockStore {
  stocks: Stock[]
}

/**
 * 종목 생성 요청
 */
export interface CreateStockRequest {
  stockCode: string
  assetGroup: AssetGroup
  accountType: AccountType
  stockName: string
}

/**
 * 종목 수정 요청
 */
export interface UpdateStockRequest {
  id: string
  stockCode?: string
  assetGroup?: AssetGroup
  accountType?: AccountType
  stockName?: string
}

