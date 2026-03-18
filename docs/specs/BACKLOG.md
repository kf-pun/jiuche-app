# 揪車 JiuChe — 開發 Backlog 與時程規劃

**更新日期：** 2026-03-18（最後更新：Sprint 7 全部完成）
**目標上線：** 2026-05-12（因加入後台系統，延後一週）

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
May 12 ■    Sprint 9  後台 P3（B2B）+ 部署
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
