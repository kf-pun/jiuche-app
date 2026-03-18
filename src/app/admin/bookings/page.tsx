"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getAdminBookings } from "@/actions/admin/bookings";
import type { AdminBookingItem } from "@/actions/admin/bookings";

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  confirmed: { label: "已確認", cls: "bg-green-100 text-green-700" },
  completed: { label: "已完成", cls: "bg-gray-100 text-gray-500" },
  cancelled: { label: "已取消", cls: "bg-red-100 text-red-600" },
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBookingItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getAdminBookings({ search, status, dateFrom, dateTo, page });
    setBookings(result.bookings);
    setTotal(result.total);
    setLoading(false);
  }, [search, status, dateFrom, dateTo, page]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">訂單管理</h1>
        <span className="text-sm text-gray-500">共 {total} 筆訂單</span>
      </div>

      {/* 工具列 */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-5 flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="搜尋訂單號或乘客姓名…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 min-w-48 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <option value="all">全部狀態</option>
          <option value="confirmed">已確認</option>
          <option value="completed">已完成</option>
          <option value="cancelled">已取消</option>
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
        <span className="flex items-center text-gray-400 text-sm">至</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      {/* 表格 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">訂單號</th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">乘客</th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">路線</th>
              <th className="px-6 py-3 text-right text-xs text-gray-500 font-medium uppercase tracking-wider">座位</th>
              <th className="px-6 py-3 text-right text-xs text-gray-500 font-medium uppercase tracking-wider">金額</th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">狀態</th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">建立時間</th>
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
            ) : bookings.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-16 text-center text-sm text-gray-400">找不到符合條件的訂單</td></tr>
            ) : bookings.map((b) => {
              const st = STATUS_LABEL[b.status] ?? { label: b.status, cls: "bg-gray-100 text-gray-500" };
              return (
                <tr key={b.id} className="border-t border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/admin/bookings/${b.id}`} className="text-xs font-mono text-emerald-600 hover:underline">
                      JC{b.id.replace(/-/g, "").slice(0, 6).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/users/${b.passengerId}`} className="text-sm font-medium text-gray-800 hover:text-emerald-600">
                      {b.passengerName}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{b.from} → {b.to}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-right">{b.seats} 席</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-700 text-right">NT${b.totalPrice.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.cls}`}>{st.label}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {new Date(b.createdAt).toLocaleString("zh-TW", { timeZone: "Asia/Taipei", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* 分頁 */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">第 {page} / {totalPages} 頁</p>
            <div className="flex gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50">←</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return (
                  <button key={p} onClick={() => setPage(p)} className={`px-3 py-1.5 rounded-lg text-sm border ${p === page ? "bg-emerald-600 text-white border-emerald-600" : "border-gray-200 hover:bg-gray-50"}`}>{p}</button>
                );
              })}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50">→</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
