'use client'

import { formatNumber } from '@/lib/calculations'
import { AssetTrend } from '@/types/analytics'
import { Stock } from '@/types/stock'
import { format, subDays } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { StockTrendCard } from '@/components/trends'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300']

// 프로젝트 메인컬러 (총 자산 그래프 등)
const MAIN_COLOR = '#F7A8B7'

// 계좌별 추이 차트용 파스텔 색상
const ACCOUNT_CHART_COLORS = [
  '#a8d0e6', '#e8a0b8', '#e8d080', '#7eb8d8', '#80c0b8',
]

// 종목 카드: 마시멜로 파스텔 팔레트 (하늘·분홍·노랑·민트 계열)
const STOCK_CARD_COLORS = [
  { chart: '#a8d0e6', bg: '#e8f4fa' },   // 연한 하늘색
  { chart: '#e8a0b8', bg: '#fce8ee' },   // 연분홍
  { chart: '#e8d080', bg: '#fdf8e8' },   // 옅은 노랑
  { chart: '#7eb8d8', bg: '#dceef7' },    // 진한 하늘색
  { chart: '#80c0b8', bg: '#e0f0ec' },   // 연한 민트
]

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
        const stocksData = data.data as Stock[]
        setStocks(stocksData)
        const accounts = Array.from(new Set(stocksData.map((s) => s.accountType)))
        setSelectedAccounts(accounts)
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

  // 전체 자산 변화 추이 데이터 (Y축 천만원 단위, X축 M/d 형식)
  const TEN_MILLION = 10_000_000
  const totalTrendData = trends.map((trend) => ({
    date: format(new Date(trend.date), 'M/d'),
    fullDate: trend.date,
    총평가금액_천만: trend.totalValue / TEN_MILLION,
    _raw총평가금액: trend.totalValue,
    총평가금액: trend.totalValue,
    총매입금액: trend.totalPurchaseAmount,
    총평가손익: trend.totalGainLoss,
  }))
  // Y축 정수 눈금(4천만, 5천만, …)을 위해 상한 올림
  const totalChartYMax =
    totalTrendData.length > 0
      ? Math.ceil(Math.max(...totalTrendData.map((d) => d.총평가금액_천만)))
      : 7
  const totalChartYDomain: [number, number] = [4, Math.max(5, totalChartYMax)]

  // 계좌별 데이터 준비 (원 + 만원 단위 for 계좌별 비교 차트)
  const accountTrendData = trends.map((trend) => {
    const data: Record<string, number | string> = {
      date: format(new Date(trend.date), 'M/d'),
      fullDate: trend.date,
    }
    if (trend.byAccount) {
      selectedAccounts.forEach((account) => {
        const value = trend.byAccount?.[account] || 0
        data[account] = value
        data[`${account}_만`] = value / 10_000
      })
    }
    return data
  })

  // 종목별 데이터 준비
  const stockTrendData = trends.map((trend) => {
    const data: Record<string, any> = {
      date: format(new Date(trend.date), 'M/d'),
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

  // 계좌별 최신 데이터 (최근 4일, 맨 앞 일자 대비 변화율 + 툴팁용 총 평가금액)
  const accountLatestData = accounts.map((account) => {
    const latestTrend = trends[trends.length - 1]
    const prevTrend = trends[trends.length - 2]
    const currentValue = latestTrend?.byAccount?.[account] || 0
    const prevValue = prevTrend?.byAccount?.[account] || 0
    const change = currentValue - prevValue
    const changePercent = prevValue > 0 ? ((change / prevValue) * 100).toFixed(1) : '0.0'

    const slice4 = trends.slice(-4)
    const firstValue = slice4[0]?.byAccount?.[account] ?? 0
    const miniChartData = slice4.map((t) => {
      const actualValue = t.byAccount?.[account] ?? 0
      const rate =
        firstValue > 0 ? ((actualValue - firstValue) / firstValue) * 100 : 0
      return {
        date: format(new Date(t.date), 'MM/dd'),
        value: Number(rate.toFixed(1)),
        actualValue,
      }
    })

    return {
      account,
      value: currentValue,
      change,
      changePercent,
      isPositive: change >= 0,
      miniChartData,
    }
  }).sort((a, b) => b.value - a.value)

  // 계좌별 추이 통합 차트용 데이터 (최근 4일, 맨 앞 일자 대비 변화율 + 툴팁용 실제 평가금액)
  const topAccounts = accountLatestData.map((a) => a.account)
  const accountCombinedChartData = (() => {
    const slice4 = trends.slice(-4)
    if (slice4.length === 0 || topAccounts.length === 0) return []
    return slice4.map((t) => {
      const point: Record<string, number | string> = {
        date: format(new Date(t.date), 'MM/dd'),
      }
      topAccounts.forEach((account) => {
        const firstValue = slice4[0]?.byAccount?.[account] ?? 0
        const actualValue = t.byAccount?.[account] ?? 0
        const rate =
          firstValue > 0 ? ((actualValue - firstValue) / firstValue) * 100 : 0
        point[account] = Number(rate.toFixed(1))
        point[`${account}_actual`] = actualValue
      })
      return point
    })
  })()

  // 종목별 최신 데이터 (최근 4일, 맨 앞 일자 대비 변화율 + 툴팁용 총 평가금액)
  const stockLatestData = stocks
    .map((stock) => {
      const latestTrend = trends[trends.length - 1]
      const prevTrend = trends[trends.length - 2]
      const currentValue = latestTrend?.byStock?.[stock.id] || 0
      const prevValue = prevTrend?.byStock?.[stock.id] || 0
      const change = currentValue - prevValue
      const changePercent = prevValue > 0 ? ((change / prevValue) * 100).toFixed(1) : '0.0'

      const slice4 = trends.slice(-4)
      const firstValue = slice4[0]?.byStock?.[stock.id] ?? 0
      const miniChartData = slice4.map((t) => {
        const actualValue = t.byStock?.[stock.id] ?? 0
        const rate =
          firstValue > 0 ? ((actualValue - firstValue) / firstValue) * 100 : 0
        return {
          date: format(new Date(t.date), 'MM/dd'),
          value: Number(rate.toFixed(1)),
          actualValue,
        }
      })

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
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
          >
            ←
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-1 text-sm bg-gray-100 rounded-lg text-gray-700"
          >
            필터
          </button>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {selectedFilterName}
          </h1>
          {trends.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-2xl font-bold text-gray-900">
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
        <div className="bg-white p-4 rounded-xl shadow-md mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium mb-1">시작일</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">종료일</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">계좌 필터</label>
              <select
                value={selectedAccount}
                onChange={(e) => {
                  setSelectedAccount(e.target.value)
                  setSelectedStockId('')
                }}
                className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg"
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
              <label className="block text-xs font-medium mb-1">종목 필터</label>
              <select
                value={selectedStockId}
                onChange={(e) => {
                  setSelectedStockId(e.target.value)
                  setSelectedAccount('')
                }}
                className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg"
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
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md mb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">총 자산</h2>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg"
            >
              <option value="Day">일</option>
              <option value="Week">주</option>
              <option value="Month">월</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={totalTrendData} margin={{ left: 0, right: 8 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={MAIN_COLOR} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={MAIN_COLOR} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis
                width={40}
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => `${v}천만`}
                domain={totalChartYDomain}
                allowDecimals={false}
              />
              <Tooltip
                formatter={(value: number, name: string, props: { payload?: { _raw총평가금액?: number } }) => [
                  formatNumber(props?.payload?._raw총평가금액 ?? 0),
                  '총평가금액',
                ]}
                labelStyle={{ color: '#000' }}
              />
              <Area
                type="monotone"
                dataKey="총평가금액_천만"
                stroke={MAIN_COLOR}
                fillOpacity={1}
                fill="url(#colorTotal)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 계좌별 추이 – 5개 계좌 단일 차트 */}
      {!selectedAccount &&
        !selectedStockId &&
        accountCombinedChartData.length > 0 &&
        topAccounts.length > 0 && (
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md mb-4">
            <h2 className="text-lg font-semibold mb-4">계좌별 추이</h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart
                data={accountCombinedChartData}
                margin={{ top: 8, right: 8, left: -8, bottom: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e0e0e0"
                  className="stroke-gray-600"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  height={28}
                />
                <YAxis
                  width={36}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `${v}%`}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  formatter={(value, name, item: { payload?: Record<string, number> }) => {
                    const key = `${String(name)}_actual`
                    const actual = item?.payload?.[key] ?? 0
                    return [formatNumber(actual), name]
                  }}
                  contentStyle={{ fontSize: 12 }}
                  labelStyle={{ color: 'inherit' }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} iconSize={10} />
                {topAccounts.map((account, index) => (
                  <Line
                    key={account}
                    type="monotone"
                    dataKey={account}
                    name={account}
                    stroke={ACCOUNT_CHART_COLORS[index % ACCOUNT_CHART_COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 3, fill: ACCOUNT_CHART_COLORS[index % ACCOUNT_CHART_COLORS.length] }}
                    activeDot={{ r: 4 }}
                    isAnimationActive={true}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

      {/* 종목별 추이 카드 섹션 */}
      {!selectedAccount && !selectedStockId && stockLatestData.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">종목별 추이</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            {stockLatestData.slice(0, 5).map((item, index) => {
              const { chart, bg } = STOCK_CARD_COLORS[index % STOCK_CARD_COLORS.length]
              return (
                <StockTrendCard
                  key={item.stock.id}
                  stock={item.stock}
                  value={item.value}
                  isPositive={item.isPositive}
                  miniChartData={item.miniChartData}
                  chartColor={chart}
                  bgColor={bg}
                  onClick={() => router.push(`/trends/stock/${item.stock.id}`)}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* 상세 차트 (필터링된 경우 또는 선택된 계좌/종목) */}
      {(selectedAccount || selectedStockId || selectedAccounts.length > 0 || selectedStockIds.length > 0) &&
        trends.length > 0 && (
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md mb-4">
            <h2 className="text-lg font-semibold mb-4">
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
                <YAxis
                  tickFormatter={
                    selectedAccounts.length > 0
                      ? (value: number) => `${value}만`
                      : (value: number) => formatNumber(value)
                  }
                  tick={{ fontSize: 12 }}
                  width={selectedAccounts.length > 0 ? 40 : undefined}
                />
                {selectedAccounts.length > 0 ? (
                  <Tooltip
                    formatter={(value: number | undefined, name: string, item: { payload?: Record<string, number> }) => {
                      const account = String(name).replace(/_만$/, '')
                      const actual = item?.payload?.[account] ?? 0
                      return [formatNumber(actual), account]
                    }}
                  />
                ) : (
                  <Tooltip formatter={(value: number) => formatNumber(value)} />
                )}
                <Legend wrapperStyle={{ fontSize: 11 }} iconSize={10} />
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
                      dataKey={`${account}_만`}
                      name={account}
                      stroke={ACCOUNT_CHART_COLORS[index % ACCOUNT_CHART_COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 3, fill: ACCOUNT_CHART_COLORS[index % ACCOUNT_CHART_COLORS.length] }}
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
        <div className="text-center py-8 text-gray-500">
          해당 기간의 데이터가 없습니다.
        </div>
      )}
    </div>
  )
}
