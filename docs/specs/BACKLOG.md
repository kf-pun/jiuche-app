# 揪車 JiuChe — 開發 Backlog 與時程規劃

**更新日期：** 2026-03-22（最後更新：spec-22 QA 完成，3 項人工驗證待補）
**目標上線：** 2026-05-19（Sprint 10 Google Maps 深度整合）

---

## 時程總覽

```
Mar 17 ████ Sprint 1  後端基礎建設
Mar 24 ████ Sprint 2  認證系統
Mar 31 ████ Sprint 3  行程發布與搜尋
Apr 07 ████ Sprint 4  預訂與錢包
Apr 14 ████ Sprint 5  資料一致性
Apr 21 ████ Sprint 6  後台 P0（架構 + 核心客服功能）
Apr 28 ████ Sprint 7  後台 P1 + 支付
May 05 ████ Sprint 8  後台 P2 + 體驗補完
May 12 ████ Sprint 9  後台 P3（B2B）+ 部署
May 19 ■    Sprint 10 Google Maps 深度整合
```

> **時程說明：** 後台管理系統於 Sprint 4 完成（真實 bookings/wallet 資料入庫）後開始建置，確保後台有真實資料可操作。目標上線調整為 5/12。

---

## Sprint 1｜Mar 17–23　後端基礎建設

| # | 任務 | 說明 | 狀態 |
|---|------|------|------|
| S1-1 | **Supabase 建置 + Schema 設計** | 建立專案；設計 users / rides / bookings / reviews / wallet_transactions / notifications 六張表 | ✅ 完成 |
| S1-2 | **Next.js API Routes / Server Actions 架構** | 建立統一資料存取層，取代所有 mockData.ts 直接讀取 | ✅ 完成 |

---

## Sprint 2｜Mar 24–30　認證系統

| # | 任務 | 說明 | 來源規格書 | 狀態 |
|---|------|------|-----------|------|
| S2-1 | **真實 OTP 認證（Supabase Phone Auth）** | 開發模式：Anonymous sign-in + 888888 bypass；正式環境換 SMS provider | spec-04 | ✅ 完成 |
| S2-2 | **新用戶偵測 → 導向註冊頁** | OTP 後查 users 表，無資料則帶 phone 參數跳 `/auth/register` | spec-04, spec-11 | ✅ 完成 |
| S2-3 | **Session 持久化（Supabase Auth）** | 取代 localStorage 自製 JWT，跨裝置登入狀態同步 | — | ✅ 完成 |

---

## Sprint 3｜Mar 31–Apr 6　行程發布與搜尋

| # | 任務 | 說明 | 來源規格書 | 狀態 |
|---|------|------|-----------|------|
| S3-1 | **發布共乘 → 寫入 rides 表** | 表單送出真實存 DB，取代目前假成功動畫 | spec-07 | ✅ 完成 |
| S3-2 | **搜尋結果依條件查詢 rides** | 起點/終點/日期/剩餘座位過濾；補齊早晚班、價格區間等完整篩選 | spec-01, spec-02 | ✅ 完成 |

---

## Sprint 4｜Apr 7–13　預訂與錢包

| # | 任務 | 說明 | 來源規格書 | 狀態 |
|---|------|------|-----------|------|
| S4-1 | **座位數選擇 + 預訂寫入 DB** | 詳情頁加 1～N 選擇器帶入確認頁，扣 available_seats，建立 bookings 記錄 | spec-03, spec-05 | ✅ 完成 |
| S4-2 | **錢包餘額真實持久化** | deductBalance / addBalance 改走 wallet_transactions 表，儲值成功才入帳 | spec-09, spec-10 | ✅ 完成 |

---

## Sprint 5｜Apr 14–20　資料一致性

| # | 任務 | 說明 | 來源規格書 | 狀態 |
|---|------|------|-----------|------|
| S5-1 | **我的行程從真實 bookings 查詢** | 依 user_id 撈乘客訂單，取代假資料 | spec-08 | ✅ 完成 |
| S5-2 | **評價持久化 + 司機評分更新 + 已評價按鈕鎖定** | 寫入 reviews 表，更新司機平均星等；行程列表評價按鈕改為已評價不可點 | spec-12 | ✅ 完成 |
| S5-3 | **通知狀態持久化 + BottomNav 未讀小紅點** | 未讀/已讀寫 DB，跨裝置同步；BottomNav 顯示未讀數 | spec-14 | ✅ 完成 |
| S5-4 | **ESG 數據從真實行程計算** | CO₂ 依 bookings 動態加總，企業排行榜從 users 表統計 | spec-15 | ✅ 完成 |

---

## Sprint 6｜Apr 21–27　後台 P0 — 架構 + 核心客服功能

> **前提：** Sprint 4 完成，bookings / wallet_transactions 已有真實資料

| # | 任務 | 說明 | 狀態 |
|---|------|------|------|
| S6-1 | **後台基礎架構** | `/admin` 寬版 Layout（左側導覽 240px + 主內容區）；Admin Auth Guard（`users.role = 'admin'` 檢查）；`users` 表新增 `role` 欄位；`createServiceClient()` 繞過 RLS | ✅ 完成 |
| S6-2 | **Dashboard 總覽** | 今日新增用戶/行程/訂單 KPI 卡片；近 30 天預訂量折線圖；最新 5 筆訂單 + 5 位新用戶快速連結 | ✅ 完成 |
| S6-3 | **會員管理** | 列表（搜尋/篩選）、詳情頁（資料 + 歷史訂單/行程/交易頁籤）、手動調整餘額、停權/解除停權 | ✅ 完成 |
| S6-4 | **訂單管理** | 列表（搜尋/狀態篩選/日期範圍）、詳情頁、手動確認/取消+退款/標記完成；取消時自動寫入退款交易 + 可選發通知 | ✅ 完成 |

---

## Sprint 7｜Apr 28–May 4　後台 P1 + 支付

| # | 任務 | 說明 | 狀態 |
|---|------|------|------|
| S7-1 | **行程管理** | 列表（搜尋起訖點/司機/日期/狀態）、詳情頁含已訂乘客名單、強制取消行程（自動取消所有 bookings + 退款 + 通知） | ✅ 完成 |
| S7-2 | **金流管理** | 列表（類型/日期/用戶篩選）、頂部統計列、手動新增補償交易、匯出 CSV | ✅ 完成 |
| S7-3 | **儲值串接支付（ECPay 測試環境）** | 實際付款流程；Webhook 收到成功通知才更新餘額 | ✅ 完成 |

---

## Sprint 8｜May 5–11　後台 P2 + 體驗補完

