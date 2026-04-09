import type { AssetGroup } from '@/types/stock'

export type AssetGroupCardColors = Record<
  AssetGroup,
  { bg: string; border: string; text: string }
>

export type AssetGroupChartColors = Record<
  AssetGroup,
  { primary: string; secondary: string }
>

export const ASSET_GROUP_CARD_COLORS: AssetGroupCardColors = {
  연금: {
    bg: 'var(--tint-sky)',
    border: 'var(--theme-sky)',
    text: 'var(--theme-text)',
  },
  금: {
    bg: 'var(--tint-yellow)',
    border: 'var(--theme-yellow)',
    text: 'var(--theme-text)',
  },
  해외주식: {
    bg: 'var(--tint-pink)',
    border: 'var(--theme-primary)',
    text: 'var(--theme-text)',
  },
  국내주식: {
    bg: 'var(--tint-mint)',
    border: 'var(--theme-mint)',
    text: 'var(--theme-text)',
  },
}

export const ASSET_GROUP_CHART_COLORS: AssetGroupChartColors = {
  // 진행바에서 같은 색상(Hue) 기반으로 톤만 다르게(수익 영역이 더 진하게)
  연금: {
    primary: 'var(--theme-sky)',
    secondary: 'color-mix(in srgb, var(--theme-sky) 90%, #000)',
  },
  금: {
    primary: 'var(--theme-yellow)',
    secondary: 'color-mix(in srgb, var(--theme-yellow) 90%, #000)',
  },
  해외주식: {
    primary: 'var(--theme-primary)',
    secondary: 'color-mix(in srgb, var(--theme-primary) 90%, #000)',
  },
  국내주식: {
    primary: 'var(--theme-mint)',
    secondary: 'color-mix(in srgb, var(--theme-mint) 90%, #000)',
  },
}

