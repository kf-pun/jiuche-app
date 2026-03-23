"use client";

import { useAuth } from "@/lib/authContext";
import { getWalletTransactions, type WalletTx } from "@/actions/wallet";
import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";

type TxType = "topup" | "payment" | "refund" | "earning";

const txConfig: Record<TxType, { icon: React.ReactNode; bg: string; amountClass: string }> = {
  topup: {
    bg: "bg-blue-50",
    amountClass: "text-green-600",
    icon: <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>,
  },
  payment: {
    bg: "bg-orange-50",
    amountClass: "text-gray-700",
    icon: <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>,
  },
  earning: {
    bg: "bg-green-50",
    amountClass: "text-green-600",
    icon: <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"/></svg>,
  },
  refund: {
    bg: "bg-purple-50",
    amountClass: "text-green-600",
    icon: <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>,
  },
};

const txLabel: Record<TxType, string> = {
  topup: "儲值",
  payment: "共乘付款",
  earning: "共乘收款",
  refund: "退款",
};

function formatDate(isoStr: string): string {
  const d = new Date(isoStr);
  return `${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getDate().toString().padStart(2, "0")} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

function isThisMonth(isoStr: string): boolean {
  const d = new Date(isoStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function WalletPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<WalletTx[]>([]);
  const [txLoading, setTxLoading] = useState(true);

  useEffect(() => {
    getWalletTransactions().then((data) => {
      setTransactions(data);
      setTxLoading(false);
    });
  }, []);

  if (!user) return null;

  // 本月收支（以 wallet_transactions 當月記錄計算）
  const monthTxs = transactions.filter(t => isThisMonth(t.createdAt));
  const income  = monthTxs.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expense = monthTxs.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0);

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-500 px-5 pt-12 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-white/70 text-sm">揪車錢包</p>
            <p className="text-white text-4xl font-bold mt-1">
              NT$ {user.balance.toLocaleString()}
            </p>
          </div>
          <div className="bg-white/20 rounded-2xl p-3">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
        </div>

        {/* Income / Expense summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/15 rounded-2xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
              </div>
              <span className="text-white/70 text-xs">本月支出</span>
            </div>
            <p className="text-white font-bold text-lg">NT$ {Math.abs(expense).toLocaleString()}</p>
          </div>
          <div className="bg-white/15 rounded-2xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/></svg>
              </div>
              <span className="text-white/70 text-xs">本月入帳</span>
            </div>
            <p className="text-white font-bold text-lg">NT$ {income.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-md p-4 grid grid-cols-3 gap-3">
          {[
            { label: "儲值", href: "/wallet/topup", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>, color: "text-green-600 bg-green-50" },
            { label: "轉帳", href: "#", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>, color: "text-blue-500 bg-blue-50" },
            { label: "提領", href: "#", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>, color: "text-purple-500 bg-purple-50" },
          ].map((a) => (
            <Link key={a.label} href={a.href} className="flex flex-col items-center gap-2 py-2 hover:opacity-80 active:scale-95 transition-all">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${a.color}`}>
                {a.icon}
              </div>
              <span className="text-xs font-medium text-gray-600">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Transaction list */}
      <div className="px-4 mt-4 pb-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">交易紀錄</p>

        {txLoading ? (
          <div className="flex justify-center py-8">
            <svg className="w-5 h-5 animate-spin text-green-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : transactions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <p className="text-gray-400 text-sm">尚無交易紀錄</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {transactions.map((tx, i) => {
              const cfg = txConfig[tx.type] ?? txConfig.payment;
              return (
                <div key={tx.id} className={`flex items-center gap-3 px-4 py-3.5 ${i < transactions.length - 1 ? "border-b border-gray-50" : ""}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700">{txLabel[tx.type] ?? tx.type}</p>
                    <p className="text-xs text-gray-400 truncate">{tx.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-bold ${cfg.amountClass}`}>
                      {tx.amount > 0 ? "+" : tx.amount < 0 ? "-" : ""}NT$ {Math.abs(tx.amount).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(tx.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProtectedWalletPage() {
  return <AuthGuard><WalletPage /></AuthGuard>;
}
