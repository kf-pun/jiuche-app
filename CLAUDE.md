# 揪車 JiuChe — CLAUDE.md

企業 ESG 減碳共乘平台 Prototype。
策略：前端優先、Mobile-First、Mock Data 展示完整流程。
目前階段：功能優化中 → 最後再部署 Vercel。

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
│   └── layout.tsx                  # Mobile Layout max-w-md + AuthProvider
├── components/
│   ├── BottomNav.tsx               # 底部導覽（/auth/* 時隱藏）
│   └── AuthGuard.tsx               # 未登入 → /auth/login + redirect-back
└── lib/
    ├── mockData.ts                 # 4筆 Ride mock 資料
    └── authContext.tsx             # Auth Context + localStorage 持久化
```

## 設計規範
- 主色：`green-600` / `emerald-500`（漸層）
- 圓角：`rounded-xl` / `rounded-2xl`
- 手機框：`max-w-md mx-auto`，內頁用 `pb-20`（避被 BottomNav 遮住）
- 動畫：success 頁用 `opacity/scale + delay` CSS transition
- Header：綠色漸層 `bg-gradient-to-br from-green-600 to-emerald-500 px-5 pt-12 pb-6`
- useSearchParams 頁面必須用 `<Suspense>` 包內層 function component

## Mock 資料
- `mockData.ts`：4筆 Ride（ride-001～ride-004），女性司機：ride-002、ride-004
- `authContext.tsx` DEFAULT_USER：王小明 / 台積電 / balance: 1250 / co2Total: 28.4
- OTP：888888（固定）
- localStorage key：`jiuche_user`
- sessionStorage key：`jiuche_redirect`（AuthGuard 登入後跳回用）

## AuthContext API
```ts
login(phone, userData?)  // 登入（userData 可選，否則用 DEFAULT_USER）
logout()
updateUser(partial)      // 更新部分欄位
deductBalance(amount)    // 扣款，回傳 boolean（餘額不足回傳 false）
addBalance(amount)       // 儲值
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

## 待優化項目（當前階段）
> 部署之前先把體驗拉滿

詳見 `/docs/specs/BACKLOG.md`，依優先度排序管理。

## 部署（最後執行）
```bash
vercel login   # 瀏覽器登入 Vercel
vercel --prod  # 在 jiuche-app 目錄執行
```
或直接在 vercel.com 用 GitHub import kf-pun/jiuche-app。

## B2B（Demo 後續）
- 企業管理後台、ESG 報告匯出（PDF）、費用報帳、企業 SSO
