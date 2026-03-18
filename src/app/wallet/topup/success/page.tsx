"use client";

import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";

const methodLabel: Record<string, string> = {
  credit: "信用卡",
  linepay: "LINE Pay",
  atm: "ATM 轉帳",
  cvs: "超商條碼",
};

function SuccessContent() {
  const searchParams = useSearchParams();
  const { user, refreshUser } = useAuth();
  const [show, setShow] = useState(false);

  const amount = parseInt(searchParams.get("amount") || "0");
  const method = searchParams.get("method") || "credit";
  const [txId] = useState(() => "TX" + Math.floor(10000000 + Math.random() * 90000000));

  useEffect(() => {
    refreshUser();
    const t = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col min-h-full bg-gradient-to-b from-green-50 to-gray-50">
      {/* Animation */}
      <div className="flex flex-col items-center pt-16 pb-8 px-6">
        <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center shadow-lg transition-all duration-700 ${show ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}>
          <svg className={`w-12 h-12 text-white transition-all duration-500 delay-300 ${show ? "opacity-100" : "opacity-0"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className={`text-center mt-5 transition-all duration-500 delay-200 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <h1 className="text-2xl font-bold text-gray-800">儲值成功！</h1>
          <p className="text-4xl font-bold text-green-600 mt-2">NT$ {amount.toLocaleString()}</p>
        </div>
      </div>

      {/* Details */}
      <div className={`px-4 flex flex-col gap-3 transition-all duration-500 delay-300 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">交易明細</h3>
          {[
            { label: "交易編號", value: txId },
            { label: "儲值金額", value: `NT$ ${amount.toLocaleString()}` },
            { label: "付款方式", value: methodLabel[method] || method },
            { label: "交易時間", value: new Date().toLocaleString("zh-TW", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-400">{label}</span>
              <span className="text-sm font-semibold text-gray-700">{value}</span>
            </div>
          ))}
        </div>

        {/* New balance */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-white/70 text-xs">更新後餘額</p>
            <p className="text-white text-2xl font-bold mt-0.5">
              NT$ {user?.balance.toLocaleString() ?? amount}
            </p>
          </div>
          <div className="bg-white/20 rounded-xl p-2.5">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-1 mb-6">
          <Link href="/wallet" className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold py-4 rounded-xl shadow text-center block active:scale-95 transition-all">
            返回錢包
          </Link>
          <Link href="/" className="w-full bg-white text-gray-600 font-medium py-3.5 rounded-xl border border-gray-200 text-center block hover:bg-gray-50 active:scale-95 transition-all">
            去搜尋共乘
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function TopupSuccessPage() {
  return <Suspense><SuccessContent /></Suspense>;
}
