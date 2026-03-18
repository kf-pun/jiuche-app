# Google Maps 深度整合 功能規格書

**版本：** v1.0
**日期：** 2026-03-18
**狀態：** 已確認

---

## 1. 背景與目標

目前起訖點輸入只有文字自動完成，使用者必須準確輸入地名才能搜尋，對不熟悉地址的人不友善，也無法得知行車距離與預計時間。

**目標：**
- 透過地圖選點與 GPS 定位，讓起訖點輸入零打字即可完成
- 自動計算路線距離與行車時間，提升行程資訊透明度
- 依距離自動估算票價，協助司機定價、乘客判斷合理性

---

## 2. 使用者故事

- 身為**乘客**，我希望點一下「定位」就能自動填入目前位置，這樣才能省去手動輸入出發地的麻煩。
- 身為**乘客**，我希望在地圖上點選目的地，這樣才能精準選到沒有固定地名的地點（如公司大樓側門）。
- 身為**乘客**，我希望在行程詳情看到路線地圖與行車時間，這樣才能評估是否值得搭乘。
- 身為**司機**，我希望發布行程時系統自動建議票價，這樣才能快速定價不需要自己估算。

---

## 3. 功能範圍

### 已完成功能
- 文字地點自動完成（`PlacesAutocomplete` 元件，`/api/places` 代理路由）
- 起訖點欄位（首頁、發布共乘）

### 待製作
- GPS 定位按鈕（首頁、發布行程出發地欄位旁）
- 地圖選點 Modal（起訖點欄位可切換地圖模式）
- 行程詳情頁路線地圖卡片（距離 + 行車時間 + 路線視覺化）
- 發布共乘頁自動計算建議票價
- `rides` 表新增地圖相關欄位
- DB migration：`supabase/migrations/002_add_map_fields.sql`
- API 代理路由：`/api/directions`、`/api/geocode`

---

## 4. 使用流程

### 4-1 GPS 定位（首頁 / 發布行程）

1. 使用者點擊出發地欄位旁的「📍 定位」按鈕
2. 瀏覽器彈出定位授權請求
3. **授權成功**：呼叫 Geocoding API 將座標轉為地址，自動填入出發地欄位
4. **授權拒絕 / 逾時**：顯示提示「無法取得位置，請手動輸入」，欄位維持空白

### 4-2 地圖選點 Modal

1. 使用者點擊起點或終點欄位右側的「🗺 地圖」按鈕
2. 全螢幕 Modal 開啟，顯示 Google Maps（預設以台灣為中心；若已有 GPS 則以當前位置為中心）
3. 使用者點擊地圖任意位置，大頭針落下
4. 底部顯示反查後的地址文字
5. 點擊「確認」→ Modal 關閉，地址與座標帶回欄位
6. 點擊「取消」→ Modal 關閉，欄位不變

### 4-3 路線預覽（行程詳情頁）

1. 頁面載入，取得起訖點座標
2. 呼叫 Directions API 計算路線
3. 顯示地圖卡片：藍線路線 + 起點綠色大頭針 + 終點紅色大頭針
4. 卡片下方顯示距離（km）與預計行車時間
5. **無 API Key**：隱藏地圖卡片，僅顯示文字起訖點
6. **舊行程（無座標）**：隱藏地圖卡片，向下相容

### 4-4 車費估算（發布共乘頁）

1. 司機填入起訖點後（含座標），自動呼叫 Directions API
2. 依公式計算建議票價：`$50 + $8 × 距離(km)`，四捨五入至整數
3. 票價欄位自動帶入建議值，並顯示「依 X km 估算」說明文字
4. 司機可手動修改票價（建議值僅供參考）
5. 送出時將 `distance_km`、`duration_minutes`、`origin_lat/lng`、`destination_lat/lng` 一併寫入 DB

---

## 5. 畫面與功能說明

### 首頁（`/`）
- 出發地欄位右側新增「📍」圖示按鈕（綠色，`text-green-600`）
- 起訖點欄位右側另有「🗺」按鈕，點擊開啟地圖選點 Modal
- **需要登入**：否

