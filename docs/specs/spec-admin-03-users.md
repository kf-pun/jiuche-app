# 後台會員管理 功能規格書

**版本：** v1.0
**日期：** 2026-03-18
**狀態：** 已確認

---

## 1. 背景與目標
- 管理員需要查閱、搜尋平台所有用戶，並對特定用戶執行管理操作
- 目標：提供完整的用戶列表與詳情，支援餘額調整與帳號停權

## 2. 使用者故事
- 身為管理員，我希望能搜尋特定用戶的姓名或電話，這樣才能快速找到需要處理的帳號
- 身為管理員，我希望對用戶手動調整餘額並留下備註，這樣才能處理客訴補償
- 身為管理員，我希望能停權違規用戶，這樣才能維護平台秩序
- 身為管理員，我希望在詳情頁查看用戶的歷史訂單與交易，這樣才能全面了解用戶行為

## 3. 功能範圍

### 已完成功能
- 無

### 待製作
- 會員列表頁（搜尋、篩選、分頁）
- 會員詳情頁（基本資料 + 三頁籤）
- 手動調整餘額 Modal
- 停權 / 解除停權二次確認 Modal

## 4. 使用流程

**查詢用戶：**
1. 管理員進入 `/admin/users`
2. 輸入姓名或電話關鍵字（debounce 500ms），或選擇角色/狀態篩選
3. 點擊用戶列 → 進入 `/admin/users/[id]`

**調整餘額：**
1. 在詳情頁點擊「調整餘額」
2. 輸入金額（正數=加值，負數=扣款）＋備註（必填）
3. Modal 即時顯示「調整後餘額：NT$ xxx」
4. 二次確認 → 寫入 `wallet_transactions`（type='adjustment'）+ 更新 `users.balance`
5. 成功：右下角 toast 綠色通知；失敗：toast 紅色通知

**停權用戶：**
1. 在詳情頁點擊「停權帳號」
2. 紅色二次確認 Modal
3. 確認 → 更新 `users.is_active = false`
4. 停權用戶下次嘗試登入時，系統拒絕並顯示「帳號已停權，請聯繫客服」

**解除停權：**
1. 在詳情頁點擊「解除停權」
2. 確認 → 更新 `users.is_active = true`

## 5. 畫面與功能說明

### 會員列表（`/admin/users`）
- **頁面標題：** 會員管理
- **工具列：**
  - 搜尋欄（placeholder：「搜尋姓名或電話…」）
  - 角色篩選 select：全部 / 用戶 / 管理員
  - 狀態篩選 select：全部 / 正常 / 停權
- **表格欄位：**

| 欄位 | 說明 |
|------|------|
| 用戶 | 頭像縮寫圓形 + 姓名 + 電話（小字） |
| 公司 | 公司名稱 |
| 角色 | 管理員=紫色標籤 / 用戶=灰色標籤 |
| 狀態 | 正常=綠色標籤 / 停權=紅色標籤 |
| 餘額 | NT$ 格式 |
| 評分 | ⭐ 數字（一位小數） |
| 註冊時間 | YYYY/MM/DD |

- **排序：** 預設依「註冊時間」降冪（最新優先）
- **分頁：** 每頁 20 筆，底部分頁器（← 上一頁 / 1 2 3 … / 下一頁 →）
- **空狀態：** 「找不到符合條件的會員」（搜尋無結果時）
- **點擊整列** → `/admin/users/[id]`

### 會員詳情（`/admin/users/[id]`）
- **頂部資料卡（`bg-white rounded-xl shadow-sm p-6`）：**
  - 左：頭像縮寫（大圓，64px）、姓名（`text-2xl font-bold`）、電話、公司
  - 右側數字區：當前餘額、評分（含評價數）、累計 CO₂
  - 狀態標籤 + 角色標籤
- **操作按鈕區（頂部卡片右上角）：**
  - 「調整餘額」`bg-blue-600 text-white`
  - 停權時顯示「解除停權」`bg-green-600 text-white`
  - 正常時顯示「停權帳號」`bg-red-600 text-white`

- **三個頁籤：**

**① 歷史訂單**
- 表格：訂單號（前8碼）、路線（起→迄）、座位數、金額、狀態標籤、訂單時間
- 點擊整列 → `/admin/bookings/[id]`
- 空狀態：「此會員尚無訂單記錄」

**② 發布行程**
- 表格：路線、出發時間、單價、已訂/總座位、狀態標籤
- 空狀態：「此會員尚未發布行程」

**③ 交易記錄**
- 表格：類型標籤、金額（正=綠 / 負=紅）、備註、時間
- 類型標籤：topup=藍、payment=橘、refund=綠、adjustment=紫
- 空狀態：「此會員尚無交易記錄」

### 調整餘額 Modal
- 標題：「調整 [姓名] 的餘額」
- 輸入欄：金額（數字，允許負數，必填）、備註（文字，必填）
- 即時預覽：「調整後餘額：NT$ xxx」（灰色小字）
- 按鈕：「取消」（灰）、「確認調整」（藍）
- 驗證：金額不可為 0；備註不可為空

### 停權確認 Modal
- 紅色警示圓圈圖示（`bg-red-100`）
- 標題：「確認停權此帳號？」
- 說明：「停權後 [姓名] 將無法登入平台，所有進行中訂單不受影響，需手動處理。」
- 按鈕：「取消」（灰）、「確認停權」（紅）

### 解除停權確認 Modal
- 綠色確認圖示
- 標題：「確認解除停權？」
- 說明：「解除後 [姓名] 將可正常登入平台。」
- 按鈕：「取消」（灰）、「確認解除」（綠）

## 6. 資料說明
- 讀取：`users` 表（含 `role`、`is_active` 欄位）
- 詳情頁：join `bookings`、`rides`、`wallet_transactions`
- 寫入調整餘額：
  ```
  wallet_transactions: { user_id, type='adjustment', amount, description=備註 }
  users: { balance = balance + amount }
  ```
- 寫入停權：`users: { is_active = false }`
- 所有寫入用 `createServiceClient()` 繞過 RLS

**Server Actions（`src/actions/admin/users.ts`）：**
```ts
getAdminUsers(params)          // 列表（搜尋/篩選/分頁）
getAdminUserDetail(userId)     // 詳情基本資料
getUserBookingsAdmin(userId)   // 歷史訂單
getUserRidesAdmin(userId)      // 發布行程
getUserTransactionsAdmin(userId) // 交易記錄
adjustUserBalance(userId, amount, note)  // 調整餘額
toggleUserActive(userId, isActive)       // 停權/解除
```

## 7. 設計規範
- 列表表格：`bg-white rounded-xl shadow-sm overflow-hidden`
- thead：`bg-gray-50 text-xs text-gray-500 uppercase tracking-wider px-6 py-3`
- tbody tr：`border-t border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors`
- Modal backdrop：`fixed inset-0 bg-black/50 flex items-center justify-center z-50`
- Modal 本體：`bg-white rounded-2xl p-6 w-full max-w-md shadow-xl`
- Toast：`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-lg text-white text-sm`（成功=`bg-green-600`，失敗=`bg-red-600`，3 秒自動消失）

## 8. 備註
- 停權只影響登入，不自動取消進行中訂單（管理員需在訂單管理手動處理）
- `is_active = false` 的用戶登入時，在 auth 流程中偵測並拒絕（`/auth/login` 查詢 `users.is_active`）

## 9. 待確認事項
- 停權用戶的已確認訂單不自動取消（已確認：由管理員手動在訂單管理頁處理）
