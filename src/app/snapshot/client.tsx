'use client'

import SnapshotDateInput from '@/components/snapshot/SnapshotDateInput'
import SnapshotSaveButton from '@/components/snapshot/SnapshotSaveButton'
import SnapshotStockList from '@/components/snapshot/SnapshotStockList'
import { CreateSnapshotRequest, SnapshotItemForm } from '@/types/snapshot'
import type { Snapshot } from '@/types/snapshot'
import { Stock } from '@/types/stock'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'

export default function SnapshotClient() {
    const [stocks, setStocks] = useState<Stock[]>([])
    const [loading, setLoading] = useState(true)
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
    const [items, setItems] = useState<SnapshotItemForm[]>([])

    // 종목 로드 + 마지막 스냅샷으로 기본값 채우기
    const loadStocks = async () => {
        try {
            const [stockRes, snapshotsRes] = await Promise.all([
                fetch('/api/stock'),
                fetch('/api/snapshots'),
            ])
            const stockData = await stockRes.json()
            const snapshotsData = await snapshotsRes.json()

            if (!stockData.ok || !stockData.data) {
                setLoading(false)
                return
            }

            const stocksList = stockData.data as Stock[]
            setStocks(stocksList)

            const latestSnapshot: Snapshot | null =
                snapshotsData.ok && Array.isArray(snapshotsData.data) && snapshotsData.data.length > 0
                    ? (snapshotsData.data[0] as Snapshot)
                    : null

            const initialItems: SnapshotItemForm[] = stocksList.map((stock: Stock) => {
                const prev = latestSnapshot?.items.find((i) => i.stockId === stock.id)
                return {
                    ...stock,
                    currentPrice: prev?.currentPrice ?? 0,
                    averagePrice: prev?.averagePrice ?? 0,
                    quantity: prev?.quantity ?? 0,
                    exchangeRate: prev?.exchangeRate ?? (stock.assetGroup === '해외주식' ? 1 : 1),
                    purchaseAmount:
                        stock.assetGroup === '금' ? (prev?.purchaseAmount ?? 0) : undefined,
                }
            })
            setItems(initialItems)
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
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
                스냅샷 입력
            </h1>

            <SnapshotDateInput date={date} onChange={setDate} />
            <SnapshotStockList items={items} onItemChange={handleItemChange} />
            <SnapshotSaveButton onClick={handleSave} />
        </div>
    )
}
