"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import Link from "next/link";

const PRESET_AMOUNTS = [100, 300, 500, 1000, 2000, 3000];

type PayMethod = "credit" | "atm" | "cvs" | "linepay";

const payMethods: { id: PayMethod; label: string; sub: string; icon: React.ReactNode }[] = [
  {
    id: "credit", label: "信用卡", sub: "Visa / MasterCard / JCB",
    icon: <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>,
  },
  {
    id: "linepay", label: "LINE Pay", sub: "快速安全付款",
    icon: <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>,
  },
  {
    id: "atm", label: "ATM 轉帳", sub: "銀行帳戶轉帳",
    icon: <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/></svg>,
  },
  {
    id: "cvs", label: "超商條碼", sub: "7-11 / 全家 / OK",
    icon: <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>,
  },
];

export default function TopupPage() {
  const { user, isLoggedIn, addBalance } = useAuth();
  const router = useRouter();
  const [amount, setAmount] = useState<number | "">("");
  const [custom, setCustom] = useState("");
  const [method, setMethod] = useState<PayMethod>("credit");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const finalAmount = amount !== "" ? amount : (parseInt(custom) || 0);

  const handlePreset = (v: number) => { setAmount(v); setCustom(""); setError(""); };

  const handleCustom = (v: string) => {
    setCustom(v);
    setAmount("");
    setError("");
  };

  const handleTopup = () => {
    if (finalAmount < 100) { setError("最低儲值金額為 NT$ 100"); return; }
    if (finalAmount > 10000) { setError("單次儲值上限為 NT$ 10,000"); return; }
    setLoading(true);
    setTimeout(() => {
      addBalance(finalAmount);
      router.push(`/wallet/topup/success?amount=${finalAmount}&method=${method}`);
    }, 1500);
  };

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full px-6 py-20">
        <p className="text-gray-500">請先登入</p>
        <Link href="/auth/login" className="mt-4 text-green-600 text-sm">前往登入</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-500 px-5 pt-12 pb-6">
        <Link href="/wallet" className="flex items-center gap-1.5 text-white/80 text-sm mb-4 hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          返回錢包
        </Link>
        <h1 className="text-xl font-bold text-white">儲值</h1>
        <p className="text-white/70 text-sm mt-0.5">目前餘額 NT$ {user?.balance.toLocaleString()}</p>
      </div>

      <div className="flex-1 px-4 py-5 flex flex-col gap-4">
        {/* 金額選擇 */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">選擇儲值金額</h3>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {PRESET_AMOUNTS.map((v) => (
              <button
                key={v}
                onClick={() => handlePreset(v)}
                className={`py-3 rounded-xl text-sm font-semibold transition-all ${
                  amount === v ? "bg-green-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                NT$ {v.toLocaleString()}
              </button>
            ))}
          </div>

          {/* Custom input */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">或輸入自訂金額</label>
            <div className={`flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3 border transition-colors ${amount === "" && custom ? "border-green-400" : "border-gray-100"} focus-within:border-green-400`}>
              <span className="text-gray-400 text-sm">NT$</span>
              <input
                type="number"
                placeholder="100 ~ 10,000"
                value={custom}
                onChange={(e) => handleCustom(e.target.value)}
                className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
              />
            </div>
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
          </div>

          {/* Preview */}
          {finalAmount >= 100 && (
            <div className="mt-3 bg-green-50 rounded-xl p-3 flex items-center justify-between">
              <span className="text-sm text-green-700">儲值後餘額</span>
              <span className="text-green-700 font-bold">NT$ {((user?.balance ?? 0) + finalAmount).toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* 付款方式 */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">付款方式</h3>
          <div className="flex flex-col gap-2">
            {payMethods.map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                  method === m.id ? "border-green-400 bg-green-50" : "border-gray-100 bg-gray-50 hover:border-gray-200"
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${method === m.id ? "bg-white shadow-sm" : "bg-white"}`}>
                  {m.icon}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-gray-700">{m.label}</p>
                  <p className="text-xs text-gray-400">{m.sub}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${method === m.id ? "border-green-500 bg-green-500" : "border-gray-300"}`}>
                  {method === m.id && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Confirm button */}
        <button
          onClick={handleTopup}
          disabled={finalAmount < 100 || loading}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold py-4 rounded-xl shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          {loading ? (
            <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>處理中...</>
          ) : (
            <>確認儲值 {finalAmount >= 100 ? `NT$ ${finalAmount.toLocaleString()}` : ""}</>
          )}
        </button>

        <p className="text-center text-xs text-gray-400">儲值後不支援退款，請確認金額後再送出</p>
      </div>
    </div>
  );
}
