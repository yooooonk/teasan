'use client'

import { formatNumberInManwon } from '@/lib/calculations'
import { AssetTypeSummary } from '@/types/analytics'
import { AssetGroup } from '@/types/stock'

// 자산군별 색상 팔레트 (AssetPieChart와 동일)
const assetGroupColors: Record<AssetGroup, { primary: string; secondary: string }> = {
    연금: { primary: '#CDB4DB', secondary: '#B8A3C7' },
    금: { primary: '#FFC8DD', secondary: '#FFB3D1' },
    해외주식: { primary: '#BDE0FE', secondary: '#A2D2FF' },
    국내주식: { primary: '#A2D2FF', secondary: '#8BC5FF' },
}

interface AssetTargetProgressProps {
    data: AssetTypeSummary[]
}

export default function AssetTargetProgress({ data }: AssetTargetProgressProps) {
    if (data.length === 0) {
        return null
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md">
            <h2 className="text-base sm:text-lg font-semibold mb-4 dark:text-white">
                자산별 목표금액 vs 현재자산
            </h2>

            <div className="space-y-4">
                {data.map((item) => {
                    const target = item.targetAmount || 0
                    const current = item.totalPurchaseAmount + item.totalGainLoss
                    const progress = target > 0 ? (current / target) * 100 : 0
                    const purchaseProgress = target > 0 ? (item.totalPurchaseAmount / target) * 100 : 0
                    const gainLossProgress = target > 0 ? (item.totalGainLoss / target) * 100 : 0
                    const colors = assetGroupColors[item.assetType as AssetGroup] || { primary: '#BDE0FE', secondary: '#A2D2FF' }

                    return (
                        <div key={item.assetType}>
                            <div className="mb-2">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {item.assetType}
                                </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="relative w-full h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                {/* 매입금액 */}
                                <div
                                    className="absolute left-0 top-0 h-full transition-all duration-500"
                                    style={{
                                        width: `${Math.min(purchaseProgress, 100)}%`,
                                        backgroundColor: colors.primary,
                                    }}
                                />
                                {/* 평가손익 (매입금액 위에 쌓기) */}
                                {gainLossProgress > 0 && (
                                    <div
                                        className="absolute left-0 top-0 h-full transition-all duration-500"
                                        style={{
                                            left: `${Math.min(purchaseProgress, 100)}%`,
                                            width: `${Math.min(gainLossProgress, 100 - purchaseProgress)}%`,
                                            backgroundColor: colors.secondary,
                                        }}
                                    />
                                )}
                                {/* 목표 라인 (항상 100% 위치) */}
                                {target > 0 && (
                                    <div
                                        className="absolute top-0 bottom-0 w-0.5 z-10"
                                        style={{
                                            left: '100%',
                                            backgroundColor: colors.primary,
                                            opacity: 0.6,
                                        }}
                                    />
                                )}
                                {/* 현재 금액 텍스트 (progress bar 내부 왼쪽) */}
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20">
                                    <span
                                        className="text-xs font-semibold px-1"
                                        style={{
                                            color: '#1F2937',
                                            textShadow: '0 1px 2px rgba(255, 255, 255, 0.8), 0 0 4px rgba(255, 255, 255, 0.6)',
                                        }}
                                    >
                                        {formatNumberInManwon(current)}만원
                                    </span>
                                </div>
                                {/* 목표 금액 텍스트 (progress bar 내부 오른쪽) */}
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20">
                                    <span
                                        className="text-xs font-semibold px-1"
                                        style={{
                                            color: '#1F2937',
                                            textShadow: '0 1px 2px rgba(255, 255, 255, 0.8), 0 0 4px rgba(255, 255, 255, 0.6)',
                                        }}
                                    >
                                        {formatNumberInManwon(target)}만원
                                    </span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

