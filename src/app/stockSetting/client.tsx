'use client'

import StockCard from '@/components/stockSetting/StockCard'
import StockForm from '@/components/stockSetting/StockForm'
import { AccountType, AssetGroup, CreateStockRequest, Stock } from '@/types/stock'
import { useEffect, useState } from 'react'

const assetGroups: AssetGroup[] = ['연금', '금', '해외주식', '국내주식']
const accountTypes: AccountType[] = ['연금저축계좌', '퇴직연금IRP', '금현물', '일반', 'ISA']

export default function StockSettingClient() {
    const [stocks, setStocks] = useState<Stock[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterAccountType, setFilterAccountType] = useState<AccountType | ''>('')
    const [filterAssetGroup, setFilterAssetGroup] = useState<AssetGroup | ''>('')
    const [showForm, setShowForm] = useState(false)
    const [editingStock, setEditingStock] = useState<Stock | null>(null)
    const [formData, setFormData] = useState<CreateStockRequest>({
        stockCode: '',
        assetGroup: '연금',
        accountType: '연금저축계좌',
        stockName: '',
    })

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

    // 필터링된 종목 목록
    const filteredStocks = stocks.filter((stock) => {
        const matchesSearch =
            stock.stockName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (stock.stockCode && stock.stockCode.toLowerCase().includes(searchTerm.toLowerCase()))
        const matchesAccountType = !filterAccountType || stock.accountType === filterAccountType
        const matchesAssetGroup = !filterAssetGroup || stock.assetGroup === filterAssetGroup
        return matchesSearch && matchesAccountType && matchesAssetGroup
    })

    // 폼 초기화
    const resetForm = () => {
        setFormData({
            stockCode: '',
            assetGroup: '연금',
            accountType: '연금저축계좌',
            stockName: '',
        })
        setEditingStock(null)
        setShowForm(false)
    }

    // 저장
    const handleSave = async () => {
        if (!formData.stockName.trim()) {
            alert('종목명을 입력해주세요.')
            return
        }
        if (!formData.stockCode.trim()) {
            alert('종목코드를 입력해주세요.')
            return
        }

        try {
            const url = '/api/stock'
            const method = editingStock ? 'PUT' : 'POST'
            const body = editingStock
                ? { id: editingStock.id, ...formData }
                : formData

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })

            const data = await res.json()
            if (data.ok) {
                await loadStocks()
                resetForm()
            } else {
                alert(data.error || '저장 중 오류가 발생했습니다.')
            }
        } catch (error) {
            console.error('Error saving stock:', error)
            alert('저장 중 오류가 발생했습니다.')
        }
    }

    // 수정 시작
    const handleEdit = (stock: Stock) => {
        setEditingStock(stock)
        setFormData({
            stockCode: stock.stockCode || '',
            assetGroup: stock.assetGroup,
            accountType: stock.accountType,
            stockName: stock.stockName,
        })
        setShowForm(true)
    }

    // 삭제
    const handleDelete = async (id: string) => {
        if (!confirm('정말 삭제하시겠습니까?')) return

        try {
            const res = await fetch(`/api/stock?id=${id}`, {
                method: 'DELETE',
            })

            const data = await res.json()
            if (data.ok) {
                await loadStocks()
            } else {
                alert(data.error || '삭제 중 오류가 발생했습니다.')
            }
        } catch (error) {
            console.error('Error deleting stock:', error)
            alert('삭제 중 오류가 발생했습니다.')
        }
    }

    if (loading) {
        return <div className="text-center py-8">로딩 중...</div>
    }

    return (
        <div className="px-4 py-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-900">
                    종목 관리
                </h1>
                <button
                    onClick={() => {
                        resetForm()
                        setShowForm(true)
                    }}
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
                    추가
                </button>
            </div>

            {/* 입력 폼 (위쪽 카드) */}
            {showForm && (
                <StockForm
                    formData={formData}
                    editing={!!editingStock}
                    assetGroups={assetGroups}
                    accountTypes={accountTypes}
                    onChange={setFormData}
                    onSave={handleSave}
                    onCancel={resetForm}
                />
            )}


            {/* 리스트 카드 영역 */}
            <div className="bg-white/80 rounded-xl shadow-sm p-6 backdrop-blur-sm">

                {filteredStocks.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        데이터가 없습니다.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredStocks.map((stock) => (
                            <StockCard
                                key={stock.id}
                                stock={stock}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

