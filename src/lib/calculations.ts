import { SnapshotItem } from '@/types/snapshot'

/**
 * 매입금액 계산
 * 매입금액 = 평균단가 × 수량 × 환율
 */
export function calculatePurchaseAmount(
  averagePrice: number,
  quantity: number,
  exchangeRate: number = 1
): number {
  return averagePrice * quantity * exchangeRate
}

/**
 * 평가금액 계산
 * 평가금액 = 현재가 × 수량 × 환율
 */
export function calculateValuationAmount(
  currentPrice: number,
  quantity: number,
  exchangeRate: number = 1
): number {
  return currentPrice * quantity * exchangeRate
}

/**
 * 평가손익 계산
 * 평가손익 = 평가금액 - 매입금액
 */
export function calculateGainLoss(
  valuationAmount: number,
  purchaseAmount: number
): number {
  return valuationAmount - purchaseAmount
}

/**
 * 수익률 계산
 * 수익률 = (평가손익 / 매입금액) × 100
 */
export function calculateReturnRate(
  gainLoss: number,
  purchaseAmount: number
): number {
  if (purchaseAmount === 0) return 0
  return (gainLoss / purchaseAmount) * 100
}

/**
 * 스냅샷 아이템의 모든 값 계산
 */
export function calculateSnapshotItem(
  currentPrice: number,
  averagePrice: number,
  quantity: number,
  exchangeRate: number = 1
): Omit<SnapshotItem, 'metadataId'> {
  const purchaseAmount = calculatePurchaseAmount(averagePrice, quantity, exchangeRate)
  const valuationAmount = calculateValuationAmount(currentPrice, quantity, exchangeRate)
  const gainLoss = calculateGainLoss(valuationAmount, purchaseAmount)
  
  return {
    currentPrice,
    averagePrice,
    quantity,
    exchangeRate,
    purchaseAmount,
    valuationAmount,
    gainLoss,
  }
}

/**
 * 숫자 포맷팅 (천 단위 구분)
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('ko-KR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * 통화 포맷팅
 */
export function formatCurrency(value: number, currency: string = 'KRW'): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: currency,
  }).format(value)
}

/**
 * 수익률 포맷팅 (%)
 */
export function formatReturnRate(rate: number, decimals: number = 2): string {
  const sign = rate >= 0 ? '+' : ''
  return `${sign}${rate.toFixed(decimals)}%`
}

