"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  getMonthlyStats, getAdminTransactions, getAllTransactionsForExport,
  searchUsersForCompensation, createCompensation,
} from "@/actions/admin/transactions";
import type { AdminTxItem, MonthlyStats, UserSearchResult } from "@/actions/admin/transactions";

const TX_TYPE: Record<string, { label: string; cls: string }> = {
  topup:      { label: "儲值",     cls: "bg-blue-100 text-blue-700" },
  payment:    { label: "付款",     cls: "bg-orange-100 text-orange-700" },
  refund:     { label: "退款",     cls: "bg-green-100 text-green-700" },
  adjustment: { label: "手動調整", cls: "bg-purple-100 text-purple-700" },
  earning:    { label: "收益",     cls: "bg-teal-100 text-teal-700" },
};

function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-lg text-white text-sm z-50 ${ok ? "bg-green-600" : "bg-red-600"}`}>
      {msg}
    </div>
  );
}

export default function AdminTransactionsPage() {
  const [stats, setStats] = useState<MonthlyStats | null>(null);
  const [txs, setTxs] = useState<AdminTxItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  // 補償 Modal
  const [showComp, setShowComp] = useState(false);
  const [compSearch, setCompSearch] = useState("");
  const [compResults, setCompResults] = useState<UserSearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [compAmount, setCompAmount] = useState("");
  const [compNote, setCompNote] = useState("");
  const [compLoading, setCompLoading] = useState(false);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), ok ? 3000 : 5000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const [s, result] = await Promise.all([
      getMonthlyStats(),
      getAdminTransactions({ search, type, dateFrom, dateTo, page }),
    ]);
    setStats(s);
    setTxs(result.transactions);
    setTotal(result.total);
    setLoading(false);
  }, [search, type, dateFrom, dateTo, page]);

  useEffect(() => { load(); }, [load]);

  // 補償用戶搜尋
  useEffect(() => {
    if (!compSearch.trim() || selectedUser) { setCompResults([]); return; }
    const t = setTimeout(async () => {
      const res = await searchUsersForCompensation(compSearch);
      setCompResults(res);
    }, 300);
    return () => clearTimeout(t);
  }, [compSearch, selectedUser]);

  async function handleCompensation() {
    if (!selectedUser || !compAmount || !compNote.trim()) return;
    const amt = parseFloat(compAmount);
    if (isNaN(amt) || amt === 0) return;
    setCompLoading(true);
    const res = await createCompensation(selectedUser.id, amt, compNote.trim());
    setCompLoading(false);
    if (res.success) {
      setShowComp(false);
      setCompSearch(""); setSelectedUser(null); setCompAmount(""); setCompNote("");
      showToast("補償交易已新增", true);
      load();
    } else {
      showToast(res.error ?? "操作失敗", false);
    }
  }

  async function handleExportCsv() {
    const data = await getAllTransactionsForExport({ search, type, dateFrom, dateTo });
    if (data.length === 0) { showToast("無資料可匯出", false); return; }

    const TYPE_ZH: Record<string, string> = {
      topup: "儲值", payment: "付款", refund: "退款", adjustment: "手動調整", earning: "收益",
    };
    const rows = [
      ["交易編號", "用戶姓名", "用戶電話", "類型", "金額", "備註", "建立時間"],
      ...data.map((t) => [
        t.id, t.userName, t.userPhone,
        TYPE_ZH[t.type] ?? t.type,
        t.amount.toString(),
        t.description,
        new Date(t.createdAt).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" }),
      ]),
    ];
    const csv = "\uFEFF" + rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jiuche_transactions_${new Date().toISOString().slice(0, 10).replace(/-/g, "")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalPages = Math.max(1, Math.ceil(total / 20));
  const compPreview = selectedUser && compAmount && !isNaN(parseFloat(compAmount))
    ? `${selectedUser.name} 的新餘額：NT$ ${(selectedUser.balance + parseFloat(compAmount)).toLocaleString()}`
    : "";

  const statsCards = stats ? [
    { label: "本月總儲值", value: stats.totalTopup,   color: "text-blue-600",   bg: "bg-blue-50" },
    { label: "本月總付款", value: stats.totalPayment, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "本月總退款", value: stats.totalRefund,  color: "text-green-600",  bg: "bg-green-50" },
    { label: "本月淨收益", value: stats.netRevenue,   color: "text-purple-600", bg: "bg-purple-50" },
  ] : [];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">金流管理</h1>

      {/* 統計列 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {statsCards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-xs text-gray-400 mb-2">{c.label}</p>
            <p className={`text-2xl font-bold ${c.color}`}>NT$ {c.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* 工具列 */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-5 flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="搜尋用戶姓名…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 min-w-40 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
        <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
          <option value="all">全部類型</option>
          <option value="topup">儲值</option>
          <option value="payment">付款</option>
          <option value="refund">退款</option>
          <option value="adjustment">手動調整</option>
        </select>
        <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
        <span className="flex items-center text-gray-400 text-sm">至</span>
        <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setShowComp(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >新增補償交易</button>
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >匯出 CSV</button>
        </div>
      </div>

      {/* 表格 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["用戶", "類型", "金額", "備註", "建立時間"].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-t border-gray-50">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : txs.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-16 text-center text-sm text-gray-400">找不到符合條件的交易記錄</td></tr>
            ) : txs.map((t) => {
              const ty = TX_TYPE[t.type] ?? { label: t.type, cls: "bg-gray-100 text-gray-500" };
              return (
                <tr key={t.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3">
                    <Link href={`/admin/users/${t.userId}`} className="flex items-center gap-2 w-fit">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-[10px] font-bold">
                        {t.userName[0]}
                      </div>
                      <span className="text-sm text-gray-800 hover:text-emerald-600">{t.userName}</span>
                    </Link>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ty.cls}`}>{ty.label}</span>
                  </td>
                  <td className={`px-6 py-3 text-sm font-medium ${t.amount >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {t.amount >= 0 ? "+" : ""}NT${Math.abs(t.amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500 max-w-48 truncate">{t.description || "—"}</td>
                  <td className="px-6 py-3 text-xs text-gray-400">
                    {new Date(t.createdAt).toLocaleString("zh-TW", { timeZone: "Asia/Taipei", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* 分頁 */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">第 {page} / {totalPages} 頁，共 {total} 筆</p>
            <div className="flex gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50">←</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return <button key={p} onClick={() => setPage(p)} className={`px-3 py-1.5 rounded-lg text-sm border ${p === page ? "bg-emerald-600 text-white border-emerald-600" : "border-gray-200 hover:bg-gray-50"}`}>{p}</button>;
              })}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50">→</button>
            </div>
          </div>
        )}
      </div>

      {/* 補償 Modal */}
      {showComp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">新增補償交易</h3>
            <div className="space-y-3">
              {/* 用戶搜尋 */}
              <div className="relative">
                <label className="block text-sm text-gray-600 mb-1">選擇用戶</label>
                {selectedUser ? (
                  <div className="flex items-center justify-between border border-emerald-300 rounded-lg px-3 py-2 bg-emerald-50">
                    <span className="text-sm text-emerald-800 font-medium">{selectedUser.name}（NT${selectedUser.balance.toLocaleString()}）</span>
                    <button onClick={() => { setSelectedUser(null); setCompSearch(""); }} className="text-gray-400 hover:text-gray-600 text-xs ml-2">✕</button>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      value={compSearch}
                      onChange={(e) => setCompSearch(e.target.value)}
                      placeholder="輸入用戶姓名搜尋…"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    {compResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 mt-1">
                        {compResults.map((u) => (
                          <button
                            key={u.id}
                            onClick={() => { setSelectedUser(u); setCompSearch(u.name); setCompResults([]); }}
                            className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 text-left"
                          >
                            <span className="text-sm text-gray-800">{u.name}</span>
                            <span className="text-xs text-gray-400">NT${u.balance.toLocaleString()}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">金額（正數=加值，負數=扣款）</label>
                <input
                  type="number"
                  value={compAmount}
                  onChange={(e) => setCompAmount(e.target.value)}
                  placeholder="例：100 或 -50"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {compPreview && <p className="text-xs text-gray-400 mt-1">{compPreview}</p>}
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">備註（必填）</label>
                <input
                  type="text"
                  value={compNote}
                  onChange={(e) => setCompNote(e.target.value)}
                  placeholder="例：客訴補償、系統錯誤修正"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => { setShowComp(false); setCompSearch(""); setSelectedUser(null); setCompAmount(""); setCompNote(""); }}
                className="flex-1 py-2 rounded-lg text-sm border border-gray-200 hover:bg-gray-50"
              >取消</button>
              <button
                onClick={handleCompensation}
                disabled={compLoading || !selectedUser || !compAmount || !compNote.trim()}
                className="flex-1 py-2 rounded-lg text-sm bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
              >{compLoading ? "處理中…" : "確認新增"}</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} ok={toast.ok} />}
    </div>
  );
}
