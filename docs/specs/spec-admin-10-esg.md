# 後台 ESG 報告 功能規格書

**版本：** v1.0
**日期：** 2026-03-18
**狀態：** 已完成

---

## 1. 背景與目標
- 企業客戶與管理層需要查看全平台 ESG 減碳成果，並能匯出正式 PDF 報告
- 目標：提供累計 CO₂ 統計、月度趨勢圖、公司排行榜、一鍵匯出 PDF

## 2. 使用者故事
- 身為管理員，我希望看到全平台累計 CO₂ 減碳量，這樣才能掌握平台環境貢獻
- 身為管理員，我希望看到各公司的 CO₂ 排行榜，這樣才能識別高貢獻企業
- 身為管理員，我希望匯出 PDF 報告，這樣才能提供給企業客戶或對外公告

## 3. 功能範圍

### 已完成功能
- 無

### 待製作
- 頂部 KPI 卡（總減碳量、總行程數、總乘客次、減少車輛數）
- 月度趨勢折線圖（近 6 個月 CO₂）
- 公司排行榜（依 CO₂ 降冪，Top 10）
- 匯出 PDF 按鈕（`@media print` CSS 方案）

## 4. 使用流程

1. 管理員進入 `/admin/esg`
2. 頁面自動載入全平台統計數據
3. 可選擇年份篩選（預設當年）
4. 點擊「匯出 PDF 報告」→ 觸發瀏覽器列印對話框 → 另存 PDF

## 5. 畫面與功能說明

### ESG 報告（`/admin/esg`）
- **頁面標題：** ESG 報告

**頂部 KPI（4 格）：**

| 指標 | 計算方式 | 圖示色 |
|------|---------|--------|
| 累計減碳量 | `SUM(co2_saved)` from rides where status='completed' | 綠色 |
| 完成行程數 | `COUNT(rides)` where status='completed' | 藍色 |
| 累計乘客次 | `COUNT(bookings)` where status='completed' | 橘色 |
| 減少車輛數 | 累計乘客次（每筆視為少開 1 輛） | 紫色 |

**月度趨勢折線圖（近 6 個月）：**
- X 軸：月份（e.g. 10月、11月、12月、1月、2月、3月）
- Y 軸：當月 CO₂ 減碳量（kg）
- 用純 CSS/SVG 折線圖（不引入額外圖表套件）

**年份篩選：**
- Select：近 3 年可選（2024、2025、2026）
- 切換後 KPI 和圖表重新計算

**公司排行榜：**
- 標題：「企業 ESG 貢獻排行榜」
- 表格：排名 / 公司名稱 / 員工共乘次數 / 累計減碳量（kg）/ 碳排等級（A/B/C）
- 排序：依累計減碳量降冪，固定顯示 Top 10

**匯出 PDF 按鈕：**
- 右上角「匯出 PDF 報告」（`bg-green-600 text-white`）
- 觸發 `window.print()`
- Print CSS：隱藏左側導覽欄、工具列、按鈕；只印報告內容

## 6. 資料說明
- KPI：`rides`（co2_saved、status）+ `bookings`（status='completed'）
- 月度趨勢：GROUP BY 月份（台灣時區 Asia/Taipei）
- 公司排行：`users.company` GROUP BY + JOIN `bookings`（status='completed'）

**Server Actions（`src/actions/admin/esg.ts`）：**
```ts
getEsgStats(year: number)       // 全平台 KPI
getMonthlyTrend(year: number)   // 近 6 個月趨勢
getCompanyRanking()             // 公司排行 Top 10
```

## 7. 設計規範
- 折線圖用純 CSS/SVG 實現，不引入 recharts 等套件
- PDF 匯出用 `@media print` CSS，隱藏左側導覽與操作按鈕
- KPI 數字：`text-3xl font-bold`，副標題 `text-sm text-gray-400`
- 碳排等級：A（≥ 100kg）= 綠、B（50-99kg）= 黃、C（< 50kg）= 灰

## 8. 備註
- CO₂ 計算：`rides.co2_saved` 欄位（建立行程時已計算並存入）
- 若 `co2_saved` 為 null 則用 `seats × 0.6 kg` 估算
- PDF 匯出透過瀏覽器原生列印，不依賴第三方 PDF 套件

## 9. 待確認事項
- 無
