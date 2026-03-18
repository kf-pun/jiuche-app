# 揪車 JiuChe 🚗🌿

> **企業 ESG 減碳共乘平台** — 讓每一次通勤都成為對地球的承諾

---

## 核心理念

「揪車」是一款專為企業員工設計的智慧共乘 App，透過媒合順路通勤者，有效降低碳排放、節省交通成本，並強化企業 ESG 永續報告數據。

- **減碳優先**：每次共乘自動計算節省的 CO₂ 排放量，累積企業碳足跡儀表板
- **員工福利**：降低通勤成本，增進同事間交流，提升員工滿意度
- **ESG 合規**：提供可匯出的碳減量報告，協助企業達成 ESG 目標與 SDG 11、13
- **B2B 企業管理**：後台企業帳號管理、員工共乘統計、費用報帳 CSV 匯出

---

## 技術棧

| 層級 | 技術 |
|------|------|
| 前端框架 | Next.js 15 (App Router) |
| 語言 | TypeScript |
| 樣式 | Tailwind CSS v4 |
| 後端 / 資料庫 | Supabase（PostgreSQL + Auth + RLS） |
| 套件管理 | npm |
| 部署目標 | Vercel |

---

## 快速開始

```bash
npm install
npm run dev
```

開啟瀏覽器前往 [http://localhost:3000](http://localhost:3000)

### 環境變數

複製 `.env.local.example` 為 `.env.local` 並填入以下設定：

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_DEV_MODE=true         # 開發模式：OTP 輸入 888888 自動通過
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=  # 選填：地點自動完成
ECPAY_MERCHANT_ID=                # 選填：ECPay 儲值串接
ECPAY_HASH_KEY=
ECPAY_HASH_IV=
```

---

## 專案結構

```
src/
├── app/
│   ├── page.tsx                    # 首頁搜尋
│   ├── results/                    # 搜尋結果、行程詳情
│   ├── booking/                    # 預訂確認、成功
│   ├── post/                       # 發布共乘
│   ├── trips/                      # 我的行程、評價
│   ├── auth/                       # 登入（OTP + Google OAuth）、註冊、callback
│   ├── profile/                    # 個人資料、編輯
│   ├── wallet/                     # 錢包、儲值（ECPay）
│   ├── notifications/              # 通知中心
│   ├── esg/                        # ESG 儀表板
│   └── admin/                      # 後台管理系統（Desktop-First）
│       ├── layout.tsx              # 寬版 Layout（左側導覽 240px）
│       ├── page.tsx                # Dashboard
│       ├── users/                  # 會員管理
│       ├── bookings/               # 訂單管理
│       ├── rides/                  # 行程管理
│       ├── transactions/           # 金流管理
│       ├── reviews/                # 評價管理
│       ├── notifications/          # 通知管理
│       ├── esg/                    # ESG 報告
│       └── companies/              # 企業管理（B2B）
├── actions/                        # Server Actions（rides, bookings, wallet...）
├── components/
│   ├── BottomNav.tsx               # 底部導覽（/admin/* 時隱藏）
│   ├── AuthGuard.tsx               # 未登入 → /auth/login
│   └── AdminGuard.tsx              # 非 admin → 前台首頁
└── lib/
    ├── supabase/client.ts          # 瀏覽器 Supabase client
    ├── supabase/server.ts          # Server / ServiceRole client
    ├── authContext.tsx             # Auth Context
    └── mockData.ts                 # 部分保留的 mock 資料
```

---

## 功能清單

### 前台（Mobile-First）
- 首頁搜尋（熱門路線快填、地點自動完成、個人化搜尋記錄）
- 搜尋結果（時間/價格/CO₂/評分篩選排序 + 女性司機切換）
- 行程詳情（ESG 減碳卡、司機資訊、歷史評價列表）
- 預訂確認（餘額顯示、扣款）→ 成功動畫
- 發布共乘（兩步驟表單、CO₂ 預覽）→ 成功動畫
- 我的行程（即將/歷史分頁、取消、評價）
- 評價（互動星等、快速標籤、留言）
- 錢包（餘額/收支/交易記錄）→ 儲值（ECPay 信用卡/ATM/超商）
- 通知中心（未讀標記、全部已讀）
- ESG 儀表板（個人 CO₂ / 成就徽章 / 企業排行榜 / PDF 匯出）
- Auth：手機 OTP（開發模式 888888）+ Google OAuth

### 後台（Desktop-First，`/admin/*`）
- Dashboard（KPI 卡片、折線圖、最新訂單/用戶）
- 會員管理（搜尋/篩選/詳情/調整餘額/停權）
- 訂單管理（手動確認/取消/退款）
- 行程管理（強制取消 + 批次退款通知）
- 金流管理（統計/補償/CSV 匯出）
- 評價管理（刪除不當評價 + 重算評分）
- 通知管理（發送系統公告，支援全體/公司/個人）
- ESG 報告（月度趨勢圖、公司排行、PDF 匯出）
- 企業管理（B2B 企業帳號、員工列表、費用 CSV）

---

## 資料庫 Schema

六張核心表（詳見 `supabase/migrations/001_initial_schema.sql`）：

| 表名 | 說明 |
|------|------|
| `users` | 關聯 auth.users，含餘額/評分/CO₂/role |
| `rides` | 共乘行程 |
| `bookings` | 乘客預訂 |
| `reviews` | 行程評價 |
| `wallet_transactions` | 錢包明細 |
| `notifications` | 通知中心 |

---

## 部署

```bash
vercel login
vercel --prod
```

或在 [vercel.com](https://vercel.com) 用 GitHub import `kf-pun/jiuche-app`。

**注意**：部署前需完成以下人工設定：
1. GCP OAuth 2.0 Client 建立（Google Cloud Console）
2. Supabase Dashboard → Authentication → Providers → Google 啟用

---

## 規格書

所有功能規格書位於 [`/docs/specs/`](./docs/specs/)，索引見 [`INDEX.md`](./docs/specs/INDEX.md)。
