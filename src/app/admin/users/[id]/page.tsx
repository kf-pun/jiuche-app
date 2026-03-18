"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getAdminUserDetail, getUserBookingsAdmin, getUserRidesAdmin, getUserTransactionsAdmin,
  adjustUserBalance, toggleUserActive,
} from "@/actions/admin/users";
import type { AdminUserDetail, UserBookingTabItem, UserRideTabItem, UserTxTabItem } from "@/actions/admin/users";

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  confirmed: { label: "已確認", cls: "bg-green-100 text-green-700" },
  completed: { label: "已完成", cls: "bg-gray-100 text-gray-500" },
  cancelled: { label: "已取消", cls: "bg-red-100 text-red-600" },
  active:    { label: "進行中", cls: "bg-blue-100 text-blue-700" },
};

const TX_TYPE: Record<string, { label: string; cls: string }> = {
  topup:      { label: "儲值",     cls: "bg-blue-100 text-blue-700" },
  payment:    { label: "付款",     cls: "bg-orange-100 text-orange-700" },
  refund:     { label: "退款",     cls: "bg-green-100 text-green-700" },
  adjustment: { label: "手動調整", cls: "bg-purple-100 text-purple-700" },
  earning:    { label: "收益",     cls: "bg-teal-100 text-teal-700" },
};

