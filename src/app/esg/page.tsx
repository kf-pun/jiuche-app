"use client";

import AuthGuard from "@/components/AuthGuard";

import { useAuth } from "@/lib/authContext";
import { useState } from "react";

// 月份減碳資料 (kg CO2)
const monthlyData = [
  { month: "10月", kg: 4.2 },
  { month: "11月", kg: 6.8 },
  { month: "12月", kg: 5.1 },
  { month: "01月", kg: 8.4 },
  { month: "02月", kg: 7.6 },
  { month: "03月", kg: 6.3 },
];
const maxKg = Math.max(...monthlyData.map((d) => d.kg));

const badges = [
  { id: "b1", emoji: "🌱", name: "初次綠行",   desc: "完成第一次共乘",          required: 1,  unit: "趟",  progressKey: "rides" },
  { id: "b2", emoji: "🌿", name: "綠色通勤者", desc: "累計減碳超過 20 kg",      required: 20, unit: "kg",  progressKey: "co2"   },
  { id: "b3", emoji: "🌳", name: "減碳達人",   desc: "累計減碳超過 50 kg",      required: 50, unit: "kg",  progressKey: "co2"   },
  { id: "b4", emoji: "⭐", name: "五星司機",   desc: "保持高評分完成 30 趟",    required: 30, unit: "趟",  progressKey: "rides" },
  { id: "b5", emoji: "🔥", name: "連續共乘",   desc: "連續 5 天共乘上班",       required: 5,  unit: "天",  progressKey: "streak"},
  { id: "b6", emoji: "🏆", name: "ESG 領袖",   desc: "公司減碳排行前 3 名",     required: 3,  unit: "名",  progressKey: "rank"  },
];

const leaderboard = [
  { rank: 1, name: "王建國", dept: "工程部", kg: 52.4, rides: 41 },
  { rank: 2, name: "陳大偉", dept: "業務部", kg: 38.7, rides: 31 },
  { rank: 3, name: "林小雨", dept: "設計部", kg: 31.2, rides: 26 },
  { rank: 4, name: "你",     dept: "產品部", kg: 28.4, rides: 23, isMe: true },
  { rank: 5, name: "張美玲", dept: "行銷部", kg: 24.1, rides: 19 },
];

