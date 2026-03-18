-- Sprint 8: 通知管理 — 新增 created_by 欄位
-- 用於區分管理員手動發送的公告 vs 系統自動產生的通知

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.users(id) ON DELETE SET NULL;

-- 更新型別備註：created_by 有值 = 管理員手動發送，null = 系統自動
