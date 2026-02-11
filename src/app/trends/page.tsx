'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import { AssetTrend } from '@/types/analytics'
import { Stock } from '@/types/stock'
import { formatNumber } from '@/lib/calculations'
import { format, subDays } from 'date-fns'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300']

export default function TrendsPage() {
  const router = useRouter()
  const [trends, setTrends] = useState<AssetTrend[]>([])
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [selectedStockId, setSelectedStockId] = useState<string>('')
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])
  const [selectedStockIds, setSelectedStockIds] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [dateRange, setDateRange] = useState('Day')

  // 종목 로드
  const loadStocks = async () => {
    try {
      const res = await fetch('/api/stock')
      const data = await res.json()
      if (data.ok) {
        setStocks(data.data)
        const accounts = Array.from(new Set(data.data.map((s: Stock) => s.accountType)))
        setSelectedAccounts(accounts.slice(0, 3))
      }
    } catch (error) {
      console.error('Error loading stocks:', error)
    }
  }

  // 트렌드 데이터 로드
  const loadTrends = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (selectedAccount) params.append('accountType', selectedAccount)
      if (selectedStockId) params.append('stockId', selectedStockId)

      const res = await fetch(`/api/analytics/trends?${params.toString()}`)
      const data = await res.json()
      if (data.ok) {
        setTrends(data.data)
      }
    } catch (error) {
      console.error('Error loading trends:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStocks()
  }, [])

  useEffect(() => {
    loadTrends()
  }, [startDate, endDate, selectedAccount, selectedStockId])

  const accounts = Array.from(new Set(stocks.map((s) => s.accountType)))

  // 전체 자산 변화 추이 데이터
  const totalTrendData = trends.map((trend) => ({
    date: format(new Date(trend.date), 'MMM dd'),
    fullDate: trend.date,
    총평가금액: trend.totalValue,
    총매입금액: trend.totalPurchaseAmount,
    총평가손익: trend.totalGainLoss,
  }))

  // 계좌별 데이터 준비
  const accountTrendData = trends.map((trend) => {
    const data: Record<string, any> = {
      date: format(new Date(trend.date), 'MMM dd'),
      fullDate: trend.date,
    }
    if (trend.byAccount) {
      selectedAccounts.forEach((account) => {
        data[account] = trend.byAccount?.[account] || 0
      })
    }
    return data
  })

  // 종목별 데이터 준비
  const stockTrendData = trends.map((trend) => {
    const data: Record<string, any> = {
      date: format(new Date(trend.date), 'MMM dd'),
      fullDate: trend.date,
    }
    if (trend.byStock) {
      selectedStockIds.forEach((stockId) => {
        const stock = stocks.find((s) => s.id === stockId)
        if (stock) {
          data[stock.stockName] = trend.byStock?.[stockId] || 0
        }
      })
    }
    return data
  })

  // 계좌별 최신 데이터
  const accountLatestData = accounts.map((account) => {
    const latestTrend = trends[trends.length - 1]
    const prevTrend = trends[trends.length - 2]
    const currentValue = latestTrend?.byAccount?.[account] || 0
    const prevValue = prevTrend?.byAccount?.[account] || 0
    const change = currentValue - prevValue
    const changePercent = prevValue > 0 ? ((change / prevValue) * 100).toFixed(1) : '0.0'
    
    // 미니 차트 데이터 (최근 7일)
    const miniChartData = trends.slice(-7).map((t) => ({
      date: format(new Date(t.date), 'MM/dd'),
      value: t.byAccount?.[account] || 0,
    }))

    return {
      account,
      value: currentValue,
      change,
      changePercent,
      isPositive: change >= 0,
      miniChartData,
    }
  }).sort((a, b) => b.value - a.value)

  // 종목별 최신 데이터
  const stockLatestData = stocks
    .map((stock) => {
      const latestTrend = trends[trends.length - 1]
      const prevTrend = trends[trends.length - 2]
      const currentValue = latestTrend?.byStock?.[stock.id] || 0
      const prevValue = prevTrend?.byStock?.[stock.id] || 0
      const change = currentValue - prevValue
      const changePercent = prevValue > 0 ? ((change / prevValue) * 100).toFixed(1) : '0.0'
      
      const miniChartData = trends.slice(-7).map((t) => ({
        date: format(new Date(t.date), 'MM/dd'),
        value: t.byStock?.[stock.id] || 0,
      }))

      return {
        stock,
        value: currentValue,
        change,
        changePercent,
        isPositive: change >= 0,
        miniChartData,
      }
    })
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

  const toggleAccount = (account: string) => {
    if (selectedAccounts.includes(account)) {
      setSelectedAccounts(selectedAccounts.filter((a) => a !== account))
    } else {
      setSelectedAccounts([...selectedAccounts, account])
    }
  }

  const toggleStock = (stockId: string) => {
    if (selectedStockIds.includes(stockId)) {
      setSelectedStockIds(selectedStockIds.filter((id) => id !== stockId))
    } else {
      setSelectedStockIds([...selectedStockIds, stockId])
    }
  }

  const selectedFilterName = selectedAccount
    ? accounts.find((a) => a === selectedAccount) || ''
    : selectedStockId
    ? stocks.find((s) => s.id === selectedStockId)?.stockName || ''
    : '전체'

  const latestTotal = trends.length > 0 ? trends[trends.length - 1].totalValue : 0
  const prevTotal = trends.length > 1 ? trends[trends.length - 2].totalValue : 0
  const totalChange = latestTotal - prevTotal
  const isTotalPositive = totalChange >= 0

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>
  }

  return (
    <div className="px-4 py-4">
      {/* 헤더 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            ←
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
          >
            필터
          </button>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {selectedFilterName}
          </h1>
          {trends.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(latestTotal)}
              </span>
              <span className={`text-sm ${isTotalPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isTotalPositive ? '▲' : '▼'} {Math.abs(totalChange) > 0 ? formatNumber(Math.abs(totalChange)) : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 필터 섹션 (접을 수 있음) */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium mb-1 dark:text-gray-300">시작일</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 dark:text-gray-300">종료일</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1 dark:text-gray-300">계좌 필터</label>
              <select
                value={selectedAccount}
                onChange={(e) => {
                  setSelectedAccount(e.target.value)
                  setSelectedStockId('')
                }}
                className="w-full px-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="">전체</option>
                {accounts.map((account) => (
                  <option key={account} value={account}>
                    {account}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 dark:text-gray-300">종목 필터</label>
              <select
                value={selectedStockId}
                onChange={(e) => {
                  setSelectedStockId(e.target.value)
                  setSelectedAccount('')
                }}
                className="w-full px-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="">전체</option>
                {stocks.map((stock) => (
                  <option key={stock.id} value={stock.id}>
                    {stock.stockName} - {stock.accountType}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 총 자산 차트 (Total Cases 스타일) */}
      {trends.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md mb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold dark:text-white">총 자산</h2>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="Day">일</option>
              <option value="Week">주</option>
              <option value="Month">월</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={totalTrendData}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(value) => formatNumber(value)} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => formatNumber(value)}
                labelStyle={{ color: '#000' }}
              />
              <Area
                type="monotone"
                dataKey="총평가금액"
                stroke="#8884d8"
                fillOpacity={1}
                fill="url(#colorTotal)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 계좌별 카드 섹션 (Top Country 스타일) */}
      {!selectedAccount && !selectedStockId && accountLatestData.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold dark:text-white">상위 계좌</h2>
            <button className="text-sm text-blue-600 dark:text-blue-400">전체 보기</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            {accountLatestData.slice(0, 5).map((item, index) => (
              <div
                key={item.account}
                className="flex-shrink-0 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4"
                style={{
                  borderLeft: `4px solid ${COLORS[index % COLORS.length]}`,
                }}
              >
                <div className="mb-2">
                  <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    {item.account}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatNumber(item.value)}
                    </span>
                    <span className={`text-xs ${item.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {item.isPositive ? '▲' : '▼'}
                    </span>
                  </div>
                </div>
                <div className="h-12">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={item.miniChartData}>
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={COLORS[index % COLORS.length]}
                        fill={COLORS[index % COLORS.length]}
                        fillOpacity={0.3}
                        strokeWidth={1.5}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 종목별 카드 섹션 */}
      {!selectedAccount && !selectedStockId && stockLatestData.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold dark:text-white">상위 종목</h2>
            <button className="text-sm text-blue-600 dark:text-blue-400">전체 보기</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            {stockLatestData.slice(0, 5).map((item, index) => (
              <div
                key={item.stock.id}
                className="flex-shrink-0 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4"
                style={{
                  borderLeft: `4px solid ${COLORS[index % COLORS.length]}`,
                }}
              >
                <div className="mb-2">
                  <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    {item.stock.stockName}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatNumber(item.value)}
                    </span>
                    <span className={`text-xs ${item.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {item.isPositive ? '▲' : '▼'}
                    </span>
                  </div>
                </div>
                <div className="h-12">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={item.miniChartData}>
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={COLORS[index % COLORS.length]}
                        fill={COLORS[index % COLORS.length]}
                        fillOpacity={0.3}
                        strokeWidth={1.5}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 상세 차트 (필터링된 경우 또는 선택된 계좌/종목) */}
      {(selectedAccount || selectedStockId || selectedAccounts.length > 0 || selectedStockIds.length > 0) &&
        trends.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md mb-4">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">
            {selectedAccount
              ? `${selectedAccount} 자산 변화`
              : selectedStockId
              ? `${stocks.find((s) => s.id === selectedStockId)?.stockName} 자산 변화`
              : selectedAccounts.length > 0
              ? '계좌별 비교'
              : '종목별 비교'}
          </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={
                  selectedAccount || selectedStockId
                    ? totalTrendData
                    : selectedAccounts.length > 0
                    ? accountTrendData
                    : stockTrendData
                }
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(value) => formatNumber(value)} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => formatNumber(value)} />
                <Legend />
                {selectedAccount || selectedStockId ? (
                  <>
                    <Line type="monotone" dataKey="총평가금액" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="총매입금액" stroke="#82ca9d" strokeWidth={2} />
                    <Line type="monotone" dataKey="총평가손익" stroke="#ffc658" strokeWidth={2} />
                  </>
                ) : selectedAccounts.length > 0 ? (
                  selectedAccounts.map((account, index) => (
                    <Line
                      key={account}
                      type="monotone"
                      dataKey={account}
                      stroke={COLORS[index % COLORS.length]}
                      strokeWidth={2}
                    />
                  ))
                ) : (
                  selectedStockIds.map((stockId, index) => {
                    const stock = stocks.find((s) => s.id === stockId)
                    return stock ? (
                      <Line
                        key={stockId}
                        type="monotone"
                        dataKey={stock.stockName}
                        stroke={COLORS[index % COLORS.length]}
                        strokeWidth={2}
                      />
                    ) : null
                  })
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

      {trends.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          해당 기간의 데이터가 없습니다.
        </div>
      )}
    </div>
  )
}
