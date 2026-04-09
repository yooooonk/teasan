'use client'

import NavSpriteIcon from '@/components/ui/NavSpriteIcon'
import { NAV_SPRITE_CELLS } from '@/lib/navSprite'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
    { href: '/trends', label: '추이' },
    { href: '/snapshot', label: '스냅샷' },
    { href: '/', label: '대시보드' },
    { href: '/stockSetting', label: '종목 관리' },
    { href: '/history', label: '기록' },
]

export default function BottomNavigation() {
    const pathname = usePathname()
    const activeIndex = navItems.findIndex(
        (item) =>
            pathname === item.href ||
            (item.href !== '/' && pathname?.startsWith(item.href))
    )

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 safe-area-inset-bottom px-3 pb-3 bg-[var(--app-bg)]">
            <nav className="bg-[var(--nav-bar-bg)] rounded-[1.375rem] rounded-b-[1.75rem] shadow-xl max-w-md mx-auto">
                <div className="flex justify-around items-center min-h-[74px]">
                    {navItems.map((item, index) => {
                        const isActive = index === activeIndex
                        const cell = NAV_SPRITE_CELLS[index]

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex flex-col items-center justify-center flex-1 min-w-0 px-1 py-1 transition-all duration-200"
                            >
                                <span className="inline-flex items-center justify-center mb-1 w-[40px] h-[40px] min-w-[40px] min-h-[40px] rounded-lg">
                                    <NavSpriteIcon
                                        cell={cell}
                                        sizePx={45}
                                        className="opacity-100"
                                    />
                                </span>
                                <span
                                    className={`text-[11px] font-medium truncate w-full text-center ${isActive ? 'font-semibold' : 'font-normal'
                                        }`}
                                    style={{
                                        color: isActive
                                            ? 'var(--theme-primary-deep)'
                                            : 'var(--theme-text-muted)',
                                    }}
                                >
                                    {item.label}
                                </span>
                            </Link>
                        )
                    })}
                </div>
            </nav>
        </div>
    )
}
