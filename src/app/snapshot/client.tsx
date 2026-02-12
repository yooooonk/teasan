'use client'

import SnapshotDateInput from '@/components/snapshot/SnapshotDateInput'
import SnapshotSaveButton from '@/components/snapshot/SnapshotSaveButton'
import SnapshotStockList from '@/components/snapshot/SnapshotStockList'
import { CreateSnapshotRequest, SnapshotItemForm } from '@/types/snapshot'
import { Stock } from '@/types/stock'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'

export default function SnapshotClient() {
    const [stocks, setStocks] = useState<Stock[]>([])
    const [loading, setLoading] = useState(true)
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
    const [items, setItems] = useState<SnapshotItemForm[]>([])

    // 종목 로드
    const loadStocks = async () => {
        try {
            const res = await fetch('/api/stock')
            const data = await res.json()
            if (data.ok) {
                setStocks(data.data)
                // 모든 종목을 초기화하여 items에 추가
                const initialItems: SnapshotItemForm[] = data.data.map((stock: Stock) => ({
                    ...stock,
                    currentPrice: 0,
                    averagePrice: 0,
                    quantity: 0,
                    exchangeRate: stock.assetGroup === '해외주식' ? 1 : 1, // 기본값 1
                    purchaseAmount: stock.assetGroup === '금' ? 0 : undefined, // 금인 경우만 초기화
                }))
                setItems(initialItems)
            }
        } catch (error) {
            console.error('Error loading stocks:', error)
        } finally {
            setLoading(false)
        }
    }

    // 아이템 업데이트
    const handleItemChange = (index: number, updatedItem: SnapshotItemForm) => {
        const newItems = [...items]
        newItems[index] = updatedItem
        setItems(newItems)
    }

    // 저장
    const handleSave = async () => {
        if (!date) {
            alert('날짜를 입력해주세요.')
            return
        }

        // 입력값이 있는 종목만 필터링
        const validItems = items.filter((item) => {
            if (item.assetGroup === '금') {
                // 금인 경우: 현재가, 매입금액, 수량 필요
                return item.currentPrice > 0 && (item.purchaseAmount || 0) > 0 && item.quantity > 0
            } else {
                // 금이 아닌 경우: 현재가, 평균단가, 수량 필요
                return item.currentPrice > 0 && item.averagePrice > 0 && item.quantity > 0
            }
        })

        if (validItems.length === 0) {
            alert('최소 하나의 종목에 값을 입력해주세요.')
            return
        }

        try {
            const requestData: CreateSnapshotRequest = {
                date,
                items: validItems.map((item) => {
                    // 금인 경우 매입금액을 averagePrice 필드에 넣어서 전송 (API에서 처리)
                    if (item.assetGroup === '금') {
                        return {
                            stockId: item.id,
                            currentPrice: item.currentPrice,
                            averagePrice: item.purchaseAmount || 0, // 매입금액을 averagePrice 필드에 저장
                            quantity: item.quantity,
                            exchangeRate: 1,
                        }
                    } else {
                        return {
                            stockId: item.id,
                            currentPrice: item.currentPrice,
                            averagePrice: item.averagePrice,
                            quantity: item.quantity,
                            exchangeRate: item.exchangeRate || 1,
                        }
                    }
                }),
            }

            const res = await fetch('/api/snapshots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData),
            })

            const data = await res.json()
            if (data.ok) {
                alert('저장되었습니다.')
                // 입력값 초기화
                const resetItems: SnapshotItemForm[] = stocks.map((stock) => ({
                    ...stock,
                    currentPrice: 0,
                    averagePrice: 0,
                    quantity: 0,
                    exchangeRate: stock.assetGroup === '해외주식' ? 1 : 1,
                    purchaseAmount: stock.assetGroup === '금' ? 0 : undefined,
                }))
                setItems(resetItems)
                setDate(format(new Date(), 'yyyy-MM-dd'))
            } else {
                alert(data.error || '저장 중 오류가 발생했습니다.')
            }
        } catch (error) {
            console.error('Error saving snapshot:', error)
            alert('저장 중 오류가 발생했습니다.')
        }
    }

    useEffect(() => {
        loadStocks()
    }, [])

    if (loading) {
        return <div className="text-center py-8">로딩 중...</div>
    }

    return (
        <div className="px-4 py-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                스냅샷 입력
            </h1>

            <SnapshotDateInput date={date} onChange={setDate} />
            <SnapshotStockList items={items} onItemChange={handleItemChange} />
            <SnapshotSaveButton onClick={handleSave} />
        </div>
    )
}
