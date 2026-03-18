"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getAdminNotificationLogs, getCompanies, searchUsersForNotification,
  countTargetUsers, sendSystemAnnouncement,
} from "@/actions/admin/notifications";
import type { AdminNotificationLog } from "@/actions/admin/notifications";

function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-lg text-white text-sm z-50 ${ok ? "bg-green-600" : "bg-red-600"}`}>
      {msg}
    </div>
  );
}

export default function AdminNotificationsPage() {
  const [logs, setLogs] = useState<AdminNotificationLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [targetType, setTargetType] = useState<"all" | "company" | "user">("all");
  const [companies, setCompanies] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<{ id: string; name: string; company: string }[]>([]);
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [targetCount, setTargetCount] = useState<number | null>(null);
  const [sending, setSending] = useState(false);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), ok ? 3000 : 5000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getAdminNotificationLogs({ dateFrom, dateTo, page });
    setLogs(result.logs);
    setTotal(result.total);
    setLoading(false);
  }, [dateFrom, dateTo, page]);

  useEffect(() => { load(); }, [load]);

  // 開啟 Modal 時載入公司清單
  useEffect(() => {
    if (showModal && companies.length === 0) {
      getCompanies().then(setCompanies);
    }
  }, [showModal, companies.length]);

  // 用戶搜尋
  useEffect(() => {
    if (!userSearch.trim() || selectedUser) { setUserResults([]); return; }
    const t = setTimeout(async () => {
      const res = await searchUsersForNotification(userSearch);
      setUserResults(res);
    }, 300);
    return () => clearTimeout(t);
  }, [userSearch, selectedUser]);

  // 計算目標人數
  useEffect(() => {
    if (!showModal) return;
    const params = {
      targetType,
      company: targetType === "company" ? selectedCompany : undefined,
      userId: targetType === "user" ? selectedUser?.id : undefined,
    };
    countTargetUsers(params).then(setTargetCount);
  }, [showModal, targetType, selectedCompany, selectedUser]);

  function resetModal() {
    setTargetType("all");
    setSelectedCompany("");
    setUserSearch("");
    setUserResults([]);
    setSelectedUser(null);
    setTitle("");
    setBody("");
    setTargetCount(null);
  }

  async function handleSend() {
    if (!title.trim() || !body.trim()) return;
    if (targetType === "user" && !selectedUser) return;
    if (targetType === "company" && !selectedCompany) return;

    setSending(true);
    const res = await sendSystemAnnouncement({
      targetType,
      company: targetType === "company" ? selectedCompany : undefined,
      userId: targetType === "user" ? selectedUser?.id : undefined,
      title: title.trim(),
      body: body.trim(),
    });
    setSending(false);

    if (res.success) {
      setShowModal(false);
      resetModal();
      showToast(`公告已發送給 ${res.count} 位用戶`, true);
      load();
    } else {
      showToast(res.error ?? "發送失敗", false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">通知管理</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          發送新公告
        </button>
      </div>

      {/* 工具列 */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-5 flex gap-3 flex-wrap">
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
          aria-label="起始日期"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
        <span className="flex items-center text-gray-400 text-sm">至</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
          aria-label="結束日期"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      {/* 紀錄表格 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["標題", "發送對象", "發送人數", "發送時間"].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t border-gray-50">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <td key={j} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center text-sm text-gray-400">目前尚無發送紀錄</td>
              </tr>
            ) : logs.map((log) => (
              <tr key={log.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-800 max-w-xs truncate">{log.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{log.body}</p>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{log.targetLabel}</td>
                <td className="px-6 py-4 text-sm text-gray-700 font-medium">{log.recipientCount} 人</td>
                <td className="px-6 py-4 text-xs text-gray-400 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString("zh-TW", {
                    timeZone: "Asia/Taipei", month: "numeric", day: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">第 {page} / {totalPages} 頁</p>
            <div className="flex gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} aria-label="上一頁" className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50">←</button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} aria-label="下一頁" className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50">→</button>
            </div>
          </div>
        )}
      </div>

      {/* 發送公告 Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">發送系統公告</h3>

            <div className="space-y-4">
              {/* 發送對象 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">發送對象</label>
                <div className="flex gap-3">
                  {(["all", "company", "user"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => { setTargetType(t); setSelectedCompany(""); setSelectedUser(null); setUserSearch(""); }}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                        targetType === t ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {t === "all" ? "全體用戶" : t === "company" ? "特定公司" : "特定用戶"}
                    </button>
                  ))}
                </div>

                {targetType === "company" && (
                  <select
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    aria-label="選擇公司"
                    className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">請選擇公司…</option>
                    {companies.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                )}

                {targetType === "user" && (
                  <div className="relative mt-2">
                    {selectedUser ? (
                      <div className="flex items-center justify-between border border-blue-300 rounded-lg px-3 py-2 bg-blue-50">
                        <span className="text-sm text-blue-800 font-medium">{selectedUser.name}</span>
                        <button onClick={() => { setSelectedUser(null); setUserSearch(""); }} className="text-gray-400 hover:text-gray-600 text-xs ml-2" aria-label="清除已選用戶">✕</button>
                      </div>
                    ) : (
                      <>
                        <input
                          type="text"
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          placeholder="輸入用戶姓名搜尋…"
                          aria-label="搜尋用戶"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        {userResults.length > 0 && (
                          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 mt-1">
                            {userResults.map((u) => (
                              <button
                                key={u.id}
                                onClick={() => { setSelectedUser(u); setUserSearch(u.name); setUserResults([]); }}
                                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 text-left"
                              >
                                <span className="text-sm text-gray-800">{u.name}</span>
                                <span className="text-xs text-gray-400">{u.company}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {targetCount !== null && (
                  <p className="mt-2 text-sm text-blue-600 font-medium">將發送給 {targetCount} 位用戶</p>
                )}
              </div>

              {/* 標題 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  通知標題 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, 50))}
                  placeholder="最多 50 字"
                  maxLength={50}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{title.length} / 50</p>
              </div>

              {/* 內文 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  通知內文 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value.slice(0, 200))}
                  placeholder="最多 200 字"
                  maxLength={200}
                  rows={4}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{body.length} / 200</p>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => { setShowModal(false); resetModal(); }}
                className="flex-1 py-2 rounded-lg text-sm border border-gray-200 hover:bg-gray-50"
              >取消</button>
              <button
                onClick={handleSend}
                disabled={
                  sending || !title.trim() || !body.trim() ||
                  (targetType === "company" && !selectedCompany) ||
                  (targetType === "user" && !selectedUser)
                }
                className="flex-1 py-2 rounded-lg text-sm bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
              >{sending ? "發送中…" : "確認發送"}</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} ok={toast.ok} />}
    </div>
  );
}
