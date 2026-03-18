# 揪車 JiuChe — CLAUDE.md

企業 ESG 減碳共乘平台 Prototype。
策略：前端優先、Mobile-First → 現階段串接真實 Supabase 後端。
目前階段：Sprint 3 — 行程發布與搜尋真實化。
後台計畫：方向 A（同專案 `/admin` 路由），Sprint 6 開始建置，寬版 Layout，電腦操作。

## 開發準則（強制執行）
1. **開發前必須有規格書**：任何功能開發都必須以對應的規格書為出發點，沒有規格書不得進行開發。
2. **開發完必須更新規格書**：功能完成後，必須回頭更新規格書，確保內容與實際功能一致。
3. 規格書統一放在 `/docs/specs/` 目錄，使用 `/spec-writer` Skill 撰寫。
4. **詢問待開發功能時**：必須讀取 `/docs/specs/BACKLOG.md`，以此為準回答，不得憑記憶回覆。

## 技術棧
- Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- 套件管理：npm
- GitHub: kf-pun/jiuche-app（部署：Vercel，待辦）

## 開發指令
```bash
npm run dev    # localhost:3000
npm run build
npm run lint
```

## 專案結構
```
src/
├── app/
│   ├── page.tsx                    # 首頁（搜尋表單）
│   ├── results/page.tsx            # 搜尋結果＋篩選排序
│   ├── results/[id]/page.tsx       # 行程詳情
│   ├── booking/confirm/page.tsx    # 付款確認（扣餘額）[Suspense]
│   ├── booking/success/page.tsx    # 預訂成功動畫
│   ├── post/page.tsx               # 發布共乘（兩步驟）[AuthGuard]
│   ├── post/success/page.tsx       # 發布成功
│   ├── trips/page.tsx              # 我的行程 [AuthGuard]
│   ├── trips/[id]/review/page.tsx  # 評價頁面
│   ├── auth/login/page.tsx         # 登入（OTP 888888）
│   ├── auth/register/page.tsx      # 註冊（姓名/公司/車輛）
│   ├── profile/page.tsx            # 個人資料
│   ├── profile/edit/page.tsx       # 編輯資料
│   ├── wallet/page.tsx             # 錢包/餘額/收支 [AuthGuard]
│   ├── wallet/topup/page.tsx       # 儲值
│   ├── wallet/topup/success/page.tsx
│   ├── notifications/page.tsx      # 通知中心 [AuthGuard]
│   ├── esg/page.tsx                # ESG 儀表板 [AuthGuard]
│   ├── admin/                      # 後台管理系統（Sprint 6+）
│   │   ├── layout.tsx              # 寬版 Layout（左側導覽 + 主內容，無 BottomNav）
│   │   ├── page.tsx                # Dashboard 總覽
│   │   ├── users/page.tsx          # 會員管理
│   │   ├── users/[id]/page.tsx     # 會員詳情
│   │   ├── bookings/page.tsx       # 訂單管理
│   │   ├── bookings/[id]/page.tsx  # 訂單詳情
│   │   ├── rides/page.tsx          # 行程管理
│   │   ├── rides/[id]/page.tsx     # 行程詳情
│   │   ├── transactions/page.tsx   # 金流管理
│   │   ├── reviews/page.tsx        # 評價管理
│   │   ├── notifications/page.tsx  # 通知管理
│   │   ├── esg/page.tsx            # ESG 報告
│   │   └── companies/page.tsx      # 企業管理（B2B，Sprint 9）
│   └── layout.tsx                  # Mobile Layout max-w-md + AuthProvider
├── components/
│   ├── BottomNav.tsx               # 底部導覽（/auth/* 與 /admin/* 時隱藏）
│   ├── AuthGuard.tsx               # 未登入 → /auth/login + redirect-back
│   └── AdminGuard.tsx              # 非 admin → 前台首頁（Sprint 6 新增）
└── lib/
    ├── mockData.ts                 # 4筆 Ride mock 資料
    └── authContext.tsx             # Auth Context + localStorage 持久化
```

## 設計規範

### 前台（Mobile-First）
- 主色：`green-600` / `emerald-500`（漸層）
- 圓角：`rounded-xl` / `rounded-2xl`
- 手機框：`max-w-md mx-auto`，內頁用 `pb-20`（避被 BottomNav 遮住）
- 動畫：success 頁用 `opacity/scale + delay` CSS transition
- Header：綠色漸層 `bg-gradient-to-br from-green-600 to-emerald-500 px-5 pt-12 pb-6`
- useSearchParams 頁面必須用 `<Suspense>` 包內層 function component

### 後台（Desktop-First，`/admin/*`）
- 最小支援寬度：1280px，無 BottomNav、無手機 Header
- 左側導覽：固定寬 240px，`bg-gray-900` 深色底 + 白字
- 主內容區：`bg-gray-50`，各 section 用 `bg-white rounded-xl shadow-sm`
- 表格：每頁 20 筆 + 分頁，支援排序
- 危險操作（取消、退款、刪除）：紅色按鈕 + 二次確認 Modal
- 狀態標籤：正常/完成=綠、待處理=黃、取消/停權=紅

