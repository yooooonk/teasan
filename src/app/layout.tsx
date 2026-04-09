import NavWrapper from '@/components/ui/NavWrapper'
import ContentArea from '@/components/ui/ContentArea'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '투자 대시보드',
  description: '자산별, 계좌별, 종목별 비중 및 자산 변화 추이 시각화',
  manifest: '/manifest.json',
  themeColor: '#E8A4BC',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Gamja+Flower&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <main className="min-h-screen pb-28 sm:pb-32">
          <ContentArea>{children}</ContentArea>
        </main>
        <NavWrapper />
      </body>
    </html>
  )
}
