# 後台行程管理 功能規格書

**版本：** v1.0
**日期：** 2026-03-18
**狀態：** 已確認

---

## 1. 背景與目標
- 管理員需要查閱所有行程，並能對問題行程（司機臨時取消、違規行程）進行強制介入
- 目標：提供完整行程列表與詳情，支援強制取消並自動批次退款給所有已訂乘客

## 2. 使用者故事
- 身為管理員，我希望搜尋特定起訖點或司機名稱，這樣才能快速找到目標行程
- 身為管理員，我希望看到一個行程下有哪些乘客已預訂，這樣才能掌握影響範圍
- 身為管理員，我希望強制取消問題行程並一鍵退款給所有乘客，這樣才能有效處理突發事件

## 3. 功能範圍

### 已完成功能
- 無

### 待製作
- 行程列表頁（搜尋 + 狀態/日期篩選 + 分頁）
- 行程詳情頁（行程資訊 + 乘客名單）
- 強制取消行程 Modal（批次退款 + 可選通知）

## 4. 使用流程

**查詢行程：**
1. 管理員進入 `/admin/rides`
2. 輸入起訖點或司機名稱搜尋，或選狀態/日期範圍篩選
3. 點擊行程列 → 進入 `/admin/rides/[id]`

**強制取消行程：**
1. 管理員在行程詳情頁點擊「強制取消行程」（紅色）
2. Modal 顯示：「共 N 位乘客將被退款，總退款 NT$X」
3. 勾選「發送取消通知給所有乘客」（預設勾選）
4. 確認 → 依序執行：
   - `rides.status = 'cancelled'`
   - 批次查出所有 `status = 'confirmed'` 的 bookings
   - 每筆 booking：`status = 'cancelled'` + 寫退款 `wallet_transactions` + 更新乘客 `balance`
   - 若勾選通知：批次寫入各乘客的 `notifications`
5. 成功：toast 綠色，詳情頁狀態更新

**失敗路徑：**
- 行程已是 `cancelled` 或 `completed` 狀態 → 操作按鈕不顯示

## 5. 畫面與功能說明

### 行程列表（`/admin/rides`）
- **頁面標題：** 行程管理
- **工具列：**
  - 搜尋欄（placeholder：「搜尋起點、終點或司機名稱…」，debounce 500ms）
  - 狀態篩選 select：全部 / 進行中（active）/ 已完成（completed）/ 已取消（cancelled）
  - 日期範圍：出發日期起～迄（type=date）
- **表格欄位：**

| 欄位 | 說明 |
|------|------|
| 路線 | 起點 → 終點 |
| 司機 | 頭像縮寫 + 姓名 |
| 出發時間 | YYYY/MM/DD HH:MM（台灣時區） |
| 單價 | NT$ |
| 座位 | 已訂/總座位（e.g. 2/4） |
| CO₂ | X.X kg |
| 狀態 | 標籤色票 |

- **狀態標籤：** active=綠、completed=灰、cancelled=紅
- **排序：** 預設依「出發時間」降冪
- **分頁：** 每頁 20 筆
- **點擊整列** → `/admin/rides/[id]`

### 行程詳情（`/admin/rides/[id]`）
- **返回連結：** ← 返回行程列表
- **行程資訊卡：**
  - 路線（大字）、出發時間、集合地點（若有）、備註（若有）
  - 單價、總座位數、可用座位數、CO₂ 減碳量
  - 狀態標籤
  - 司機資訊：頭像縮寫 + 姓名 + 電話，「查看會員詳情 →」連結至 `/admin/users/[id]`
- **操作按鈕（右上角）：**
  - 僅 `active` 狀態顯示「強制取消行程」（`bg-red-600`）
  - 其他狀態：不顯示操作按鈕
- **乘客名單：**
  - 標題：「已訂乘客（N 人）」
  - 表格：頭像縮寫 + 姓名 + 電話 + 座位數 + 付款金額 + 訂單狀態 + 「查看訂單 →」連結
  - `confirmed` 狀態：正常顯示
  - `cancelled` 狀態：灰色半透明
  - 空狀態：「目前尚無乘客預訂此行程」

### 強制取消行程 Modal
- 紅色警示圖示
- 標題：「確認強制取消此行程？」
- 影響摘要：
  ```
  共 N 位乘客將收到退款
  總退款金額：NT$ X,XXX
  ```
- 勾選框：「同時發送取消通知給所有乘客」（預設勾選）
- 按鈕：取消（灰）、確認強制取消（紅）

## 6. 資料說明
- 讀取：`rides` join `users`（司機資訊）
- 詳情：`bookings` join `users`（乘客）where `ride_id = ?`
- 強制取消寫入：
  - `rides: { status: 'cancelled' }`
  - 批次 `bookings: { status: 'cancelled' }` where ride_id AND status='confirmed'
  - 批次 `wallet_transactions`（type='refund'，各乘客退款）
  - 批次更新 `users.balance`
  - 批次 `notifications`（可選，type='system'）

**Server Actions（`src/actions/admin/rides.ts`）：**
```ts
getAdminRides(params)                        // 列表
getAdminRideDetail(rideId)                   // 詳情 + 乘客名單
forceCancel Ride(rideId, sendNotification)   // 強制取消
```

## 7. 設計規範
- 同 Sprint 6 後台規範（`bg-white rounded-xl shadow-sm`）
- 強制取消按鈕：`bg-red-600 hover:bg-red-700 text-white`，必須二次確認
- 乘客名單：cancelled 訂單列 `opacity-50`

## 8. 備註
- 強制取消只退 `status='confirmed'` 的乘客，`completed` 狀態訂單不退款
- 批次操作按順序執行，任一乘客退款失敗仍繼續處理其他乘客

## 9. 待確認事項
- 無
