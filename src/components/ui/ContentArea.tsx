'use client'

import { usePathname } from 'next/navigation'

export default function ContentArea({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isStockDetail = pathname?.match(/^\/trends\/stock\/[^/]+$/)

  if (isStockDetail) {
    return <>{children}</>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      {children}
    </div>
  )
}
