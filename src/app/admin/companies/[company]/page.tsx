"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getAdminCompanyDetail, getCompanyExpensesCSV } from "@/actions/admin/companies";
import type { CompanyDetailResult } from "@/actions/admin/companies";

const ROLE_LABEL: Record<string, { label: string; cls: string }> = {
  admin: { label: "管理員", cls: "bg-purple-100 text-purple-700" },
  user:  { label: "用戶",   cls: "bg-gray-100 text-gray-500" },
};

export default function AdminCompanyDetailPage() {
  const params = useParams();
  const company = decodeURIComponent(params.company as string);

  const [detail, setDetail] = useState<CompanyDetailResult | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getAdminCompanyDetail({ company, page });
    setDetail(result);
    setLoading(false);
  }, [company, page]);

  useEffect(() => { load(); }, [load]);

  async function handleExportCSV() {
    setExporting(true);
    try {
      const csv = await getCompanyExpensesCSV(company);
      if (!csv) { alert("無可匯出的資料"); return; }
      const now = new Date();
      const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `jiuche_expenses_${company}_${ym}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  const totalPages = detail ? Math.max(1, Math.ceil(detail.total / 20)) : 1;

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <svg className="w-6 h-6 animate-spin text-emerald-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="p-8">
        <p className="text-gray-500">找不到企業資料</p>
        <Link href="/admin/companies" className="text-emerald-600 text-sm mt-2 inline-block">← 返回企業列表</Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/companies" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{detail.company}</h1>
      </div>

      {/* KPI 卡片 */}
      <div className="grid grid-cols-3 gap-5 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-xs text-gray-400 mb-1">員工數</p>
          <p className="text-2xl font-bold text-gray-900">{detail.employeeCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-xs text-gray-400 mb-1">累計 CO₂ 減碳</p>
          <p className="text-2xl font-bold text-emerald-600">{detail.co2Total.toFixed(1)} <span className="text-sm font-normal text-gray-400">kg</span></p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-xs text-gray-400 mb-1">本月消費</p>
          <p className="text-2xl font-bold text-gray-900">
            {detail.monthlySpend > 0 ? `NT$ ${detail.monthlySpend.toLocaleString()}` : "—"}
          </p>
        </div>
      </div>

      {/* 員工列表 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">員工列表</h2>
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
          >
            {exporting ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
            匯出費用報帳 CSV
          </button>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-gray-500">姓名</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">手機</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">加入日期</th>
              <th className="text-right px-6 py-3 font-medium text-gray-500">餘額</th>
              <th className="text-center px-6 py-3 font-medium text-gray-500">角色</th>
              <th className="text-center px-6 py-3 font-medium text-gray-500">狀態</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {detail.employees.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-400">無員工資料</td>
              </tr>
            ) : (
              detail.employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3.5">
                    <Link href={`/admin/users/${emp.id}`} className="font-medium text-gray-900 hover:text-emerald-600 transition-colors">
                      {emp.name}
                    </Link>
                  </td>
                  <td className="px-6 py-3.5 text-gray-500">{emp.phone}</td>
                  <td className="px-6 py-3.5 text-gray-500">
                    {new Date(emp.createdAt).toLocaleDateString("zh-TW")}
                  </td>
                  <td className="px-6 py-3.5 text-right text-gray-700">NT$ {emp.balance.toLocaleString()}</td>
                  <td className="px-6 py-3.5 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_LABEL[emp.role]?.cls ?? ""}`}>
                      {ROLE_LABEL[emp.role]?.label ?? emp.role}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      emp.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                    }`}>
                      {emp.isActive ? "正常" : "停權"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* 分頁 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
            <span className="text-xs text-gray-500">第 {page} / {totalPages} 頁，共 {detail.total} 位員工</span>
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
