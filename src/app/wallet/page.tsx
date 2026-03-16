"use client";

import { useAuth } from "@/lib/authContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

type TxType = "topup" | "pay" | "receive" | "refund";

interface Transaction {
  id: string;
  type: TxType;
  title: string;
  subtitle: string;
  amount: number;   // 正 = 入帳, 負 = 扣款
  date: string;
  balance: number;  // 交易後餘額
}

const mockTransactions: Transaction[] = [
  { id: "tx1", type: "pay",     title: "共乘付款",  subtitle: "王建國 · 市政府→南港",   amount: -70,  date: "03/17 07:50", balance: 1250 },
  { id: "tx2", type: "topup",   title: "儲值",      subtitle: "信用卡 末四碼 5678",     amount: 500,  date: "03/16 20:12", balance: 1320 },
  { id: "tx3", type: "receive", title: "共乘收款",  subtitle: "乘客 2 人 · 新店→信義",  amount: 160,  date: "03/15 08:35", balance: 820  },
  { id: "tx4", type: "pay",     title: "共乘付款",  subtitle: "林小雨 · 市政府→南港",   amount: -90,  date: "03/14 08:30", balance: 660  },
  { id: "tx5", type: "pay",     title: "共乘付款",  subtitle: "張美玲 · 市政府→南港",   amount: -85,  date: "03/12 09:00", balance: 750  },
  { id: "tx6", type: "topup",   title: "儲值",      subtitle: "超商條碼繳費",            amount: 300,  date: "03/10 14:22", balance: 835  },
  { id: "tx7", type: "refund",  title: "退款",      subtitle: "取消行程退還",            amount: 85,   date: "03/08 10:05", balance: 535  },
  { id: "tx8", type: "receive", title: "共乘收款",  subtitle: "乘客 1 人 · 板橋→內湖",  amount: 120,  date: "03/05 08:20", balance: 450  },
];

const txConfig: Record<TxType, { icon: React.ReactNode; color: string; bg: string }> = {
  topup: {
    bg: "bg-blue-50",
    color: "text-blue-600",
    icon: <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>,
  },
  pay: {
    bg: "bg-orange-50",
    color: "text-orange-500",
    icon: <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>,
  },
  receive: {
    bg: "bg-green-50",
    color: "text-green-600",
    icon: <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"/></svg>,
  },
  refund: {
    bg: "bg-purple-50",
    color: "text-purple-500",
    icon: <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>,
  },
};

export default function WalletPage() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();

  if (!isLoggedIn || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full px-6 py-20">
        <p className="text-gray-500 font-medium">請先登入</p>
        <Link href="/auth/login" className="mt-4 text-green-600 text-sm font-medium">前往登入</Link>
      </div>
    );
  }

  const income  = mockTransactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expense = mockTransactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0);

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
            <p className="text-white font-bold text-lg">NT$ {Math.abs(expense)}</p>
          </div>
          <div className="bg-white/15 rounded-2xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/></svg>
              </div>
              <span className="text-white/70 text-xs">本月入帳</span>
            </div>
            <p className="text-white font-bold text-lg">NT$ {income}</p>
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
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {mockTransactions.map((tx, i) => {
            const cfg = txConfig[tx.type];
            return (
              <div key={tx.id} className={`flex items-center gap-3 px-4 py-3.5 ${i < mockTransactions.length - 1 ? "border-b border-gray-50" : ""}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700">{tx.title}</p>
                  <p className="text-xs text-gray-400 truncate">{tx.subtitle}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-bold ${tx.amount > 0 ? "text-green-600" : "text-gray-700"}`}>
                    {tx.amount > 0 ? "+" : ""}NT$ {Math.abs(tx.amount)}
                  </p>
                  <p className="text-xs text-gray-400">{tx.date}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