function BarChart() {
  return (
    <div className="flex items-end justify-between gap-1.5 h-28 px-1">
      {monthlyData.map((d, i) => {
        const height = (d.kg / maxKg) * 100;
        const isLast = i === monthlyData.length - 1;
        return (
          <div key={d.month} className="flex flex-col items-center gap-1 flex-1">
            <span className={`text-xs font-bold ${isLast ? "text-green-600" : "text-gray-400"}`}>{d.kg}</span>
            <div
              className={`w-full rounded-t-lg ${isLast ? "bg-gradient-to-t from-green-600 to-emerald-400" : "bg-green-100"}`}
              style={{ height: `${height}%`, minHeight: "4px" }}
            />
            <span className={`text-xs ${isLast ? "text-green-700 font-bold" : "text-gray-400"}`}>{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}

function BadgeCard({ badge, progress }: { badge: typeof badges[0]; progress: number }) {
  const unlocked = badge.progressKey === "rank"
    ? progress <= badge.required
    : progress >= badge.required;
  const pct = badge.progressKey === "rank"
    ? 100
    : Math.min((progress / badge.required) * 100, 100);

  return (
    <div className={`rounded-2xl p-3 flex flex-col items-center text-center ${unlocked ? "bg-gradient-to-b from-green-50 to-emerald-50 border border-green-200" : "bg-gray-50 border border-gray-100"}`}>
      <div className={`text-3xl mb-1 ${!unlocked && "grayscale opacity-40"}`}>{badge.emoji}</div>
      <p className={`text-xs font-bold leading-tight ${unlocked ? "text-green-700" : "text-gray-400"}`}>{badge.name}</p>
      <p className={`text-xs mt-0.5 leading-tight ${unlocked ? "text-green-600/70" : "text-gray-300"}`}>{badge.desc}</p>
      {!unlocked ? (
        <div className="mt-2 w-full">
          <div className="bg-gray-200 rounded-full h-1">
            <div className="bg-green-400 h-1 rounded-full" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{progress}/{badge.required} {badge.unit}</p>
        </div>
      ) : (
        <span className="mt-1.5 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">已解鎖</span>
      )}
    </div>
  );
}

function EsgPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"personal" | "company">("personal");

  const co2Total   = user?.co2Total  ?? 28.4;
  const totalRides = user?.totalRides ?? 23;
  const treesEq    = (co2Total / 21.77).toFixed(1);
  const carKm      = Math.round(co2Total / 0.21);

  const progressMap: Record<string, number> = {
    rides: totalRides, co2: co2Total, streak: 3, rank: 4,
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-500 px-5 pt-12 pb-6">
        <h1 className="text-2xl font-bold text-white">ESG 減碳</h1>
        <p className="text-white/70 text-sm mt-0.5">你的每次共乘，都是對地球的承諾</p>

        {/* Hero stat */}
        <div className="mt-4 bg-white/15 rounded-3xl p-5">
          <p className="text-white/70 text-xs mb-1">累計減少碳排放</p>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-bold text-white">{co2Total.toFixed(1)}</span>
            <span className="text-white/80 text-lg mb-1">kg CO₂</span>
          </div>
          <div className="mt-3 bg-white/20 rounded-full h-2">
            <div className="bg-white rounded-full h-2" style={{ width: `${(co2Total / 50) * 100}%` }} />
          </div>
          <div className="flex justify-between mt-1">
            <p className="text-white/60 text-xs">距「減碳達人」勳章</p>
            <p className="text-white/80 text-xs font-medium">{(50 - co2Total).toFixed(1)} kg</p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="px-4 -mt-3">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "共乘次數", value: totalRides,      unit: "趟",  emoji: "🚗" },
            { label: "等同種樹", value: treesEq,          unit: "棵",  emoji: "🌳" },
            { label: "少開車",   value: `${carKm}`,       unit: "km",  emoji: "⛽" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl shadow-sm p-3 text-center border border-gray-100">
              <div className="text-2xl mb-1">{s.emoji}</div>
              <p className="text-base font-bold text-gray-800">{s.value}<span className="text-xs text-gray-400 ml-0.5">{s.unit}</span></p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tab */}
      <div className="flex mx-4 mt-4 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        {(["personal", "company"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${tab === t ? "text-green-600 bg-green-50" : "text-gray-400"}`}>
            {t === "personal" ? "個人數據" : "企業排行"}
          </button>
        ))}
      </div>

      <div className="px-4 py-4 flex flex-col gap-4 pb-8">
        {tab === "personal" && (
          <>
            {/* Monthly chart */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">月度減碳趨勢</h3>
                <span className="text-xs text-gray-400">kg CO₂</span>
              </div>
              <BarChart />
              <div className="mt-3 flex items-center gap-2 bg-green-50 rounded-xl p-3">
                <span className="text-lg">📈</span>
                <p className="text-xs text-green-700">本月比上月少排放 <span className="font-bold">17.1%</span>，繼續保持！</p>
              </div>
            </div>

            {/* CO2 equivalent */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">減碳換算</h3>
              {[
                { emoji: "✈️", label: "台北→東京 飛機單程",    value: `${((co2Total / 150) * 100).toFixed(0)}%`, sub: "單程約 150 kg CO₂" },
                { emoji: "💡", label: "節省用電",              value: `${(co2Total / 0.533).toFixed(0)} 度`,     sub: "家庭用電量換算"   },
                { emoji: "🌊", label: "減少塑膠袋",            value: `${(co2Total * 12).toFixed(0)} 個`,        sub: "等效塑膠袋數量"   },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                  <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-700">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.sub}</p>
                  </div>
                  <span className="text-sm font-bold text-green-600">{item.value}</span>
                </div>
              ))}
            </div>

            {/* Badges */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">成就勳章</h3>
              <div className="grid grid-cols-3 gap-2">
                {badges.map((badge) => (
                  <BadgeCard key={badge.id} badge={badge} progress={progressMap[badge.progressKey] ?? 0} />
                ))}
              </div>
            </div>

            {/* SDG */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4">
              <p className="text-white font-bold text-sm mb-3">聯合國 SDG 貢獻</p>
              <div className="flex gap-2">
                {[
                  { num: "11", label: "永續城市" },
                  { num: "13", label: "氣候行動" },
                  { num: "17", label: "夥伴關係" },
                ].map((sdg) => (
                  <div key={sdg.num} className="flex-1 bg-white/20 rounded-xl p-2.5 text-center">
                    <p className="text-white font-bold text-sm">SDG {sdg.num}</p>
                    <p className="text-white/80 text-xs">{sdg.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === "company" && (
          <>
            {/* Company summary */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-5">
              <p className="text-white/80 text-xs mb-0.5">台積電・本月企業總減碳</p>
              <p className="text-white text-3xl font-bold">2,847 <span className="text-base font-medium">kg CO₂</span></p>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {[
                  { value: "312", label: "共乘趟次" },
                  { value: "87",  label: "參與員工" },
                ].map((s) => (
                  <div key={s.label} className="bg-white/15 rounded-xl p-3 text-center">
                    <p className="text-white text-xl font-bold">{s.value}</p>
                    <p className="text-white/70 text-xs">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">本月減碳排行</h3>
                <span className="text-xs text-gray-400">kg CO₂</span>
              </div>
              <div className="flex flex-col gap-1">
                {leaderboard.map((person) => {
                  const medals = ["🥇", "🥈", "🥉"];
                  return (
                    <div key={person.rank} className={`flex items-center gap-3 px-3 py-3 rounded-xl ${person.isMe ? "bg-green-50 border border-green-200" : "hover:bg-gray-50"}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${person.rank <= 3 ? "" : "bg-gray-100 text-gray-400"}`}>
                        {person.rank <= 3 ? medals[person.rank - 1] : person.rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className={`text-sm font-semibold ${person.isMe ? "text-green-700" : "text-gray-700"}`}>{person.name}</p>
                          {person.isMe && <span className="text-xs bg-green-600 text-white px-1.5 py-0.5 rounded-full">我</span>}
                        </div>
                        <p className="text-xs text-gray-400">{person.dept} · {person.rides} 趟</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-sm font-bold ${person.isMe ? "text-green-600" : "text-gray-700"}`}>{person.kg}</p>
                        <p className="text-xs text-gray-400">kg</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ESG Report */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">ESG 年度報告</p>
                  <p className="text-xs text-gray-400">匯出企業共乘減碳完整報告</p>
                </div>
              </div>
              <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold py-3.5 rounded-xl text-sm active:scale-95 transition-all">
                匯出 PDF 報告
              </button>
              <p className="text-center text-xs text-gray-400 mt-2">🏢 B2B 企業版專屬功能</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ProtectedEsgPage() {
  return <AuthGuard><EsgPage /></AuthGuard>;
}
