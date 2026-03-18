"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getAdminReviews, deleteReview } from "@/actions/admin/reviews";
import type { AdminReviewItem } from "@/actions/admin/reviews";

function StarDisplay({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < rating ? "text-yellow-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ))}
    </div>
  );
}

function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-lg text-white text-sm z-50 ${ok ? "bg-green-600" : "bg-red-600"}`}>
      {msg}
    </div>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReviewItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [rating, setRating] = useState(0);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  // 刪除確認 Modal
  const [deleteTarget, setDeleteTarget] = useState<AdminReviewItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), ok ? 3000 : 5000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getAdminReviews({ search, rating, dateFrom, dateTo, page });
    setReviews(result.reviews);
    setTotal(result.total);
    setLoading(false);
  }, [search, rating, dateFrom, dateTo, page]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await deleteReview(deleteTarget.id, deleteTarget.driverId);
    setDeleting(false);
    setDeleteTarget(null);
    if (res.success) {
      showToast("評價已刪除，司機評分已更新", true);
      load();
    } else {
      showToast(res.error ?? "刪除失敗", false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">評價管理</h1>

      {/* 工具列 */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-5 flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="搜尋乘客或司機姓名…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          aria-label="搜尋乘客或司機姓名"
          className="flex-1 min-w-40 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
        <select
          value={rating}
          onChange={(e) => { setRating(Number(e.target.value)); setPage(1); }}
          aria-label="篩選星等"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <option value={0}>全部星等</option>
          <option value={1}>1 星</option>
          <option value={2}>2 星</option>
          <option value={3}>3 星</option>
          <option value={4}>4 星</option>
          <option value={5}>5 星</option>
        </select>
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

      {/* 表格 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["乘客", "司機", "星等", "評語", "標籤", "日期", "操作"].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-t border-gray-50">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : reviews.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-16 text-center text-sm text-gray-400">目前沒有符合條件的評價</td></tr>
            ) : reviews.map((r) => (
              <tr key={r.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3">
                  <Link href={`/admin/users/${r.passengerId}`} className="flex items-center gap-2 w-fit hover:text-emerald-600">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-[10px] font-bold">
                      {r.passengerName[0]}
                    </div>
                    <span className="text-sm text-gray-800">{r.passengerName}</span>
                  </Link>
                </td>
                <td className="px-6 py-3">
                  <Link href={`/admin/users/${r.driverId}`} className="flex items-center gap-2 w-fit hover:text-emerald-600">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
                      {r.driverName[0]}
                    </div>
                    <span className="text-sm text-gray-800">{r.driverName}</span>
                  </Link>
                </td>
                <td className="px-6 py-3"><StarDisplay rating={r.rating} /></td>
                <td className="px-6 py-3 text-sm text-gray-600 max-w-48">
                  <span className="line-clamp-2">{r.comment || <span className="text-gray-300 italic">無評語</span>}</span>
                </td>
                <td className="px-6 py-3">
                  <div className="flex flex-wrap gap-1 max-w-32">
                    {r.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-3 text-xs text-gray-400 whitespace-nowrap">
                  {new Date(r.createdAt).toLocaleDateString("zh-TW", { timeZone: "Asia/Taipei", month: "numeric", day: "numeric" })}
                </td>
                <td className="px-6 py-3">
                  <button
                    onClick={() => setDeleteTarget(r)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                    aria-label={`刪除 ${r.passengerName} 對 ${r.driverName} 的評價`}
                  >
                    刪除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 分頁 */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">第 {page} / {totalPages} 頁，共 {total} 筆</p>
            <div className="flex gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} aria-label="上一頁" className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50">←</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return <button key={p} onClick={() => setPage(p)} className={`px-3 py-1.5 rounded-lg text-sm border ${p === page ? "bg-emerald-600 text-white border-emerald-600" : "border-gray-200 hover:bg-gray-50"}`}>{p}</button>;
              })}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} aria-label="下一頁" className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50">→</button>
            </div>
          </div>
        )}
      </div>

      {/* 刪除確認 Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">確認刪除此評價？</h3>
            <p className="text-sm text-gray-500 text-center mb-5">
              刪除後將重新計算 <span className="font-medium text-gray-700">{deleteTarget.driverName}</span> 的平均評分，此操作無法復原。
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2 rounded-lg text-sm border border-gray-200 hover:bg-gray-50"
              >取消</button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2 rounded-lg text-sm bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50"
              >{deleting ? "刪除中…" : "確認刪除"}</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} ok={toast.ok} />}
    </div>
  );
}
