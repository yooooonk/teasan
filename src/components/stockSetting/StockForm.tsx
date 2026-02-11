'use client'

import { AccountType, AssetGroup, CreateStockRequest } from '@/types/stock'

interface StockFormProps {
    formData: CreateStockRequest
    editing: boolean
    assetGroups: AssetGroup[]
    accountTypes: AccountType[]
    onChange: (data: CreateStockRequest) => void
    onSave: () => void
    onCancel: () => void
}

export default function StockForm({
    formData,
    editing,
    assetGroups,
    accountTypes,
    onChange,
    onSave,
    onCancel,
}: StockFormProps) {
    return (
        <div className="mb-6 p-6 bg-white/80 dark:bg-gray-800 rounded-xl shadow-sm backdrop-blur-sm">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                        종목코드 *
                    </label>
                    <input
                        type="text"
                        value={formData.stockCode}
                        onChange={(e) => onChange({ ...formData, stockCode: e.target.value })}
                        placeholder="종목코드를 입력하세요"
                        className="w-full px-4 py-3 text-base bg-gray-50 dark:bg-gray-700 rounded-lg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                        종목명 *
                    </label>
                    <input
                        type="text"
                        value={formData.stockName}
                        onChange={(e) => onChange({ ...formData, stockName: e.target.value })}
                        placeholder="종목명을 입력하세요"
                        className="w-full px-4 py-3 text-base bg-gray-50 dark:bg-gray-700 rounded-lg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                        자산군 *
                    </label>
                    <select
                        value={formData.assetGroup}
                        onChange={(e) => onChange({ ...formData, assetGroup: e.target.value as AssetGroup })}
                        className="w-full px-4 py-3 text-base bg-gray-50 dark:bg-gray-700 rounded-lg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {assetGroups.map((group) => (
                            <option key={group} value={group}>
                                {group}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                        계좌종류 *
                    </label>
                    <select
                        value={formData.accountType}
                        onChange={(e) => onChange({ ...formData, accountType: e.target.value as AccountType })}
                        className="w-full px-4 py-3 text-base bg-gray-50 dark:bg-gray-700 rounded-lg dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {accountTypes.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="mt-6 flex gap-3">
                <button
                    onClick={onSave}
                    className="flex-1 px-6 py-2 text-white rounded-2xl font-medium min-h-[44px] transition-colors"
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
                    저장
                </button>
                <button
                    onClick={onCancel}
                    className="flex-1 px-6 py-2 rounded-2xl font-medium min-h-[44px] transition-colors"
                    style={{
                        backgroundColor: '#F6E6D0',
                        color: '#8B6F47',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#FFDFC3'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#F6E6D0'
                    }}
                    onMouseDown={(e) => {
                        e.currentTarget.style.backgroundColor = '#F3B5A0'
                    }}
                    onMouseUp={(e) => {
                        e.currentTarget.style.backgroundColor = '#F6E6D0'
                    }}
                >
                    취소
                </button>
            </div>
        </div>
    )
}

