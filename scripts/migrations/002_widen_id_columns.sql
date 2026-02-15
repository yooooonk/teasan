-- id 컬럼을 VARCHAR(64)로 확장 (JSON 시드의 긴 id 지원)
-- 실행: Neon/Vercel DB 콘솔에서 001 적용 후 실행

ALTER TABLE stocks ALTER COLUMN id TYPE VARCHAR(64);
ALTER TABLE snapshots ALTER COLUMN id TYPE VARCHAR(64);
ALTER TABLE snapshot_items ALTER COLUMN id TYPE VARCHAR(64);
ALTER TABLE snapshot_items ALTER COLUMN snapshot_id TYPE VARCHAR(64);
ALTER TABLE snapshot_items ALTER COLUMN stock_id TYPE VARCHAR(64);
