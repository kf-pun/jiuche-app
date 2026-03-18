"use client";

import { useState, useEffect } from "react";
import { getEsgStats, getMonthlyTrend, getCompanyRanking } from "@/actions/admin/esg";
import type { EsgStats, MonthlyTrendItem, CompanyRankItem } from "@/actions/admin/esg";

const GRADE_STYLE: Record<string, string> = {
  A: "bg-green-100 text-green-700",
  B: "bg-yellow-100 text-yellow-700",
  C: "bg-gray-100 text-gray-500",
};

function LineChart({ data }: { data: MonthlyTrendItem[] }) {
  if (data.length === 0) return <div className="h-40 flex items-center justify-center text-gray-300 text-sm">尚無資料</div>;

  const max = Math.max(...data.map((d) => d.co2), 1);
  const w = 100 / (data.length - 1 || 1);

  const points = data.map((d, i) => ({
    x: i * w,
    y: 100 - (d.co2 / max) * 85,
    ...d,
  }));

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="relative">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-40">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((y) => (
          <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#f3f4f6" strokeWidth="0.5" />
        ))}
        {/* Area fill */}
        <polygon
          points={`0,100 ${polyline} 100,100`}
          fill="rgba(16,185,129,0.08)"
        />
        {/* Line */}
        <polyline
          points={polyline}
          fill="none"
          stroke="#10b981"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {/* Dots */}
        {points.map((p) => (
          <circle key={p.month} cx={p.x} cy={p.y} r="1.5" fill="#10b981" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      {/* X labels */}
      <div className="flex justify-between mt-1 px-1">
        {data.map((d) => (
          <span key={d.month} className="text-xs text-gray-400 w-8 text-center">{d.label}</span>
        ))}
      </div>
    </div>
  );
}

export default function AdminEsgPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [stats, setStats] = useState<EsgStats | null>(null);
  const [trend, setTrend] = useState<MonthlyTrendItem[]>([]);
  const [ranking, setRanking] = useState<CompanyRankItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getEsgStats(year),
      getMonthlyTrend(year),
      getCompanyRanking(),
    ]).then(([s, t, r]) => {
      setStats(s);
      setTrend(t);
      setRanking(r);
      setLoading(false);
    });
  }, [year]);

  const kpiCards = stats ? [
    { label: "累計減碳量", value: `${stats.totalCo2.toLocaleString()} kg`, sub: "CO₂", color: "text-green-600", bg: "bg-green-50" },
    { label: "完成行程數", value: stats.totalRides.toLocaleString(), sub: "趟", color: "text-blue-600", bg: "bg-blue-50" },
    { label: "累計乘客次", value: stats.totalPassengers.toLocaleString(), sub: "次", color: "text-orange-600", bg: "bg-orange-50" },
    { label: "減少車輛數", value: stats.reducedCars.toLocaleString(), sub: "輛", color: "text-purple-600", bg: "bg-purple-50" },
  ] : [];

  return (
    <div className="p-8 print:p-4" id="esg-report">
      {/* 標題列 */}
      <div className="flex items-center justify-between mb-6 print:mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ESG 報告</h1>
          <p className="text-sm text-gray-400 mt-1">全平台碳排減少與企業貢獻統計</p>
        </div>
        <div className="flex items-center gap-3 print:hidden">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            aria-label="選擇年份"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
              <option key={y} value={y}>{y} 年</option>
            ))}
          </select>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            aria-label="匯出 PDF 報告"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            匯出 PDF 報告
          </button>
        </div>
      </div>

      {/* 列印標頭（只在列印時顯示）*/}
      <div className="hidden print:block mb-6 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <span className="text-white text-sm font-bold">揪</span>
          </div>
          <div>
            <p className="font-bold text-lg">揪車 JiuChe — ESG 報告</p>
            <p className="text-sm text-gray-500">報告期間：{year} 年 ｜ 產製日期：{new Date().toLocaleDateString("zh-TW")}</p>
          </div>
        </div>
      </div>

      {/* KPI 卡片 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-5 animate-pulse">
                <div className="h-3 bg-gray-100 rounded w-16 mb-3" />
                <div className="h-8 bg-gray-100 rounded w-24" />
              </div>
            ))
          : kpiCards.map((c) => (
              <div key={c.label} className="bg-white rounded-xl shadow-sm p-5">
                <p className="text-xs text-gray-400 mb-2">{c.label}</p>
                <p className={`text-3xl font-bold ${c.color}`}>{c.value}</p>
                <p className="text-xs text-gray-400 mt-1">{c.sub}</p>
              </div>
            ))
        }
      </div>

      {/* 月度趨勢 */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">月度 CO₂ 減碳趨勢（近 6 個月）</h2>
        {loading ? (
          <div className="h-40 bg-gray-50 rounded animate-pulse" />
        ) : (
          <LineChart data={trend} />
        )}
      </div>

      {/* 公司排行榜 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">企業 ESG 貢獻排行榜（Top 10）</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["排名", "公司名稱", "共乘次數", "累計減碳（kg）", "碳排等級"].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t border-gray-50">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : ranking.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">尚無完成行程資料</td></tr>
            ) : ranking.map((r) => (
              <tr key={r.company} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3">
                  <span className={`text-sm font-bold ${r.rank <= 3 ? "text-yellow-500" : "text-gray-400"}`}>
                    {r.rank <= 3 ? ["🥇", "🥈", "🥉"][r.rank - 1] : r.rank}
                  </span>
                </td>
                <td className="px-6 py-3 text-sm font-medium text-gray-800">{r.company}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{r.tripCount} 次</td>
                <td className="px-6 py-3 text-sm text-green-600 font-medium">{r.co2} kg</td>
                <td className="px-6 py-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${GRADE_STYLE[r.grade]}`}>{r.grade}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
