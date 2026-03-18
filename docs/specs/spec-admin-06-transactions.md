# 後台金流管理 功能規格書

**版本：** v1.0
**日期：** 2026-03-18
**狀態：** 已完成

---

## 1. 背景與目標
- 管理員需要查閱所有錢包交易明細，掌握平台金流狀況，並能手動補償用戶
- 目標：提供完整交易列表、本月金流統計、手動補償功能、CSV 匯出

## 2. 使用者故事
- 身為管理員，我希望查看本月總收入與退款金額，這樣才能掌握平台財務狀況
- 身為管理員，我希望對特定用戶手動新增補償交易，這樣才能快速處理客訴
- 身為管理員，我希望匯出 CSV 報表，這樣才能交給財務部門做對帳

## 3. 功能範圍

### 已完成功能
- 無

### 待製作
- 頂部統計列（本月 4 個數字）
- 交易列表（搜尋 + 類型/日期篩選 + 分頁）
- 手動新增補償交易 Modal
- 匯出 CSV 按鈕（前端產生下載）

## 4. 使用流程

**查看金流：**
1. 管理員進入 `/admin/transactions`
2. 頂部自動顯示本月統計
3. 可用搜尋、類型篩選、日期範圍縮小範圍

**手動補償：**
1. 點擊「新增補償交易」
2. Modal 中輸入用戶姓名搜尋 → 選擇目標用戶
3. 輸入金額（正數加值 / 負數扣款）+ 備註（必填）
4. 確認 → 寫入 `wallet_transactions` + 更新 `users.balance`
5. 列表自動刷新

**匯出 CSV：**
1. 點擊「匯出 CSV」
2. 依目前篩選條件拉出全部符合記錄（最多 5000 筆）
3. 前端產生 CSV Blob → 瀏覽器下載，檔名：`jiuche_transactions_YYYYMMDD.csv`

## 5. 畫面與功能說明

### 金流管理（`/admin/transactions`）
- **頁面標題：** 金流管理

**頂部統計列（4 格，`bg-white rounded-xl shadow-sm p-6`）：**

| 統計 | 計算 | 顏色 |
|------|------|------|
| 本月總儲值 | `SUM(amount)` where type='topup' AND 本月 | 藍色 |
| 本月總付款 | `SUM(ABS(amount))` where type='payment' AND 本月 | 橘色 |
| 本月總退款 | `SUM(amount)` where type='refund' AND 本月 | 綠色 |
| 本月淨收益 | 總付款 − 總退款 | 紫色 |

- **工具列（搜尋 + 篩選 + 按鈕）：**
  - 搜尋欄（用戶姓名，debounce 500ms）
  - 類型篩選：全部 / 儲值 / 付款 / 退款 / 手動調整
  - 日期範圍（起～迄）
  - 「新增補償交易」`bg-blue-600 text-white`（右側）
  - 「匯出 CSV」`border border-gray-200 text-gray-600`（最右）

- **表格欄位：**

| 欄位 | 說明 |
|------|------|
| 用戶 | 頭像縮寫 + 姓名，可點擊連到 `/admin/users/[id]` |
| 類型 | 標籤色票 |
| 金額 | 正=`text-green-600 +NT$X` / 負=`text-red-500 -NT$X` |
| 備註 | description |
| 建立時間 | YYYY/MM/DD HH:MM |

- **類型標籤：** topup=藍、payment=橘、refund=綠、adjustment=紫
- **排序：** 依「建立時間」降冪
- **分頁：** 每頁 20 筆

### 手動補償 Modal
- 標題：「新增補償交易」
- 用戶搜尋欄（即時 debounce，顯示下拉建議最多 5 筆，選擇後鎖定顯示已選用戶）
- 金額輸入（數字，正負均可，必填）
- 備註輸入（必填）
- 即時預覽：「[用戶名] 的新餘額：NT$ XXX」
- 按鈕：取消（灰）、確認新增（藍）
- 驗證：用戶必選、金額不可為 0、備註不可空

### CSV 格式（逗號分隔，UTF-8 BOM）
```
交易編號,用戶姓名,用戶電話,類型,金額,備註,建立時間
uuid,王小明,+886912345678,topup,500,儲值（信用卡）,2026-03-18 14:30:00
```

## 6. 資料說明
- 讀取：`wallet_transactions` join `users`（姓名、電話）
- 本月定義：台灣時區（Asia/Taipei）當月 1 日 00:00:00 起
- 新增補償：`wallet_transactions`（type='adjustment'）+ 更新 `users.balance`
- CSV 匯出：最多 5000 筆，超過提示縮小篩選範圍

**Server Actions（`src/actions/admin/transactions.ts`）：**
```ts
getMonthlyStats()                          // 本月四項統計
getAdminTransactions(params)               // 列表（分頁）
getAllTransactionsForExport(params)        // 全量（CSV 用，無分頁）
createCompensation(userId, amount, note)  // 手動補償
searchUsersForCompensation(query)         // 用戶搜尋（補償 Modal 用）
```

## 7. 設計規範
- 統計列數字：`text-2xl font-bold`，副標題 `text-sm text-gray-400`
- CSV 匯出：前端產生 Blob，以 `\uFEFF` BOM 開頭確保 Excel 正確顯示中文
- 補償 Modal 用戶下拉：`absolute` 定位，`bg-white border rounded-xl shadow-lg z-10`

## 8. 備註
- CSV 在前端產生，不走 Server 下載端點
- 本月統計固定以台灣時區計算

## 9. 待確認事項
- 無
