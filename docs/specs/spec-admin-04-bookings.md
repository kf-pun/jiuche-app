# 後台訂單管理 功能規格書

**版本：** v1.0
**日期：** 2026-03-18
**狀態：** 已完成

---

## 1. 背景與目標
- 管理員需要查閱所有訂單，並能手動介入處理異常（退款、確認、完成）
- 目標：提供完整訂單列表、篩選搜尋、與可靠的退款流程

## 2. 使用者故事
- 身為管理員，我希望搜尋訂單號或乘客名稱，這樣才能快速定位客訴訂單
- 身為管理員，我希望對訂單執行取消+退款，這樣才能處理行程異常
- 身為管理員，我希望標記訂單完成，這樣才能更新訂單狀態讓用戶可以評價
- 身為管理員，我希望篩選特定狀態或日期範圍的訂單，這樣才能快速找到目標

## 3. 功能範圍

### 已完成功能
- 無

### 待製作
- 訂單列表頁（搜尋 + 狀態篩選 + 日期範圍篩選 + 分頁）
- 訂單詳情頁（完整資訊 + 相關交易）
- 手動標記完成（二次確認）
- 手動取消 + 退款（自動寫退款交易 + 可選發通知）

## 4. 使用流程

**取消退款流程：**
1. 管理員在列表找到目標訂單，點擊進入詳情頁
2. 點擊「取消並退款」（紅色按鈕）
3. Modal 顯示退款金額，勾選「是否發送取消通知給乘客」（預設勾選）
4. 確認 → 執行以下操作（原子性，全部成功或全部回滾）：
   - `bookings.status = 'cancelled'`
   - 寫入 `wallet_transactions`（type='refund'，amount=正數金額）
   - `users.balance += 退款金額`
   - `rides.available_seats += 訂單座位數`
   - 若勾選通知：寫入 `notifications`
5. 成功：toast 綠色；詳情頁狀態即時更新

**標記完成流程：**
1. 管理員在詳情頁點擊「標記完成」（綠色按鈕）
2. 二次確認 Modal
3. 確認 → `bookings.status = 'completed'`
4. 前台乘客可對此行程進行評價

## 5. 畫面與功能說明

### 訂單列表（`/admin/bookings`）
- **頁面標題：** 訂單管理
- **工具列：**
  - 搜尋欄（placeholder：「搜尋訂單號或乘客姓名…」，debounce 500ms）
  - 狀態篩選 select：全部 / 已確認（confirmed）/ 已完成（completed）/ 已取消（cancelled）
  - 日期範圍：起始日期 input + 結束日期 input（type=date）
- **表格欄位：**

| 欄位 | 說明 |
|------|------|
| 訂單號 | 前8碼，格式 `JC` + 6碼 |
| 乘客 | 頭像縮寫 + 姓名 |
| 路線 | 起點 → 終點 |
| 座位 | X 席 |
| 金額 | NT$ 格式 |
| 狀態 | 標籤色票 |
| 建立時間 | YYYY/MM/DD HH:MM |

- **狀態標籤：** confirmed=`bg-green-100 text-green-700`、completed=`bg-gray-100 text-gray-500`、cancelled=`bg-red-100 text-red-600`
- **排序：** 預設依「建立時間」降冪
- **分頁：** 每頁 20 筆
- **點擊整列** → `/admin/bookings/[id]`

### 訂單詳情（`/admin/bookings/[id]`）
- **頁面標題：** 訂單詳情 + 返回列表連結
- **訂單基本資訊卡：**
  - 完整訂單號、狀態標籤（大）、建立時間
- **乘客資訊區：**
  - 頭像縮寫、姓名、電話
  - 「查看會員詳情 →」連結至 `/admin/users/[passenger_id]`
- **行程資訊區：**
  - 起點、終點、出發時間（台灣時區）
  - 座位數、單價（NT$）、總金額（NT$）
  - CO₂ 減碳（seats × 0.6 kg）
- **操作按鈕區（依狀態顯示）：**
  - `confirmed`：「標記完成」（`bg-green-600`）＋「取消並退款」（`bg-red-600`）
  - `completed`：顯示「此訂單已完成」提示，無操作按鈕
  - `cancelled`：顯示「此訂單已取消」提示，無操作按鈕
- **相關交易記錄：**
  - 表格：類型標籤、金額（正=綠/負=紅）、備註、時間
  - 顯示此 `booking_id` 關聯的所有 `wallet_transactions`

### 取消退款 Modal
- 標題：「取消訂單並退款」
- 退款資訊：「退款 NT$ [金額] 至 [乘客姓名] 的揪車錢包」（`text-lg font-bold text-red-600`）
- 勾選框：「同時發送取消通知給乘客」（預設勾選）
- 通知預覽（灰色小字）：「您的訂單 #XXXXXX 已取消，NT$xxx 已退回您的揪車錢包」
- 按鈕：「取消」（灰）、「確認取消並退款」（紅）

### 標記完成 Modal
- 標題：「標記訂單為已完成」
- 說明：「確認後，乘客將可對此行程進行評價。」
- 按鈕：「取消」（灰）、「確認完成」（綠）

### Toast 通知
- 右下角固定定位
- 成功：`bg-green-600` 綠色，3 秒消失
- 失敗：`bg-red-600` 紅色，5 秒消失（含錯誤訊息）

## 6. 資料說明
- 讀取：`bookings` join `rides`（起迄點、出發時間、price）join `users`（乘客姓名、電話）
- 搜尋：訂單 UUID 前 prefix 模糊比對 OR 乘客姓名 ilike
- 日期篩選：`bookings.created_at` 的台灣時區範圍

**取消退款寫入（`src/actions/admin/bookings.ts`）：**
```ts
cancelBookingWithRefund(bookingId, sendNotification: boolean)
// 1. UPDATE bookings SET status='cancelled'
// 2. INSERT wallet_transactions (type='refund', amount=+totalPrice)
// 3. UPDATE users SET balance = balance + totalPrice
// 4. UPDATE rides SET available_seats = available_seats + seats
// 5. (optional) INSERT notifications
```

**標記完成：**
```ts
completeBooking(bookingId)
// UPDATE bookings SET status='completed'
```

**Server Actions（`src/actions/admin/bookings.ts`）：**
```ts
getAdminBookings(params)           // 列表（搜尋/篩選/分頁）
getAdminBookingDetail(bookingId)   // 詳情
cancelBookingWithRefund(bookingId, sendNotification)
completeBooking(bookingId)
```

所有操作用 `createServiceClient()` 繞過 RLS。

## 7. 設計規範
- 同會員管理規範（`bg-white rounded-xl shadow-sm`、hover、toast、modal）
- 「取消並退款」必須紅色，且需要二次確認 Modal
- 「標記完成」需要二次確認 Modal
- 操作按鈕僅在 `confirmed` 狀態顯示
- 詳情頁返回按鈕：左上角「← 返回訂單列表」

## 8. 備註
- 退款直接回到揪車錢包餘額，不支援退回原付款管道（Sprint 7 串接 ECPay 後再評估）
- 取消退款操作在 server action 中按順序執行，若中途失敗需 catch error 並回傳錯誤訊息
- 通知寫入 `notifications` 表：`type='system'`，`title='訂單取消通知'`，`body` 含退款金額

## 9. 待確認事項
- 無
