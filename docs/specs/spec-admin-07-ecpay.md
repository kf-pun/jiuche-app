# 儲值串接 ECPay 支付 功能規格書

**版本：** v1.0
**日期：** 2026-03-18
**狀態：** 已確認

---

## 1. 背景與目標
- 目前儲值直接加餘額（假流程），需串接真實付款確保金流安全
- 目標：使用 ECPay 測試環境讓用戶完成真實（測試）付款，webhook 驗證後才入帳

## 2. 使用者故事
- 身為用戶，我希望儲值時可以使用信用卡付款，這樣才能安全地為錢包加值
- 身為管理員，我希望只有 ECPay 確認付款成功後才入帳，這樣才能防止假儲值

## 3. 功能範圍

### 已完成功能
- 前台儲值頁（選擇金額 + 付款方式 UI）
- `createTopup()` server action（目前直接入帳，需改寫）

### 待製作
- 前台儲值頁：送出改為產生 ECPay 表單並跳轉
- `POST /api/ecpay/callback` Route Handler：驗證簽章，成功才入帳
- `wallet_transactions` 新增 `status` / `ecpay_trade_no` 欄位（DB migration）
- 付款失敗/取消：儲值頁顯示 error banner

## 4. 使用流程

**成功路徑：**
1. 用戶選擇金額 + 付款方式，點「前往付款」
2. Server Action 建立 `status='pending'` 的 `wallet_transactions` 記錄
3. 產生 ECPay 表單 HTML，前端自動 submit 跳轉至 ECPay 付款頁
4. 用戶填入測試卡號完成付款
5. ECPay POST 至 `/api/ecpay/callback`
6. Route Handler 驗證 `CheckMacValue` 簽章
7. 驗證通過 → `wallet_transactions.status = 'completed'` + 更新 `users.balance`
8. ECPay redirect 用戶至 `/wallet/topup/success?method=ecpay`
9. 成功頁顯示「儲值成功」

**失敗路徑：**
- 簽章驗證失敗 → callback 回傳 `0|Error`，不入帳，`status = 'failed'`
- 用戶在 ECPay 取消 → redirect 至 `/wallet/topup?error=cancelled`

## 5. 畫面與功能說明

### 前台儲值頁（`/wallet/topup`）修改
- UI 不變（選金額 + 付款方式選擇）
- 付款方式選項：信用卡（Credit）、ATM 虛擬帳號（ATM）
- 按鈕文字：「確認儲值」→「前往付款」
- 點擊後：顯示「正在跳轉至付款頁…」loading overlay（半透明黑底 spinner）
- Error banner（query param `?error=cancelled` 或 `?error=failed`）：
  - cancelled：「付款已取消，請重新嘗試」（黃色 banner）
  - failed：「付款失敗，請聯繫客服」（紅色 banner）

### `/api/ecpay/callback`（Route Handler）
- **路徑：** `src/app/api/ecpay/callback/route.ts`
- **方法：** POST（接收 ECPay form data）
- **處理流程：**
  1. 解析 `application/x-www-form-urlencoded`
  2. 取出 `MerchantTradeNo`、`RtnCode`、`TradeNo`、`CheckMacValue`
  3. 重新計算 CheckMacValue（SHA256，URLEncode + 小寫）比對
  4. `RtnCode === '1'` AND 簽章正確 → 入帳
  5. 回傳純文字 `1|OK`（成功）或 `0|Error`（失敗）
- **安全：** 必須驗證簽章，不得僅憑 RtnCode 入帳

### 儲值成功頁（`/wallet/topup/success`）
- 延用現有設計（綠色勾勾動畫）
- 新增顯示：付款方式（從 query param 讀取）

## 6. 資料說明

**DB Migration（`supabase/migrations/003_wallet_tx_ecpay.sql`）：**
```sql
ALTER TABLE public.wallet_transactions
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'completed'
    CHECK (status IN ('pending', 'completed', 'failed'));
ALTER TABLE public.wallet_transactions
  ADD COLUMN IF NOT EXISTS ecpay_trade_no TEXT;
```

**ECPay 測試環境參數（存於 `.env.local`）：**
```
ECPAY_MERCHANT_ID=2000132
ECPAY_HASH_KEY=5294y06JbISpM5x9
ECPAY_HASH_IV=v77hoKGq4kWxNNIS
ECPAY_API_URL=https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5
ECPAY_RETURN_URL=https://<your-domain>/api/ecpay/callback
ECPAY_ORDER_RESULT_URL=https://<your-domain>/wallet/topup/success
```

**`MerchantTradeNo` 格式：** `JC` + timestamp（14 碼），e.g. `JC20260318143022`

**測試信用卡：**
- 卡號：`4311-9522-2222-2222`
- 安全碼：`222`
- 有效期：任意未來日期

**Server Action（`src/actions/wallet.ts` 擴充）：**
```ts
createEcpayOrder(userId, amount, paymentType)
// 1. INSERT wallet_transactions (status='pending', amount)
// 2. 產生 ECPay 所需參數 + 計算 CheckMacValue
// 3. 回傳 { formAction, params } 供前端組裝表單
```

## 7. 設計規範
- Loading overlay：`fixed inset-0 bg-black/60 flex items-center justify-center z-50`
- Error banner：`mx-4 mt-4 p-3 rounded-xl text-sm`，cancelled=`bg-yellow-50 text-yellow-700`，failed=`bg-red-50 text-red-600`
- 手機版全螢幕 Loading

## 8. 備註
- Webhook (`/api/ecpay/callback`) 需要公開 URL，本地開發需 ngrok 或部署至 Vercel 後測試
- 現有 `wallet_transactions` 記錄的 `status` 欄位默認為 `completed`，不影響現有功能
- CheckMacValue 計算：參數排序 → URLEncode → `HashKey=...&params...&HashIV=...` → SHA256 → 大寫

## 9. 待確認事項
- Webhook 測試建議以 Vercel 部署環境為主（本地無法接收 ECPay 回呼）（已確認）
