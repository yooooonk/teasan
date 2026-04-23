import { NextRequest, NextResponse } from 'next/server'

type SymbolInfo = {
  symbol: string
  isGold: boolean
  isOverseas: boolean
}

function toYahooSymbol(stockCode: string): SymbolInfo | null {
  const parts = stockCode.trim().split(/\s+/)
  if (parts.length < 2) return null
  const market = parts[0].toUpperCase()
  const code = parts.slice(1).join('')

  switch (market) {
    case 'KOSPI':
      return { symbol: `${code}.KS`, isGold: false, isOverseas: false }
    case 'KOSDAQ':
      return { symbol: `${code}.KQ`, isGold: false, isOverseas: false }
    case 'ETF':
      return { symbol: `${code}.KS`, isGold: false, isOverseas: false }
    case 'NASDAQ':
    case 'NYSE':
      return { symbol: code, isGold: false, isOverseas: true }
    case 'KRX':
      if (code === 'GOLD') return { symbol: 'GC=F', isGold: true, isOverseas: false }
      return { symbol: `${code}.KS`, isGold: false, isOverseas: false }
    default:
      return null
  }
}

async function fetchYahooPrice(symbol: string): Promise<number | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' },
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = await res.json()
    const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice
    return typeof price === 'number' ? price : null
  } catch {
    return null
  }
}

type PriceResult = {
  price: number | null
  exchangeRate?: number
}

export async function POST(req: NextRequest) {
  try {
    const { codes } = (await req.json()) as { codes: string[] }

    if (!Array.isArray(codes) || codes.length === 0) {
      return NextResponse.json({ ok: false, error: '종목 코드가 없습니다.' }, { status: 400 })
    }

    const symbolMap = new Map<string, SymbolInfo>()
    for (const code of codes) {
      const info = toYahooSymbol(code)
      if (info) symbolMap.set(code, info)
    }

    const needsKrwRate = Array.from(symbolMap.values()).some((i) => i.isGold || i.isOverseas)
    const krwRatePromise = needsKrwRate ? fetchYahooPrice('KRW=X') : Promise.resolve(null)

    const pricePromises = Array.from(symbolMap.entries()).map(async ([code, info]) => {
      const price = await fetchYahooPrice(info.symbol)
      return { code, price, info }
    })

    const [priceResults, krwRate] = await Promise.all([Promise.all(pricePromises), krwRatePromise])

    const data: Record<string, PriceResult> = {}

    for (const { code, price, info } of priceResults) {
      if (info.isGold) {
        // GC=F(USD/트로이온스) → KRW/g 변환
        if (price !== null && krwRate !== null) {
          data[code] = { price: Math.round((price * krwRate) / 31.1035) }
        } else {
          data[code] = { price: null }
        }
      } else if (info.isOverseas) {
        data[code] = {
          price,
          exchangeRate: krwRate !== null ? Math.round(krwRate) : undefined,
        }
      } else {
        data[code] = { price }
      }
    }

    return NextResponse.json({ ok: true, data })
  } catch (error) {
    console.error('Error fetching prices:', error)
    return NextResponse.json({ ok: false, error: '시세 조회 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