| # | 任務 | 說明 | 狀態 |
|---|------|------|------|
| S8-1 | **評價管理** | 列表（星等/日期篩選）、刪除不當評價並重算司機平均評分 | ✅ 完成 |
| S8-2 | **通知管理** | 查看發送紀錄、發送系統公告（全體/特定公司/特定用戶，批次寫入 notifications 表） | ✅ 完成 |
| S8-3 | **ESG 報告** | 全平台累計 CO₂ + 月度趨勢折線圖、依公司分組排行、匯出 PDF（對應前台 ESG 儀表板「匯出 PDF」按鈕） | ✅ 完成 |
| S8-4 | **地點自動完成（Google Maps Places API）** | 起訖點輸入加下拉建議，避免打錯地名 | ✅ 完成 |
| S8-5 | **司機歷史評價列表** | 行程詳情頁顯示真實 reviews | ✅ 完成 |
| S8-6 | **UX 補完（集中處理）** | 歷史行程空狀態插圖、欄位驗證紅字、個人化搜尋記錄、訂單號 sessionStorage 持久化、無障礙 aria-label | ✅ 完成 |

---

## Sprint 9｜May 12　後台 P3（B2B）+ 部署

| # | 任務 | 說明 | 狀態 |
|---|------|------|------|
| S9-1 | **企業管理（B2B）** | 企業帳號列表（員工數/CO₂/狀態）、單一企業員工列表、費用報帳匯出 CSV | ✅ 完成 |
| S9-2 | **Google OAuth 串接** | Supabase Auth 內建，設定即可 | ✅ 完成 |
| S9-3 | **Vercel 部署** | 環境變數設定（Supabase URL/Key、SMS、Google Maps、ECPay）；前台 + 後台同一 repo 部署 | ✅ 完成 |
| S9-4 | **E2E 流程驗收** | 前台：搜尋 → 預訂 → 付款 → 評價 → ESG；後台：訂單管理 → 退款 → 通知 → ESG 報告匯出 | ✅ 完成 |

---

## Sprint 10｜May 19　Google Maps 深度整合

| # | 任務 | 說明 | 狀態 |
|---|------|------|------|
| S10-1 | **GPS 定位按鈕** | 首頁與發布行程出發地欄位旁新增「📍 定位」按鈕；Browser Geolocation API + Geocoding API 反查地址 | ✅ 完成 |
| S10-2 | **地圖選點 Modal** | 共用 `MapPickerModal` 元件；點擊地圖或拖曳大頭針選點；帶回地址文字與座標；`/api/geocode` 代理路由 | ✅ 完成 |
| S10-3 | **行程詳情路線地圖** | `/results/[id]` 新增路線地圖卡片（200px）；Directions API 計算路線藍線 + 距離 + 行車時間；`/api/directions` 代理路由 | ✅ 完成 |
| S10-4 | **合法油資上限計算 + 費用拆分** | 發布共乘頁依 Directions API 距離計算法定油資上限（油耗 × 油價 ÷ 乘客數）；票價不得超上限；預訂確認頁拆顯油資 + 服務費；企業員工服務費 $0 | ✅ 完成 |
| S10-5 | **DB Migration** | `supabase/migrations/003_sprint10_map_fields.sql`；`rides` 新增地圖欄位 + `fare_limit`；`bookings` 新增 `service_fee`；**CREATE TABLE `companies`**（id/name/subscription_active/subscription_expires_at）；`users.vehicle_type` 加 CHECK constraint（8 種類別）；新增 `system_config` 表；已透過 Supabase MCP 套用 | ✅ 完成 |
| S10-6 | **每週油價自動更新（Vercel Cron）** | `/api/cron/update-fuel-price` 每週四呼叫 data.gov.tw 能源局油價 API（非爬蟲）取得 92/95/98 最新油價，存入 `system_config` 表；`CRON_SECRET` Bearer token 保護；失敗時保留舊值不中斷系統 | ✅ 完成 |

> **已確認：**
> - 油耗依車型類別查官方表（8 種），司機不得自填
> - 油號依車型類別固定預設（小/中型 → 95；大型/大 SUV → 98；電動車 → N/A），不開放選擇，防舞弊
> - 油價每週四透過 data.gov.tw 能源局 API 自動更新（非爬蟲），存入 `system_config` 表
> - 服務費採方案 B 三段分級：$10（≤10km）/ $15（11–30km）/ $20（>30km），後台可透過 `system_config` 調整
> - 散客乘客付油資 + 服務費；企業員工只付油資（服務費由企業月費涵蓋）
> - `companies` 表為 Sprint 10 新建（Sprint 9 用 group-by 無獨立表）；乘客企業判斷改為 JOIN companies
> - `users.vehicle_type` 加 CHECK constraint；舊不合規值設 NULL，計算時兜底用中型轎車
> - Vercel Cron 以 `CRON_SECRET` Bearer token 保護

---

## QA 測試改善待辦（全功能測試完畢後依優先度排程）

> 來源：QA 自動化測試（Claude QA Agent，2026-03-19 起）。
> - **自動驗證**：MCP Preview 程式碼靜態分析 + UI 操作已完成
> - **人工待補**：需真實裝置 / 外部服務 / 瀏覽器權限才能驗證，標記 🔲；完成後改為 ✅
> 所有項目待全部功能測試完畢後，統一評估優先度再排入 Sprint。

### 功能缺陷 / 改善建議

