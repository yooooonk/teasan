'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { GrHomeRounded, GrLineChart, GrMultiple, GrPaint, GrVirtualStorage } from 'react-icons/gr'

const ACTIVE_BG = '#EE6B6B'
const PINK_ACTIVE = '#F7A8B7'
const APP_BG = '#FFFBF7'

const navItems = [
    { href: '/', label: '대시보드', icon: GrHomeRounded },
    { href: '/trends', label: '추이', icon: GrLineChart },
    { href: '/snapshot', label: '스냅샷', icon: GrMultiple },
    { href: '/stockSetting', label: '종목 관리', icon: GrVirtualStorage },
    { href: '/history', label: '기록', icon: GrPaint },
]

const CENTER_INDEX = 2

export default function BottomNavigation() {
    const pathname = usePathname()
    const activeIndex = navItems.findIndex(
        (item) =>
            pathname === item.href ||
            (item.href !== '/' && pathname?.startsWith(item.href))
    )

    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-50 safe-area-inset-bottom px-4 pb-4"
            style={{ backgroundColor: APP_BG }}
        >
            <nav className="relative bg-white rounded-[2rem] rounded-b-[2.5rem] shadow-xl max-w-md mx-auto overflow-visible min-h-[72px]">
                {/* 노치: 가운데만 반원으로 파인 부분 – 원과 메뉴 사이 둥근 공백 */}
                <div
                    className="absolute left-0 right-0 pointer-events-none z-[1]"
                    style={{ top: -44, height: 44 }}
                >
                    <div
                        className="absolute w-[88px] h-[88px] rounded-full"
                        style={{
                            backgroundColor: APP_BG,
                            left: `calc(${((CENTER_INDEX + 0.5) / navItems.length) * 100}% - 44px)`,
                            top: 0,
                        }}
                    />
                </div>
                <div className="relative z-10 flex justify-around items-end min-h-[72px] px-1 pb-2 pt-1">
                    {navItems.map((item, index) => {
                        const isCenter = index === CENTER_INDEX
                        const isActive = index === activeIndex

                        if (isCenter) {
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex flex-col items-center justify-end flex-1 min-w-0 px-1 pt-0 pb-2 -mt-7 transition-all duration-200"
                                >
                                    <span
                                        className="inline-flex items-center justify-center mb-1.5 w-[52px] h-[52px] rounded-full flex-shrink-0 transition-shadow duration-200"
                                        style={{
                                            backgroundColor: ACTIVE_BG,
                                            color: 'white',
                                            boxShadow: isActive
                                                ? '0 4px 12px rgba(0,0,0,0.15)'
                                                : '0 2px 8px rgba(0,0,0,0.1)',
                                        }}
                                    >
                                        {typeof item.icon === 'function' ? (
                                            <item.icon className="w-6 h-6" style={{ color: 'white' }} />
                                        ) : (
                                            <span className="text-xl">{item.icon}</span>
                                        )}
                                    </span>
                                    <span
                                        className={`text-[10px] font-medium truncate w-full text-center ${
                                            isActive ? 'text-gray-800 font-semibold' : 'text-gray-400'
                                        }`}
                                    >
                                        {item.label}
                                    </span>
                                </Link>
                            )
                        }

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex flex-col items-center justify-end flex-1 min-w-0 px-1 pt-2 transition-all duration-200"
                            >
                                <span
                                    className="inline-flex items-center justify-center mb-0.5 w-10 h-10 rounded-full"
                                    style={{ color: isActive ? PINK_ACTIVE : '#9CA3AF' }}
                                >
                                    {typeof item.icon === 'function' ? (
                                        <item.icon
                                            className={isActive ? 'w-6 h-6' : 'w-5 h-5'}
                                            style={{ color: isActive ? PINK_ACTIVE : undefined }}
                                        />
                                    ) : (
                                        <span className="text-xl">{item.icon}</span>
                                    )}
                                </span>
                                <span
                                    className={`text-[10px] font-medium truncate w-full text-center ${isActive ? 'font-semibold' : 'font-normal'
                                        }`}
                                    style={{ color: isActive ? PINK_ACTIVE : '#9CA3AF' }}
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

