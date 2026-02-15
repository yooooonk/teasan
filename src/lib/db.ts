/**
 * Vercel Postgres 연결 및 쿼리 래퍼
 * - 환경 변수: POSTGRES_URL (Vercel Storage/Postgres 연결 시 자동 주입, 로컬은 .env.local에 설정)
 */
import crypto from 'node:crypto'
import { sql } from '@vercel/postgres'
import type { Stock, CreateStockRequest } from '@/types/stock'
import type { Snapshot, SnapshotItem, SnapshotQuery } from '@/types/snapshot'
import type { TargetStore } from '@/types/target'
import type { AssetGroup } from '@/types/stock'

export { sql }

// --- Row → App 타입 변환 ---
function rowToStock(row: {
  id: string
  stock_code: string
  asset_group: string
  account_type: string
  stock_name: string
  created_at: Date
  updated_at: Date
}): Stock {
  return {
    id: row.id,
    stockCode: row.stock_code,
    assetGroup: row.asset_group as AssetGroup,
    accountType: row.account_type as Stock['accountType'],
    stockName: row.stock_name,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  }
}

function rowToSnapshotItem(row: {
  stock_id: string
  current_price: string
  average_price: string
  quantity: string
  exchange_rate: string
  purchase_amount: string
  valuation_amount: string
  gain_loss: string
}): SnapshotItem {
  return {
    stockId: row.stock_id,
    currentPrice: Number(row.current_price),
    averagePrice: Number(row.average_price),
    quantity: Number(row.quantity),
    exchangeRate: Number(row.exchange_rate),
    purchaseAmount: Number(row.purchase_amount),
    valuationAmount: Number(row.valuation_amount),
    gainLoss: Number(row.gain_loss),
  }
}

// --- Stocks CRUD ---
export async function getStocks(): Promise<Stock[]> {
  const { rows } = await sql`
    SELECT id, stock_code, asset_group, account_type, stock_name, created_at, updated_at
    FROM stocks ORDER BY created_at ASC
  `
  return (rows as Parameters<typeof rowToStock>[0][]).map(rowToStock)
}

