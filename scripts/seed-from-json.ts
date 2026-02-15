/**
 * src/data/*.json 데이터를 Postgres DB에 시드합니다.
 * 실행: npx tsx scripts/seed-from-json.ts (또는 npm run seed)
 * 전제: .env.local에 POSTGRES_URL 설정, 001_initial_schema.sql 실행 후 002_widen_id_columns.sql 실행
 *
 * self-signed certificate 오류 시 (프록시/회사망): .env.local에 SEED_INSECURE_TLS=1 추가 후 실행
 */
import { config } from 'dotenv'
import path from 'path'
import { readFileSync } from 'fs'
import { randomUUID } from 'crypto'
import { sql } from '@vercel/postgres'

const PROJECT_ROOT = path.resolve(process.cwd())
const DATA_DIR = path.join(PROJECT_ROOT, 'src', 'data')

config({ path: path.join(PROJECT_ROOT, '.env.local') })

// 프록시/회사망 등에서 self-signed cert 오류 시 TLS 검증 완화 (시드 스크립트 전용)
if (process.env.SEED_INSECURE_TLS === '1' || process.env.SEED_INSECURE_TLS === 'true') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
  console.warn('Warning: SEED_INSECURE_TLS is set. TLS certificate verification is disabled for this run.')
}

type StockRow = {
  id: string
  stockCode: string
  assetGroup: string
  accountType: string
  stockName: string
  createdAt: string
  updatedAt: string
}

type SnapshotRow = {
  id: string
  date: string
  createdAt: string
}

type SnapshotItemRow = {
  stockId: string
  currentPrice: number
  averagePrice: number
  quantity: number
  exchangeRate: number
  purchaseAmount: number
  valuationAmount: number
  gainLoss: number
}

function loadJson<T>(filename: string): T {
  const filePath = path.join(DATA_DIR, filename)
  const raw = readFileSync(filePath, 'utf-8')
  return JSON.parse(raw) as T
}

async function seedStocks() {
  const { stocks } = loadJson<{ stocks: StockRow[] }>('stock.json')
  for (const row of stocks) {
    await sql`
      INSERT INTO stocks (id, stock_code, asset_group, account_type, stock_name, created_at, updated_at)
      VALUES (${row.id}, ${row.stockCode}, ${row.assetGroup}, ${row.accountType}, ${row.stockName}, ${row.createdAt}, ${row.updatedAt})
      ON CONFLICT (id) DO UPDATE SET
        stock_code = EXCLUDED.stock_code,
        asset_group = EXCLUDED.asset_group,
        account_type = EXCLUDED.account_type,
        stock_name = EXCLUDED.stock_name,
        updated_at = EXCLUDED.updated_at
    `
  }
  console.log(`Stocks: ${stocks.length} rows upserted`)
}

async function seedSnapshots() {
  const { snapshots } = loadJson<{ snapshots: Array<SnapshotRow & { items: SnapshotItemRow[] }> }>('snapshots.json')
  for (const snap of snapshots) {
    await sql`
      INSERT INTO snapshots (id, date, created_at)
      VALUES (${snap.id}, ${snap.date}, ${snap.createdAt})
      ON CONFLICT (id) DO UPDATE SET date = EXCLUDED.date, created_at = EXCLUDED.created_at
    `
    await sql`DELETE FROM snapshot_items WHERE snapshot_id = ${snap.id}`
    for (let i = 0; i < snap.items.length; i++) {
      const item = snap.items[i]
      const itemId = randomUUID()
      await sql`
        INSERT INTO snapshot_items (id, snapshot_id, stock_id, current_price, average_price, quantity, exchange_rate, purchase_amount, valuation_amount, gain_loss)
        VALUES (${itemId}, ${snap.id}, ${item.stockId}, ${item.currentPrice}, ${item.averagePrice}, ${item.quantity}, ${item.exchangeRate}, ${item.purchaseAmount}, ${item.valuationAmount}, ${item.gainLoss})
      `
    }
  }
  console.log(`Snapshots: ${snapshots.length} rows upserted (with items)`)
}

async function seedTargets() {
  const store = loadJson<Record<string, number>>('targets.json')
  const groups = ['연금', '금', '해외주식', '국내주식'] as const
  for (const ag of groups) {
    const amount = store[ag] ?? 0
    await sql`
      INSERT INTO targets (asset_group, target_amount)
      VALUES (${ag}, ${amount})
      ON CONFLICT (asset_group) DO UPDATE SET target_amount = EXCLUDED.target_amount
    `
  }
  console.log('Targets: upserted')
}

async function main() {
  if (!process.env.POSTGRES_URL) {
    console.error('POSTGRES_URL가 설정되지 않았습니다. .env.local을 확인하세요.')
    process.exit(1)
  }
  try {
    await seedStocks()
    await seedSnapshots()
    await seedTargets()
    console.log('Seed 완료.')
  } catch (err) {
    console.error('Seed 실패:', err)
    process.exit(1)
  }
}

main()
