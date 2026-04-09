import NavWrapper from '@/components/ui/NavWrapper'
import ContentArea from '@/components/ui/ContentArea'
import type { Metadata } from 'next'
import { Single_Day } from 'next/font/google'
import './globals.css'

const singleDay = Single_Day({
  weight: '400',
  display: 'swap',
})

export const metadata: Metadata = {
  title: '투자 대시보드',
  description: '자산별, 계좌별, 종목별 비중 및 자산 변화 추이 시각화',
  manifest: '/manifest.json',
  themeColor: '#E8A4BC',
  appleWebApp: {
    capable: true,
    title: '투자대시보드',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={singleDay.className}>
        <main className="min-h-screen pb-28 sm:pb-32">
          <ContentArea>{children}</ContentArea>
        </main>
        <NavWrapper />
      </body>
    </html>
  )
}
