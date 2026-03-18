# Google OAuth 串接 功能規格書

**版本：** v1.0
**日期：** 2026-03-18
**狀態：** 已確認

---

## 1. 背景與目標

目前登入頁已有「使用 Google 帳號繼續」按鈕但尚未串接。提供 Google OAuth 可降低手機號碼登入的摩擦，特別是企業用戶多使用 Google Workspace 帳號的情境。

目標：
- 讓用戶可用 Google 帳號一鍵登入，無需輸入手機號碼及 OTP
- Google 登入後依照相同邏輯判斷新/舊用戶（新用戶導向註冊頁）
- 不影響現有手機 OTP 登入流程

---

## 2. 使用者故事

- 身為用戶，我希望能用 Google 帳號登入，這樣才能省去輸入手機和等待驗證碼的麻煩
- 身為新用戶，我用 Google 登入後，如果還沒填過資料，希望被引導完成註冊（公司/車輛資訊）
- 身為管理員，我希望 Google OAuth 使用 Supabase 內建機制，這樣才能減少自行維護 token 的成本

---

## 3. 功能範圍

### 已完成功能
- 登入頁有 Google 按鈕 UI（`/auth/login`）
- Supabase Auth 已設定（`@supabase/ssr`）
- 新用戶偵測邏輯（查 `users` 表，無資料則跳 `/auth/register`）

### 待製作
- Google OAuth Provider 在 Supabase Dashboard 設定（GCP OAuth Client ID/Secret）
- 登入頁 Google 按鈕串接 `supabase.auth.signInWithOAuth`
- OAuth Callback 路由 `/auth/callback`（處理 code exchange + 新舊用戶判斷）
- 環境變數設定說明（`NEXT_PUBLIC_SITE_URL`）

---

## 4. 使用流程

### 成功路徑（舊用戶）
1. 用戶點擊「使用 Google 帳號繼續」
2. 導向 Google 帳號選擇頁
3. 選擇帳號後，Google 回呼 `/auth/callback?code=...`
4. Callback 完成 code exchange，取得 Supabase session
5. 查 `users` 表有資料 → `refreshUser()` → 導向原本目標頁（或首頁）

### 成功路徑（新用戶）
1. 步驟 1–4 同上
2. 查 `users` 表無資料 → 導向 `/auth/register`（email 已知，phone 欄位可留空）

### 例外情況
- 用戶在 Google 頁面取消 → 回到 `/auth/login`
- OAuth 失敗（token 錯誤）→ 回到 `/auth/login?error=oauth_failed`，顯示錯誤提示

---

## 5. 畫面與功能說明

### 5.1 登入頁 `/auth/login`（修改現有頁面）

- Google 按鈕點擊後呼叫：
  ```ts
  supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${SITE_URL}/auth/callback` }
  })
  ```
- 按鈕加入 loading 狀態（點擊後 disabled + spinner）

### 5.2 OAuth Callback 路由 `/auth/callback`（新增）

- 路由：`src/app/auth/callback/route.ts`（Next.js Route Handler）
- 處理邏輯：
  1. 從 URL 取得 `code`
  2. 呼叫 `supabase.auth.exchangeCodeForSession(code)`
  3. 查 `users` 表判斷新/舊用戶
  4. 舊用戶 → redirect `/`（或 `jiuche_redirect` sessionStorage 值）
  5. 新用戶 → redirect `/auth/register`

---

## 6. 資料說明

- Google OAuth 使用者的 `email` 由 Supabase Auth 提供
- `phone` 欄位在 Google 登入情境下為空字串（`users` 表允許）
- 不新增欄位，現有 `users` schema 已足夠

---

## 7. 設計規範

- 按鈕樣式沿用現有（白底 + Google logo + 灰字）
- Loading 狀態：按鈕內顯示 spinner，文字改為「連線中…」

---

## 8. 備註

- 需在 GCP Console 建立 OAuth 2.0 Client，Redirect URI 填 `https://<project>.supabase.co/auth/v1/callback`
- 開發環境需在 GCP 加入 `http://localhost:3000` 為授權來源
- `NEXT_PUBLIC_SITE_URL` 開發環境設 `http://localhost:3000`，正式環境設 Vercel URL
- Google 與手機 OTP 為兩個獨立帳號，不做帳號合併
- `users.phone` 欄位於 Google 登入時填入空字串 `''`（需確認 DB 無 NOT NULL 約束）
