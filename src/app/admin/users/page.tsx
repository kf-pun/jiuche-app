"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getAdminUsers } from "@/actions/admin/users";
import type { AdminUserItem } from "@/actions/admin/users";

const ROLE_LABEL: Record<string, { label: string; cls: string }> = {
  admin: { label: "管理員", cls: "bg-purple-100 text-purple-700" },
  user:  { label: "用戶",   cls: "bg-gray-100 text-gray-500" },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getAdminUsers({ search, role, status, page });
    setUsers(result.users);
    setTotal(result.total);
    setLoading(false);
  }, [search, role, status, page]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">會員管理</h1>
        <span className="text-sm text-gray-500">共 {total} 位會員</span>
      </div>

      {/* 工具列 */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-5 flex gap-3">
        <input
          type="text"
          placeholder="搜尋姓名或電話…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
        <select
          value={role}
          onChange={(e) => { setRole(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <option value="all">全部角色</option>
          <option value="user">用戶</option>
          <option value="admin">管理員</option>
        </select>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <option value="all">全部狀態</option>
          <option value="active">正常</option>
          <option value="suspended">停權</option>
        </select>
      </div>

      {/* 表格 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">用戶</th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">公司</th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">角色</th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">狀態</th>
              <th className="px-6 py-3 text-right text-xs text-gray-500 font-medium uppercase tracking-wider">餘額</th>
              <th className="px-6 py-3 text-right text-xs text-gray-500 font-medium uppercase tracking-wider">評分</th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">註冊時間</th>
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
            ) : users.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-16 text-center text-sm text-gray-400">找不到符合條件的會員</td></tr>
            ) : users.map((u) => {
              const roleCfg = ROLE_LABEL[u.role] ?? { label: u.role, cls: "bg-gray-100 text-gray-500" };
              return (
                <tr key={u.id} className="border-t border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/admin/users/${u.id}`} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {u.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.phone}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{u.company || "—"}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleCfg.cls}`}>{roleCfg.label}</span>
                  </td>
                  <td className="px-6 py-4">
                    {u.isActive
                      ? <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">正常</span>
                      : <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-600">停權</span>
                    }
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 text-right">NT${u.balance.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 text-right">⭐ {Number(u.rating).toFixed(1)}</td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {new Date(u.createdAt).toLocaleDateString("zh-TW")}
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
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >←</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-1.5 rounded-lg text-sm border ${p === page ? "bg-emerald-600 text-white border-emerald-600" : "border-gray-200 hover:bg-gray-50"}`}
                  >{p}</button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >→</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
