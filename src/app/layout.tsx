import BottomNavigation from '@/components/ui/BottomNavigation'
import ContentArea from '@/components/ui/ContentArea'
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
          <ContentArea>{children}</ContentArea>
        </main>
        <BottomNavigation />
      </body>
    </html>
  )
}
