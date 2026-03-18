import Link from "next/link";
import {
  getDashboardKpi,
  getBookingsTrend,
  getLatestBookings,
  getLatestUsers,
} from "@/actions/admin/dashboard";

function pctChange(today: number, yesterday: number) {
  if (yesterday === 0) return today > 0 ? "+100%" : "—";
  const pct = ((today - yesterday) / yesterday) * 100;
  return (pct >= 0 ? "+" : "") + pct.toFixed(0) + "%";
}

function pctColor(today: number, yesterday: number) {
  if (yesterday === 0) return "text-gray-400";
  return today >= yesterday ? "text-green-600" : "text-red-500";
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  confirmed: { label: "已確認", cls: "bg-green-100 text-green-700" },
  completed: { label: "已完成", cls: "bg-gray-100 text-gray-500" },
  cancelled: { label: "已取消", cls: "bg-red-100 text-red-600" },
};

function TrendChart({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const W = 580, H = 160, PAD = { t: 10, r: 10, b: 30, l: 30 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const pts = data.map((d, i) => ({
    x: PAD.l + (i / (data.length - 1)) * innerW,
    y: PAD.t + innerH - (d.count / max) * innerH,
    count: d.count,
    date: d.date,
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${PAD.t + innerH} L ${pts[0].x} ${PAD.t + innerH} Z`;

  const yTicks = [0, max / 4, max / 2, (max * 3) / 4, max].map((v) => Math.round(v));
  const xLabels = data.filter((_, i) => i % 5 === 0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Y 輔助線 */}
      {yTicks.map((v) => {
        const y = PAD.t + innerH - (v / max) * innerH;
        return (
          <g key={v}>
            <line x1={PAD.l} y1={y} x2={PAD.l + innerW} y2={y} stroke="#e5e7eb" strokeWidth={1} />
            <text x={PAD.l - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#9ca3af">{v}</text>
          </g>
        );
      })}
      {/* 面積填充 */}
      <path d={areaPath} fill="url(#grad)" />
      {/* 折線 */}
      <path d={linePath} fill="none" stroke="#10b981" strokeWidth={2} strokeLinejoin="round" />
      {/* X 軸標籤 */}
      {xLabels.map((d) => {
        const i = data.indexOf(d);
        const x = PAD.l + (i / (data.length - 1)) * innerW;
        const label = d.date.slice(5); // MM-DD
        return (
          <text key={d.date} x={x} y={H - 6} textAnchor="middle" fontSize={9} fill="#9ca3af">{label}</text>
        );
      })}
      {/* 資料點 */}
      {pts.map((p) => (
        <circle key={p.date} cx={p.x} cy={p.y} r={3} fill="#10b981">
          <title>{p.date}：{p.count} 筆</title>
        </circle>
      ))}
    </svg>
  );
}

export default async function AdminDashboardPage() {
  const [kpi, trend, latestBookings, latestUsers] = await Promise.all([
    getDashboardKpi(),
    getBookingsTrend(),
    getLatestBookings(),
    getLatestUsers(),
  ]);

  const kpiCards = [
    { label: "今日新增用戶",  value: kpi.todayUsers,    compare: pctChange(kpi.todayUsers, kpi.yesterdayUsers),    color: "text-blue-600",   bg: "bg-blue-50",   icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", pctCls: pctColor(kpi.todayUsers, kpi.yesterdayUsers) },
    { label: "今日新增行程",  value: kpi.todayRides,    compare: pctChange(kpi.todayRides, kpi.yesterdayRides),    color: "text-green-600",  bg: "bg-green-50",  icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z", pctCls: pctColor(kpi.todayRides, kpi.yesterdayRides) },
    { label: "今日新增訂單",  value: kpi.todayBookings, compare: pctChange(kpi.todayBookings, kpi.yesterdayBookings), color: "text-purple-600", bg: "bg-purple-50", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", pctCls: pctColor(kpi.todayBookings, kpi.yesterdayBookings) },
    { label: "累計減碳量",    value: `${kpi.totalCo2} kg`, compare: "全平台完成行程", color: "text-orange-600", bg: "bg-orange-50", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", pctCls: "text-gray-400" },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* KPI 卡片 */}
      <div className="grid grid-cols-4 gap-5 mb-6">
        {kpiCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">{card.label}</p>
              <div className={`w-9 h-9 ${card.bg} rounded-lg flex items-center justify-center`}>
                <svg className={`w-5 h-5 ${card.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                </svg>
              </div>
            </div>
            <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
            <p className={`text-xs mt-1.5 ${card.pctCls}`}>{card.compare} 較昨日</p>
          </div>
        ))}
      </div>

      {/* 折線圖 */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">近 30 天預訂量</h2>
        <TrendChart data={trend} />
      </div>

      {/* 列表區 */}
      <div className="grid grid-cols-2 gap-5">
        {/* 最新訂單 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-800">最新訂單</h2>
            <Link href="/admin/bookings" className="text-sm text-emerald-600 hover:underline">查看全部 →</Link>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium">乘客</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium">路線</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium">金額</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium">狀態</th>
              </tr>
            </thead>
            <tbody>
              {latestBookings.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400">尚無訂單</td></tr>
              ) : latestBookings.map((b) => {
                const st = STATUS_LABEL[b.status] ?? { label: b.status, cls: "bg-gray-100 text-gray-500" };
                return (
                  <tr key={b.id} className="border-t border-gray-50 hover:bg-gray-50 cursor-pointer">
                    <td className="px-4 py-3">
                      <Link href={`/admin/bookings/${b.id}`} className="text-sm font-medium text-gray-800 block w-full">{b.passengerName}</Link>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{b.from} → {b.to}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">NT${b.totalPrice}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.cls}`}>{st.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 最新用戶 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-800">新增會員</h2>
            <Link href="/admin/users" className="text-sm text-emerald-600 hover:underline">查看全部 →</Link>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium">姓名</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium">公司</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium">餘額</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium">時間</th>
              </tr>
            </thead>
            <tbody>
              {latestUsers.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400">尚無用戶</td></tr>
              ) : latestUsers.map((u) => (
                <tr key={u.id} className="border-t border-gray-50 hover:bg-gray-50 cursor-pointer">
                  <td className="px-4 py-3">
                    <Link href={`/admin/users/${u.id}`} className="flex items-center gap-2 w-full">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {u.name[0]}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{u.name}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{u.company || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">NT${u.balance}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(u.createdAt).toLocaleDateString("zh-TW", { month: "numeric", day: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