| ID | 來源功能 | 路徑 | 描述 | 重現步驟 | 預期結果 | 實際結果 | 類型 | 優先度 |
|----|----------|------|------|----------|----------|----------|------|--------|
| QA-SP19-01 | 司機歷史評價列表 | `src/actions/rides.ts:213` `getDriverReviews()` | **🟡 Major（已修復 2026-03-22）**：評價者姓名因 RLS 無法讀取，全部 fallback 為「用戶**」。`getDriverReviews()` 使用 `createClient()`（帶 user session），join `users!reviewer_id` 時，乘客（`is_driver=false`）不符合 RLS `users_select_drivers` 條件，也非 `auth.uid()=id` 本人，PostgREST 回傳 null → `reviewer?.name ?? ""` → `anonymizeName("")` → `"用戶**"`。**修復**：`getDriverReviews()` 改用 `createServiceClient()` 繞過 RLS。UI 驗證：名稱顯示「Q**」✅ | 1. 進入有評價的行程詳情頁 `/results/[id]` 2. 觀察評價區乘客姓名 | 顯示「Q**」等姓氏匿名 | ~~全部顯示「用戶**」（fallback）~~ → **已修復** | 🟡 Major | ✅ 已修復 |
| QA-SP19-02 | 司機歷史評價列表 | `src/app/results/[id]/page.tsx:36` + `src/actions/rides.ts:209` | **🟢 Minor**：評價總數上限 10 筆，標題計數不反映真實總數。`getDriverReviews(driverId, 10)` 硬性限制最多 fetch 10 筆，`reviews.length` 僅反映已取回數量。若司機有 12 筆評價，標題顯示「10 則」、展開按鈕顯示「+ 5 則更多評價」，展開後只能看到 10 筆，剩餘 2 筆完全遺失。修復建議：先 COUNT 取總數顯示於標題，或提高 limit 上限 | 當司機評價超過 10 筆時發生 | 標題顯示真實總數 | 最多顯示 10，多餘評價遺失 | 🟢 Minor | 低 |
| QA-SP19-03 | 司機歷史評價列表 | `src/app/results/[id]/page.tsx:250` | **🟢 Minor（規格差異）**：評語截斷方式與規格書不符。規格書 §5 要求「最多顯示 100 字，超過截斷 + 「…」」（字數限制），程式碼使用 CSS `line-clamp-3`（行數截斷）。在 max-w-md 窄螢幕下約 75-90 字，不精確等於 100 字；不支援 line-clamp 的瀏覽器會完整顯示所有文字。修復建議：JS 層截斷 `r.comment.length > 100 ? r.comment.slice(0, 100) + "…" : r.comment`，或更新規格書承認 line-clamp 設計決策 | 撰寫超過 100 字評語觀察截斷 | 第 101 字截斷並顯示「…」| CSS line-clamp 依行數截斷，位置隨視窗變化 | 🟢 Minor | 低 |
| QA-SP12-01 | 評價頁面 | `src/app/trips/[id]/review/page.tsx` | **🟢 Minor**：評價頁無 AuthGuard，未登入直接訪問 `/trips/xxx/review` 顯示「找不到行程」而非導向 `/auth/login`。規格書 §9「待確認事項」尚未結案。建議：加 AuthGuard 元件或在 getBookingDetail 回傳 null 時 redirect 登入頁，提升用戶引導體驗 | 1. 未登入狀態 2. 直接訪問 `/trips/xxx/review` | 應跳轉 `/auth/login?redirect=...` | 顯示「找不到行程」，無登入引導 | 🟢 Minor | 低 |
| QA-SP12-02 | 評價頁面 | `src/actions/bookings.ts` `getBookingDetail()` | **🟢 Minor**：`getBookingDetail` 不檢查 `booking.status`，`confirmed`（未完成）行程也能進入評價填寫頁，用戶填完整個表單送出後才被 server 拒絕「行程尚未完成」，UX 體驗差。建議：`getBookingDetail` 回傳 `status` 欄位，review page 在 status ≠ "completed" 時顯示提示並鎖定表單 | 1. 有 confirmed booking 2. 直接訪問其評價 URL 3. 填星等送出 | 頁面載入時即提示「此行程尚未完成，無法評價」 | 表單正常顯示，送出後才顯示「行程尚未完成」 | 🟢 Minor | 低 |
| QA-SP13-01 | 個人資料 | `src/lib/authContext.tsx` line 32 `rowToUser()` | **🟡 Major（已修復 2026-03-20）**：`totalRides: row.rating_count` 將「已收到的評分數量」對應至「共乘次數」，語意完全錯誤。**修復**：`fetchUser()` 改為 `Promise.all` 同時查 `users` 表與 `bookings` count（`passenger_id=userId, status≠cancelled`），以 `{ ...rowToUser(data), totalRides: count ?? 0 }` 覆寫。UI 驗證：rating_count=25 的用戶有 3 筆 bookings，profile 顯示「3 趟」✅ | 1. 登入 2. 前往 /profile 3. 觀察「共乘次數」與實際 booking 數對比 | 共乘次數應反映實際共乘趟數 | ~~顯示 rating_count（25），非實際共乘次數~~ → **已修復：顯示 3（實際 bookings count）** | 🟡 Major | ✅ 已修復 |
| QA-02 | 首頁搜尋 | `src/app/page.tsx` `handleSearch()` | 前端未對過去日期做程式碼防護，僅靠 HTML `min` 屬性阻擋。若以非標準方式（如直接修改 DOM 或 API 呼叫）帶入過去日期，仍可送出搜尋 | 1. 開啟首頁 2. 用 DevTools 移除 `min` 屬性 3. 填入過去日期 4. 填妥起訖點點擊搜尋 | 應顯示錯誤或阻擋送出 | 成功跳轉 `/results` 帶過去日期 | 低優 Bug | 低 |
| QA-03 | 搜尋結果 | `src/app/results/page.tsx` `FilterBar` | 「清除篩選」僅清時間篩選（timeRange → "all"），不重置排序（sort 維持當前選項）；目前行為符合程式碼，但規格書「待確認事項」未結案，需確認是否為預期設計 | 1. 進入 /results 2. 切換排序至「最低價」3. 啟用早班篩選 4. 點擊清除篩選 | 設計待確認：排序應否一併重置為「最早出發」| 排序維持「最低價」不變 | 設計確認待定 | 低 |
| QA-06 | 行程詳情 | `src/app/results/[id]/page.tsx` line 152 | 植樹換算公式 `0.{Math.round(co2Saved * 8)}` 在 co2Saved 數值較大時會產生「0.400 棵樹」等不合理顯示（應為 400 棵樹），且「0.」為寫死前綴而非小數點。目前測試資料範圍（1.2–3.6 kg）顯示正常（0.10–0.29），但邊界值有潛在問題 | 1. 進入有 co2Saved > 12 的行程詳情頁 2. 觀察「相當於種下」數字 | 應顯示合理棵樹數 | 顯示「0.XX 棵樹」但 XX > 9 時視覺不直觀 | 低優 Bug | 低 |
| QA-07 | 預訂確認 | `src/actions/bookings.ts` createBooking() Step 5–6 + `src/lib/supabase/server.ts` createServiceClient() | **🔴 Critical（已修復 2026-03-19）**：付款成功後 `rides.available_seats` 未扣減 + `wallet_transactions` 未寫入。根因：`createServiceClient()` 使用 `@supabase/ssr` 的 `createServerClient`，其 cookie handler 注入 user JWT 覆蓋 service role key。**修復**：改為 `@supabase/supabase-js` 的原生 `createClient`（`auth: { autoRefreshToken: false, persistSession: false }`）。DB 驗證：rides.available_seats 2→1 ✅，wallet_transactions -165 寫入 ✅ | 1. 登入 2. 進入行程詳情，確認 available_seats 數量 3. 完成付款 4. 查 DB rides.available_seats 與 wallet_transactions | available_seats 應減少、wallet_transactions 應有 -payment 記錄 | ~~available_seats 不變（2→2）、wallet_transactions 空白~~ → **已修復** | 🔴 Critical Bug | ✅ 已修復 |
| QA-08 | 預訂確認 | `src/app/booking/confirm/page.tsx` line 66 + `src/actions/bookings.ts` line 190 | **🟡 Major（已修復 2026-03-19）**：服務費計算不一致。**修復**：`createBooking()` 加入 `serviceFee: number = 0` 參數，`totalPrice = ride.price * seats + serviceFee`；confirm 頁呼叫時傳入 `serviceFee`。DB 驗證：bookings.total_price=165 ✅，balance 扣 165 ✅ | 1. 登入，餘額 165 2. 進入確認頁（服務費=15）3. 完成付款後查 bookings.total_price | total_price=165，balance 扣 165 | ~~total_price=150，服務費流失~~ → **已修復** | 🟡 Major Bug | ✅ 已修復 |
| QA-09 | 預訂確認 | `src/app/booking/confirm/page.tsx` line 191 | **🟢 Minor（已修復 2026-03-19）**：未登入時錢包卡顯示「NT$ undefined」。**修復**：`user?.balance.toLocaleString()` → `(user?.balance ?? 0).toLocaleString()`。UI 驗證：顯示「NT$ 0」✅ | 1. 未登入 2. 進入確認頁 | 應顯示「NT$ 0」 | ~~顯示「NT$ undefined」~~ → **已修復** | 🟢 Minor Bug | ✅ 已修復 |
| QA-10 | 預訂成功 | `src/app/booking/success/page.tsx` line 18 | **🟡 Major**：訂單編號每次 mount 重新隨機產生（`useState(() => "JC" + Math.random()...)`），重整頁面後訂單號改變（JC303731 → JC622506），無法作為截圖存查依據，與規格書 §8 備註「Q1：是否需改為寫入 sessionStorage」一致。建議：從 confirm 頁傳入的 `bookingId`（真實 DB id）產生固定編號，或寫入 sessionStorage（key: `jiuche_last_booking` 已有 bookingId 欄位可用） | 1. 完成付款進入成功頁，記下訂單號 2. 重整頁面 | 訂單號應維持不變 | 訂單號隨機重產，每次不同 | 🟡 Major Bug | 低 |
| QA-11 | 發布共乘 | `src/app/post/page.tsx` line 249–281 | **🟢 Minor（已修復 2026-03-19）**：步驟 1 的「出發日期」與「出發時間」欄位點擊「下一步」未填時，雖會呼叫 `touch("date")` / `touch("time")`，但程式碼未對這兩個欄位顯示紅框或 inline 錯誤訊息（`from`/`to` 欄位有完整實作），導致使用者無法得知哪些欄位未填。**修復**：date 容器加入 `touched.date && !form.date ? "border-red-300" : ...` 紅框；date input 加 `onChange` 觸發 `touch("date")`；date 與 time 欄位下方各加 `<span className={fieldErr(...)}>⚠ 請選擇...</span>` 錯誤訊息；時間槽點擊加入 `touch("time")`。 | 1. 進入 /post 2. 不填日期與時間，填妥出發地/目的地 3. 點擊「下一步」| 日期與時間欄位應顯示紅框與錯誤訊息 | 只有出發地/目的地顯示錯誤，日期/時間無任何視覺回饋 | 🟢 Minor Bug | ✅ 已修復 |
| QA-12 | 全域 / AuthGuard | `src/components/AuthGuard.tsx` + `src/lib/authContext.tsx` | **🔴 Critical（已修復 2026-03-19）**：AuthGuard 在 first render 時 `user=null`（`isLoggedIn=false`），尚未等 `fetchUser()` async 完成就立即執行 `router.replace('/auth/login')`，導致已登入的使用者訪問受保護頁面（/post、/trips 等）被錯誤跳轉至登入頁。**修復**：authContext 新增 `authLoading` state（初始值 true），`fetchUser()` 完成後設為 false；`getSession()` 無 session 時設為 false；`onAuthStateChange` 無 session 時設為 false。AuthGuard 在 `authLoading=true` 時顯示 spinner，僅在 `!authLoading && !isLoggedIn` 時才跳轉。 | 1. 已登入狀態 2. 直接瀏覽至 /post | 顯示發布表單 | ~~立即跳轉至 /auth/login~~ → **已修復** | 🔴 Critical Bug | ✅ 已修復 |
| QA-15 | 儲值 | `src/app/wallet/topup/page.tsx` line 198 | **🟢 Minor**：自訂金額 > 10,000 時，`disabled` 條件僅判斷 `finalAmount < 100`，未涵蓋上限，按鈕保持可點擊狀態。點擊後雖在 `handleTopup` 回傳錯誤訊息，但視覺上按鈕仍為「可用」，與規格書「按鈕保持 disabled」不符，也使「儲值後餘額」顯示不合理的超限金額預覽（NT$ 20,685）。 | 1. 進入 /wallet/topup 2. 輸入 20000 3. 觀察按鈕狀態 | 按鈕應 disabled + 不顯示預覽 | 按鈕可點擊（僅顯示錯誤訊息，未 disabled） | 🟢 Minor Bug | 待修復 |
| QA-14 | 錢包 | `src/app/wallet/page.tsx` line 160 | **🟢 Minor（已修復 2026-03-19）**：`payment` 等負數交易金額缺少「-」前綴，僅靠灰色區分，規格書 §5 明確標示「扣款灰（-）」。**修復**：`tx.amount > 0 ? "+" : tx.amount < 0 ? "-" : ""` 讓正負號對稱顯示。 | 1. 登入 2. 進入 /wallet 3. 查看「共乘付款」金額 | 應顯示「-NT$ 165」 | ~~「NT$ 165」無負號~~ → **已修復** | 🟢 Minor Bug | ✅ 已修復 |
| QA-13 | 我的行程 | `src/actions/bookings.ts` `getUserBookings()` line 82 | **🟡 Major（已修復 2026-03-19）**：`hasReview` 邏輯以 `Array.isArray(b.reviews)` 判斷是否已評價，但 `reviews` 表有 `UNIQUE constraint on booking_id`，PostgREST 將一對一關係的 nested select 回傳為**單一物件**（非陣列）。因此 `Array.isArray` 恆為 `false`，導致「已完成且已評價」的行程仍顯示「評價此行程」按鈕，使用者可重複提交評價。**修復**：`hasReview: b.reviews !== null && b.reviews !== undefined && (Array.isArray(b.reviews) ? b.reviews.length > 0 : true)`，同時相容物件與陣列兩種型態。 | 1. 登入（乘客）2. 對某行程送出評價 3. 回到 /trips 歷史紀錄 | 已評價的行程應顯示「已評價」灰色鎖定 | ~~顯示「評價此行程」黃色按鈕，可重複評價~~ → **已修復** | 🟡 Major Bug | ✅ 已修復 |

