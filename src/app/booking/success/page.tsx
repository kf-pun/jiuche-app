"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);

  const driverName = searchParams.get("driverName") || "司機";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const time = searchParams.get("time") || "";
  const co2 = searchParams.get("co2") || "0";
  const price = searchParams.get("price") || "0";
  const [bookingId] = useState(() => {
    try {
      const raw = sessionStorage.getItem("jiuche_last_booking");
      if (raw) {
        const saved = JSON.parse(raw) as { bookingId?: string };
        if (saved.bookingId) return "JC" + saved.bookingId.slice(-6).toUpperCase();
      }
    } catch { /* ignore */ }
    return "JC" + Math.floor(100000 + Math.random() * 900000);
  });

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col min-h-full bg-gradient-to-b from-green-50 to-gray-50">
      {/* Success animation area */}
      <div className="flex flex-col items-center pt-16 pb-8 px-6">
        {/* Animated check circle */}
        <div
          className={`w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center shadow-lg transition-all duration-700 ${
            show ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
        >
          <svg
            className={`w-12 h-12 text-white transition-all duration-500 delay-300 ${show ? "opacity-100" : "opacity-0"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div className={`text-center mt-5 transition-all duration-500 delay-200 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <h1 className="text-2xl font-bold text-gray-800">預訂成功！</h1>
          <p className="text-gray-500 text-sm mt-2">已通知 {driverName} 您的預訂</p>
        </div>

        {/* Booking ID */}
        <div className={`mt-4 bg-white rounded-xl px-6 py-3 shadow-sm border border-gray-100 transition-all duration-500 delay-300 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <p className="text-xs text-gray-400 text-center">訂單編號</p>
          <p className="text-lg font-bold text-green-600 text-center tracking-widest">{bookingId}</p>
        </div>
      </div>

      {/* Trip summary card */}
      <div className={`px-4 transition-all duration-500 delay-400 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">行程摘要</h3>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex flex-col items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full border-2 border-green-500 bg-white" />
              <div className="w-0.5 h-6 bg-gray-200" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-800">{from}</p>
                <span className="text-green-700 font-bold text-sm">{time}</span>
              </div>
              <p className="text-sm text-gray-500">{to}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-50">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400">司機</p>
              <p className="text-sm font-semibold text-gray-700 mt-0.5">{driverName}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400">費用</p>
              <p className="text-sm font-semibold text-gray-700 mt-0.5">NT${price}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ESG contribution */}
      <div className={`px-4 mt-3 transition-all duration-500 delay-500 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4">
          <p className="text-white/80 text-xs mb-1">您的環保貢獻</p>
          <div className="flex items-end gap-2">
            <p className="text-white text-3xl font-bold">{co2}</p>
            <p className="text-white/90 text-base mb-1">kg CO₂ 減少排放</p>
          </div>
          <div className="mt-2 bg-white/20 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-1000 delay-700"
              style={{ width: show ? `${Math.min(parseFloat(co2) * 30, 90)}%` : "0%" }}
            />
          </div>
          <p className="text-white/60 text-xs mt-1.5">本月個人累計：{(parseFloat(co2) * 3).toFixed(1)} kg CO₂</p>
        </div>
      </div>

      {/* Actions */}
      <div className={`px-4 mt-4 mb-6 flex flex-col gap-3 transition-all duration-500 delay-600 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        <Link
          href="/trips"
          className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold py-4 rounded-xl shadow text-center block hover:from-green-700 hover:to-emerald-600 active:scale-95 transition-all"
        >
          查看我的行程
        </Link>
        <Link
          href="/"
          className="w-full bg-white text-gray-600 font-medium py-3.5 rounded-xl border border-gray-200 text-center block hover:bg-gray-50 active:scale-95 transition-all"
        >
          返回首頁
        </Link>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
