'use client'

import { AssetGroup } from '@/types/stock'

interface TargetFormProps {
  targets: Record<AssetGroup, number>
  onChange: (assetGroup: AssetGroup, value: number) => void
  onSave: () => void
  onCancel: () => void
}

const assetGroups: AssetGroup[] = ['연금', '금', '해외주식', '국내주식']

const assetGroupLabels: Record<AssetGroup, string> = {
  연금: '연금',
  금: '금',
  해외주식: '해외주식',
  국내주식: '국내주식',
}

export default function TargetForm({
  targets,
  onChange,
  onSave,
  onCancel,
}: TargetFormProps) {
  return (
    <div className="mb-6 p-6 bg-white/80 rounded-xl shadow-sm backdrop-blur-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assetGroups.map((group) => (
          <div key={group}>
            <label className="block text-sm font-medium mb-2">
              {assetGroupLabels[group]} 목표금액 (만원) *
            </label>
            <input
              type="number"
              value={targets[group] || ''}
              onChange={(e) =>
                onChange(group, parseFloat(e.target.value) || 0)
              }
              placeholder="목표금액을 입력하세요 (만원)"
              className="w-full px-4 py-3 text-base bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
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

