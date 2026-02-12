'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
    { href: '/', label: '대시보드', icon: '📊' },
    { href: '/trends', label: '추이', icon: '📈' },
    { href: '/snapshot', label: '스냅샷', icon: '➕' },
    { href: '/stockSetting', label: '종목 관리', icon: '📋' },
]

export default function BottomNavigation() {
    const pathname = usePathname()

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 safe-area-inset-bottom px-4 pb-4">
            <nav className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 max-w-md mx-auto">
                <div className="flex justify-around items-center h-16 px-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center justify-center flex-1 h-full min-w-0 px-2 transition-all duration-200 ${isActive
                                    ? 'text-gray-900 dark:text-white'
                                    : 'text-gray-400 dark:text-gray-500'
                                    }`}
                            >
                                <span className={`text-2xl mb-0.5 transition-transform ${isActive ? 'scale-110' : ''}`}>
                                    {item.icon}
                                </span>
                                <span className={`text-xs font-medium truncate w-full text-center ${isActive ? 'font-semibold' : 'font-normal'}`}>
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

