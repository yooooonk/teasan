'use client'

import { calculateSnapshotItem, formatNumber } from '@/lib/calculations'
import { SnapshotItemForm } from '@/types/snapshot'
import { AssetGroup } from '@/types/stock'

// 자산군별 색상 팔레트 (StockCard와 동일)
const assetGroupColors: Record<AssetGroup, { bg: string; border: string; text: string }> = {
    '연금': {
        bg: '#CDB4DB',
        border: '#BDE0FE',
        text: '#2B2D42',
    },
    '금': {
        bg: '#FFC8DD',
        border: '#FFAFCC',
        text: '#2B2D42',
    },
    '해외주식': {
        bg: '#BDE0FE',
        border: '#A2D2FF',
        text: '#2B2D42',
    },
    '국내주식': {
        bg: '#A2D2FF',
        border: '#BDE0FE',
        text: '#2B2D42',
    },
}

interface SnapshotStockCardProps {
    item: SnapshotItemForm
    onChange: (item: SnapshotItemForm) => void
}

export default function SnapshotStockCard({ item, onChange }: SnapshotStockCardProps) {
    const colors = assetGroupColors[item.assetGroup]
    const isOverseas = item.assetGroup === '해외주식'
    const isGold = item.assetGroup === '금'

    const handleFieldChange = (field: 'currentPrice' | 'averagePrice' | 'quantity' | 'exchangeRate' | 'purchaseAmount', value: number) => {
        const updatedItem = {
            ...item,
            [field]: value,
        }

        // 환율이 해외주식이 아닌 경우 자동으로 1로 설정
        if (!isOverseas) {
            updatedItem.exchangeRate = 1
        }

        // 계산 수행
        if (isGold) {
            // 금인 경우: 매입금액 직접 입력, 평가금액 = 현재가 × 수량
            if (updatedItem.currentPrice && updatedItem.quantity && updatedItem.purchaseAmount) {
                const valuationAmount = updatedItem.currentPrice * updatedItem.quantity
                const gainLoss = valuationAmount - updatedItem.purchaseAmount
                updatedItem.valuationAmount = valuationAmount
                updatedItem.gainLoss = gainLoss
            }
        } else {
            // 금이 아닌 경우: 기존 계산 로직
            if (updatedItem.currentPrice && updatedItem.averagePrice && updatedItem.quantity && updatedItem.exchangeRate) {
                const calculated = calculateSnapshotItem(
                    updatedItem.currentPrice,
                    updatedItem.averagePrice,
                    updatedItem.quantity,
                    updatedItem.exchangeRate
                )
                Object.assign(updatedItem, calculated)
            }
        }

        onChange(updatedItem)
    }

    return (
        <div
            className="rounded-lg p-4 hover:shadow-md transition-shadow"
            style={{
                backgroundColor: colors.bg,
                ['--card-text' as any]: colors.text,
            }}
        >
            {/* 종목 정보 헤더 */}
            <div className="mb-4 pb-4 border-b border-white/30">
                <div
                    className="font-semibold text-base text-[color:var(--card-text)]"
                >
                    {item.stockName}
                </div>
                <div
                    className="text-xs mt-0.5 opacity-70 text-[color:var(--card-text)]"
                >
                    {item.accountType}
                </div>
            </div>

            {/* 입력 필드 */}
            <div className="grid grid-cols-2 gap-3 mb-4 pt-2">
                <div>
                    <label className="block text-xs font-medium mb-1.5 text-[color:var(--card-text)] opacity-80">
                        현재가
                    </label>
                    <input
                        type="number"
                        value={item.currentPrice || ''}
                        onChange={(e) => handleFieldChange('currentPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-2.5 text-sm bg-white/90 backdrop-blur-sm border border-white/50 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/80 transition-all duration-200 placeholder:text-gray-400 text-[color:var(--card-text)]"
                        step="0.01"
                        placeholder="0"
                    />
                </div>
                {isGold ? (
                    <div>
                        <label className="block text-xs font-medium mb-1.5 text-[color:var(--card-text)] opacity-80">
                            매입금액
                        </label>
                        <input
                            type="number"
                            value={item.purchaseAmount || ''}
                            onChange={(e) => handleFieldChange('purchaseAmount', parseFloat(e.target.value) || 0)}
                            className="w-full px-4 py-2.5 text-sm bg-white/90 backdrop-blur-sm border border-white/50 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/80 transition-all duration-200 placeholder:text-gray-400 text-[color:var(--card-text)]"
                            step="0.01"
                            placeholder="0"
                        />
                    </div>
                ) : (
                    <div>
                        <label className="block text-xs font-medium mb-1.5 text-[color:var(--card-text)] opacity-80">
                            평균단가
                        </label>
                        <input
                            type="number"
                            value={item.averagePrice || ''}
                            onChange={(e) => handleFieldChange('averagePrice', parseFloat(e.target.value) || 0)}
                            className="w-full px-4 py-2.5 text-sm bg-white/90 backdrop-blur-sm border border-white/50 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/80 transition-all duration-200 placeholder:text-gray-400 text-[color:var(--card-text)]"
                            step="0.01"
                            placeholder="0"
                        />
                    </div>
                )}
                <div>
                    <label className="block text-xs font-medium mb-1.5 text-[color:var(--card-text)] opacity-80">
                        보유수량
                    </label>
                    <input
                        type="number"
                        value={item.quantity || ''}
                        onChange={(e) => handleFieldChange('quantity', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-2.5 text-sm bg-white/90 backdrop-blur-sm border border-white/50 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/80 transition-all duration-200 placeholder:text-gray-400 text-[color:var(--card-text)]"
                        step="0.01"
                        placeholder="0"
                    />
                </div>
                {isOverseas && (
                    <div>
                        <label className="block text-xs font-medium mb-1.5 text-[color:var(--card-text)] opacity-80">
                            환율
                        </label>
                        <input
                            type="number"
                            value={item.exchangeRate || ''}
                            onChange={(e) => handleFieldChange('exchangeRate', parseFloat(e.target.value) || 1)}
                            className="w-full px-4 py-2.5 text-sm bg-white/90 backdrop-blur-sm border border-white/50 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/80 transition-all duration-200 placeholder:text-gray-400 text-[color:var(--card-text)]"
                            step="0.01"
                            placeholder="1"
                        />
                    </div>
                )}
            </div>

            {/* 계산 결과 표시 */}
            {(item.purchaseAmount !== undefined || item.valuationAmount !== undefined || item.gainLoss !== undefined) && (
                <div className="pt-3 border-t border-gray-200 grid grid-cols-3 gap-2 text-xs">
                    <div>
                        <div className="text-[color:var(--card-text)] opacity-70 mb-1">매입금액</div>
                        <div className="text-[color:var(--card-text)] font-medium">
                            {item.purchaseAmount ? formatNumber(item.purchaseAmount) : '-'}
                        </div>
                    </div>
                    <div>
                        <div className="text-[color:var(--card-text)] opacity-70 mb-1">평가금액</div>
                        <div className="text-[color:var(--card-text)] font-medium">
                            {item.valuationAmount ? formatNumber(item.valuationAmount) : '-'}
                        </div>
                    </div>
                    <div>
                        <div className="text-[color:var(--card-text)] opacity-70 mb-1">평가손익</div>
                        <div
                            className={`font-medium ${item.gainLoss !== undefined && item.gainLoss >= 0
                                ? 'text-green-600'
                                : 'text-red-600'
                                }`}
                        >
                            {item.gainLoss !== undefined
                                ? `${item.gainLoss >= 0 ? '+' : ''}${formatNumber(item.gainLoss)}`
                                : '-'}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

