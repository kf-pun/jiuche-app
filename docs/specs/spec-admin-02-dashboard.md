# 後台 Dashboard 總覽 功能規格書

**版本：** v1.0
**日期：** 2026-03-18
**狀態：** 已完成

---

## 1. 背景與目標
- 管理員登入後台第一眼看到的是整體平台概況
- 目標：讓管理員在 30 秒內掌握今日關鍵數字、近期趨勢、最新待處理項目

## 2. 使用者故事
- 身為管理員，我希望一進後台就看到今日新增用戶/行程/訂單數，這樣才能掌握平台活躍度
- 身為管理員，我希望看到近 30 天的預訂量趨勢，這樣才能判斷平台成長走向
- 身為管理員，我希望快速看到最新 5 筆訂單，這樣才能及時處理異常

## 3. 功能範圍

### 已完成功能
- 無（全新功能）

### 待製作
- 4 張 KPI 卡片：今日新增用戶、今日新增行程、今日新增訂單、累計減碳量
- 近 30 天預訂量折線圖（SVG 實作，無外部圖表庫）
- 最新 5 筆訂單列表
- 最新 5 位新用戶列表

## 4. 使用流程
1. 管理員進入 `/admin`
2. 頁面同時發出多個資料請求（Server Component，無需 useEffect）
3. 載入中各區塊顯示骨架動畫（`animate-pulse`）
4. 資料填入後可點擊訂單或用戶列表項目 → 導向詳情頁

## 5. 畫面與功能說明

### Dashboard（`/admin`）
- **網址：** `/admin`
- **頁面標題：** Dashboard

**KPI 卡片區（4 欄並排）：**

| 卡片 | 數值來源 | 比較 | 顏色 |
|------|---------|------|------|
| 今日新增用戶 | `users.created_at >= 今日 00:00 TST` | 與昨日同時段 ↑↓% | 藍色（`blue-600`）|
| 今日新增行程 | `rides.created_at >= 今日 00:00 TST` | 與昨日 ↑↓% | 綠色（`green-600`）|
| 今日新增訂單 | `bookings.created_at >= 今日 00:00 TST` | 與昨日 ↑↓% | 紫色（`purple-600`）|
| 累計減碳量 | `completed bookings` 的 `seats × 0.6` 加總 | 全平台累計 kg | 橘色（`orange-600`）|

- 比較百分比：上升 `text-green-600 ↑`，下降 `text-red-500 ↓`，持平 `text-gray-400`

**折線圖區（近 30 天預訂量）：**
- 標題：「近 30 天預訂量」
- 實作：原生 SVG，`viewBox="0 0 600 200"`，自適應寬度
- X 軸：每 5 天標一個日期標籤
- Y 軸：最大值自動計算，顯示 4 條水平輔助線
- 折線：`stroke="#10b981"`（emerald-500），`strokeWidth=2`
- 填充：`fill` 使用 `linearGradient`（emerald-100 → transparent）
- hover 效果：滑過資料點顯示當日數字 tooltip（純 CSS title 或 SVG `<title>`）

**最新訂單列表（右半區）：**
- 標題：「最新訂單」+ 右側「查看全部 →」連結至 `/admin/bookings`
- 欄位：訂單號（前8碼）、乘客名、路線（起→迄）、金額、狀態標籤、建立時間
- 每列 hover：`bg-gray-50`，cursor-pointer，點擊整列 → `/admin/bookings/[id]`
- 狀態標籤：confirmed=綠、cancelled=紅、completed=灰

**最新用戶列表（左半區）：**
- 標題：「新增會員」+ 右側「查看全部 →」連結至 `/admin/users`
- 欄位：頭像縮寫（圓形色塊）、姓名、公司、餘額、註冊時間
- 每列 hover：`bg-gray-50`，cursor-pointer，點擊整列 → `/admin/users/[id]`

**載入中：** `animate-pulse` 灰色骨架（卡片、圖表、列表各自骨架）
**登入狀態：** AdminGuard 保護

## 6. 資料說明
- 今日定義：台灣時區（Asia/Taipei）當日 00:00:00 ～ 23:59:59
- 昨日數字：`created_at >= 昨日 00:00 AND < 今日 00:00`
- 折線圖：`bookings.created_at` 按日期 group，過去 30 天（含今日）
- 累計減碳量：`bookings` where `status = 'completed'`，`SUM(seats) × 0.6`
- 所有資料用 `createServiceClient()` 查詢（繞過 RLS）

**Server Action（`src/actions/admin/dashboard.ts`）：**
```ts
getDashboardStats()   // KPI 數字
getBookingsTrend()    // 近 30 天折線圖資料
getLatestBookings()   // 最新 5 筆訂單
getLatestUsers()      // 最新 5 位用戶
```

## 7. 設計規範
- KPI 卡片：`bg-white rounded-xl shadow-sm p-6`
- 數字字級：`text-3xl font-bold text-gray-900`
- 副標題：`text-sm text-gray-500`
- 折線圖容器：`bg-white rounded-xl shadow-sm p-6`
- 列表容器：`bg-white rounded-xl shadow-sm`，thead `bg-gray-50 text-xs text-gray-500 uppercase tracking-wider`
- 頁面 padding：`p-8`

## 8. 備註
- 折線圖不使用 recharts / chart.js，用原生 SVG 實作
- Dashboard 使用 React Server Component，資料在 server 端取得（無 loading state，有 Suspense fallback）

## 9. 待確認事項
- 無
