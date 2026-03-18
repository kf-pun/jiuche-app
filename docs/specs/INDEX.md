# 揪車 JiuChe — 規格書索引

所有功能規格書統一存放於此目錄。
開發任何功能前，請先找到對應規格書；開發完成後，請回來更新規格書狀態。

> 使用 `/spec-writer` 指令撰寫新的規格書。

---

## 功能清單（依優先度排序）

### 🔴 最高優先 — 核心乘車流程

| 優先 | 功能名稱 | 路由 | 規格書 | 狀態 |
|------|----------|------|--------|------|
| 1 | 首頁搜尋 | `/` | [spec-01-home-search.md](./spec-01-home-search.md) | 已完成 |
| 2 | 搜尋結果與篩選 | `/results` | [spec-02-results.md](./spec-02-results.md) | 已完成 |
| 3 | 行程詳情 | `/results/[id]` | [spec-03-ride-detail.md](./spec-03-ride-detail.md) | 已完成 |
| 4 | 登入（手機 OTP） | `/auth/login` | [spec-04-login.md](./spec-04-login.md) | 已完成 |
| 5 | 預訂確認 | `/booking/confirm` | [spec-05-booking-confirm.md](./spec-05-booking-confirm.md) | 已完成 |
| 6 | 預訂成功 | `/booking/success` | [spec-06-booking-success.md](./spec-06-booking-success.md) | 已完成 |

### 🟠 高優先 — 供給端與帳戶管理

| 優先 | 功能名稱 | 路由 | 規格書 | 狀態 |
|------|----------|------|--------|------|
| 7 | 發布共乘 | `/post` | [spec-07-post-ride.md](./spec-07-post-ride.md) | 已完成 |
| 8 | 我的行程 | `/trips` | [spec-08-my-trips.md](./spec-08-my-trips.md) | 已完成 |
| 9 | 錢包總覽 | `/wallet` | [spec-09-wallet.md](./spec-09-wallet.md) | 已完成 |
| 10 | 儲值 | `/wallet/topup` + `/wallet/topup/success` | [spec-10-wallet-topup.md](./spec-10-wallet-topup.md) | 已完成 |
| 11 | 註冊 | `/auth/register` | [spec-11-register.md](./spec-11-register.md) | 已完成 |

### 🟡 中優先 — 信任機制與個人資料

| 優先 | 功能名稱 | 路由 | 規格書 | 狀態 |
|------|----------|------|--------|------|
| 12 | 評價頁面 | `/trips/[id]/review` | [spec-12-review.md](./spec-12-review.md) | 已完成 |
| 13 | 個人資料頁 | `/profile` | [spec-13-profile.md](./spec-13-profile.md) | 已完成 |
| 14 | 通知中心 | `/notifications` | [spec-14-notifications.md](./spec-14-notifications.md) | 已完成 |

### 🟢 一般優先 — ESG 差異化與次要頁面

| 優先 | 功能名稱 | 路由 | 規格書 | 狀態 |
|------|----------|------|--------|------|
| 15 | ESG 儀表板 | `/esg` | [spec-15-esg-dashboard.md](./spec-15-esg-dashboard.md) | 已完成 |
| 16 | 編輯個人資料 | `/profile/edit` | [spec-16-profile-edit.md](./spec-16-profile-edit.md) | 已完成 |
| 17 | 發布成功 | `/post/success` | [spec-17-post-success.md](./spec-17-post-success.md) | 已完成 |
| 18 | 儲值成功 | `/wallet/topup/success` | ↳ 合併至 spec-10-wallet-topup.md | 已完成 |

### 🔵 後台管理系統 — Sprint 6+（Desktop-First）

| 優先 | 功能名稱 | 路由 | 規格書 | 狀態 |
|------|----------|------|--------|------|
| 19 | 後台基礎架構（Layout + AdminGuard） | `/admin/*` | [spec-admin-01-layout.md](./spec-admin-01-layout.md) | 已完成 |
| 20 | 後台 Dashboard 總覽 | `/admin` | [spec-admin-02-dashboard.md](./spec-admin-02-dashboard.md) | 已完成 |
| 21 | 後台會員管理 | `/admin/users` | [spec-admin-03-users.md](./spec-admin-03-users.md) | 已完成 |
| 22 | 後台訂單管理 | `/admin/bookings` | [spec-admin-04-bookings.md](./spec-admin-04-bookings.md) | 已完成 |
| 23 | 後台行程管理 | `/admin/rides` | [spec-admin-05-rides.md](./spec-admin-05-rides.md) | 已完成 |
| 24 | 後台金流管理 | `/admin/transactions` | [spec-admin-06-transactions.md](./spec-admin-06-transactions.md) | 已完成 |
| 25 | 儲值串接 ECPay | `/wallet/topup` + `/api/ecpay/callback` | [spec-admin-07-ecpay.md](./spec-admin-07-ecpay.md) | 已完成 |
| 26 | 後台評價管理 | `/admin/reviews` | [spec-admin-08-reviews.md](./spec-admin-08-reviews.md) | 已完成 |
| 27 | 後台通知管理 | `/admin/notifications` | [spec-admin-09-notifications.md](./spec-admin-09-notifications.md) | 已完成 |
| 28 | 後台 ESG 報告 | `/admin/esg` | [spec-admin-10-esg.md](./spec-admin-10-esg.md) | 已完成 |

### 🔵 後台管理系統 — Sprint 9（B2B）

| 優先 | 功能名稱 | 路由 | 規格書 | 狀態 |
|------|----------|------|--------|------|
| 32 | 後台企業管理（B2B） | `/admin/companies` | [spec-admin-11-companies.md](./spec-admin-11-companies.md) | 已完成 |
| 33 | Google OAuth 串接 | `/auth/login` + `/auth/callback` | [spec-21-google-oauth.md](./spec-21-google-oauth.md) | 已完成 |

### 🟤 前台補完 — Sprint 8

| 優先 | 功能名稱 | 路由 | 規格書 | 狀態 |
|------|----------|------|--------|------|
| 29 | 地點自動完成（Google Maps） | `/`、`/post` | [spec-18-places-autocomplete.md](./spec-18-places-autocomplete.md) | 已完成 |
| 30 | 司機歷史評價列表 | `/results/[id]` | [spec-19-driver-reviews.md](./spec-19-driver-reviews.md) | 已完成 |
| 31 | UX 補完（空狀態/驗證/無障礙） | 多頁面 | [spec-20-ux-improvements.md](./spec-20-ux-improvements.md) | 已完成 |

---

## 共用元件

| 元件 | 說明 | 相關規格書 |
|------|------|------------|
| `BottomNav` | 底部導覽列（`/auth/*` 與 `/admin/*` 時隱藏） | 所有前台頁面 |
| `AuthGuard` | 登入保護（未登入自動導向登入頁） | spec-04-login.md |
| `AdminGuard` | 後台保護（非 admin role → 前台首頁，Sprint 6 新增） | spec-admin-01-layout.md |
| `PlacesAutocomplete` | 地點自動完成（Google Maps Places API，Sprint 8 新增） | spec-18-places-autocomplete.md |

---

## 規格書狀態說明

| 狀態 | 說明 |
|------|------|
| 待撰寫 | 尚未建立規格書 |
| 草稿 | 規格書已建立，尚未確認 |
| 審閱中 | 等待確認 |
| 已完成 | 可以開始開發 |
| 已完成 | 開發完成，規格書已更新 |