## Mock 資料（部分仍在使用）
- `mockData.ts`：4筆 Ride（ride-001～ride-004），女性司機：ride-002、ride-004（Sprint 3 後取代）
- sessionStorage key：`jiuche_redirect`（AuthGuard 登入後跳回用）

## Auth 架構（Supabase）
- 登入流程：Anonymous sign-in → 查 `public.users` → 無則跳 `/auth/register?phone=...`
- 開發模式：`NEXT_PUBLIC_DEV_MODE=true` → OTP 輸入 888888 自動通過
- Session：Supabase Auth（`@supabase/ssr`），自動持久化
- `.mcp.json`：Supabase MCP 已連線，可直接操作 DB

## AuthContext API
```ts
refreshUser()            // 從 Supabase users 表重新載入當前用戶
logout()                 // supabase.auth.signOut()
updateUser(partial)      // 更新部分欄位（仍為 local state，Sprint 5 改寫 DB）
deductBalance(amount)    // 扣款，回傳 boolean（Sprint 4 改走 wallet_transactions）
addBalance(amount)       // 儲值（Sprint 4 改走 wallet_transactions）
```

## 已完成功能清單
- 首頁搜尋（熱門路線快填、Loading spinner）
- 搜尋結果（篩選：時間/價格/CO₂/評分 + 女性司機切換 + 清除篩選）
- 行程詳情（ESG 減碳卡、司機資訊）
- 預訂確認（餘額顯示、不足警告、deductBalance 扣款）→ 成功動畫
- 發布共乘（兩步驟表單、時間槽選擇、CO₂ 預覽）→ 成功動畫
- 我的行程（即將/歷史分頁、狀態色票、聯絡司機、取消、評價按鈕）
- Auth：手機 OTP（888888）→ 自動登入，login-redirect-back
- 註冊（姓名/公司/isDriver/車型/車牌/車色）
- 個人資料（stats、錢包餘額卡、選單）+ 編輯頁
- 錢包（餘額/月收支/交易記錄）→ 儲值（6種金額+自訂+4種付款方式）→ 成功
- 評價（互動星等 hover、6種快速標籤、200字留言）→ 成功動畫
- 通知中心（9筆、6種類型、未讀標記、全部已讀）
- ESG 儀表板（個人：CSS 條形圖/6成就徽章/SDG；企業：排行榜/PDF CTA）
- AuthGuard：/trips /post /wallet /notifications /esg 受保護

## 目前進度
- **Sprint 1–2 完成**：Supabase 建置、Schema、Auth 全流程（OTP dev bypass + 新用戶註冊 + Session）
- **Sprint：S3**　任務：S3-1 發布共乘寫入 DB、S3-2 搜尋查詢真實資料
- **後台計畫**：Sprint 6（Apr 21）開始，P0 → P3 分四個 Sprint 交付，目標上線 5/12
- 詳細任務清單：`/docs/specs/BACKLOG.md`

---

## Backend 架構（Supabase）

- Supabase client（瀏覽器）：`src/lib/supabase/client.ts` → `createClient()`
- Supabase client（Server Component / Action）：`src/lib/supabase/server.ts` → `createClient()` / `createServiceClient()`
- TypeScript 型別：`src/types/database.ts`（手動維護，含 Row / Insert / Update 三層）
- Server Actions 位置：`src/actions/<resource>.ts`（e.g. `rides.ts`, `bookings.ts`）
- RLS 原則：所有表開啟 RLS；需繞過時改用 `createServiceClient()`
- DB Schema：`supabase/migrations/001_initial_schema.sql`
- 環境變數範本：`.env.local.example`

### 六張核心表
| 表名 | 說明 |
|------|------|
| `users` | 關聯 auth.users，含餘額/評分/CO₂；Sprint 6 新增 `role`（user/admin）與 `is_active` 欄位 |
| `rides` | 共乘行程，含 available_seats |
| `bookings` | 乘客預訂，confirmed/cancelled/completed |
| `reviews` | 行程評價，unique on booking_id |
| `wallet_transactions` | 錢包明細，amount 正=入帳 負=扣款；後台手動補償用 `type = 'adjustment'` |
| `notifications` | 通知中心，含 is_read |

## 部署（最後執行）
```bash
vercel login   # 瀏覽器登入 Vercel
vercel --prod  # 在 jiuche-app 目錄執行
```
或直接在 vercel.com 用 GitHub import kf-pun/jiuche-app。

## B2B（Sprint 9）
- 企業管理後台（`/admin/companies`）、ESG 報告匯出（PDF）、費用報帳 CSV、企業 SSO
