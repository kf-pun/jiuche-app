# 錢包總覽 功能規格書

**版本：** v1.1
**日期：** 2026-03-18
**狀態：** 已完成

---

## 1. 背景與目標

使用者在預訂共乘、司機收款、儲值等操作後，需要一個集中管理金流的地方，方便查閱餘額、月收支概況與完整交易紀錄。

**目標：**
- 讓使用者一眼掌握目前餘額與本月收支
- 提供完整交易紀錄，方便核對每筆金流
- 快速進入儲值、轉帳、提領等操作

---

## 2. 使用者故事

- 身為**乘客**，我希望查看目前錢包餘額，這樣才能判斷是否需要儲值才能繼續預訂。
- 身為**司機**，我希望查看本月共乘收款金額，這樣才能掌握額外收入狀況。
- 身為**使用者**，我希望看到每筆交易紀錄，這樣才能核對是否有錯誤扣款。
- 身為**使用者**，我希望快速跳到儲值頁面，這樣才能在餘額不足時立即補充。

---

## 3. 功能範圍

### 已完成功能
- AuthGuard 保護：未登入自動導向 `/auth/login`
- **Header 餘額卡：**
  - 大字顯示目前餘額（來自 `authContext user.balance`，DB 同步）
  - 本月支出 / 本月入帳（從 `wallet_transactions` 依當月日期篩選加總）
- **快捷操作列**（浮在 Header 下方）：
  - 儲值 → `/wallet/topup`
  - 轉帳 → `#`（視覺展示，無功能）
  - 提領 → `#`（視覺展示，無功能）
- **交易紀錄列表**（從 DB 載入，最多 50 筆）：
  - 4 種 DB 類型：topup（藍）、payment（橘）、earning（綠）、refund（紫）
  - 每筆顯示：類型圖示、類型中文標籤、description、金額（入帳綠 +、扣款灰 -）、日期
  - 含 loading spinner + 空狀態提示
- **[S4-2 新增]** 交易紀錄從 `wallet_transactions` 表真實載入（`getWalletTransactions()` Server Action）
- **[S4-2 新增]** 本月收支以當月真實交易計算（非 mock 固定值）

### 待製作
- 轉帳功能（目前 href="#"，無實際功能）
- 提領功能（目前 href="#"，無實際功能）
- 交易紀錄分頁或「載入更多」（目前上限 50 筆）
- 按類型篩選交易紀錄（如只看付款 / 只看收款）

---

## 4. 使用流程

**進入頁面：**
1. 已登入使用者點擊 BottomNav 或個人資料頁連結進入 `/wallet`
2. 看到當前餘額、月收支、快捷操作列、交易紀錄

**儲值：**
1. 點擊「儲值」按鈕 → 跳轉至 `/wallet/topup`

**例外：未登入**
1. AuthGuard 攔截，記錄 `jiuche_redirect = /wallet` 至 sessionStorage
2. 跳轉至 `/auth/login`，登入後跳回 `/wallet`

---

## 5. 畫面與功能說明

### 錢包頁
- **路由：** `/wallet`
- **是否需要登入：** 是（AuthGuard 保護）

**Header 區（綠色漸層）：**
- 左：「揪車錢包」標籤 + 大字餘額 `NT$ {balance}`
- 右：錢包圖示（白色半透明圓角方塊）
- 下方 2 格卡片（白色半透明底）：本月支出（向下箭頭）/ 本月入帳（向上箭頭）

**快捷操作列（`-mt-4` 浮上 Header）：**
- 白色卡片 `shadow-md`，3 欄：儲值（綠）/ 轉帳（藍）/ 提領（紫）
- 每項：圓角方形圖示 + 文字標籤

**交易紀錄：**
- 標題「交易紀錄」（小灰字 uppercase）
- 白色圓角卡片，每筆間 `border-b border-gray-50`
- 每筆：左側類型圖示、中間標題+副標、右側金額+日期

**交易類型與顏色：**

| 類型 | 標題範例 | 圖示底色 | 金額顏色 |
|------|----------|----------|----------|
| topup（儲值）| 儲值 | 藍色 | 綠色（+）|
| pay（付款）| 共乘付款 | 橘色 | 灰色（-）|
| receive（收款）| 共乘收款 | 綠色 | 綠色（+）|
| refund（退款）| 退款 | 紫色 | 綠色（+）|

---

## 6. 資料說明

- **餘額**：來自 `authContext user.balance`，由 Supabase `users.balance` 持久化
- **月支出 / 入帳**：從 `wallet_transactions` 篩選當月（`created_at` 月份比對），`amount < 0` 加總 = 支出，`amount > 0` 加總 = 入帳
- **交易紀錄**：透過 `getWalletTransactions()` Server Action 從 `wallet_transactions` 表查詢（`user_id = auth.uid()`，按 created_at 降冪，上限 50 筆）
- DB 交易類型：`topup | payment | refund | earning`（對應顯示中文：儲值 / 共乘付款 / 退款 / 共乘收款）
- 交易欄位：`id, type, amount, description, createdAt`

---

## 7. 設計規範

- 手機優先，最寬 448px，底部保留 `pb-20`
- Header：`bg-gradient-to-br from-green-600 to-emerald-500 px-5 pt-12 pb-8`
- 快捷操作列：`-mt-4`（上移覆蓋 Header 底部），`shadow-md`
- 交易紀錄卡：`rounded-2xl shadow-sm overflow-hidden`，每筆間 `border-b border-gray-50`
- 金額正負：入帳 `text-green-600`，扣款 `text-gray-700`

---

## 8. 備註

- 本月收支現已從真實 `wallet_transactions` 依當月篩選計算（S4-2 完成）
- 轉帳、提領功能目前為外觀展示，正式上線需另行規劃功能範圍
