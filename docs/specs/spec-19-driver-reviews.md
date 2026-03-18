# 司機歷史評價列表 功能規格書

**版本：** v1.0
**日期：** 2026-03-18
**狀態：** 已確認

---

## 1. 背景與目標
- 乘客在預訂行程前，希望能看到司機的歷史評價，增加信任感
- 目標：在行程詳情頁的司機資訊區下方，顯示從 DB 取得的真實評價列表

## 2. 使用者故事
- 身為乘客，我希望在行程詳情頁看到司機的歷史評價，這樣才能決定是否預訂

## 3. 功能範圍

### 已完成功能
- 行程詳情頁（`/results/[id]`）已顯示司機頭像、姓名、平均星等
- 評價已寫入 `reviews` 表

### 待製作
- 司機評價列表區塊（行程詳情頁下方）：從 `reviews` 表讀取真實資料

## 4. 使用流程

1. 乘客進入 `/results/[id]`
2. 頁面下方「司機評價」區塊顯示最新 5 筆評價
3. 若評價超過 5 筆，顯示「+ N 則更多評價」按鈕，點擊展開全部

## 5. 畫面與功能說明

### 司機評價區塊（`/results/[id]`）
- **位置：** 司機資訊卡下方
- **標題：** 「司機評價（N 則）」

**每筆評價：**
- 乘客頭像縮寫（圓形，綠色背景）+ 匿名姓名（姓氏 + `**`，e.g. 王**）
- 星等（黃色 ★，`text-yellow-400`）
- 快速標籤（最多 3 個，`bg-green-100 text-green-700 rounded-full px-2 py-0.5 text-xs`）
- 評語文字（最多顯示 100 字，超過截斷 + 「…」）
- 評價時間（相對時間：e.g. 「3 天前」/ 「2 週前」）

**展開邏輯：**
- 預設顯示最新 5 筆
- 超過 5 筆時顯示「+ N 則更多評價」按鈕（`text-green-600 underline`）
- 點擊後顯示全部，按鈕消失

**空狀態：** 「此司機尚無評價」（`text-gray-400 text-center py-4`）

## 6. 資料說明
- 讀取：`reviews` JOIN `bookings` JOIN `rides`（取 driver_id）JOIN `users`（乘客姓名）
- 篩選條件：`driver_id = [行程的 driver_id]`
- 排序：`created_at DESC`
- 匿名化：乘客姓名只顯示第一個字 + `**`

**擴充 `src/actions/rides.ts`：**
```ts
getDriverReviews(driverId: string, limit?: number): Promise<DriverReview[]>
// SELECT reviews join ... WHERE driver_id = ? ORDER BY created_at DESC LIMIT ?
```

## 7. 設計規範
- 同前台設計規範（Mobile-First，`max-w-md`）
- 評價卡：`bg-white border border-gray-100 rounded-xl p-4 mb-3`
- 乘客頭像：`w-8 h-8 rounded-full bg-green-100 text-green-700 text-sm font-medium`
- 相對時間使用簡單計算（不引入 date-fns 等套件）

## 8. 備註
- 乘客姓名做匿名處理（只顯示第一字 + `**`），保護隱私
- 評價總數顯示於標題，與實際 `reviews` 表筆數一致

## 9. 待確認事項
- 無
