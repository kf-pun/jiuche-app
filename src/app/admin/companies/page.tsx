"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getAdminCompanies } from "@/actions/admin/companies";
import type { CompanyItem } from "@/actions/admin/companies";

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getAdminCompanies({ search, page });
    setCompanies(result.companies);
    setTotal(result.total);
    setLoading(false);
  }, [search, page]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">企業管理</h1>
        <span className="text-sm text-gray-500">共 {total} 間企業</span>
      </div>

      {/* 搜尋列 */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-5 flex gap-3">
        <input
          type="text"
          placeholder="搜尋企業名稱…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      {/* 表格 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-gray-500">企業名稱</th>
              <th className="text-right px-6 py-3 font-medium text-gray-500">員工數</th>
              <th className="text-right px-6 py-3 font-medium text-gray-500">CO₂ 減碳（kg）</th>
              <th className="text-right px-6 py-3 font-medium text-gray-500">本月消費（NT$）</th>
              <th className="text-center px-6 py-3 font-medium text-gray-500">狀態</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-16 text-gray-400">
                  <svg className="w-6 h-6 animate-spin mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  載入中…
                </td>
              </tr>
            ) : companies.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16 text-gray-400">
                  <svg className="w-10 h-10 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  目前尚無企業資料
                </td>
              </tr>
            ) : (
              companies.map((c) => (
                <tr key={c.company} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{c.company}</td>
                  <td className="px-6 py-4 text-right text-gray-700">{c.employeeCount}</td>
                  <td className="px-6 py-4 text-right text-gray-700">{c.co2Total.toFixed(1)}</td>
                  <td className="px-6 py-4 text-right text-gray-700">
                    {c.monthlySpend > 0 ? `NT$ ${c.monthlySpend.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      c.hasActiveEmployee
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}>
                      {c.hasActiveEmployee ? "正常" : "停用"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/companies/${encodeURIComponent(c.company)}`}
                      className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                    >
                      查看 →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* 分頁 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
            <span className="text-xs text-gray-500">第 {page} / {totalPages} 頁</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-white transition-colors"
              >
                上一頁
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-white transition-colors"
              >
                下一頁
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
