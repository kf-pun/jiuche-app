"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";

const timeSlots = ["07:00", "07:30", "08:00", "08:15", "08:30", "09:00", "09:30", "17:30", "18:00", "18:30", "19:00"];

function PostRidePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    from: "",
    to: "",
    date: "",
    time: "",
    seats: "2",
    price: "",
    meetingPoint: "",
    notes: "",
    recurring: false,
  });

  const today = new Date().toISOString().split("T")[0];

  const set = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const step1Valid = form.from && form.to && form.date && form.time;
  const step2Valid = form.price && form.meetingPoint;

  const handleSubmit = () => {
    if (!step2Valid) return;
    setLoading(true);
    setTimeout(() => {
      router.push(`/post/success?from=${encodeURIComponent(form.from)}&to=${encodeURIComponent(form.to)}&time=${form.time}&seats=${form.seats}&price=${form.price}`);
    }, 1200);
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-500 px-5 pt-12 pb-6">
        <Link href="/" className="flex items-center gap-1.5 text-white/80 text-sm mb-4 hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          返回首頁
        </Link>
        <h1 className="text-xl font-bold text-white">發布共乘行程</h1>
        <p className="text-white/70 text-sm mt-1">分享你的順路，共同減碳</p>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mt-4">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step >= s ? "bg-white text-green-600" : "bg-white/30 text-white"
              }`}>
                {step > s ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : s}
              </div>
              <span className={`text-xs ${step >= s ? "text-white" : "text-white/50"}`}>
                {s === 1 ? "路線設定" : "費用細節"}
              </span>
              {s < 2 && <div className="w-8 h-0.5 bg-white/30 mx-1" />}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 py-5">
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-gray-700">路線資訊</h2>

              {/* From */}
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">出發地</label>
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 focus-within:border-green-400 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="輸入出發地點"
                    value={form.from}
                    onChange={(e) => set("from", e.target.value)}
                    className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                  />
                </div>
              </div>

              {/* To */}
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">目的地</label>
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 focus-within:border-green-400 transition-colors">
                  <svg className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="輸入目的地點"
                    value={form.to}
                    onChange={(e) => set("to", e.target.value)}
                    className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">出發日期</label>
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 focus-within:border-green-400 transition-colors">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <input
                    type="date"
                    min={today}
                    value={form.date}
                    onChange={(e) => set("date", e.target.value)}
                    className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                  />
                </div>
              </div>

              {/* Time slots */}
              <div>
                <label className="text-xs text-gray-500 font-medium mb-2 block">出發時間</label>
                <div className="flex flex-wrap gap-2">
                  {timeSlots.map((t) => (
                    <button
                      key={t}
                      onClick={() => set("time", t)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                        form.time === t
                          ? "bg-green-600 text-white shadow-sm"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seats */}
              <div>
                <label className="text-xs text-gray-500 font-medium mb-2 block">可載人數</label>
                <div className="flex gap-2">
                  {["1", "2", "3", "4"].map((n) => (
                    <button
                      key={n}
                      onClick={() => set("seats", n)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        form.seats === n
                          ? "bg-green-600 text-white shadow-sm"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {n} 人
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recurring toggle */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-700">設為固定班表</p>
                  <p className="text-xs text-gray-400 mt-0.5">每週同一時間重複發布</p>
                </div>
                <button
                  onClick={() => set("recurring", !form.recurring)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.recurring ? "bg-green-500" : "bg-gray-200"}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.recurring ? "left-5" : "left-0.5"}`} />
                </button>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!step1Valid}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold py-4 rounded-xl shadow disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
            >
              下一步：費用設定
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            {/* Route preview */}
            <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <div className="w-0.5 h-4 bg-green-300" />
                  <div className="w-2 h-2 rounded-full bg-emerald-700" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">{form.from}</p>
                  <p className="text-sm text-gray-500 mt-1">{form.to}</p>
                </div>
                <div className="text-right">
                  <p className="text-green-700 font-bold text-sm">{form.time}</p>
                  <p className="text-xs text-gray-400">{form.seats} 座</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-gray-700">費用與集合資訊</h2>

              {/* Price */}
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">每人費用（NT$）</label>
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 focus-within:border-green-400 transition-colors">
                  <span className="text-gray-400 text-sm font-medium">NT$</span>
                  <input
                    type="number"
                    placeholder="建議 50–150"
                    value={form.price}
                    onChange={(e) => set("price", e.target.value)}
                    className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {["50", "80", "100", "120"].map((p) => (
                    <button
                      key={p}
                      onClick={() => set("price", p)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        form.price === p ? "bg-green-100 text-green-700 border border-green-300" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      ${p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Meeting point */}
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">集合地點</label>
                <div className="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 focus-within:border-green-400 transition-colors">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <textarea
                    placeholder="例：捷運市政府站 1 號出口旁"
                    value={form.meetingPoint}
                    onChange={(e) => set("meetingPoint", e.target.value)}
                    rows={2}
                    className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none resize-none"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">備註（選填）</label>
                <div className="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 focus-within:border-green-400 transition-colors">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <textarea
                    placeholder="例：車內禁食、歡迎聊天..."
                    value={form.notes}
                    onChange={(e) => set("notes", e.target.value)}
                    rows={2}
                    className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* ESG preview */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 flex items-center gap-3">
              <div className="bg-white/20 rounded-xl p-2">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-4.97 4.97-4.97 13.03 0 18 4.97-4.97 4.97-13.03 0-18z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18" />
                </svg>
              </div>
              <div>
                <p className="text-white/80 text-xs">每趟預估可減少</p>
                <p className="text-white font-bold">
                  約 {(parseInt(form.seats) * 0.6).toFixed(1)} kg CO₂ 排放
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-white text-gray-600 font-medium py-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all"
              >
                上一步
              </button>
              <button
                onClick={handleSubmit}
                disabled={!step2Valid || loading}
                className="flex-[2] bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold py-3.5 rounded-xl shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    發布中...
                  </>
                ) : "發布行程"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProtectedPostRidePage() {
  return <AuthGuard><PostRidePage /></AuthGuard>;
}
