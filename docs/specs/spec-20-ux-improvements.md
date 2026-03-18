# UX 補完 功能規格書

**版本：** v1.0
**日期：** 2026-03-18
**狀態：** 已確認

---

## 1. 背景與目標
- 多個頁面存在體驗缺口：空狀態沒有提示、欄位驗證無紅字、搜尋記錄不個人化、訂單號刷新後消失
- 目標：集中補完以上 5 個體驗缺口，提升整體完成感

## 2. 使用者故事
- 身為乘客，我希望歷史行程空白時看到插圖提示，這樣才不會以為頁面壞掉
- 身為用戶，我希望表單填錯欄位時看到紅字說明，這樣才能知道哪裡有問題
- 身為乘客，我希望搜尋紀錄只顯示我自己用過的關鍵字，這樣才有個人化體驗
- 身為乘客，我希望重新整理頁面後還能看到訂單號，這樣才不會找不到訂單

## 3. 功能範圍

### 待製作（依優先順序）

**UX-1 歷史行程空狀態插圖**
- 位置：`/trips`，「歷史」分頁，無資料時
- 內容：Inline SVG 圖示 + 說明文字 + CTA 按鈕

**UX-2 表單欄位驗證紅字**
- 位置：`/post`（發布行程）、`/auth/register`（註冊）
- 觸發：欄位 blur 或點擊送出後，顯示 `text-red-500 text-sm` 錯誤訊息
- 驗證規則：必填欄位空白、價格需 > 0、車牌格式

**UX-3 個人化搜尋記錄**
- 位置：`/`（首頁搜尋框取得焦點時顯示歷史建議）
- 改為：`jiuche_search_{userId}`（登入用戶）或 `jiuche_search_guest`（未登入）
- 最多保留 5 筆，最新的在最上方

**UX-4 訂單號 sessionStorage 持久化**
- 位置：`/booking/success`
- `createBooking()` 成功後，將 `bookingId` 存入 `sessionStorage('jiuche_last_booking')`
- success 頁優先讀 sessionStorage，避免刷新後訂單號消失

**UX-5 無障礙 aria-label**
- 位置：BottomNav 圖示按鈕、搜尋表單 input、重要 icon-only 按鈕
- 所有 `<button>` 補 `aria-label`，圖示 `<svg>` 補 `aria-hidden="true"`

## 4. 使用流程

各子項目各自獨立，無相互依賴。

## 5. 畫面與功能說明

**UX-1 空狀態（`/trips` 歷史分頁）：**
- Inline SVG（簡約行李箱，`w-24 h-24 text-gray-300`）
- 標題：「還沒有歷史行程」（`text-gray-500 font-medium`）
- 副文字：「趕快搭乘第一趟，開始累積 ESG 減碳足跡！」（`text-gray-400 text-sm`）
- CTA 按鈕：「搜尋共乘」→ `/`（`bg-green-600 text-white rounded-xl px-6 py-3`）

**UX-2 驗證紅字範例：**
```
起點（必填）
[______________]
⚠ 請填入起點地址
```
- 顏色：`text-red-500 text-sm`
- 預留高度：`min-h-[20px]`（避免驗證訊息出現時造成版面跳動）

**UX-3 搜尋記錄：**
- localStorage key 格式：`jiuche_search_{userId}`（登入後）或 `jiuche_search_guest`（未登入）
- 以 JSON 陣列存最多 5 筆字串
- 搜尋框 focus 時，顯示歷史建議下拉（最多 5 筆）
- 送出搜尋後，將關鍵字存入最前面（重複則移到最前面）

**UX-4 sessionStorage：**
- key：`jiuche_last_booking`
- 存入格式：`{ bookingId, rideTitle, amount, createdAt }`
- 讀取：`/booking/success` 頁載入時讀取並顯示訂單號

**UX-5 aria-label 補充清單：**
- BottomNav 各按鈕：`aria-label="首頁"` / `"搜尋"` / `"發布"` / `"行程"` / `"個人"`
- 所有 icon-only 按鈕補 `aria-label`
- 表單 `<input>` 確認有對應 `<label>` 或 `aria-label`
- 所有裝飾性 SVG 補 `aria-hidden="true"`

## 6. 資料說明
- UX-3：localStorage（`jiuche_search_{userId}`），純前端，不寫 DB
- UX-4：sessionStorage（`jiuche_last_booking`），純前端，不寫 DB

## 7. 設計規範
- 空狀態 SVG：使用 inline SVG，無需外部圖片
- 驗證紅字：使用 `min-h` 預留空間，避免訊息出現時版面跳動

## 8. 備註
- UX-5 無障礙為漸進式補充，不影響現有功能，可最後執行

## 9. 待確認事項
- 無