### 地圖選點 Modal（共用元件 `MapPickerModal`）
- 全螢幕遮罩 `bg-black/50`，白色底部抽屜 `rounded-t-2xl` 高度 70vh
- Maps 佔滿上方，底部顯示地址文字 + 「確認」/ 「取消」按鈕
- 拖曳大頭針時地址即時更新（debounce 500ms）
- 載入中：顯示灰色骨架屏

### 發布共乘（`/post`）
- Step 1 起訖點區塊：每個欄位右側增加「地圖」按鈕
- 起訖點都填入後自動計算路線，顯示「預計 X km，約 Y 分鐘」提示列
- 票價欄位下方顯示「系統建議：$XXX（依距離估算）」灰色小字
- **需要登入**：是（AuthGuard 保護）

### 行程詳情（`/results/[id]`）
- 司機資訊卡片下方新增「路線地圖」卡片（高度 200px，`rounded-xl overflow-hidden shadow-sm`）
- 地圖內：藍線路線 + 起點綠色大頭針 + 終點紅色大頭針
- 卡片下方一列：🛣 `X km` ｜ 🕐 `約 Y 分鐘`（`text-sm text-gray-500`）
- 載入中：骨架屏佔位
- **需要登入**：否

---

## 6. 資料說明

### DB 新增欄位（`rides` 表）

| 欄位 | 型別 | 說明 |
|------|------|------|
| `origin_lat` | NUMERIC(10,7) | 起點緯度（可為 NULL） |
| `origin_lng` | NUMERIC(10,7) | 起點經度（可為 NULL） |
| `destination_lat` | NUMERIC(10,7) | 終點緯度（可為 NULL） |
| `destination_lng` | NUMERIC(10,7) | 終點經度（可為 NULL） |
| `distance_km` | NUMERIC(6,2) | 路線距離公里數（可為 NULL） |
| `duration_minutes` | INTEGER | 預計行車分鐘數（可為 NULL） |

Migration 檔：`supabase/migrations/002_add_map_fields.sql`（所有欄位 NULL，不影響舊資料）

### 新增 API 代理路由

| 路由 | 說明 |
|------|------|
| `/api/directions` | 代理 Google Directions API |
| `/api/geocode` | 代理 Google Geocoding API（座標 → 地址） |

### 環境變數
`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`（已有，需在 GCP 額外啟用 Maps JavaScript API、Directions API、Geocoding API）

### localStorage
不儲存座標（每次重新取得，避免過期資料）

---

## 7. 設計規範

- 手機優先（max-w-md），地圖 Modal 全螢幕覆蓋
- 定位按鈕：`bg-green-50 text-green-600 border border-green-200 rounded-lg px-2 py-1 text-xs`
- 地圖選點 Modal：`rounded-t-2xl` 底部抽屜，背景遮罩 `bg-black/50`
- 路線地圖卡片：`rounded-xl overflow-hidden shadow-sm`，固定高度 `h-[200px]`
- 距離/時間資訊列：`flex gap-4 text-sm text-gray-500 mt-2`
- **降級策略**：無 API Key 時地圖相關 UI 完全隱藏，不顯示錯誤訊息，autocomplete 正常運作

---

## 8. 備註

- 車費公式（`$50 + $8/km`）為示範用，正式上線前需與營運確認合理費率
- Directions API 計費：每 1,000 次請求約 $5 USD；發布行程與行程詳情各呼叫一次
- 建議安裝套件：`@googlemaps/js-api-loader`（統一管理 Maps script 載入）
- GPS 定位僅用於出發地；終點依使用者習慣手動輸入或地圖選點

---

## 9. 待確認事項

- **Q1**：地圖選點 Modal 內是否要同時提供搜尋框（可打字搜尋 + 在地圖上看結果）？
- **Q2**：車費公式「$50 + $8/km」是否符合預期？是否需要高速/市區分開計費？
- **Q3**：行程詳情路線地圖預設顯示「開車」模式，是否需要其他交通方式選項？
