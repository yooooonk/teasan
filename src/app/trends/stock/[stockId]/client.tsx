'use client'

import {
  StockDetailCards,
  StockSnapshotTable,
  type SnapshotWithItem,
} from '@/components/trends'
import { formatNumber } from '@/lib/calculations'
import type { Snapshot } from '@/types/snapshot'
import type { Stock } from '@/types/stock'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const MAIN_COLOR = '#F7A8B7'
const MAIN_COLOR_LIGHT = '#fbc4cd'
const GRADIENT_TOP = '#e88a9a'
const GRADIENT_BOTTOM = '#fde0e6'

type Props = {
  stockId: string
}

export default function StockDetailClient({ stockId }: Props) {
  const router = useRouter()
  const [stock, setStock] = useState<Stock | null>(null)
  const [recentSnapshotsWithItem, setRecentSnapshotsWithItem] = useState<
    SnapshotWithItem[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [stockRes, snapshotsRes] = await Promise.all([
          fetch('/api/stock'),
          fetch('/api/snapshots'),
        ])

        const stockJson = await stockRes.json()
        const snapshotsJson = await snapshotsRes.json()

        if (cancelled) return

        if (!stockJson.ok || !stockJson.data) {
          setError(stockJson.error ?? '종목 정보를 불러올 수 없습니다.')
          return
        }
        const stocks = stockJson.data as Stock[]
        const found = stocks.find((s) => s.id === stockId) ?? null
        setStock(found)

        if (!found) {
          setRecentSnapshotsWithItem([])
          return
        }

        if (!snapshotsJson.ok || !snapshotsJson.data) {
          setError(snapshotsJson.error ?? '스냅샷을 불러올 수 없습니다.')
          return
        }
        const snapshots = snapshotsJson.data as Snapshot[]
        const first = snapshots[snapshots.length - 1]
        const recent9 = snapshots.slice(0, 9)
        const combined = first
          ? [first, ...recent9.filter((s) => s.id !== first.id)].slice(0, 10)
          : recent9.slice(0, 10)
        const withItems: SnapshotWithItem[] = combined
          .map((snapshot) => {
            const item = snapshot.items.find((i) => i.stockId === stockId)
            return item ? { snapshot, item } : null
          })
          .filter((x): x is SnapshotWithItem => x !== null)
        setRecentSnapshotsWithItem(withItems)
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : '데이터를 불러오는 중 오류가 발생했습니다.'
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [stockId])

  return (
    <div
      className="min-h-screen"
      style={{
        background: `linear-gradient(180deg, ${GRADIENT_TOP} 0%, ${GRADIENT_TOP} 15%, ${MAIN_COLOR} 45%, ${MAIN_COLOR_LIGHT} 70%, ${GRADIENT_BOTTOM} 100%)`,
      }}
    >
      <header className="sticky top-0 z-0 pt-4 pb-6 px-5 sm:px-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
          type="button"
        >
          ←
        </button>
        {stock && (
          <div className="py-5 px-5 sm:px-6 text-center -mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {stock.stockName}
            </h1>
          </div>
        )}
      </header>

      <main className="relative z-10 rounded-t-3xl mt-6 bg-white dark:bg-gray-800 min-h-[80vh] px-6 sm:px-8 pt-8 pb-8 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.2)] overflow-hidden">
        {loading && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            로딩 중…
          </div>
        )}
        {error && (
          <div className="py-6 text-red-600 dark:text-red-400">{error}</div>
        )}
        {!loading && !error && stock && (
          <>
            {recentSnapshotsWithItem.length > 0 && (() => {
              const byDateDesc = [...recentSnapshotsWithItem].sort((a, b) =>
                b.snapshot.date.localeCompare(a.snapshot.date)
              )
              const latest = byDateDesc[0].item
              return (
                <>
                  <StockDetailCards item={latest} />
                  {recentSnapshotsWithItem.length >= 2 && (() => {
                    const shortDate = (s: string) => {
                      const [, m, d] = s.split('-')
                      return `${Number(m)}/${Number(d)}`
                    }
                    const byDateAsc = [...recentSnapshotsWithItem].sort((a, b) =>
                      a.snapshot.date.localeCompare(b.snapshot.date)
                    )
                    const TEN_MILLION = 10_000_000
                    const chartData = byDateAsc.map(({ snapshot, item }) => ({
                      date: shortDate(snapshot.date),
                      fullDate: snapshot.date,
                      value: item.valuationAmount / TEN_MILLION,
                      actualValue: item.valuationAmount,
                    }))
                    const max천만 = Math.max(...chartData.map((d) => d.value), 1)
                    const yMax = Math.ceil(max천만 * 1.2) || 10
                    const first = byDateAsc[0]
                    const latest = byDateAsc[byDateAsc.length - 1]
                    const prev = byDateAsc.length >= 2 ? byDateAsc[byDateAsc.length - 2] : null

                    const deltaFirst: { title: string; amount: number; pct: number } = {
                      title: '처음보다',
                      amount: latest.item.valuationAmount - first.item.valuationAmount,
                      pct:
                        first.item.valuationAmount !== 0
                          ? ((latest.item.valuationAmount - first.item.valuationAmount) /
                            first.item.valuationAmount) *
                          100
                          : 0,
                    }
                    const deltaPrev =
                      prev && byDateAsc.length >= 3
                        ? {
                          title: '저번보다',
                          amount: latest.item.valuationAmount - prev.item.valuationAmount,
                          pct:
                            prev.item.valuationAmount !== 0
                              ? ((latest.item.valuationAmount - prev.item.valuationAmount) /
                                prev.item.valuationAmount) *
                              100
                              : 0,
                        }
                        : null

                    const cardsToShow = [deltaFirst, deltaPrev].filter(
                      (c): c is NonNullable<typeof c> => c !== null
                    )

                    return (
                      <div className="mb-6">
                        <div className="rounded-2xl border border-gray-100 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 p-4 sm:p-6 mb-4">
                          <h2 className="text-base font-semibold mb-4" style={{ color: MAIN_COLOR }}>
                            평가금액 추이
                          </h2>
                          <ResponsiveContainer width="100%" height={240}>
                            <AreaChart
                              data={chartData}
                              margin={{ top: 8, right: 8, left: -8, bottom: 8 }}
                            >
                              <defs>
                                <linearGradient
                                  id="colorStockTrend"
                                  x1="0"
                                  y1="0"
                                  x2="0"
                                  y2="1"
                                >
                                  <stop offset="5%" stopColor={MAIN_COLOR} stopOpacity={0.8} />
                                  <stop offset="95%" stopColor={MAIN_COLOR} stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                className="stroke-gray-200 dark:stroke-gray-600"
                              />
                              <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                height={28}
                                className="text-gray-500 dark:text-gray-400"
                              />
                              <YAxis
                                width={52}
                                tick={{ fontSize: 11 }}
                                tickFormatter={(v) => `${v}천만`}
                                domain={[0, yMax]}
                                allowDecimals={false}
                                className="text-gray-500 dark:text-gray-400"
                              />
                              <Tooltip
                                formatter={(
                                  _value: number | undefined,
                                  _name: string | undefined,
                                  item: { payload?: { actualValue?: number } }
                                ) =>
                                  [formatNumber(item?.payload?.actualValue ?? 0), '평가금액']
                                }
                                contentStyle={{ fontSize: 12 }}
                                labelFormatter={(_, payload) =>
                                  payload?.[0]?.payload?.fullDate ?? ''
                                }
                              />
                              <Area
                                type="monotone"
                                dataKey="value"
                                stroke={MAIN_COLOR}
                                fill="url(#colorStockTrend)"
                                fillOpacity={1}
                                strokeWidth={2}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                        <h2 className="text-base font-semibold mb-3" style={{ color: MAIN_COLOR }}>
                          평가 손익차
                        </h2>
                        <div className="flex gap-4">
                          {cardsToShow.map((d) => {
                            const isUp = d.amount >= 0
                            return (
                              <div
                                key={d.title}
                                className="flex-1 min-w-0 rounded-2xl border border-gray-100 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 p-4"
                              >
                                <div className="text-sm font-medium mb-1" style={{ color: MAIN_COLOR }}>
                                  {d.title}
                                </div>
                                <div
                                  className={`text-lg sm:text-xl font-bold tabular-nums text-right ${isUp
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-rose-600 dark:text-rose-400'
                                    }`}
                                >
                                  {isUp ? '+ ' : ' '}
                                  {formatNumber(d.amount)}원
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 text-right">
                                  {d.pct >= 0 ? '+ ' : ''}
                                  {d.pct.toFixed(2)}%
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })()}
                  <StockSnapshotTable
                    items={recentSnapshotsWithItem}
                    accentColor={MAIN_COLOR}
                  />
                </>
              )
            })()}
            {recentSnapshotsWithItem.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                해당 종목의 스냅샷 데이터가 없습니다.
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
