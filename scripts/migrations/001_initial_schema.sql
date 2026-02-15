-- Vercel Postgres 초기 스키마: stocks, snapshots, snapshot_items, targets
-- 실행: Neon/Vercel DB 콘솔에서 전체 복사 후 실행

-- 1. stocks: 종목 마스터
CREATE TABLE IF NOT EXISTS stocks (
  id VARCHAR(36) PRIMARY KEY,
  stock_code VARCHAR(20) NOT NULL,
  asset_group VARCHAR(20) NOT NULL,
  account_type VARCHAR(30) NOT NULL,
  stock_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. snapshots: 스냅샷 헤더 (날짜별)
CREATE TABLE IF NOT EXISTS snapshots (
  id VARCHAR(36) PRIMARY KEY,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. snapshot_items: 스냅샷별 종목별 행 (stocks, snapshots 참조)
CREATE TABLE IF NOT EXISTS snapshot_items (
  id VARCHAR(36) PRIMARY KEY,
  snapshot_id VARCHAR(36) NOT NULL REFERENCES snapshots(id) ON DELETE CASCADE,
  stock_id VARCHAR(36) NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
  current_price DECIMAL(20, 4) NOT NULL,
  average_price DECIMAL(20, 4) NOT NULL,
  quantity DECIMAL(20, 4) NOT NULL,
  exchange_rate DECIMAL(20, 6) NOT NULL DEFAULT 1,
  purchase_amount DECIMAL(20, 2) NOT NULL,
  valuation_amount DECIMAL(20, 2) NOT NULL,
  gain_loss DECIMAL(20, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_snapshot_items_snapshot_id ON snapshot_items(snapshot_id);
CREATE INDEX IF NOT EXISTS idx_snapshot_items_stock_id ON snapshot_items(stock_id);

-- 4. targets: 자산군별 목표금액 (연금|금|해외주식|국내주식)
CREATE TABLE IF NOT EXISTS targets (
  asset_group VARCHAR(20) PRIMARY KEY,
  target_amount BIGINT NOT NULL DEFAULT 0
);
