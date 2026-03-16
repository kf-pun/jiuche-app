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
│   ├── booking/confirm/page.tsx    # 付款確認（扣餘額）✅
│   ├── booking/success/page.tsx    # 預訂成功 ✅
│   ├── post/page.tsx               # 發布共乘（兩步驟）✅ [AuthGuard]
│   ├── post/success/page.tsx       # 發布成功 ✅
│   ├── trips/page.tsx              # 我的行程 ✅ [AuthGuard]
│   ├── trips/[id]/review/page.tsx  # 完成後評價 ✅
│   ├── auth/login/page.tsx         # 登入（OTP 888888）✅
│   ├── auth/register/page.tsx      # 註冊 ✅
│   ├── profile/page.tsx            # 個人資料 ✅
│   ├── profile/edit/page.tsx       # 編輯資料 ✅
│   ├── wallet/page.tsx             # 錢包/餘額/收支 ✅ [AuthGuard]
│   ├── wallet/topup/page.tsx       # 儲值 ✅
│   ├── wallet/topup/success/page.tsx # 儲值成功 ✅
│   ├── notifications/page.tsx      # 通知中心 ✅ [AuthGuard]
│   ├── esg/page.tsx                # ESG 儀表板 ✅ [AuthGuard]
│   └── layout.tsx                  # Mobile Layout max-w-md
├── components/
│   ├── BottomNav.tsx               # 底部導覽列（含發布FAB）
│   └── AuthGuard.tsx               # 路由保護（未登入→/auth/login）
└── lib/
    ├── mockData.ts                 # Mock 共乘資料（4筆 Ride）
    └── authContext.tsx             # Auth Context + localStorage
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
### ✅ 已完成（Day 1–6）
- 首頁搜尋（Loading spinner）、搜尋結果篩選排序、行程詳情
- 發布共乘（兩步驟表單）、我的行程（即將/歷史分頁）
- Bottom Nav（含發布 FAB）
- Auth：手機 OTP 登入（888888）、註冊、登出、localStorage 持久化
- Profile 個人資料、編輯頁（updateUser）
- 錢包（餘額/收支）、儲值（addBalance）、儲值成功動畫
- 預訂確認（deductBalance 扣款）、預訂成功動畫
- 評價系統（星等+標籤+留言）
- 通知中心（9筆、6種類型、未讀標記）
- ESG 儀表板（個人：CSS 圖表/成就徽章/SDG；企業：排行榜/報告CTA）
- AuthGuard 元件：/trips /post /wallet /notifications /esg 皆受保護

### 🔲 待完成（Day 7）
- Vercel 部署（公開連結讓他人操作）
- 全流程整合測試（搜尋→預訂→扣款→評價）
- CLAUDE.md 最終更新

## B2B（下週後續，不在當前 Deadline 內）
- 企業管理後台、ESG 報告匯出、費用報帳、企業 SSO
