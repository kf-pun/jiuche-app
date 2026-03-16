"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { getRideById } from "@/lib/mockData";
import { Suspense, useState } from "react";
import Link from "next/link";

function ConfirmContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoggedIn, deductBalance } = useAuth();
  const [loading, setLoading] = useState(false);

  const rideId    = searchParams.get("rideId") || "";
  const seats     = parseInt(searchParams.get("seats") || "1");
  const ride      = getRideById(rideId);

  if (!ride) return (
    <div className="flex flex-col items-center justify-center min-h-full py-20">
      <p className="text-gray-400">找不到行程資訊</p>
      <Link href="/" className="mt-4 text-green-600 text-sm">返回首頁</Link>
    </div>
  );

  const total      = ride.price * seats;
  const hasEnough  = (user?.balance ?? 0) >= total;

  const handlePay = () => {
    if (!hasEnough) return;
    setLoading(true);
    setTimeout(() => {
      deductBalance(total);
      router.push(
        `/booking/success?rideId=${ride.id}&driverName=${encodeURIComponent(ride.driver.name)}&from=${encodeURIComponent(ride.from)}&to=${encodeURIComponent(ride.to)}&time=${ride.departureTime}&co2=${ride.co2Saved}&price=${total}`
      );
    }, 1200);
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-500 px-5 pt-12 pb-6">
        <Link href={`/results/${rideId}`} className="flex items-center gap-1.5 text-white/80 text-sm mb-4 hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          返回行程詳情
        </Link>
        <h1 className="text-xl font-bold text-white">確認付款</h1>
        <p className="text-white/70 text-sm mt-0.5">請確認以下行程與金額</p>
      </div>

      <div className="flex-1 px-4 py-5 flex flex-col gap-4">
        {/* 行程摘要 */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold">
              {ride.driver.avatar}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{ride.driver.name}</p>
              <p className="text-xs text-gray-400">{ride.driver.company} · {ride.carModel}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex flex-col items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full border-2 border-green-500 bg-white" />
              <div className="w-0.5 h-6 bg-gray-200" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex justify-between">
                <p className="text-sm font-medium text-gray-800">{ride.from}</p>
                <span className="text-green-700 font-bold text-sm">{ride.departureTime}</span>
              </div>
              <p className="text-sm text-gray-500">{ride.to}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
            <span>{ride.meetingPoint}</span>
            <span>集合地點</span>
          </div>
        </div>

        {/* 費用明細 */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">費用明細</h3>
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">每人費用</span>
              <span className="text-gray-700">NT$ {ride.price}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">乘客人數</span>
              <span className="text-gray-700">{seats} 人</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">服務費</span>
              <span className="text-green-600">NT$ 0（免費）</span>
            </div>
            <div className="border-t border-dashed border-gray-100 pt-2.5 flex justify-between">
              <span className="text-base font-bold text-gray-800">總計</span>
              <span className="text-base font-bold text-green-600">NT$ {total}</span>
            </div>
          </div>
        </div>

        {/* 付款方式（錢包） */}
        <div className={`rounded-2xl shadow-sm p-4 border-2 transition-colors ${hasEnough ? "bg-white border-green-100" : "bg-red-50 border-red-200"}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${hasEnough ? "bg-green-50" : "bg-red-100"}`}>
              <svg className={`w-5 h-5 ${hasEnough ? "text-green-500" : "text-red-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-700">揪車錢包付款</p>
              <p className={`text-xs mt-0.5 ${hasEnough ? "text-gray-400" : "text-red-500 font-medium"}`}>
                {hasEnough
                  ? `目前餘額 NT$ ${user?.balance.toLocaleString()}，付款後剩 NT$ ${((user?.balance ?? 0) - total).toLocaleString()}`
                  : `餘額不足（NT$ ${user?.balance.toLocaleString()}），請先儲值`}
              </p>
            </div>
          </div>
          {!hasEnough && (
            <Link href="/wallet/topup" className="mt-3 w-full block text-center bg-red-500 text-white text-sm font-semibold py-2.5 rounded-xl active:scale-95 transition-all">
              立即儲值
            </Link>
          )}
        </div>

        {/* ESG */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3.5 flex items-center gap-3">
          <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-4.97 4.97-4.97 13.03 0 18 4.97-4.97 4.97-13.03 0-18z"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18"/>
          </svg>
          <p className="text-sm text-emerald-700">
            這趟共乘預估減少 <span className="font-bold">{ride.co2Saved} kg CO₂</span>，感謝您的環保行動！
          </p>
        </div>

        {/* Pay button */}
        <button
          onClick={handlePay}
          disabled={!hasEnough || loading || !isLoggedIn}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold py-4 rounded-xl shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          {loading ? (
            <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>付款中...</>
          ) : `確認付款 NT$ ${total}`}
        </button>
      </div>
    </div>
  );
}

export default function BookingConfirmPage() {
  return <Suspense><ConfirmContent /></Suspense>;
}
