'use client'

import { formatNumberInManwon } from '@/lib/calculations'

interface TotalTargetProgressProps {
    totalTarget: number
    totalPurchaseAmount: number
    totalGainLoss: number
}

const SIZE = 200
const STROKE = 14
const R = (SIZE - STROKE) / 2
const CX = SIZE / 2
const CY = SIZE / 2
const CIRCUMFERENCE = 2 * Math.PI * R

export default function TotalTargetProgress({
    totalTarget,
    totalPurchaseAmount,
    totalGainLoss,
}: TotalTargetProgressProps) {
    const totalCurrent = totalPurchaseAmount + totalGainLoss
    const progressCurrent = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0
    const progressPurchase = totalTarget > 0 ? (totalPurchaseAmount / totalTarget) * 100 : 0

    const purchasePercent = Math.min(Math.max(progressPurchase, 0), 100)
    const currentPercent = Math.min(Math.max(progressCurrent, 0), 100)
    const gainPercent = Math.max(currentPercent - purchasePercent, 0)

    const purchaseLen = (purchasePercent / 100) * CIRCUMFERENCE
    const gainLen = (gainPercent / 100) * CIRCUMFERENCE
    const currentLen = purchaseLen + gainLen

    // NOTE: SVG는 -90deg 회전되어 시작점(3시)이 12시로 보입니다.
    // 마커 위치는 회전 전 좌표계(시작점 3시) 기준으로 계산해야 호 끝과 일치합니다.
    const angleRad = (currentLen / CIRCUMFERENCE) * 2 * Math.PI
    const markerX = CX + R * Math.cos(angleRad)
    const markerY = CY + R * Math.sin(angleRad)

    return (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
            <h2 className="text-center text-base sm:text-lg font-semibold mb-4">
                불어나라 불어나라
            </h2>

            <div className="flex justify-center">
                <div className="relative" style={{ width: SIZE, height: SIZE }}>
                    <svg
                        width={SIZE}
                        height={SIZE}
                        viewBox={`0 0 ${SIZE} ${SIZE}`}
                        className="rotate-[-90deg]"
                    >
                        <defs>
                            {/* 매수금액: 진한 분홍 그라데이션 */}
                            <linearGradient id="purchaseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="var(--theme-primary-deep)" />
                                <stop offset="100%" stopColor="var(--theme-primary)" />
                            </linearGradient>
                            {/* 평가손익(+): 파란색(스카이) */}
                            <linearGradient id="gainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="var(--theme-sky)" />
                                <stop offset="100%" stopColor="var(--theme-sky)" />
                            </linearGradient>
                        </defs>
                        {/* 트랙 (배경 원) */}
                        <circle
                            cx={CX}
                            cy={CY}
                            r={R}
                            fill="none"
                            stroke="var(--tint-pink)"
                            strokeWidth={STROKE}
                        />
                        {/* 매수금액 진행 (기존과 동일: 파란색 계열) */}
                        <circle
                            cx={CX}
                            cy={CY}
                            r={R}
                            fill="none"
                            stroke="url(#purchaseGradient)"
                            strokeWidth={STROKE}
                            strokeLinecap="round"
                            strokeDasharray={`${purchaseLen} ${CIRCUMFERENCE}`}
                            strokeDashoffset={0}
                            className="transition-all duration-500"
                        />
                        {/* 평가손익(+) 진행 (핑크 → 블루 그라데이션) */}
                        {gainLen > 0 && (
                            <circle
                                cx={CX}
                                cy={CY}
                                r={R}
                                fill="none"
                                stroke="url(#gainGradient)"
                                strokeWidth={STROKE}
                                strokeLinecap="round"
                                strokeDasharray={`${gainLen} ${CIRCUMFERENCE}`}
                                strokeDashoffset={-purchaseLen}
                                className="transition-all duration-500"
                            />
                        )}
                        {/* 진행 끝 마커 */}
                        {currentLen > 0 && currentLen < CIRCUMFERENCE && (
                            <circle
                                cx={markerX}
                                cy={markerY}
                                r={8}
                                fill="var(--theme-yellow)"
                                stroke="white"
                                strokeWidth={3}
                            />
                        )}
                    </svg>
                    {/* 중앙 텍스트 */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-sm font-medium text-gray-600 mb-0.5">
                            현재
                        </span>
                        <span className="text-lg sm:text-xl font-bold text-gray-900">
                            {formatNumberInManwon(totalCurrent)}만원
                        </span>
                        <span className="text-xs text-gray-400 mt-1">
                            목표 {formatNumberInManwon(totalTarget)}만원
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

