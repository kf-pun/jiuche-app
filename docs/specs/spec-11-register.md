# 註冊 功能規格書

**版本：** v1.1
**日期：** 2026-03-19
**狀態：** 已完成

---

## 1. 背景與目標

### 背景
使用者首次以手機號碼完成 OTP 驗證後，系統尚無其個人資料（姓名、公司、是否為司機）。必須引導其填寫基本資料，才能讓平台進行共乘媒合與 ESG 計算。

### 目標
1. 讓新用戶在首次登入後，一頁完成姓名、公司、車輛資料填寫
2. 填寫完成後自動登入並跳回原本想前往的頁面（redirect-back）
3. 司機選項清晰易懂，不強迫非司機使用者填寫車輛資訊

---

## 2. 使用者故事

- 身為**第一次使用揪車的員工**，我希望快速填好公司和姓名，這樣才能開始預訂同事的共乘
- 身為**想當司機賺外快的員工**，我希望在註冊時就填好車輛資訊，這樣才能馬上發布行程
- 身為**只想乘車的使用者**，我希望不需要填寫車輛資訊也能完成註冊，這樣才不會覺得被強迫

---

## 3. 功能範圍

### 已完成功能
- 基本資料填寫：姓名（必填）、公司/機構（必填）
- 司機設定切換開關（預設關閉）
- 司機欄位（開啟後顯示）：車型（必填）、車牌號碼（必填）、車身顏色（6 種色票，非必填）
- 表單驗證：欄位空白時顯示紅色錯誤訊息，錯誤清除時即時回饋
- 提交後呼叫 `supabase.from("users").insert(...)` 寫入 DB，再呼叫 `refreshUser()` 同步前端狀態
- 提交中顯示旋轉動畫，按鈕 disabled
- 完成後跳回 `sessionStorage` 的 `jiuche_redirect`，無則跳首頁 `/`
- 車牌欄位即時 transform：`replace(/[^A-Za-z0-9-]/g, "").toUpperCase()`（過濾特殊字元 + 強制大寫）
- ESG 說明卡片（告知每次共乘自動計算減碳量）
- 使用 `<Suspense>` 包裹（因使用 `useSearchParams` 讀取 `phone` 參數）

### 待製作
- 無（登入頁 spec-04 已實作新用戶判斷，OTP 驗證後若 DB 無對應 users 記錄即導向此頁）

---

## 4. 使用流程

### 4.1 成功路徑
1. 使用者在登入頁完成 OTP 驗證（手機號碼為新用戶）
2. 系統帶著 `?phone=09xxxxxxxx` 導向 `/auth/register`
3. 使用者填寫姓名、公司
4. （可選）開啟「我想當司機」→ 填寫車型、車牌、選擇車色
5. 點擊「完成註冊，開始揪車！」
6. 系統驗證通過 → 顯示旋轉動畫（模擬 1 秒）
7. 呼叫 `supabase.from("users").insert(...)` 寫入 DB → 呼叫 `refreshUser()` 同步前端狀態
8. 讀取 `sessionStorage` 的 `jiuche_redirect` → 清除後跳回原頁面（無則跳 `/`）

### 4.2 失敗例外
- **姓名為空**：顯示「請輸入姓名」紅色提示，停留原頁
- **公司為空**：顯示「請輸入公司名稱」紅色提示
- **司機開啟但車型為空**：顯示「請輸入車型」
- **司機開啟但車牌為空**：顯示「請輸入車牌號碼」
- **提交中**：按鈕 disabled，無法重複送出

---

## 5. 畫面與功能說明

### 5.1 註冊頁

**路由：** `/auth/register?phone={手機號碼}`
**需要登入：** 否（本頁就是登入的最後一步）

**畫面結構（從上到下）：**

**Header 區塊**（綠色漸層背景）
- 使用者圖示（圓形半透明白底）
- 主標題「建立帳號」
- 副標「完成後即可開始使用揪車」

**基本資料卡片**（白色圓角卡）
- 區塊標題「基本資料」
- 欄位：姓名（placeholder：「請輸入您的姓名」）
- 欄位：公司/機構（placeholder：「例：台積電、聯發科」，提示文字：「用於媒合同公司同事共乘」）

