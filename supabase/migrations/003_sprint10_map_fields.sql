-- Sprint 10 — Google Maps 深度整合
-- Migration 分兩批執行（均已透過 Supabase MCP 套用至 DB）

-- ── 1. rides 表：地圖座標欄位 ─────────────────────────────────────────────
ALTER TABLE rides
  ADD COLUMN IF NOT EXISTS origin_lat       NUMERIC(10,7),
  ADD COLUMN IF NOT EXISTS origin_lng       NUMERIC(10,7),
  ADD COLUMN IF NOT EXISTS destination_lat  NUMERIC(10,7),
  ADD COLUMN IF NOT EXISTS destination_lng  NUMERIC(10,7),
  ADD COLUMN IF NOT EXISTS distance_km      NUMERIC(6,2),
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS fare_limit       INTEGER;

-- ── 2. system_config 表（油價 + 服務費分級） ──────────────────────────────
CREATE TABLE IF NOT EXISTS system_config (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO system_config (key, value) VALUES
  ('fuel_price_92',     '30.3'),
  ('fuel_price_95',     '32.5'),
  ('fuel_price_98',     '34.5'),
  ('service_fee_tier1', '10'),
  ('service_fee_tier2', '15'),
  ('service_fee_tier3', '20')
ON CONFLICT (key) DO NOTHING;

-- ── 3. companies 表（B2B 企業訂閱） ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS companies (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                    TEXT NOT NULL UNIQUE,
  subscription_active     BOOLEAN NOT NULL DEFAULT false,
  subscription_expires_at TIMESTAMPTZ,
  created_at              TIMESTAMPTZ DEFAULT now()
);

-- ── 4. bookings 表：平台服務費欄位 ────────────────────────────────────────
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS service_fee INTEGER NOT NULL DEFAULT 0;

-- ── 5. users.vehicle_type CHECK constraint ────────────────────────────────
-- 先將不合規舊值設為 NULL
UPDATE users
SET vehicle_type = NULL
WHERE vehicle_type IS NOT NULL
  AND vehicle_type NOT IN (
    '小型轎車','中型轎車','大型轎車',
    'SUV（小）','SUV（中）','SUV（大）',
    'MPV','電動車'
  );

ALTER TABLE users
  DROP CONSTRAINT IF EXISTS vehicle_type_check;

ALTER TABLE users
  ADD CONSTRAINT vehicle_type_check
  CHECK (vehicle_type IS NULL OR vehicle_type IN (
    '小型轎車','中型轎車','大型轎車',
    'SUV（小）','SUV（中）','SUV（大）',
    'MPV','電動車'
  ));
