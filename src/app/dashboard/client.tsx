'use client'

import AssetPieChart from '@/components/dashboard/AssetPieChart'
import AssetTargetProgress from '@/components/dashboard/AssetTargetProgress'
import StockTable from '@/components/dashboard/StockTable'
import TotalTargetProgress from '@/components/dashboard/TotalTargetProgress'
import { formatNumber, formatReturnRate } from '@/lib/calculations'
import { CurrentAssetStatus } from '@/types/analytics'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DashboardClient() {
  const router = useRouter()
  const [status, setStatus] = useState<CurrentAssetStatus | null>(null)
  const [loading, setLoading] = useState(true)

  // 현재 현황 로드
  const loadStatus = async () => {
    try {
      const res = await fetch('/api/analytics/current')
      const data = await res.json()
      if (data.ok) {
        setStatus(data.data)
      }
    } catch (error) {
      console.error('Error loading status:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStatus()
  }, [])

  // 총 목표 금액 계산
  const totalTarget =
    status?.byAssetType.reduce(
      (sum, item) => sum + (item.targetAmount || 0),
      0
    ) || 0

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>
  }

  if (!status) {
    return (
      <div className="text-center py-8 text-gray-500">
        데이터가 없습니다.
      </div>
    )
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="px-4 py-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          자산 목표 현황
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-700 py-1 px-2 min-h-0 min-w-0"
          >
            로그아웃
          </button>
          <button
            onClick={() => router.push('/targets')}
          className="px-4 py-1.5 text-white rounded-2xl font-medium min-h-[44px] transition-colors"
          style={{
            backgroundColor: '#FBA2AB',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#FEA38E'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#FBA2AB'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.backgroundColor = '#F3B5A0'
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.backgroundColor = '#FBA2AB'
          }}
        >
          목표입력
        </button>
        </div>
      </div>

      {/* 목표 Progress Bar - 맨 위 */}
      {totalTarget > 0 && (
        <div className="mb-4 sm:mb-6">
          <TotalTargetProgress
            totalTarget={totalTarget}
            totalPurchaseAmount={status.totalPurchaseAmount}
            totalGainLoss={status.totalGainLoss}
          />
        </div>
      )}

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-white p-3 sm:p-4 rounded-xl shadow-md">
          <div className="text-xs sm:text-sm text-gray-500 mb-1">
            총 평가금액
          </div>
          <div className="text-lg sm:text-2xl font-bold text-gray-900">
            {formatNumber(status.totalValue)}
          </div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-xl shadow-md">
          <div className="text-xs sm:text-sm text-gray-500 mb-1">
            총 매입금액
          </div>
          <div className="text-lg sm:text-2xl font-bold text-gray-900">
            {formatNumber(status.totalPurchaseAmount)}
          </div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-xl shadow-md">
          <div className="text-xs sm:text-sm text-gray-500 mb-1">
            총 평가손익
          </div>
          <div
            className={`text-lg sm:text-2xl font-bold ${status.totalGainLoss >= 0
              ? 'text-green-600'
              : 'text-red-600'
              }`}
          >
            {status.totalGainLoss >= 0 ? '+' : ''}
            {formatNumber(status.totalGainLoss)}
          </div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-xl shadow-md">
          <div className="text-xs sm:text-sm text-gray-500 mb-1">
            수익률
          </div>
          <div
            className={`text-lg sm:text-2xl font-bold ${status.totalReturnRate >= 0
              ? 'text-green-600'
              : 'text-red-600'
              }`}
          >
            {formatReturnRate(status.totalReturnRate)}
          </div>
        </div>
      </div>

      {/* 자산군별 파이차트 */}
      {status.byAssetType.length > 0 && (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
            자산군별 분포
          </h2>
          <AssetPieChart data={status.byAssetType} />
        </div>
      )}

      {/* 자산별 목표 Progress Bar */}
      {status.byAssetType.length > 0 && status.byAssetType.some((item) => (item.targetAmount || 0) > 0) && (
        <div className="mb-4 sm:mb-6">
          <AssetTargetProgress data={status.byAssetType} />
        </div>
      )}

      {/* 종목별 상세 테이블 */}
      {status.byStock.length > 0 && (
        <div className="mb-4 sm:mb-6">
          <StockTable stocks={status.byStock} />
        </div>
      )}
    </div>
  )
}

