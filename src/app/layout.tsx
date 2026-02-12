import BottomNavigation from '@/components/ui/BottomNavigation'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '투자 대시보드',
  description: '자산별, 계좌별, 종목별 비중 및 자산 변화 추이 시각화',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <main className="min-h-screen pb-24">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
        <BottomNavigation />
      </body>
    </html>
  )
}
