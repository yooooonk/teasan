'use client'

import { useState, useEffect } from 'react'
import { Stock } from '@/types/stock'
import { CreateSnapshotRequest } from '@/types/snapshot'
import { calculateSnapshotItem, formatNumber, formatReturnRate } from '@/lib/calculations'
import { format } from 'date-fns'

interface SnapshotItemForm {
  stockId: string
  currentPrice: number
  averagePrice: number
  quantity: number
  exchangeRate: number
  purchaseAmount?: number
  valuationAmount?: number
  gainLoss?: number
}

export default function SnapshotPage() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [items, setItems] = useState<SnapshotItemForm[]>([])
  const [selectedStockId, setSelectedStockId] = useState('')

  // 종목 로드
  const loadStocks = async () => {
    try {
      const res = await fetch('/api/stock')
      const data = await res.json()
      if (data.ok) {
        setStocks(data.data)
      }
    } catch (error) {
      console.error('Error loading stocks:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStocks()
  }, [])

  // 종목 추가
  const handleAddStock = () => {
    if (!selectedStockId) return

    const stock = stocks.find((s) => s.id === selectedStockId)
    if (!stock) return

    // 이미 추가된 종목인지 확인
    if (items.some((item) => item.stockId === selectedStockId)) {
      alert('이미 추가된 종목입니다.')
      return
    }

    const newItem: SnapshotItemForm = {
      stockId: selectedStockId,
      currentPrice: 0,
      averagePrice: 0,
      quantity: 0,
      exchangeRate: 1, // 기본값 1
    }

    setItems([...items, newItem])
    setSelectedStockId('')
  }

  // 아이템 업데이트
  const handleItemChange = (index: number, field: keyof SnapshotItemForm, value: number | string) => {
    const newItems = [...items]
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    }

    // 계산
    const item = newItems[index]
    if (item.currentPrice && item.averagePrice && item.quantity && item.exchangeRate) {
      const calculated = calculateSnapshotItem(
        item.currentPrice,
        item.averagePrice,
        item.quantity,
        item.exchangeRate
      )
      newItems[index] = {
        ...item,
        ...calculated,
      }
    }

    setItems(newItems)
  }

  // 아이템 삭제
  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  // 저장
  const handleSave = async () => {
    if (!date) {
      alert('날짜를 입력해주세요.')
      return
    }

    if (items.length === 0) {
      alert('최소 하나의 종목을 추가해주세요.')
      return
    }

    // 유효성 검사
    for (const item of items) {
      if (!item.currentPrice || !item.averagePrice || !item.quantity) {
        alert('모든 필드를 입력해주세요.')
        return
      }
    }

    try {
      const requestData: CreateSnapshotRequest = {
        date,
        items: items.map((item) => ({
          stockId: item.stockId,
          currentPrice: item.currentPrice,
          averagePrice: item.averagePrice,
          quantity: item.quantity,
          exchangeRate: item.exchangeRate,
        })),
      }

      const res = await fetch('/api/snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      })

      const data = await res.json()
      if (data.ok) {
        alert('저장되었습니다.')
        setItems([])
        setDate(format(new Date(), 'yyyy-MM-dd'))
      } else {
        alert(data.error || '저장 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Error saving snapshot:', error)
      alert('저장 중 오류가 발생했습니다.')
    }
  }

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>
  }

  return (
    <div className="px-4 py-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        스냅샷 입력
      </h1>

      {/* 날짜 선택 */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 dark:text-gray-300">
          날짜 *
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* 종목 추가 */}
      <div className="mb-4 flex gap-2">
        <select
          value={selectedStockId}
          onChange={(e) => setSelectedStockId(e.target.value)}
          className="flex-1 px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
        >
          <option value="">종목 선택</option>
          {stocks
            .filter((stock) => !items.some((item) => item.stockId === stock.id))
            .map((stock) => (
              <option key={stock.id} value={stock.id}>
                {stock.stockName} - {stock.accountType} ({stock.assetGroup})
              </option>
            ))}
        </select>
        <button
          onClick={handleAddStock}
          disabled={!selectedStockId}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium min-h-[44px]"
        >
          추가
        </button>
      </div>

      {/* 아이템 목록 - 모바일 카드, 데스크톱 테이블 */}
      {items.length > 0 && (
        <div className="mb-4">
          {/* 모바일 카드 뷰 */}
          <div className="md:hidden space-y-4">
            {items.map((item, index) => {
              const stock = stocks.find((s) => s.id === item.stockId)
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {stock?.stockName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {stock?.accountType} - {stock?.assetGroup}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 active:bg-red-800 min-h-[36px]"
                    >
                      삭제
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1 dark:text-gray-300">현재가</label>
                      <input
                        type="number"
                        value={item.currentPrice || ''}
                        onChange={(e) =>
                          handleItemChange(index, 'currentPrice', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1 dark:text-gray-300">평균단가</label>
                      <input
                        type="number"
                        value={item.averagePrice || ''}
                        onChange={(e) =>
                          handleItemChange(index, 'averagePrice', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1 dark:text-gray-300">수량</label>
                      <input
                        type="number"
                        value={item.quantity || ''}
                        onChange={(e) =>
                          handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1 dark:text-gray-300">환율</label>
                      <input
                        type="number"
                        value={item.exchangeRate || ''}
                        onChange={(e) =>
                          handleItemChange(index, 'exchangeRate', parseFloat(e.target.value) || 1)
                        }
                        className="w-full px-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">매입금액</div>
                      <div className="text-gray-900 dark:text-white font-medium">
                        {item.purchaseAmount ? formatNumber(item.purchaseAmount) : '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">평가금액</div>
                      <div className="text-gray-900 dark:text-white font-medium">
                        {item.valuationAmount ? formatNumber(item.valuationAmount) : '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">평가손익</div>
                      <div
                        className={`font-medium ${
                          item.gainLoss && item.gainLoss >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {item.gainLoss !== undefined
                          ? `${item.gainLoss >= 0 ? '+' : ''}${formatNumber(item.gainLoss)}`
                          : '-'}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* 데스크톱 테이블 뷰 */}
          <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    종목
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    현재가
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    평균단가
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    수량
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    환율
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    매입금액
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    평가금액
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    평가손익
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {items.map((item, index) => {
                  const stock = stocks.find((s) => s.id === item.stockId)
                  return (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {stock?.stockName}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">
                          {stock?.accountType} - {stock?.assetGroup}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.currentPrice || ''}
                          onChange={(e) =>
                            handleItemChange(index, 'currentPrice', parseFloat(e.target.value) || 0)
                          }
                          className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white text-sm"
                          step="0.01"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.averagePrice || ''}
                          onChange={(e) =>
                            handleItemChange(index, 'averagePrice', parseFloat(e.target.value) || 0)
                          }
                          className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white text-sm"
                          step="0.01"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.quantity || ''}
                          onChange={(e) =>
                            handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)
                          }
                          className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white text-sm"
                          step="0.01"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.exchangeRate || ''}
                          onChange={(e) =>
                            handleItemChange(index, 'exchangeRate', parseFloat(e.target.value) || 1)
                          }
                          className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white text-sm"
                          step="0.01"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {item.purchaseAmount ? formatNumber(item.purchaseAmount) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {item.valuationAmount ? formatNumber(item.valuationAmount) : '-'}
                      </td>
                      <td
                        className={`px-4 py-3 text-sm font-medium ${
                          item.gainLoss && item.gainLoss >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {item.gainLoss !== undefined
                          ? `${item.gainLoss >= 0 ? '+' : ''}${formatNumber(item.gainLoss)}`
                          : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 저장 버튼 */}
      {items.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 font-medium min-h-[44px]"
          >
            저장
          </button>
        </div>
      )}

      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          종목을 추가해주세요.
        </div>
      )}
    </div>
  )
}