### 文件補齊

| ID | 來源功能 | 描述 | 負責人 |
|----|----------|------|--------|
| QA-01 | 首頁搜尋 | `spec-01-home-search.md` v1.0（2026-03-16）內容過舊：「待製作」區塊仍列 GPS 定位、地圖選點、個人化搜尋記錄、Places 自動完成，但上述功能已於 Sprint 10 全部完成。需更新至 v2.0，補充新功能說明（GpsButton 元件、MapPickerModal 元件、localStorage 搜尋記錄邏輯）並移除「待製作」章節 | — |
| QA-04 | 搜尋結果 | `spec-02-results.md` v1.1（2026-03-18）「待製作」仍列：(1) 女性司機篩選（已確認移除，DB 無 gender 欄位）(2) 行程詳情頁未串接 DB（已於 Sprint 4/5 完成）；「待確認事項」清除篩選是否重置排序未結案。需更新至 v2.0 | — |
| QA-05 | 行程詳情 | `spec-03-ride-detail.md` v1.1（2026-03-18）「待製作」仍列「司機詳細評價列表」，但 Sprint 8-5 已完成（`getDriverReviews()` + 最多 10 筆 + 展開按鈕）；備註「ESG 減碳數字來自 mockData」已過時（現在來自真實 DB）。需更新至 v2.0 | — |
| QA-SP14-DOC | 通知中心 | `spec-14-notifications.md` v1.1（2026-03-18）§3「待製作」仍列兩項已實作功能：(1)「通知狀態不持久化」→ 實際已於 Sprint 5-3 完成 DB 持久化（`markNotificationRead` / `markAllNotificationsRead` 寫入 `notifications.is_read`）；(2)「BottomNav 通知圖示無未讀紅點」→ `BottomNav.tsx` 已實作 `getUnreadNotificationCount()` + 紅點。§8「待確認事項」三點均已可答覆（持久化✅、不刪除通知、BottomNav 有紅點✅）。需更新至 v1.2 | — |
| QA-SP15-01 | ESG 儀表板 | 🟢 Minor — b5「連續共乘」勳章（`progressKey="streak"`）的 `streak` 值在 `page.tsx:107` hardcoded 為 0，永遠無法解鎖。DB 無 streak 欄位，規格書亦未標記此為「待製作」。建議：在 spec-15 §3 補充說明 streak 為未來功能，或在 UI 上加「即將推出」提示取代進度條 | — |
| QA-SP15-02 | ESG 儀表板 | 🟢 Minor — UX 設計問題：b6「ESG 領袖」勳章的解鎖狀態依賴 `company` state，只有在當次 session 中訪問過「企業排行」Tab 後，b6 在「個人數據」Tab 才會顯示已解鎖。新用戶首次進入個人分頁永遠看不到 b6 解鎖，即使實際上排行前 3 名。建議：個人分頁載入時同步載入排行榜名次，或將 myRank 從 `getPersonalEsgStats()` 一起返回 | — |
| QA-SP15-DOC | ESG 儀表板 | `spec-15-esg-dashboard.md` v1.0（規格書）§6「資料說明」仍描述 mock 資料，實際已於 Sprint 5-4 改為從 `completed bookings` 動態計算。PDF 匯出按鈕無 onClick 應在規格書§3「待製作」明確標記。需更新至 v1.1 | — |
| QA-SP16-01 | 編輯個人資料 | 🟡 Major **（已修復 2026-03-20）** — `updateUser()` 呼叫 `supabase.from("users").update(...)` 後端回傳 **401 No API key found**，DB 資料未更新。根因：`authContext.tsx` 中 `const supabase = createClient()` 在每次 render 都重新建立新實例，導致 `useCallback([supabase])` / `useEffect([fetchUser, supabase])` 在每次 render 都重新執行、重複訂閱 auth listener，auth state 不穩定，PATCH 請求缺少 `apikey` header。**修復**：將 `const supabase = createClient()` 改為 `useMemo(() => createClient(), [])` 確保單一穩定實例。`fetchUser` 的 deps 和 `useEffect` deps 均穩定，PATCH 請求可正確附帶 auth headers。**需人工以真實 OTP 登入補驗（QA-M-SP16-01）** | — |
| QA-SP16-02 | 編輯個人資料 | 🟡 Major **（已修復 2026-03-20）** — **直接訪問 `/profile/edit`（硬導覽/重新整理）時，表單欄位全部為空**，預填功能失效。根因：`useState({ name: user?.name ?? "" })` 的初始值只在 mount 時計算一次；直接訪問時 `authLoading=true`、`user=null`，form 以空字串初始化，後續 `user` 非同步載入後 state 不更新。**修復**：在 `profile/edit/page.tsx` 加入 `useEffect(() => { if (user) setForm({...user fields...}); }, [user?.id])`，當 user identity 載入後同步更新表單，並以 `user?.id` 為 dep 避免用戶編輯時被覆蓋。**需人工補驗（QA-M-SP16-02）** | — |
| QA-SP16-DOC | 編輯個人資料 | `spec-16-profile-edit.md` v1.0（2026-03-17）§6「備註」第一點說「儲存後即時反映至 localStorage」已過時，實際從 Sprint 5 起已改為寫入 Supabase DB（`authContext.tsx updateUser()`）。需更新說明為「儲存後即時更新 authContext 狀態並寫入 Supabase DB」 | — |
| QA-SP20-01 | UX 補完 — 註冊頁 | **🔴 Critical** — `/auth/register` 自動重導至首頁 `/`，阻斷新用戶完成註冊。重現：直接導向 `/auth/register?phone=xxx` 後等待 ~2 秒（不做任何操作）頁面即自動跳轉至 `/`。代碼層面無明確 redirect 邏輯（`RegisterContent` 無 useEffect，authContext 無 redirect）。推測 Supabase anonymous session（cookie）觸發 `onAuthStateChange`，但確切原因待查。**臨時建議：** 在 RegisterContent 加入 `useEffect(() => { supabase.auth.getUser().then(({ data: { user }}) => { if (!user) router.replace('/auth/login'); }); }, [])` 確保有效 session 才渲染，並加入 isRegistered 檢查（有 profile 則跳 /）。 | — |
| QA-SP20-02 | UX 補完 — 發布表單 | **🟢 Minor** — `/post` 錯誤訊息消失時可能造成輕微版面跳動。`fieldErr()` helper（`src/app/post/page.tsx:52`）回傳 `"block text-red-500..."` 或 `"hidden"`，無 `min-h-[20px]` 預留空間，錯誤訊息消失時佔位高度歸零，表單元素上移。建議：改為 `min-h-[20px]` 並以 `invisible` 取代 `hidden`，或加 `<span className="min-h-[20px] block">` 外層 | — |
| QA-SP20-03 | UX 補完 — SVG 無障礙 | **🟢 Minor** — 首頁搜尋卡裝飾性 SVG 缺少 `aria-hidden="true"`（`src/app/page.tsx` 搜尋欄位 icon、方向箭頭 icon 等），會被螢幕閱讀器讀出干擾資訊。BottomNav SVG 已有 `aria-hidden="true"` ✅。建議：統一在所有裝飾性 SVG 加上 `aria-hidden="true"` | — |
| QA-SP21-01 | Google OAuth — NEXT_PUBLIC_SITE_URL | **🟡 Major（部署前必須確認）** — `src/app/auth/login/page.tsx` 呼叫 `signInWithOAuth` 的 `redirectTo` 使用 `process.env.NEXT_PUBLIC_SITE_URL \|\| window.location.origin`，若 Vercel 部署時未設定 `NEXT_PUBLIC_SITE_URL` 環境變數，OAuth callback URL 將隨機取 `window.location.origin`，可能導致 Google 授權頁報「redirect_uri_mismatch」錯誤。**建議：** Vercel 部署前必須在環境變數設定 `NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app`，並在 GCP OAuth Client 的「已授權的重新導向 URI」加入相同網域的 `/auth/callback` | — |
| QA-SP21-02 | Google OAuth — 登入後 redirect-back | **🟢 Minor（架構限制）** — `src/app/auth/callback/route.ts` 為 Next.js Server Route Handler，無法存取 `sessionStorage`，因此 AuthGuard 儲存的 `jiuche_redirect` 無法在 Google OAuth 流程後使用，登入後一律跳 `/` 或 `/auth/register`，而非跳回原本要訪問的受保護頁面。**建議：** 改用 OAuth `state` 參數傳遞 redirect path（`signInWithOAuth` options 的 `state` 欄位），callback route 讀取 `state` 決定最終跳轉目標 | — |