export async function createStock(data: CreateStockRequest): Promise<Stock> {
  const id = `stock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const now = new Date()
  await sql`
    INSERT INTO stocks (id, stock_code, asset_group, account_type, stock_name, created_at, updated_at)
    VALUES (${id}, ${data.stockCode}, ${data.assetGroup}, ${data.accountType}, ${data.stockName}, ${now}, ${now})
  `
  return {
    id,
    stockCode: data.stockCode,
    assetGroup: data.assetGroup,
    accountType: data.accountType,
    stockName: data.stockName,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  }
}

export async function updateStock(
  id: string,
  data: Partial<Omit<CreateStockRequest, 'stockCode'>> & { stockCode?: string }
): Promise<Stock | null> {
  const { rows } = await sql`
    UPDATE stocks SET
      stock_code = COALESCE(${data.stockCode ?? null}, stock_code),
      asset_group = COALESCE(${data.assetGroup ?? null}, asset_group),
      account_type = COALESCE(${data.accountType ?? null}, account_type),
      stock_name = COALESCE(${data.stockName ?? null}, stock_name),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, stock_code, asset_group, account_type, stock_name, created_at, updated_at
  `
  if (rows.length === 0) return null
  return rowToStock(rows[0] as Parameters<typeof rowToStock>[0])
}

export async function deleteStock(id: string): Promise<boolean> {
  const { rowCount } = await sql`DELETE FROM stocks WHERE id = ${id}`
  return (rowCount ?? 0) > 0
}

// --- Snapshots + snapshot_items CRUD ---
export async function getSnapshots(query?: SnapshotQuery): Promise<Snapshot[]> {
  let result
  if (query?.date) {
    result = await sql`
      SELECT s.id, s.date, s.created_at
      FROM snapshots s
      WHERE s.date = ${query.date}
      ORDER BY s.date DESC, s.created_at DESC
    `
  } else if (query?.startDate || query?.endDate) {
    if (query.startDate && query.endDate) {
      result = await sql`
        SELECT s.id, s.date, s.created_at
        FROM snapshots s
        WHERE s.date >= ${query.startDate} AND s.date <= ${query.endDate}
        ORDER BY s.date DESC, s.created_at DESC
      `
    } else if (query.startDate) {
      result = await sql`
        SELECT s.id, s.date, s.created_at
        FROM snapshots s
        WHERE s.date >= ${query.startDate}
        ORDER BY s.date DESC, s.created_at DESC
      `
    } else {
      result = await sql`
        SELECT s.id, s.date, s.created_at
        FROM snapshots s
        WHERE s.date <= ${query.endDate!}
        ORDER BY s.date DESC, s.created_at DESC
      `
    }
  } else {
    result = await sql`
      SELECT id, date, created_at FROM snapshots ORDER BY date DESC, created_at DESC
    `
  }

  const snapshotRows = result.rows as { id: string; date: string; created_at: Date }[]
  if (snapshotRows.length === 0) return []

  const ids = snapshotRows.map((r) => r.id)
  const { rows: itemRows } = await sql`
    SELECT snapshot_id, stock_id, current_price, average_price, quantity, exchange_rate, purchase_amount, valuation_amount, gain_loss
    FROM snapshot_items
    WHERE snapshot_id = ANY(${ids})
  `
  const itemsBySnapshot = new Map<string, SnapshotItem[]>()
  for (const row of itemRows as Array<{
    snapshot_id: string
    stock_id: string
    current_price: string
    average_price: string
    quantity: string
    exchange_rate: string
    purchase_amount: string
    valuation_amount: string
    gain_loss: string
  }>) {
    const list = itemsBySnapshot.get(row.snapshot_id) ?? []
    list.push(rowToSnapshotItem(row))
    itemsBySnapshot.set(row.snapshot_id, list)
  }

  return snapshotRows.map((s) => ({
    id: s.id,
    date: s.date,
    createdAt: s.created_at.toISOString(),
    items: itemsBySnapshot.get(s.id) ?? [],
  }))
}

export async function getSnapshotById(id: string): Promise<Snapshot | null> {
  const { rows: snapRows } = await sql`
    SELECT id, date, created_at FROM snapshots WHERE id = ${id}
  `
  if (snapRows.length === 0) return null
  const s = snapRows[0] as { id: string; date: string; created_at: Date }
  const { rows: itemRows } = await sql`
    SELECT stock_id, current_price, average_price, quantity, exchange_rate, purchase_amount, valuation_amount, gain_loss
    FROM snapshot_items WHERE snapshot_id = ${id}
  `
  const items = (itemRows as Parameters<typeof rowToSnapshotItem>[0][]).map(rowToSnapshotItem)
  return {
    id: s.id,
    date: s.date,
    createdAt: s.created_at.toISOString(),
    items,
  }
}

export async function createSnapshot(
  snapshot: Omit<Snapshot, 'createdAt'> & { createdAt?: string }
): Promise<Snapshot> {
  const createdAt = snapshot.createdAt ? new Date(snapshot.createdAt) : new Date()
  await sql`
    INSERT INTO snapshots (id, date, created_at)
    VALUES (${snapshot.id}, ${snapshot.date}, ${createdAt})
  `
  for (let i = 0; i < snapshot.items.length; i++) {
    const item = snapshot.items[i]
    const itemId = crypto.randomUUID()
    await sql`
      INSERT INTO snapshot_items (id, snapshot_id, stock_id, current_price, average_price, quantity, exchange_rate, purchase_amount, valuation_amount, gain_loss)
      VALUES (${itemId}, ${snapshot.id}, ${item.stockId}, ${item.currentPrice}, ${item.averagePrice}, ${item.quantity}, ${item.exchangeRate}, ${item.purchaseAmount}, ${item.valuationAmount}, ${item.gainLoss})
    `
  }
  return {
    ...snapshot,
    createdAt: createdAt.toISOString(),
  }
}

export async function updateSnapshot(
  id: string,
  data: { date?: string; items?: SnapshotItem[] }
): Promise<Snapshot | null> {
  const existing = await getSnapshotById(id)
  if (!existing) return null

  const date = data.date ?? existing.date
  if (data.date) {
    await sql`UPDATE snapshots SET date = ${data.date} WHERE id = ${id}`
  }

  if (data.items !== undefined) {
    await sql`DELETE FROM snapshot_items WHERE snapshot_id = ${id}`
    for (const item of data.items) {
      const itemId = crypto.randomUUID()
      await sql`
        INSERT INTO snapshot_items (id, snapshot_id, stock_id, current_price, average_price, quantity, exchange_rate, purchase_amount, valuation_amount, gain_loss)
        VALUES (${itemId}, ${id}, ${item.stockId}, ${item.currentPrice}, ${item.averagePrice}, ${item.quantity}, ${item.exchangeRate}, ${item.purchaseAmount}, ${item.valuationAmount}, ${item.gainLoss})
      `
    }
  }

  return getSnapshotById(id)
}

export async function deleteSnapshot(id: string): Promise<boolean> {
  const { rowCount } = await sql`DELETE FROM snapshots WHERE id = ${id}`
  return (rowCount ?? 0) > 0
}

// --- Targets CRUD ---
const ASSET_GROUPS: AssetGroup[] = ['연금', '금', '해외주식', '국내주식']

export async function getTargets(): Promise<TargetStore> {
  const { rows } = await sql`SELECT asset_group, target_amount FROM targets`
  const store = { 연금: 0, 금: 0, 해외주식: 0, 국내주식: 0 } as TargetStore
  for (const row of rows as { asset_group: string; target_amount: string }[]) {
    if (ASSET_GROUPS.includes(row.asset_group as AssetGroup)) {
      store[row.asset_group as AssetGroup] = Number(row.target_amount)
    }
  }
  return store
}

export async function setTargets(store: TargetStore): Promise<void> {
  for (const ag of ASSET_GROUPS) {
    const amount = store[ag] ?? 0
    await sql`
      INSERT INTO targets (asset_group, target_amount)
      VALUES (${ag}, ${amount})
      ON CONFLICT (asset_group) DO UPDATE SET target_amount = ${amount}
    `
  }
}
