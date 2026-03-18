# 後台基礎架構 功能規格書

**版本：** v1.0
**日期：** 2026-03-18
**狀態：** 已完成

---

## 1. 背景與目標
- 後台管理系統需要獨立的版面框架，與前台手機版完全區隔
- 只有具備管理員身份（`role = 'admin'`）的用戶才能進入後台
- 目標：建立可復用的後台 Layout、路由保護機制、DB 角色欄位，作為 Sprint 6–9 後台所有功能的基礎

## 2. 使用者故事
- 身為平台管理員，我希望進入 `/admin` 時看到寬版管理介面，這樣才能在電腦上舒適操作
- 身為一般用戶，當我試圖直接輸入 `/admin` 網址時，希望被自動導回前台首頁，這樣才能防止未授權存取
- 身為開發人員，我希望後台 Layout 是獨立元件，這樣才能在所有後台頁面共用，無需重複撰寫

## 3. 功能範圍

### 已完成功能
- 無（此為全新架構）

### 待製作
- `/admin` 路由 Layout：左側固定導覽 240px + 右側主內容區
- AdminGuard 元件：驗證 `users.role = 'admin'`
- `users` 表新增 `role` 欄位（預設 `user`，管理員設為 `admin`）
- `users` 表新增 `is_active` 欄位（預設 `true`）
- DB 遷移腳本
- BottomNav 在 `/admin/*` 路由下隱藏

## 4. 使用流程

**成功路徑（管理員）：**
1. 管理員在瀏覽器輸入 `/admin`
2. AdminGuard 向 Supabase 查詢當前登入用戶的 `role`
3. 確認為 `admin` → 顯示後台 Layout
4. 左側導覽列可切換各功能模組

**失敗路徑：**
- 未登入 → 導向 `/auth/login`
- 已登入但 `role ≠ 'admin'` → 導向 `/`（前台首頁）

## 5. 畫面與功能說明

### 後台 Layout（`/admin/*`）
- **網址：** `/admin`、`/admin/users`、`/admin/bookings`…
- **左側導覽（固定 240px，bg-gray-900）：**
  - 頂部：平台 Logo + 「後台管理」文字（白色）
  - 導覽項目（白字，hover: `bg-gray-800`，active: `bg-gray-700`）：
    - Dashboard（首頁圖示）→ `/admin`
    - 會員管理（人物圖示）→ `/admin/users`
    - 訂單管理（文件圖示）→ `/admin/bookings`
    - 行程管理（地圖圖示）→ `/admin/rides`
    - 金流管理（錢包圖示）→ `/admin/transactions`
    - 評價管理（星星圖示）→ `/admin/reviews`
    - 通知管理（鈴鐺圖示）→ `/admin/notifications`
    - ESG 報告（葉子圖示）→ `/admin/esg`
    - 企業管理（大樓圖示）→ 停用（Sprint 9）
  - 底部：當前管理員姓名 + 登出按鈕
- **主內容區（`bg-gray-50`，佔剩餘寬度，獨立捲動）**
- **無 BottomNav**（偵測 pathname.startsWith('/admin') 即隱藏）
- **登入狀態：** AdminGuard 保護

### AdminGuard 元件（`src/components/AdminGuard.tsx`）
- 包裹 `src/app/admin/layout.tsx` 的所有子頁面
- 載入中：全螢幕 Loading spinner（`bg-gray-900/20`）
- 驗證失敗：靜默 redirect，不顯示錯誤訊息

## 6. 資料說明

**DB 遷移（`supabase/migrations/002_add_role_and_active.sql`）：**
```sql
-- users 表新增 role 欄位
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
    CHECK (role IN ('user', 'admin'));

-- users 表新增 is_active 欄位
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
```

**設定管理員帳號（手動執行一次）：**
```sql
UPDATE public.users SET role = 'admin' WHERE id = '<your-user-id>';
```

**後台讀取用戶 role：使用 `createServiceClient()` 繞過 RLS**

## 7. 設計規範
- Desktop-First，最小支援寬度 1280px
- 無手機版，不做 RWD
- 左側導覽固定不捲動；主內容區獨立捲動（`overflow-y-auto`）
- 企業管理項目：`opacity-50 cursor-not-allowed`，點擊無反應
- Layout 整體：`flex h-screen`；左側：`w-60 flex-shrink-0`；右側：`flex-1 overflow-y-auto`

## 8. 備註
- Sprint 9 企業管理項目先放入導覽但 disabled
- `createServiceClient()` 已在 `src/lib/supabase/server.ts` 實作，可直接使用

## 9. 待確認事項
- 管理員帳號初期用 SQL 手動設定，後台不做升級 UI（Sprint 8 再評估）