function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-lg text-white text-sm z-50 ${ok ? "bg-green-600" : "bg-red-600"}`}>
      {msg}
    </div>
  );
}

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [tab, setTab] = useState<"bookings" | "rides" | "transactions">("bookings");
  const [bookings, setBookings] = useState<UserBookingTabItem[]>([]);
  const [rides, setRides] = useState<UserRideTabItem[]>([]);
  const [txs, setTxs] = useState<UserTxTabItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  // 餘額調整 modal
  const [showAdjust, setShowAdjust] = useState(false);
  const [adjAmount, setAdjAmount] = useState("");
  const [adjNote, setAdjNote] = useState("");
  const [adjLoading, setAdjLoading] = useState(false);

  // 停權 modal
  const [showToggle, setShowToggle] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const loadUser = useCallback(async () => {
    const [u, b, r, t] = await Promise.all([
      getAdminUserDetail(id),
      getUserBookingsAdmin(id),
      getUserRidesAdmin(id),
      getUserTransactionsAdmin(id),
    ]);
    setUser(u);
    setBookings(b);
    setRides(r);
    setTxs(t);
    setLoading(false);
  }, [id]);

  useEffect(() => { loadUser(); }, [loadUser]);

  async function handleAdjust() {
    const amt = parseFloat(adjAmount);
    if (!adjAmount || isNaN(amt) || amt === 0) return;
    if (!adjNote.trim()) return;
    setAdjLoading(true);
    const res = await adjustUserBalance(id, amt, adjNote.trim());
    setAdjLoading(false);
    setShowAdjust(false);
    setAdjAmount(""); setAdjNote("");
    if (res.success) {
      showToast("餘額已調整", true);
      loadUser();
    } else {
      showToast(res.error ?? "調整失敗", false);
    }
  }

  async function handleToggle() {
    if (!user) return;
    setToggleLoading(true);
    const res = await toggleUserActive(id, !user.isActive);
    setToggleLoading(false);
    setShowToggle(false);
    if (res.success) {
      showToast(user.isActive ? "帳號已停權" : "已解除停權", true);
      loadUser();
    } else {
      showToast(res.error ?? "操作失敗", false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-64">
        <svg className="w-8 h-8 animate-spin text-emerald-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!user) {
    return <div className="p-8 text-gray-500">找不到此會員</div>;
  }

  const adjPreview = adjAmount && !isNaN(parseFloat(adjAmount))
    ? `調整後餘額：NT$ ${(user.balance + parseFloat(adjAmount)).toLocaleString()}`
    : "";

  return (
    <div className="p-8">
      {/* 返回 */}
      <Link href="/admin/users" className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-5">
        ← 返回會員列表
      </Link>

      {/* 基本資料卡 */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-2xl font-bold">
              {user.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-500"}`}>
                  {user.role === "admin" ? "管理員" : "用戶"}
                </span>
                {user.isActive
                  ? <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">正常</span>
                  : <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-600">停權</span>
                }
              </div>
              <p className="text-sm text-gray-500">{user.phone} · {user.company || "無公司"}</p>
              <p className="text-xs text-gray-400 mt-0.5">註冊於 {new Date(user.createdAt).toLocaleDateString("zh-TW")}</p>
            </div>
          </div>

          {/* 操作按鈕 */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowAdjust(true)}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >調整餘額</button>
            <button
              onClick={() => setShowToggle(true)}
              className={`px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors ${user.isActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
            >{user.isActive ? "停權帳號" : "解除停權"}</button>
          </div>
        </div>

        {/* 數字區 */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400">當前餘額</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">NT$ {user.balance.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">平均評分</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">⭐ {Number(user.rating).toFixed(1)} <span className="text-sm font-normal text-gray-400">({user.ratingCount} 則)</span></p>
          </div>
          <div>
            <p className="text-xs text-gray-400">累計減碳</p>
            <p className="text-xl font-bold text-emerald-600 mt-0.5">{user.co2Total} kg CO₂</p>
          </div>
        </div>
      </div>

      {/* 頁籤 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100">
          {(["bookings", "rides", "transactions"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3.5 text-sm font-medium transition-colors relative ${tab === t ? "text-emerald-600" : "text-gray-400 hover:text-gray-600"}`}
            >
              {{ bookings: "歷史訂單", rides: "發布行程", transactions: "交易記錄" }[t]}
              {tab === t && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />}
            </button>
          ))}
        </div>

        {/* 歷史訂單 */}
        {tab === "bookings" && (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs text-gray-500 font-medium">訂單號</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 font-medium">路線</th>
                <th className="px-6 py-3 text-right text-xs text-gray-500 font-medium">座位</th>
                <th className="px-6 py-3 text-right text-xs text-gray-500 font-medium">金額</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 font-medium">狀態</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 font-medium">時間</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400">此會員尚無訂單記錄</td></tr>
              ) : bookings.map((b) => {
                const st = STATUS_LABEL[b.status] ?? { label: b.status, cls: "bg-gray-100 text-gray-500" };
                return (
                  <tr key={b.id} className="border-t border-gray-50 hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-3">
                      <Link href={`/admin/bookings/${b.id}`} className="text-xs text-emerald-600 font-mono hover:underline">
                        JC{b.id.replace(/-/g, "").slice(0, 6).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">{b.from} → {b.to}</td>
                    <td className="px-6 py-3 text-sm text-gray-600 text-right">{b.seats} 席</td>
                    <td className="px-6 py-3 text-sm text-gray-700 text-right">NT${b.totalPrice}</td>
                    <td className="px-6 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.cls}`}>{st.label}</span></td>
                    <td className="px-6 py-3 text-xs text-gray-400">{new Date(b.createdAt).toLocaleDateString("zh-TW")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* 發布行程 */}
        {tab === "rides" && (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs text-gray-500 font-medium">路線</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 font-medium">出發時間</th>
                <th className="px-6 py-3 text-right text-xs text-gray-500 font-medium">單價</th>
                <th className="px-6 py-3 text-right text-xs text-gray-500 font-medium">座位</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 font-medium">狀態</th>
              </tr>
            </thead>
            <tbody>
              {rides.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">此會員尚未發布行程</td></tr>
              ) : rides.map((r) => {
                const st = STATUS_LABEL[r.status] ?? { label: r.status, cls: "bg-gray-100 text-gray-500" };
                return (
                  <tr key={r.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-700">{r.from} → {r.to}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {new Date(r.departureTime).toLocaleString("zh-TW", { timeZone: "Asia/Taipei", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-700 text-right">NT${r.price}</td>
                    <td className="px-6 py-3 text-sm text-gray-600 text-right">{r.totalSeats - r.availableSeats}/{r.totalSeats}</td>
                    <td className="px-6 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.cls}`}>{st.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* 交易記錄 */}
        {tab === "transactions" && (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs text-gray-500 font-medium">類型</th>
                <th className="px-6 py-3 text-right text-xs text-gray-500 font-medium">金額</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 font-medium">備註</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 font-medium">時間</th>
              </tr>
            </thead>
            <tbody>
              {txs.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-400">此會員尚無交易記錄</td></tr>
              ) : txs.map((t) => {
                const ty = TX_TYPE[t.type] ?? { label: t.type, cls: "bg-gray-100 text-gray-500" };
                return (
                  <tr key={t.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ty.cls}`}>{ty.label}</span></td>
                    <td className={`px-6 py-3 text-sm font-medium text-right ${t.amount >= 0 ? "text-green-600" : "text-red-500"}`}>
                      {t.amount >= 0 ? "+" : ""}NT${t.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">{t.description || "—"}</td>
                    <td className="px-6 py-3 text-xs text-gray-400">{new Date(t.createdAt).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* 調整餘額 Modal */}
      {showAdjust && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">調整 {user.name} 的餘額</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">金額（正數=加值，負數=扣款）</label>
                <input
                  type="number"
                  value={adjAmount}
                  onChange={(e) => setAdjAmount(e.target.value)}
                  placeholder="例：100 或 -50"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {adjPreview && <p className="text-xs text-gray-400 mt-1">{adjPreview}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">備註（必填）</label>
                <input
                  type="text"
                  value={adjNote}
                  onChange={(e) => setAdjNote(e.target.value)}
                  placeholder="例：客訴補償"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowAdjust(false)} className="flex-1 py-2 rounded-lg text-sm border border-gray-200 hover:bg-gray-50">取消</button>
              <button
                onClick={handleAdjust}
                disabled={adjLoading || !adjAmount || !adjNote.trim()}
                className="flex-1 py-2 rounded-lg text-sm bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
              >{adjLoading ? "處理中…" : "確認調整"}</button>
            </div>
          </div>
        </div>
      )}

      {/* 停權/解除 Modal */}
      {showToggle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className={`w-12 h-12 rounded-full ${user.isActive ? "bg-red-100" : "bg-green-100"} flex items-center justify-center mx-auto mb-4`}>
              <svg className={`w-6 h-6 ${user.isActive ? "text-red-600" : "text-green-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {user.isActive
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                }
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
              {user.isActive ? "確認停權此帳號？" : "確認解除停權？"}
            </h3>
            <p className="text-sm text-gray-500 text-center mb-5">
              {user.isActive
                ? `停權後 ${user.name} 將無法登入平台，所有進行中訂單不受影響，需手動處理。`
                : `解除後 ${user.name} 將可正常登入平台。`
              }
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowToggle(false)} className="flex-1 py-2 rounded-lg text-sm border border-gray-200 hover:bg-gray-50">取消</button>
              <button
                onClick={handleToggle}
                disabled={toggleLoading}
                className={`flex-1 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 ${user.isActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
              >
                {toggleLoading ? "處理中…" : user.isActive ? "確認停權" : "確認解除"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} ok={toast.ok} />}
    </div>
  );
}
