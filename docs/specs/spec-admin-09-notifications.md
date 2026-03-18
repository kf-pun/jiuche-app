# 後台通知管理 功能規格書

**版本：** v1.0
**日期：** 2026-03-18
**狀態：** 已確認

---

## 1. 背景與目標
- 管理員需要主動向用戶發送系統公告（活動通知、維護公告等），並查看歷史發送紀錄
- 目標：支援群發公告（全體 / 特定公司 / 特定用戶）並提供發送記錄列表

## 2. 使用者故事
- 身為管理員，我希望發送公告給全體用戶，這樣才能快速傳達重要訊息
- 身為管理員，我希望對特定公司員工發送通知，這樣才能進行 B2B 客製溝通
- 身為管理員，我希望查看過去發送的公告紀錄，這樣才能避免重複發送

## 3. 功能範圍

### 已完成功能
- 無

### 待製作
- 通知記錄列表（日期篩選 + 分頁）
- 發送系統公告 Modal（對象選擇 + 標題 + 內文 + 批次寫入 notifications 表）

## 4. 使用流程

**發送公告：**
1. 管理員點擊「發送新公告」
2. Modal 中：
   - 選擇對象：全體 / 特定公司（下拉選公司名稱）/ 特定用戶（輸入姓名搜尋）
   - 輸入通知標題（必填，最多 50 字）
   - 輸入通知內文（必填，最多 200 字）
3. 預覽：顯示「將發送給 N 位用戶」
4. 確認送出 → 批次查出目標用戶 ID → 批次 `INSERT INTO notifications`（type='system'）
5. 成功：toast 綠色，列表刷新

**查看紀錄：**
- 列表依時間降冪排列
- 每列顯示：標題、發送對象摘要、發送人數、時間

## 5. 畫面與功能說明

### 通知管理（`/admin/notifications`）
- **頁面標題：** 通知管理

**工具列：**
- 日期範圍篩選（起～迄）
- 「發送新公告」按鈕（`bg-blue-600 text-white`，右側）

**公告紀錄表格：**

| 欄位 | 說明 |
|------|------|
| 標題 | 公告標題（最多 40 字截斷） |
| 發送對象 | 「全體用戶」/ 「[公司名] 員工」/ 「[用戶姓名]」 |
| 發送人數 | N 人 |
| 發送時間 | YYYY/MM/DD HH:MM |

- **空狀態：** 「目前尚無發送紀錄」
- **分頁：** 每頁 20 筆

> 備註：此頁面只顯示管理員主動發送的 `type='system'` 公告紀錄，不顯示系統自動產生的訂單/預訂通知。

### 發送公告 Modal
- 標題：「發送系統公告」
- **發送對象：**
  - Radio / Select：全體用戶（預設）/ 特定公司 / 特定用戶
  - 選「特定公司」→ 顯示公司 select（從 users 表 distinct company 取得）
  - 選「特定用戶」→ 顯示用戶搜尋欄（debounce，顯示下拉最多 5 筆）
- **通知標題**（必填，最多 50 字）
- **通知內文**（必填，最多 200 字，textarea）
- **預覽列：** 「將發送給 N 位用戶」（選擇對象後即時計算）
- 按鈕：「取消」（灰）、「確認發送」（藍）

## 6. 資料說明
- 讀取紀錄：`notifications` where `type='system'` AND `created_by` 欄位為管理員 user_id（需新增此欄位）
- 發送對象計算：
  - 全體：所有 `users.is_active = true` 且非 admin 的用戶
  - 特定公司：`users.company = ?` AND `is_active = true`
  - 特定用戶：指定 1 位

**新增欄位：**
- `notifications.created_by`：uuid（管理員 user_id），用於區分系統自動 vs 管理員手動

**Server Actions（`src/actions/admin/notifications.ts`）：**
```ts
getAdminNotificationLogs(params)             // 公告紀錄列表
sendSystemAnnouncement(params)               // 批次寫入 notifications
getCompanies()                               // 取得公司列表（distinct）
searchUsersForNotification(query)            // 用戶搜尋
countTargetUsers(target)                     // 計算目標人數（預覽用）
```

## 7. 設計規範
- 同後台其他頁規範
- 發送對象 Radio 切換時，下方條件欄位動態顯示/隱藏

## 8. 備註
- 批次寫入：目標用戶超過 500 人時，分批（每批 100 筆）寫入，避免單次 INSERT 過大
- `notifications.created_by` 欄位需新增 migration

## 9. 待確認事項
- 無
