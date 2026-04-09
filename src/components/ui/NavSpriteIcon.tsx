'use client'

import { navSpriteStyle, type NavSpriteCell } from '@/lib/navSprite'
import type { CSSProperties } from 'react'

type NavSpriteIconProps = {
  cell: NavSpriteCell
  sizePx: number
  className?: string
  /** 빨간 원 위에 올릴 때 실루엣을 흰색에 가깝게 */
  variant?: 'default' | 'onPrimary'
}

export default function NavSpriteIcon({
  cell,
  sizePx,
  className = '',
  variant = 'default',
}: NavSpriteIconProps) {
  const base = navSpriteStyle(cell, sizePx)
  const filter: CSSProperties =
    variant === 'onPrimary'
      ? {
          filter: 'brightness(0) invert(1)',
          opacity: 0.95,
        }
      : {}

  return (
    <span
      className={`inline-block ${className}`}
      style={{ ...base, ...filter }}
      aria-hidden
    />
  )
}
