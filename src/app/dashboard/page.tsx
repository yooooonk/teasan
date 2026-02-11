'use client'

import { formatNumber, formatReturnRate } from '@/lib/calculations'
import { CurrentAssetStatus } from '@/types/analytics'
import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export default function DashboardPage() {
  const [status, setStatus] = useState<CurrentAssetStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [targetAmount, setTargetAmount] = useState<number>(0)

  // 현재 현황 로드
  const loadStatus = async () => {
    try {
      const res = await fetch('/api/analytics/current')
      const data = await res.json()
      if (data.ok) {
        setStatus(data.data)
        // 목표 금액은 로컬 스토리지에서 불러오거나 총 평가금액의 120%로 설정
        const savedTarget = localStorage.getItem('targetAmount')
        if (savedTarget) {
          setTargetAmount(parseFloat(savedTarget))
        } else if (data.data.totalValue > 0) {
          setTargetAmount(data.data.totalValue * 1.2)
        }
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

  // 목표 금액 저장
  const handleSaveTarget = () => {
    localStorage.setItem('targetAmount', targetAmount.toString())
    alert('목표 금액이 저장되었습니다.')
  }

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>
  }

  if (!status) {
    return <div className="text-center py-8 text-gray-500 dark:text-gray-400">데이터가 없습니다.</div>
  }

  // 총 목표 vs 현재 데이터
  const totalComparisonData = [
    {
      name: '목표',
      금액: targetAmount,
    },
    {
      name: '현재',
      금액: status.totalValue,
    },
  ]

  // 자산 종류별 데이터
  const assetTypeData = status.byAssetType.map((item) => ({
    name: item.assetType,
    목표: item.targetAmount || 0,
    현재: item.totalValue,
    매입금액: item.totalPurchaseAmount,
    평가손익: item.totalGainLoss,
  }))

  // 현재 자산 막대 그래프 데이터
  const assetBarData = status.byAssetType.map((item) => ({
    name: item.assetType,
    매입금액: item.totalPurchaseAmount,
    평가손익: item.totalGainLoss,
  }))

  // 종목별 데이터 (상위 10개)
  const topStocks = [...status.byStock]
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 10)
    .map((item) => ({
      name: item.metadata.name,
      매입금액: item.totalPurchaseAmount,
      평가손익: item.totalGainLoss,
    }))

  return (
    <div className="px-4 py-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        자산 목표 현황
      </h1>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl shadow-md">
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">총 평가금액</div>
          <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
            {formatNumber(status.totalValue)}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl shadow-md">
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">총 매입금액</div>
          <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
            {formatNumber(status.totalPurchaseAmount)}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl shadow-md">
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">총 평가손익</div>
          <div
            className={`text-lg sm:text-2xl font-bold ${status.totalGainLoss >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
              }`}
          >
            {status.totalGainLoss >= 0 ? '+' : ''}
            {formatNumber(status.totalGainLoss)}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl shadow-md">
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">수익률</div>
          <div
            className={`text-lg sm:text-2xl font-bold ${status.totalReturnRate >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
              }`}
          >
            {formatReturnRate(status.totalReturnRate)}
          </div>
        </div>
      </div>

      {/* 목표 금액 설정 */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <label className="text-sm font-medium dark:text-gray-300 sm:whitespace-nowrap">목표 금액:</label>
          <input
            type="number"
            value={targetAmount}
            onChange={(e) => setTargetAmount(parseFloat(e.target.value) || 0)}
            className="flex-1 px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={handleSaveTarget}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 font-medium min-h-[44px]"
          >
            저장
          </button>
        </div>
      </div>

      {/* 총 목표 vs 현재 */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 dark:text-white">총 목표 금액 vs 현재 자산</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={totalComparisonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => formatNumber(value)} />
            <Tooltip formatter={(value: number) => formatNumber(value)} />
            <Legend />
            <Bar dataKey="금액" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 자산 종류별 목표/현재 비교 */}
      {assetTypeData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 dark:text-white">자산 종류별 목표/현재 비교</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={assetTypeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => formatNumber(value)} />
              <Tooltip formatter={(value: number) => formatNumber(value)} />
              <Legend />
              <Bar dataKey="목표" fill="#8884d8" />
              <Bar dataKey="현재" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 현재 자산 막대 그래프 */}
      {assetBarData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 dark:text-white">현재 자산 (매입금액, 평가손익)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={assetBarData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => formatNumber(value)} />
              <Tooltip formatter={(value: number) => formatNumber(value)} />
              <Legend />
              <Bar dataKey="매입금액" fill="#0088FE" />
              <Bar dataKey="평가손익" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 종목별 매입금액/평가손익 */}
      {topStocks.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 dark:text-white">종목별 매입금액/평가손익 (상위 10개)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topStocks} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(value) => formatNumber(value)} />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip formatter={(value: number) => formatNumber(value)} />
              <Legend />
              <Bar dataKey="매입금액" fill="#0088FE" />
              <Bar dataKey="평가손익" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 종목별 상세 테이블 */}
      {status.byStock.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="p-4">
            <h2 className="text-base sm:text-lg font-semibold dark:text-white">종목별 상세</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    종목명
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    매입금액
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    평가금액
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    평가손익
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    수익률
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {status.byStock
                  .sort((a, b) => b.totalValue - a.totalValue)
                  .map((item) => (
                    <tr key={item.metadata.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {item.metadata.name}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatNumber(item.totalPurchaseAmount)}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatNumber(item.totalValue)}
                      </td>
                      <td
                        className={`px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium ${item.totalGainLoss >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                          }`}
                      >
                        {item.totalGainLoss >= 0 ? '+' : ''}
                        {formatNumber(item.totalGainLoss)}
                      </td>
                      <td
                        className={`px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium ${item.returnRate >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                          }`}
                      >
                        {formatReturnRate(item.returnRate)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

