"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";

function PostSuccessContent() {
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);

  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const time = searchParams.get("time") || "";
  const seats = searchParams.get("seats") || "2";
  const price = searchParams.get("price") || "0";

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col min-h-full bg-gradient-to-b from-green-50 to-gray-50">
      <div className="flex flex-col items-center pt-16 pb-8 px-6">
        <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center shadow-lg transition-all duration-700 ${show ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}>
          <svg className={`w-12 h-12 text-white transition-all duration-500 delay-300 ${show ? "opacity-100" : "opacity-0"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className={`text-center mt-5 transition-all duration-500 delay-200 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <h1 className="text-2xl font-bold text-gray-800">行程發布成功！</h1>
          <p className="text-gray-500 text-sm mt-2">系統正在為你媒合順路乘客</p>
        </div>
      </div>

      <div className={`px-4 transition-all duration-500 delay-300 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">發布摘要</h3>
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
              <p className="text-xs text-gray-400">可載人數</p>
              <p className="text-sm font-semibold text-gray-700 mt-0.5">{seats} 人</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400">每人費用</p>
              <p className="text-sm font-semibold text-gray-700 mt-0.5">NT${price}</p>
            </div>
          </div>
        </div>
      </div>

      <div className={`px-4 mt-3 transition-all duration-500 delay-400 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 flex items-center gap-3">
          <div className="bg-white/20 rounded-xl p-2.5">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">通知已開啟</p>
            <p className="text-white/70 text-xs mt-0.5">乘客預訂時將即時通知你</p>
          </div>
        </div>
      </div>

      <div className={`px-4 mt-4 mb-6 flex flex-col gap-3 transition-all duration-500 delay-500 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        <Link href="/trips" className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold py-4 rounded-xl shadow text-center block hover:from-green-700 active:scale-95 transition-all">
          查看我的行程
        </Link>
        <Link href="/" className="w-full bg-white text-gray-600 font-medium py-3.5 rounded-xl border border-gray-200 text-center block hover:bg-gray-50 active:scale-95 transition-all">
          返回首頁
        </Link>
      </div>
    </div>
  );
}

export default function PostSuccessPage() {
  return <Suspense><PostSuccessContent /></Suspense>;
}
