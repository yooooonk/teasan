'use client'

import { useState, useEffect } from 'react'
import { StockMetadata, CreateMetadataRequest } from '@/types/metadata'
import { formatNumber } from '@/lib/calculations'

export default function MetadataPage() {
  const [stocks, setStocks] = useState<StockMetadata[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAssetType, setFilterAssetType] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingStock, setEditingStock] = useState<StockMetadata | null>(null)
  const [formData, setFormData] = useState<CreateMetadataRequest>({
    name: '',
    code: '',
    assetType: '',
    currency: 'KRW',
    accountName: '',
  })

  // 메타데이터 로드
  const loadMetadata = async () => {
    try {
      const res = await fetch('/api/metadata')
      const data = await res.json()
      if (data.ok) {
        setStocks(data.data)
      }
    } catch (error) {
      console.error('Error loading metadata:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMetadata()
  }, [])

  // 필터링된 종목 목록
  const filteredStocks = stocks.filter((stock) => {
    const matchesSearch =
      stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.accountName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesAssetType = !filterAssetType || stock.assetType === filterAssetType
    return matchesSearch && matchesAssetType
  })

  // 자산 종류 목록
  const assetTypes = Array.from(new Set(stocks.map((s) => s.assetType))).filter(Boolean)

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      assetType: '',
      currency: 'KRW',
      accountName: '',
    })
    setEditingStock(null)
    setShowForm(false)
  }

  // 저장
  const handleSave = async () => {
    try {
      const url = editingStock ? '/api/metadata' : '/api/metadata'
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
        await loadMetadata()
        resetForm()
      } else {
        alert(data.error || '저장 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Error saving metadata:', error)
      alert('저장 중 오류가 발생했습니다.')
    }
  }

  // 수정 시작
  const handleEdit = (stock: StockMetadata) => {
    setEditingStock(stock)
    setFormData({
      name: stock.name,
      code: stock.code,
      assetType: stock.assetType,
      currency: stock.currency,
      accountName: stock.accountName,
    })
    setShowForm(true)
  }

  // 삭제
  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const res = await fetch(`/api/metadata?id=${id}`, {
        method: 'DELETE',
      })

      const data = await res.json()
      if (data.ok) {
        await loadMetadata()
      } else {
        alert(data.error || '삭제 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Error deleting metadata:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>
  }

  return (
    <div className="px-4 py-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          메타데이터 관리
        </h1>
        <button
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 font-medium min-h-[44px]"
        >
          추가
        </button>
      </div>

      {/* 검색 및 필터 */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="검색 (종목명, 코드, 계좌명)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
        />
        <select
          value={filterAssetType}
          onChange={(e) => setFilterAssetType(e.target.value)}
          className="px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
        >
          <option value="">전체 자산구분</option>
          {assetTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* 폼 */}
      {showForm && (
        <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">
            {editingStock ? '수정' : '추가'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                종목명 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                종목코드 *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                자산구분 *
              </label>
              <input
                type="text"
                value={formData.assetType}
                onChange={(e) => setFormData({ ...formData, assetType: e.target.value })}
                placeholder="예: 주식, 채권, 현금"
                className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                통화 *
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="KRW">KRW</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="JPY">JPY</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                계좌명 *
              </label>
              <input
                type="text"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 font-medium min-h-[44px]"
            >
              저장
            </button>
            <button
              onClick={resetForm}
              className="flex-1 px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 font-medium min-h-[44px]"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 목록 - 모바일 카드, 데스크톱 테이블 */}
      {filteredStocks.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center text-gray-500 dark:text-gray-400">
          데이터가 없습니다.
        </div>
      ) : (
        <>
          {/* 모바일 카드 뷰 */}
          <div className="md:hidden space-y-3">
            {filteredStocks.map((stock) => (
              <div
                key={stock.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {stock.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stock.code}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(stock)}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 min-h-[36px]"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(stock.id)}
                      className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 active:bg-red-800 min-h-[36px]"
                    >
                      삭제
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">자산구분:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{stock.assetType}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">통화:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{stock.currency}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500 dark:text-gray-400">계좌명:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{stock.accountName}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 데스크톱 테이블 뷰 */}
          <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    종목명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    종목코드
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    자산구분
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    통화
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    계좌명
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredStocks.map((stock) => (
                  <tr key={stock.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {stock.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {stock.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {stock.assetType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {stock.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {stock.accountName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(stock)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(stock.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

