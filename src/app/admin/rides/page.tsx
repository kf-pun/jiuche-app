"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getAdminRides } from "@/actions/admin/rides";
import type { AdminRideItem } from "@/actions/admin/rides";

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  active:    { label: "進行中", cls: "bg-green-100 text-green-700" },
  completed: { label: "已完成", cls: "bg-gray-100 text-gray-500" },
  cancelled: { label: "已取消", cls: "bg-red-100 text-red-600" },
};

export default function AdminRidesPage() {
  const [rides, setRides] = useState<AdminRideItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getAdminRides({ search, status, dateFrom, dateTo, page });
    setRides(result.rides);
    setTotal(result.total);
    setLoading(false);
  }, [search, status, dateFrom, dateTo, page]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">行程管理</h1>
        <span className="text-sm text-gray-500">共 {total} 筆行程</span>
      </div>

      {/* 工具列 */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-5 flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="搜尋起點、終點或司機名稱…"
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
          <option value="active">進行中</option>
          <option value="completed">已完成</option>
          <option value="cancelled">已取消</option>
        </select>
        <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
        <span className="flex items-center text-gray-400 text-sm">至</span>
        <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
      </div>

      {/* 表格 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["路線", "司機", "出發時間", "單價", "座位", "CO₂", "狀態"].map((h) => (
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
            ) : rides.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-16 text-center text-sm text-gray-400">找不到符合條件的行程</td></tr>
            ) : rides.map((r) => {
              const st = STATUS_LABEL[r.status] ?? { label: r.status, cls: "bg-gray-100 text-gray-500" };
              const bookedSeats = r.totalSeats - r.availableSeats;
              return (
                <tr key={r.id} className="border-t border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/admin/rides/${r.id}`} className="text-sm font-medium text-gray-900 hover:text-emerald-600">
                      {r.from} → {r.to}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/users/${r.driverId}`} className="flex items-center gap-2 w-fit">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-[10px] font-bold">
                        {r.driverName[0]}
                      </div>
                      <span className="text-sm text-gray-700">{r.driverName}</span>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(r.departureTime).toLocaleString("zh-TW", { timeZone: "Asia/Taipei", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">NT${r.price}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{bookedSeats}/{r.totalSeats}</td>
                  <td className="px-6 py-4 text-sm text-emerald-600">{r.co2Saved} kg</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.cls}`}>{st.label}</span>
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
                return <button key={p} onClick={() => setPage(p)} className={`px-3 py-1.5 rounded-lg text-sm border ${p === page ? "bg-emerald-600 text-white border-emerald-600" : "border-gray-200 hover:bg-gray-50"}`}>{p}</button>;
              })}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50">→</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
