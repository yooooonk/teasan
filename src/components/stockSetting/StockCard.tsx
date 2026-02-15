'use client'

import { AssetGroup, Stock } from '@/types/stock';
import { HiPencil, HiTrash } from 'react-icons/hi';

// 자산군별 색상 팔레트 (요청 팔레트)
// #CDB4DB, #FFC8DD, #FFAFCC, #BDE0FE, #A2D2FF
const assetGroupColors: Record<AssetGroup, { bg: string; border: string; text: string }> = {
    '연금': {
        bg: '#CDB4DB',
        border: '#BDE0FE',
        text: '#2B2D42',
    },
    '금': {
        bg: '#FFC8DD',
        border: '#FFAFCC',
        text: '#2B2D42',
    },
    '해외주식': {
        bg: '#BDE0FE',
        border: '#A2D2FF',
        text: '#2B2D42',
    },
    '국내주식': {
        bg: '#A2D2FF',
        border: '#BDE0FE',
        text: '#2B2D42',
    },
};

interface StockCardProps {
    stock: Stock
    onEdit: (stock: Stock) => void
    onDelete: (id: string) => void
}

export default function StockCard({ stock, onEdit, onDelete }: StockCardProps) {
    const colors = assetGroupColors[stock.assetGroup]

    return (
        <div
            className="rounded-lg p-3 flex items-center gap-4 hover:shadow-md transition-shadow"
            style={{
                backgroundColor: colors.bg,
                // CSS 변수로 텍스트/아이콘 색을 통일 (테마 팔레트)
                ['--card-text' as any]: colors.text,
                ['--card-icon' as any]: colors.text,
                ['--card-icon-edit-hover' as any]: '#3D2B4A',
                ['--card-icon-delete-hover' as any]: '#4A1F2E',
            }}
        >
            {/* 가로 레이아웃: 종목명+코드, 자산군+계좌종류 */}
            <div className="flex-1 flex items-center gap-4 min-w-0 pr-2">
                {/* 종목명 (크게) + 코드 (작게) */}
                <div className="flex-[2] min-w-28">
                    <div
                        className="font-semibold text-base truncate text-[color:var(--card-text)]"
                    >
                        {stock.stockName}
                    </div>
                    <div
                        className="text-xs truncate mt-0.5 opacity-80 text-[color:var(--card-text)]"
                    >
                        {stock.stockCode || '-'}
                    </div>
                </div>

                {/* 자산군 (크게) + 계좌종류 (작게) */}
                <div className="flex-1 min-w-20">
                    <div
                        className="text-sm font-medium truncate text-[color:var(--card-text)]"
                    >
                        {stock.assetGroup}
                    </div>
                    <div
                        className="text-xs truncate mt-0.5 opacity-70 text-[color:var(--card-text)]"
                    >
                        {stock.accountType}
                    </div>
                </div>
            </div>

            {/* 오른쪽: 액션 아이콘 */}
            <div className="flex gap-0.5">
                <button
                    onClick={() => onEdit(stock)}
                    className="p-1 min-w-0 min-h-0 hover:bg-white/50 rounded-lg transition-colors text-[color:var(--card-icon)] hover:text-[color:var(--card-icon-edit-hover)]"
                    aria-label="수정"
                >
                    <HiPencil />
                </button>
                <button
                    onClick={() => onDelete(stock.id)}
                    className="p-1 min-w-0 min-h-0 hover:bg-white/50 rounded-lg transition-colors text-[color:var(--card-icon)] hover:text-[color:var(--card-icon-delete-hover)]"
                    aria-label="삭제"
                >
                    <HiTrash />
                </button>
            </div>
        </div>
    )
}

