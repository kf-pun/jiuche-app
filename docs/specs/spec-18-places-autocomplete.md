# 地點自動完成（Google Maps Places API）功能規格書

**版本：** v1.0
**日期：** 2026-03-18
**狀態：** 已完成

---

## 1. 背景與目標
- 用戶在搜尋和發布行程時，手動輸入地名容易打錯，導致搜尋無結果
- 目標：在首頁搜尋、發布行程起訖點欄位加入地址自動完成建議

## 2. 使用者故事
- 身為乘客，我希望輸入起點時看到地點建議，這樣才能確保地名標準化
- 身為司機，我希望發布行程時用自動完成選地點，這樣才能避免打錯地址

## 3. 功能範圍

### 已完成功能
- 首頁搜尋表單（純文字輸入）
- 發布共乘兩步驟表單（純文字輸入）

### 待製作
- 建立共用 `PlacesAutocomplete` 元件（`src/components/PlacesAutocomplete.tsx`）
- 首頁起訖點欄位改為 `PlacesAutocomplete`
- 發布行程起訖點欄位改為 `PlacesAutocomplete`
- Next.js API Route（`/api/places`）代理 Google Places 請求（避免 API Key 暴露）

## 4. 使用流程

1. 用戶在起點欄位輸入 2 字以上
2. 0.5 秒後（debounce）透過 `/api/places` 向 Google Places API 發出請求
3. 下拉顯示最多 5 筆建議（地名 + 副標題）
4. 用戶點擊建議 → 填入欄位，下拉關閉
5. 用戶直接按 Enter 或繼續輸入 → 保留原文字（相容現有搜尋邏輯）

**失敗路徑：**
- API Key 未設定或超出配額 → 靜默降級為一般文字輸入（不顯示錯誤，功能仍可用）

## 5. 畫面與功能說明

### PlacesAutocomplete 元件（`src/components/PlacesAutocomplete.tsx`）
- **Props：**
  - `value: string`
  - `onChange: (value: string) => void`
  - `placeholder?: string`
  - `className?: string`
- **下拉樣式：**
  - `absolute w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 mt-1`
  - 每筆建議：主要地名（`font-medium`）+ 副地址（`text-sm text-gray-400`）
  - Hover：`bg-gray-50`
  - 最多 5 筆，無結果時不顯示下拉
- **載入中：** 輸入框右側顯示小 spinner（`animate-spin`）
- **套用位置：**
  - `app/page.tsx`（首頁搜尋）：起點、終點
  - `app/post/page.tsx`（發布行程）：起點、終點

### API Route（`/api/places/route.ts`）
- 接收 `?input=xxx` 查詢參數
- 轉發至 Google Places Autocomplete API
- 限制：`components=country:tw`、`language=zh-TW`
- 回傳：`[{ description, place_id }]`

### 環境變數
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`（已在 `.env.local.example` 預留）
- API Route 中使用 `GOOGLE_MAPS_API_KEY`（Server-side，不暴露給前端）

## 6. 資料說明
- 呼叫 Google Places Autocomplete API（`/maps/api/place/autocomplete/json`）
- 限制台灣地區：`components=country:tw`
- 語言：`language=zh-TW`
- 不儲存任何資料至 DB

## 7. 設計規範
- 手機優先：下拉寬度 100%，z-index 高於其他元素（`z-50`）
- 鍵盤操作：↑↓ 移動選項，Enter 選擇，Escape 關閉
- 降級：`GOOGLE_MAPS_API_KEY` 未設定時，元件自動退化為純 `<input>`

## 8. 備註
- Google Maps API Key 需用戶自行申請並填入 `.env.local`
- API 費用：每 1000 次 Autocomplete 請求約 $2.83 USD，初期流量小影響不大
- 若無 API Key，功能完全不受影響（降級為純文字輸入）

## 9. 待確認事項
- 無
