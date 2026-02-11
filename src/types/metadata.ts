/**
 * 종목 메타데이터
 */
export interface StockMetadata {
  id: string
  name: string              // 종목명
  code: string              // 종목코드
  assetType: string         // 자산구분 (주식, 채권, 현금 등)
  currency: string          // 통화구분 (KRW, USD 등)
  accountName: string       // 계좌명
  createdAt: string
  updatedAt: string
}

/**
 * 메타데이터 저장소 구조
 */
export interface MetadataStore {
  stocks: StockMetadata[]
}

/**
 * 메타데이터 생성 요청
 */
export interface CreateMetadataRequest {
  name: string
  code: string
  assetType: string
  currency: string
  accountName: string
}

/**
 * 메타데이터 수정 요청
 */
export interface UpdateMetadataRequest {
  id: string
  name?: string
  code?: string
  assetType?: string
  currency?: string
  accountName?: string
}

