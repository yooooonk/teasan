-- history_entries: 간단 매매일지(제목/내용)
-- 실행: Neon/Vercel DB 콘솔에서 전체 복사 후 실행

CREATE TABLE IF NOT EXISTS history_entries (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_history_entries_created_at ON history_entries(created_at DESC);

