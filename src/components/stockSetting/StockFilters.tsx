'use client'

import { AssetGroup, AccountType } from '@/types/stock'

interface StockFiltersProps {
  searchTerm: string
  filterAccountType: AccountType | ''
  filterAssetGroup: AssetGroup | ''
  accountTypes: AccountType[]
  assetGroups: AssetGroup[]
  onSearchChange: (value: string) => void
  onAccountTypeChange: (value: AccountType | '') => void
  onAssetGroupChange: (value: AssetGroup | '') => void
}

export default function StockFilters({
  searchTerm,
  filterAccountType,
  filterAssetGroup,
  accountTypes,
  assetGroups,
  onSearchChange,
  onAccountTypeChange,
  onAssetGroupChange,
}: StockFiltersProps) {
  return (
    <div className="mb-4 flex flex-col sm:flex-row gap-3">
      <input
        type="text"
        placeholder="종목명 검색"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1 px-4 py-3 text-base border border-gray-300 rounded-lg"
      />
      <select
        value={filterAccountType}
        onChange={(e) => onAccountTypeChange(e.target.value as AccountType | '')}
        className="px-4 py-3 text-base border border-gray-300 rounded-lg"
      >
        <option value="">전체 계좌종류</option>
        {accountTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
      <select
        value={filterAssetGroup}
        onChange={(e) => onAssetGroupChange(e.target.value as AssetGroup | '')}
        className="px-4 py-3 text-base border border-gray-300 rounded-lg"
      >
        <option value="">전체 자산군</option>
        {assetGroups.map((group) => (
          <option key={group} value={group}>
            {group}
          </option>
        ))}
      </select>
    </div>
  )
}


