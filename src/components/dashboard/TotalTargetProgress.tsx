'use client'

import { formatNumberInManwon } from '@/lib/calculations'

interface TotalTargetProgressProps {
    totalTarget: number
    totalPurchaseAmount: number
    totalGainLoss: number
}

export default function TotalTargetProgress({
    totalTarget,
    totalPurchaseAmount,
    totalGainLoss,
}: TotalTargetProgressProps) {
    const totalCurrent = totalPurchaseAmount + totalGainLoss
    const progress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0
    const purchaseProgress = totalTarget > 0 ? (totalPurchaseAmount / totalTarget) * 100 : 0
    const gainLossProgress = totalTarget > 0 ? (totalGainLoss / totalTarget) * 100 : 0

    return (
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md">
            <h2 className="text-center text-base sm:text-lg font-semibold mb-3 dark:text-white">
                불어나라 불어나라
            </h2>

            {/* Progress Bar */}
            <div className="relative w-full h-10 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                {/* 매입금액 */}
                <div
                    className="absolute left-0 top-0 h-full transition-all duration-500"
                    style={{
                        width: `${Math.min(purchaseProgress, 100)}%`,
                        backgroundColor: '#BDE0FE',
                    }}
                />
                {/* 평가손익 (매입금액 위에 쌓기) */}
                {gainLossProgress > 0 && (
                    <div
                        className="absolute left-0 top-0 h-full transition-all duration-500"
                        style={{
                            left: `${Math.min(purchaseProgress, 100)}%`,
                            width: `${Math.min(gainLossProgress, 100 - purchaseProgress)}%`,
                            backgroundColor: '#A2D2FF',
                        }}
                    />
                )}
                {/* 목표 라인 (항상 100% 위치) */}
                {totalTarget > 0 && (
                    <div
                        className="absolute top-0 bottom-0 w-0.5 z-10"
                        style={{
                            left: '100%',
                            backgroundColor: '#CDB4DB',
                        }}
                    />
                )}
                {/* 현재 금액 텍스트 (progress bar 내부 왼쪽) */}
                <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20">
                    <span
                        className="text-xs sm:text-sm font-semibold px-1"
                        style={{
                            color: '#1F2937',
                            textShadow: '0 1px 2px rgba(255, 255, 255, 0.8), 0 0 4px rgba(255, 255, 255, 0.6)',
                        }}
                    >
                        {formatNumberInManwon(totalCurrent)}만원
                    </span>
                </div>
                {/* 목표 금액 텍스트 (progress bar 내부 오른쪽) */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20">
                    <span
                        className="text-xs sm:text-sm font-semibold px-1"
                        style={{
                            color: '#1F2937',
                            textShadow: '0 1px 2px rgba(255, 255, 255, 0.8), 0 0 4px rgba(255, 255, 255, 0.6)',
                        }}
                    >
                        {formatNumberInManwon(totalTarget)}만원
                    </span>
                </div>
            </div>


        </div>
    )
}

