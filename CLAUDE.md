# 揪車 JiuChe — CLAUDE.md

企業 ESG 減碳共乘平台 Prototype，供投資人 Demo 使用。
策略：前端優先、Mobile-First、Mock Data 展示流程。

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
│   ├── page.tsx              # 首頁（搜尋表單）
│   ├── results/
│   │   ├── page.tsx          # 搜尋結果＋篩選排序
│   │   └── [id]/page.tsx     # 行程詳情
│   ├── booking/success/      # 預訂成功
│   ├── post/
│   │   ├── page.tsx          # 發布共乘（兩步驟表單）
│   │   └── success/          # 發布成功
│   ├── trips/page.tsx        # 我的行程（即將/歷史）
│   ├── esg/page.tsx          # ESG 儀表板（待實作）
│   └── layout.tsx            # Mobile Layout max-w-md
├── components/
│   └── BottomNav.tsx         # 底部導覽列（含中間發布FAB）
└── lib/
    └── mockData.ts           # Mock 共乘資料（4筆 Ride）
```

## 設計規範
- 主色：`green-600` / `emerald-500`（漸層）
- 圓角：`rounded-xl` / `rounded-2xl`
- 手機框：`max-w-md mx-auto`，`pb-20`（避被 BottomNav 遮住）
- 動畫：success 頁用 `opacity/scale + delay` CSS transition

## Mock 資料
`src/lib/mockData.ts` 有 4 筆 Ride（ride-001 ～ ride-004）
女性司機 ID：`ride-002`、`ride-004`

## 已完成頁面
Day1：首頁、搜尋結果、行程詳情、預訂成功
Day2：篩選排序、發布共乘、我的行程

## 待實作
- `/esg` ESG 儀表板（Day 5）
- 登入/個人設定（Day 6）