### 人工驗證待補 🔲

> 以下項目因需瀏覽器授權 / 外部 API，MCP Preview 無法自動執行，需人工在實機補驗

| ID | 來源功能 | 路徑 | 驗證項目 | 驗證方法 | 狀態 |
|----|----------|------|----------|----------|------|
| QA-M-SP19-01 | 司機歷史評價列表 — 無評語評價卡 | `src/app/results/[id]/page.tsx:249` | DB 目前無 `comment=null` 的評價，UI 層無法驗證空評語時評語區塊是否不顯示。需在 DB 插入一筆 comment=NULL 的評價後，確認評價卡不顯示評語區塊（程式碼邏輯正確：`{r.comment && <p>...}` 空字串 falsy） | 插入 comment=NULL 的 reviews 記錄，進入該司機行程詳情頁確認無評語區塊顯示 | 🔲 待補 |
| QA-M01 | 首頁搜尋 — GPS 定位 | `src/components/GpsButton.tsx` + `/api/geocode` | 點擊「定位」按鈕 → 瀏覽器詢問位置權限 → 允許後顯示「定位中」spinner → 取得座標 → 呼叫 `/api/geocode` → 反查中文地址帶入出發地欄位 | 在手機或桌機瀏覽器開啟 `localhost:3000`，確認有 `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` 環境變數，點擊定位按鈕授權 | 🔲 待補 |
| QA-M02 | 首頁搜尋 — GPS 定位失敗狀態 | `src/components/GpsButton.tsx` | 拒絕位置權限後，按鈕變為紅色「失敗」狀態，title 顯示「無法取得位置，請手動輸入。點擊重試」；點擊失敗按鈕可重設回 idle 狀態 | 瀏覽器拒絕地理位置授權後確認按鈕外觀與行為 | 🔲 待補 |
| QA-M03 | 首頁搜尋 — 地圖選點 Modal（出發地） | `src/components/MapPickerModal.tsx` | 點擊出發地旁「地圖」按鈕 → Modal 開啟顯示 Google Maps → 點擊/拖曳大頭針選點 → 點擊確認 → 地址文字帶入出發地欄位 / Modal 關閉 | 需 `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` 有效，手動操作 | 🔲 待補 |
| QA-M04 | 首頁搜尋 — 地圖選點 Modal（目的地） | `src/components/MapPickerModal.tsx` | 同 QA-M03，但針對目的地欄位 | 同上 | 🔲 待補 |
| QA-M05 | 首頁搜尋 — 地圖選點 Modal 取消 | `src/components/MapPickerModal.tsx` | 開啟 Modal 後點擊取消或背景 → Modal 關閉，欄位值不變 | 手動操作 | 🔲 待補 |
| QA-M06 | 搜尋結果 — 「最高評分」排序 | `src/app/results/page.tsx` `filtered` useMemo | 排序邏輯 `b.driver.rating - a.driver.rating` 程式碼正確，但測試資料全為 0.0 分，UI 無法有意義驗證。需有 2 位以上、評分不同的司機資料後補測 | 確保 DB 有不同評分的司機資料，進入 /results 切換「最高評分」確認卡片順序正確降冪排列 | 🔲 待補 |
| QA-M07 | 行程詳情 — 路線地圖卡片（RouteMapCard） | `src/components/RouteMapCard.tsx` + `/api/directions` | 有 origin/destination 座標的行程詳情頁，RouteMapCard 應顯示 Google Maps 路線藍線、距離與行車時間 | 需在 DB 中有含 `origin_lat/lng` + `destination_lat/lng` 的行程，且 `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` 有效 | 🔲 待補 |
| QA-M-SP12-01 | 評價頁面 — 送出 Loading 動畫 | `src/app/trips/[id]/review/page.tsx` | 點擊「送出評價」後按鈕應顯示旋轉 spinner + 「送出中...」約 1 秒動畫 | 網路 Throttle 後點擊送出，確認按鈕 loading 狀態外觀 | 🔲 待補 |
| QA-M-SP12-02 | 評價頁面 — 成功畫面星星 animate-bounce | `src/app/trips/[id]/review/page.tsx` | 成功畫面頂部星星圖示應有 animate-bounce 動畫效果 | 目視確認（截圖無法捕捉動畫） | 🔲 待補 |
| QA-M-SP12-03 | 評價頁面 — 星等 hover 效果 | `src/app/trips/[id]/review/page.tsx` | 滑鼠懸停星等時應顯示漸進填滿效果（hover 黃色 + active:scale-90） | 手動滑鼠操作確認 hover state | 🔲 待補 |
| QA-M08 | 預訂確認 — TC-011 Loading spinner | `src/app/booking/confirm/page.tsx` handlePay() | 點擊「確認付款」後按鈕應顯示 spinner + 「付款中...」約 1–2 秒。自動化測試因付款成功後立即跳頁，未能截圖確認 spinner 畫面 | 正常付款流程，在 DevTools 中 Throttle 網路速度後點擊確認付款，觀察按鈕 loading 狀態 | 按鈕顯示 SVG spinner + 「付款中...」文字 | 未截圖驗證（邏輯正確，`loading=true` 條件確認存在） | 🔲 待補 |
| QA-M-SP16-01 | 編輯個人資料 — `updateUser()` DB 寫入 401 驗證 | `src/lib/authContext.tsx` `updateUser()` + `src/lib/supabase/client.ts` | MCP Preview 環境中 `supabase.from("users").update()` 返回 401，DB 未更新。需使用**真實 OTP 登入**的帳號在實機/桌機瀏覽器操作：進入 /profile/edit 修改姓名 → 儲存 → 重新整理後確認名稱是否保留 | 以真實手機 OTP 登入，修改個人資料後重新整理，確認資料持久化 | 🔲 待補 |
| QA-M-SP16-02 | 編輯個人資料 — 直接訪問 /profile/edit 表單預填 | `src/app/profile/edit/page.tsx` `useState` 初始值 | 直接在瀏覽器輸入網址 `localhost:3000/profile/edit` 或重新整理頁面，確認表單欄位是否顯示空白（bug）或正確預填使用者資料 | 已登入後直接輸入 URL 訪問，確認表單顯示狀態 | 🔲 待補 |
| QA-M-SP13-01 | 個人資料 — 非司機用戶「車輛資訊」隱藏 | `src/app/profile/page.tsx` line 123 `{user.isDriver && ...}` | is_driver=false 的用戶「帳號設定」卡片中「車輛資訊」選單項目應完全不顯示。程式碼驗證已確認 `{user.isDriver && <MenuItem...>}` 條件正確，但 UI 層未以非司機帳號登入實際目視確認 | 以 is_driver=false 的帳號登入，前往 /profile 確認「帳號設定」中無「車輛資訊」項目 | 🔲 待補 |
| QA-M-SP13-02 | 個人資料 — 登出按鈕紅色樣式 | `src/app/profile/page.tsx` `<MenuItem danger>` | 登出按鈕文字與圖示應為紅色（`text-red-400`），背景 `bg-red-50`，在「其他」卡片中視覺上有明顯區隔 | 前往 /profile → 目視確認登出按鈕紅色樣式（截圖僅顯示文字無法確認顏色精確度） | 🔲 待補 |
| QA-M-SP13-03 | 個人資料 — BottomNav「我的」高亮 | `src/components/BottomNav.tsx` | 停留在 /profile 時，底部導覽列「我的」圖示與文字應呈現 active 高亮狀態（綠色） | 前往 /profile → 目視確認底部「我的」圖示高亮 | 🔲 待補 |
| QA-M-SP20-01 | UX 補完 — /trips 空狀態 | `src/app/trips/page.tsx` | 歷史行程空狀態：SVG 圖示 + 「還沒有歷史行程」文字 + 「搜尋共乘」CTA 按鈕三件組正確顯示；即將行程空狀態文字「尚無即將出發的行程」顯示 | 登入後確認歷史行程與即將行程均為空，分別切換分頁確認 | 🔲 待補 |
| QA-M-SP20-02 | UX 補完 — /post 表單驗證 | `src/app/post/page.tsx` | TC-004~008：空表單點擊「下一步」顯示 from/to/date/time 紅框與錯誤文字；逐一填入欄位後紅框消失；所有欄位填妥後可進入步驟 2 | 登入後進入 /post，測試各欄位空白提交行為 | 🔲 待補 |
| QA-M-SP20-03 | UX 補完 — /register 表單驗證 | `src/app/auth/register/page.tsx` | TC-009~011：(1) 空表單點擊「完成註冊」顯示姓名與公司錯誤訊息；(2) isDriver=true 時缺少車型/車牌也顯示錯誤；(3) 填妥所有欄位可正常提交。**同時確認 QA-SP20-01 在已登出狀態是否還原** | 完全登出瀏覽器後訪問 /auth/register，測試驗證邏輯 | 🔲 待補 |
| QA-M-SP20-04 | UX 補完 — /booking/success 固定訂單號 | `src/app/booking/success/page.tsx` | 完成真實預訂流程後進入成功頁，訂單號應固定（來自 sessionStorage 或真實 booking ID）；重整後不改變 | 登入 → 預訂行程 → 完成付款 → 確認成功頁訂單號 → 重整後確認相同 | 🔲 待補（需修復 QA-SP20-02 後補驗）|
| QA-M-SP20-05 | UX 補完 — 首頁 SVG aria-hidden | `src/app/page.tsx` | 確認搜尋卡所有裝飾性 SVG 均有 `aria-hidden="true"` | 開啟 DevTools Accessibility 面板，或執行 `document.querySelectorAll('svg:not([aria-hidden])')` 查漏 | 🔲 待補 |
| QA-M-SP21-01 | Google OAuth — 新用戶首次登入 | `src/app/auth/callback/route.ts` | 使用真實 Google 帳號（Supabase users 表無記錄）登入 → callback 流程 → 應跳轉 `/auth/register?phone=` | 需完成 GCP OAuth 2.0 Client 設定 + Supabase Google Provider 啟用；使用未曾登入過的 Google 帳號測試 | 🔲 待補 |
| QA-M-SP21-02 | Google OAuth — 已有帳號的用戶登入 | `src/app/auth/callback/route.ts` | 使用已有 users 記錄的 Google 帳號登入 → callback 流程 → 應跳轉 `/`（首頁）| 需 GCP + Supabase Google Provider 設定；使用已完成過 OTP 註冊的帳號對應的 Google email 測試 | 🔲 待補 |
| QA-M-SP21-03 | Google OAuth — 在 Google 頁面取消授權 | `src/app/auth/login/page.tsx` + `src/app/auth/callback/route.ts` | 點擊 Google 登入按鈕 → Google 授權頁面 → 點擊「取消」或直接關閉 → 應返回 `/auth/login`（不顯示錯誤或 oauth_failed 訊息）| 需 GCP + Supabase Google Provider 設定；在 Google 授權頁點擊取消 | 🔲 待補 |
| QA-M-SP22-01 | spec-22 — /post 油資上限警告 | `src/app/post/page.tsx` | TC-021：填入出發地/目的地並以地圖選取（儲存座標）→ Step 2 輸入超過油資上限的金額 → 應顯示紅框 + 警告文字 + 「發布行程」按鈕 disabled | 需真實 Google Maps API Key 使 `/api/directions` 回傳路線距離 | ✅ PASS（2026-03-22）法定上限 NT$117，輸入 200 顯示紅框 + 警告 + 按鈕 disabled |
| QA-M-SP22-02 | spec-22 — /post 路線資訊卡 | `src/app/post/page.tsx` | TC-022：填入起訖地點並選取座標 → Step 1 應顯示藍色路線資訊卡（距離 + 時間 + 油資上限）| 需真實 Google Maps API Key | ✅ PASS（2026-03-22）台北→新竹 76.1 公里，約 1 小時 3 分鐘，法定上限 NT$117 |
| QA-M-SP22-03 | spec-22 — /results/[id] RouteMapCard | `src/app/results/[id]/page.tsx` + `src/components/RouteMapCard.tsx` | 新增有座標的行程後，從行程詳情頁查看 → 應顯示 Google Maps 路線地圖（綠色起點 + 紅色終點 + 路線折線）| 需真實 Google Maps API Key 並發布含座標的行程 | ✅ PASS（2026-03-22）綠色起點台北 + 紅色終點新竹 + 路線折線沿國道 3 號正確顯示 |

