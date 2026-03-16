# 揪車 JiuChe — CLAUDE.md

企業 ESG 減碳共乘平台 Prototype。
**Deadline：下週一**，需讓其他人可實際操作所有功能。
策略：前端優先、Mobile-First、Mock Data 展示完整流程。
優先順序：B2C 完整流程 → 後續再做 B2B 企業後台。

## 技術棧
- Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- 套件管理：npm
- 部署：Vercel / GitHub: kf-pun/jiuche-app

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
│   ├── page.tsx                    # 首頁（搜尋表單）✅
│   ├── results/
│   │   ├── page.tsx                # 搜尋結果＋篩選排序 ✅
│   │   └── [id]/page.tsx           # 行程詳情 ✅
│   ├── booking/
│   │   ├── confirm/page.tsx        # 付款確認（扣餘額）🔲
│   │   └── success/page.tsx        # 預訂成功 ✅
│   ├── post/
│   │   ├── page.tsx                # 發布共乘（兩步驟）✅
│   │   └── success/page.tsx        # 發布成功 ✅
│   ├── trips/
│   │   ├── page.tsx                # 我的行程 ✅
│   │   └── [id]/review/page.tsx    # 完成後評價 🔲
│   ├── auth/
│   │   ├── login/page.tsx          # 登入 🔲
│   │   └── register/page.tsx       # 註冊 🔲
│   ├── profile/page.tsx            # 個人資料 🔲
│   ├── wallet/
│   │   ├── page.tsx                # 錢包/餘額/收支 🔲
│   │   └── topup/page.tsx          # 儲值 🔲
│   ├── notifications/page.tsx      # 通知中心 🔲
│   ├── esg/page.tsx                # ESG 儀表板 🔲（佔位）
│   └── layout.tsx                  # Mobile Layout max-w-md
├── components/
│   └── BottomNav.tsx               # 底部導覽列（含中間發布FAB）
└── lib/
    └── mockData.ts                 # Mock 共乘資料（4筆 Ride）
```

## 設計規範
- 主色：`green-600` / `emerald-500`（漸層）
- 圓角：`rounded-xl` / `rounded-2xl`
- 手機框：`max-w-md mx-auto`，內頁用 `pb-20`（避被 BottomNav 遮住）
- 動畫：success 頁用 `opacity/scale + delay` CSS transition
- 所有頁面頂部 Header 用綠色漸層 `from-green-600 to-emerald-500`

## Mock 資料
- `src/lib/mockData.ts`：4 筆 Ride（ride-001 ～ ride-004）
- 女性司機 ID：`ride-002`、`ride-004`
- Mock 錢包餘額：NT$1,250（存在 localStorage 或 context）
- Mock 使用者：{ name: "王小明", company: "台積電", rating: 4.8 }

## 開發進度
### ✅ 已完成（Day 1–2）
- 首頁搜尋（Loading spinner）
- 搜尋結果＋篩選排序（時間/價格/減碳/評分/性別）
- 行程詳情（ESG 減碳卡）
- 預訂成功（動畫）
- 發布共乘（兩步驟表單）
- 我的行程（即將/歷史分頁、狀態色票）
- Bottom Nav（含發布 FAB）

### 🔲 待完成
**Day 3 — 會員系統**
- /auth/login：手機號碼登入（Mock OTP）
- /auth/register：姓名、公司、車牌
- /profile：個人資料、評分、車輛設定

**Day 4 — 錢包系統**
- /wallet：餘額卡片、收支紀錄
- /wallet/topup：金額選擇、儲值成功動畫

**Day 5 — 代收代付 & 評價**
- /booking/confirm：顯示餘額 → 確認扣款
- /trips/[id]/review：星等評價

**Day 6 — ESG & 通知**
- /esg：個人減碳圖表、勳章、企業排行
- /notifications：預訂/付款/系統通知列表

**Day 7 — 整合 & 部署**
- Auth Guard（未登入導向 login）
- 預訂自動扣款串接
- Vercel 部署（公開連結）

## B2B（下週後續，不在當前 Deadline 內）
- 企業管理後台、ESG 報告匯出、費用報帳、企業 SSO
