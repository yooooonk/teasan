'use client'

import { usePathname } from 'next/navigation'
import BottomNavigation from './BottomNavigation'

export default function NavWrapper() {
  const pathname = usePathname()
  if (pathname === '/login') return null
  return <BottomNavigation />
}