---

## 已完成

| 任務 | 完成日期 | 備註 |
|------|---------|------|
| S1-1 Supabase 建置 + Schema | 2026-03-17 | 六張表 + RLS 全部啟用；MCP 連線設定完成 |
| S1-2 Server Actions 架構 | 2026-03-17 | `src/lib/supabase/client.ts` / `server.ts`；`src/types/database.ts` |
| S2-1 OTP 認證 | 2026-03-17 | 開發模式 `NEXT_PUBLIC_DEV_MODE=true`，OTP=888888 bypass via Anonymous sign-in |
| S2-2 新用戶導向註冊頁 | 2026-03-17 | Anonymous session → 查 users → 無則帶 phone 跳 `/auth/register` |
| S2-3 Session 持久化 | 2026-03-17 | Supabase Auth session 取代 localStorage JWT |
| UX：OTP 輸入框尺寸 | 2026-03-17 | 改 `w-11 h-12` 固定寬高，不再 overflow |
| UX：Register 輸入框 focus 丟失 | 2026-03-17 | 將 Field component 移至 RegisterContent 外層，避免 remount |
| UX：車牌輸入格式驗證 | 2026-03-17 | 僅允許英數字 + `-`，自動轉大寫 |
| S3-1 發布共乘 → 寫入 rides 表 | 2026-03-18 | `src/actions/rides.ts` createRide()；AuthGuard 保護；CO₂ = seats × 0.6 kg |
| S3-2 搜尋結果查詢真實 rides | 2026-03-18 | `src/actions/rides.ts` searchRides()；起迄點模糊搜尋 + 日期範圍（台灣時區）；早/晚班篩選；排序（時間/價格/CO₂/評分） |
| S4-1 座位數選擇 + 預訂寫入 DB | 2026-03-18 | `getRideDetail()` 從 DB 取詳情；詳情頁座位 +/− 選擇器；`src/actions/bookings.ts` createBooking()：寫 bookings + 扣 available_seats + 寫 wallet_transactions(payment) + 更新 balance；confirm 頁改呼叫 createBooking() + refreshUser() |
| S4-2 錢包餘額真實持久化 | 2026-03-18 | `src/actions/wallet.ts` createTopup() + getWalletTransactions()；topup 頁改呼叫 createTopup()；wallet 頁改載入真實交易紀錄（本月收支按月篩選） |
| S5–S6 資料一致性 + 後台 P0 | 2026-03-18 | 評價/通知/ESG 真實資料；後台 Layout + AdminGuard + Dashboard + 會員管理 + 訂單管理 |
| S7-1 行程管理 | 2026-03-18 | `src/actions/admin/rides.ts`；列表/詳情/強制取消（批次退款 + 通知） |
| S7-2 金流管理 | 2026-03-18 | `src/actions/admin/transactions.ts`；月統計/列表/補償 Modal/CSV 匯出（UTF-8 BOM） |
| S7-3 ECPay 儲值串接 | 2026-03-18 | `createEcpayOrder()` SHA256 CheckMacValue；`/api/ecpay/callback` webhook；`/api/ecpay/result` client redirect；信用卡/ATM/超商走 ECPay，LINE Pay 保留舊流程 |
| S8-1 後台評價管理 | 2026-03-18 | `src/actions/admin/reviews.ts`；列表/星等/日期篩選；刪除評價 + 重算司機平均分（AVG + rating_count） |
| S8-2 後台通知管理 | 2026-03-18 | `src/actions/admin/notifications.ts`；notifications 表新增 `created_by` / `target_label` 欄位；批次寫入（每批 100 筆） |
| S8-3 後台 ESG 報告 | 2026-03-18 | `src/actions/admin/esg.ts`；KPI 4 格 + SVG 折線圖 + 公司 Top 10 排行；`window.print()` 匯出 PDF（print CSS 隱藏側欄） |
| S8-4 地點自動完成 | 2026-03-18 | `PlacesAutocomplete` 元件 + `/api/places` 代理路由；首頁 + 發布行程起訖點欄位套用；無 API Key 自動降級 |
| S8-5 司機歷史評價列表 | 2026-03-18 | `getDriverReviews()` in rides.ts；行程詳情頁底部顯示最新 5 筆，可展開全部；乘客姓名匿名（姓氏 + **） |
| S8-6 UX 補完 | 2026-03-18 | 歷史行程空狀態 SVG 插圖；發布行程欄位驗證紅字（blur 觸發）；首頁個人化搜尋記錄（localStorage）；訂單號 sessionStorage 持久化；BottomNav aria-label 全補 |
| S9-1 企業管理（B2B） | 2026-03-18 | `src/actions/admin/companies.ts`；企業列表（以 users.company 分組）+ 詳情頁 + CSV 匯出（UTF-8 BOM）；導覽列啟用「企業管理」；規格書 spec-admin-11-companies.md |
| S9-2 Google OAuth 串接 | 2026-03-18 | `src/app/auth/callback/route.ts`；登入頁 Google 按鈕串接 signInWithOAuth + loading 狀態 + oauth_failed 錯誤顯示；規格書 spec-21-google-oauth.md |
| S9-3 Vercel 部署設定 | 2026-03-18 | `vercel.json` 新增；`.env.local.example` 補齊 NEXT_PUBLIC_SITE_URL / Google OAuth / ECPay / Google Maps 所有變數說明 |
| S9-4 E2E 靜態驗收 | 2026-03-18 | 24 條 TC 靜態程式碼分析，22 PASS / 2 WARN / 0 FAIL；build 成功；Google OAuth 需人工設定 GCP OAuth Client 才能完整驗收 |
| S10-1 GPS 定位按鈕 | 2026-03-19 | `GpsButton` 元件；`/api/geocode` 代理路由；首頁 + 發布行程出發地欄位套用 |
| S10-2 地圖選點 Modal | 2026-03-19 | `MapPickerModal` 元件；首頁 + 發布行程起訖點欄位；@googlemaps/js-api-loader v2（setOptions + importLibrary） |
| S10-3 路線地圖卡片 | 2026-03-19 | `RouteMapCard` 元件；`/api/directions` 代理路由；行程詳情頁套用（有座標才顯示）；polyline 解碼 |
| S10-4 油資上限 + 費用拆分 | 2026-03-19 | `fareUtils.ts`（FUEL_EFFICIENCY / FUEL_GRADE / calcFareLimit / calcServiceFee）；`systemConfig.ts`（getFareConfig / isEnterprisePassenger）；發布頁顯示上限 + 超限阻擋；預訂確認頁費用分項 + 企業員工 $0 |
| S10-5 DB Migration | 2026-03-19 | `003_sprint10_map_fields.sql`；rides 7 欄位、system_config 表（含初始油價/服務費設定）、companies 表、bookings.service_fee、vehicle_type CHECK；已套用至 Supabase DB |
| S10-6 Vercel Cron 油價更新 | 2026-03-19 | `/api/cron/update-fuel-price`；data.gov.tw 能源局 API；vercel.json cron 每週四 01:00 UTC；CRON_SECRET 保護 |