**司機設定卡片**（白色圓角卡）
- 標題「我想當司機」＋副標「開啟後可發布共乘行程」
- 右側切換開關（關：灰色 / 開：綠色，有滑動動畫）
- 開啟後展開（帶分隔線）：
  - 欄位：車型（placeholder：「例：Toyota Camry」）
  - 欄位：車牌號碼（placeholder：「例：ABC-1234」）
  - 車身顏色色票：白色、銀色、黑色、灰色、藍色、紅色（點選後綠色選中樣式）

**ESG 說明卡片**（emerald → teal 漸層）
- 資訊圖示 ＋ 說明文字：「每次共乘都將自動計算減碳量，累積您的 ESG 貢獻，並納入企業永續報告。」

**送出按鈕**
- 文字「完成註冊，開始揪車！」
- 提交中：旋轉圖示 ＋「建立中...」，disabled

**各欄位狀態：**
- 一般：灰底（`bg-gray-50`）、無框線
- 聚焦：綠色框線
- 錯誤：紅色框線 ＋ 紅底 ＋ 欄位下方紅色錯誤文字
- 有提示文字（hint）時：無錯誤才顯示

---

## 6. 資料說明

| 項目 | 說明 |
|------|------|
| `phone` | 由登入頁透過 URL query 傳入，`useSearchParams().get("phone")`，轉換為 E.164 格式（`+8869xxxxxxxx`）存入 DB |
| 帳號建立 | `supabase.from("users").insert(...)` 寫入 `public.users`，欄位包含 id（Supabase auth UID）、phone、name、company、is_driver、vehicle_type/plate/color、balance=0、co2_total=0、rating=0 |
| 狀態同步 | 寫入成功後呼叫 `refreshUser()` 從 DB 重新載入 authContext |
| Redirect | 讀取並清除 `sessionStorage` key: `jiuche_redirect`，跳回原頁或 `/` |

**寫入 DB 的使用者欄位：**
```ts
{
  id: authUser.id,       // Supabase auth UID
  phone: "+8869xxxxxxxx", // E.164 格式
  name: string,
  company: string,
  is_driver: boolean,
  vehicle_type: string | null,  // 司機模式才有值
  vehicle_plate: string | null,
  vehicle_color: string | null,
  balance: 0,
  co2_total: 0,
  rating: 0,
  rating_count: 0,
}
```

---

## 7. 設計規範

- 手機優先，畫面最寬 448px
- Header：`bg-gradient-to-br from-green-600 to-emerald-500 px-5 pt-12 pb-8`
- 卡片：`bg-white rounded-2xl shadow-sm p-5`
- ESG 卡片：`bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl`
- 主按鈕：`bg-gradient-to-r from-green-600 to-emerald-500`，`active:scale-95`
- 切換開關滑動動畫：`transition-all`，圓鈕 `left-0.5` → `left-6`
- BottomNav 隱藏：`/auth/*` 路徑下不顯示

---

## 8. 備註

- 登入頁（spec-04）已實作新用戶判斷：OTP 驗證後查詢 `public.users`，若無記錄則導向 `/auth/register?phone={號碼}`。
- 車身顏色為非必填項目，未選時存 `null`（`vehicle_color: null`）。
- 資料寫入 Supabase `public.users` 表，已完成後端持久化。
- 姓名、公司驗證僅檢查是否空白（`!trim()`），無最低字元長度限制。
- Session 過期時提交會收到「Session 已過期，請重新登入」錯誤並跳回 `/auth/login`。

---

## 9. 待確認事項

- 目前「我想當司機」預設為關閉。如果 Demo 想展示司機功能，是否需要一個「快速切換為司機帳號」的入口？
- 車身顏色只有 6 種固定選項（白/銀/黑/灰/藍/紅）。是否有其他常見車色需要補上（例如：棕色、金色）？
- 使用者填完並送出後，目前沒有成功動畫，直接跳頁。是否需要短暫的成功提示（如：「帳號建立成功！」），還是直接跳頁即可？
