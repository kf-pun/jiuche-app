"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getAdminBookingDetail,
  cancelBookingWithRefund,
  completeBooking,
} from "@/actions/admin/bookings";
import type { AdminBookingDetail } from "@/actions/admin/bookings";

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  confirmed: { label: "已確認", cls: "bg-green-100 text-green-700" },
  completed: { label: "已完成", cls: "bg-gray-100 text-gray-500" },
  cancelled: { label: "已取消", cls: "bg-red-100 text-red-600" },
};

const TX_TYPE: Record<string, { label: string; cls: string }> = {
  topup:      { label: "儲值",     cls: "bg-blue-100 text-blue-700" },
  payment:    { label: "付款",     cls: "bg-orange-100 text-orange-700" },
  refund:     { label: "退款",     cls: "bg-green-100 text-green-700" },
  adjustment: { label: "手動調整", cls: "bg-purple-100 text-purple-700" },
};

function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-lg text-white text-sm z-50 ${ok ? "bg-green-600" : "bg-red-600"}`}>
      {msg}
    </div>
  );
}

export default function AdminBookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<AdminBookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  // 取消退款 modal
  const [showCancel, setShowCancel] = useState(false);
  const [sendNoti, setSendNoti] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);

  // 標記完成 modal
  const [showComplete, setShowComplete] = useState(false);
  const [completeLoading, setCompleteLoading] = useState(false);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), ok ? 3000 : 5000);
  };

  const load = useCallback(async () => {
    const d = await getAdminBookingDetail(id);
    setBooking(d);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function handleCancel() {
    setCancelLoading(true);
    const res = await cancelBookingWithRefund(id, sendNoti);
    setCancelLoading(false);
    setShowCancel(false);
    if (res.success) {
      showToast("訂單已取消並退款", true);
      load();
    } else {
      showToast(res.error ?? "操作失敗", false);
    }
  }

  async function handleComplete() {
    setCompleteLoading(true);
    const res = await completeBooking(id);
    setCompleteLoading(false);
    setShowComplete(false);
    if (res.success) {
      showToast("訂單已標記為完成", true);
      load();
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

  if (!booking) {
    return <div className="p-8 text-gray-500">找不到此訂單</div>;
  }

  const st = STATUS_LABEL[booking.status] ?? { label: booking.status, cls: "bg-gray-100 text-gray-500" };
  const displayId = "JC" + booking.id.replace(/-/g, "").slice(0, 6).toUpperCase();

  return (
    <div className="p-8">
      {/* 返回 */}
      <Link href="/admin/bookings" className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-5">
        ← 返回訂單列表
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">訂單詳情</h1>
          <p className="text-sm text-gray-400 mt-0.5 font-mono">{booking.id}</p>
        </div>
        {/* 操作按鈕 */}
        {booking.status === "confirmed" && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowComplete(true)}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
            >標記完成</button>
            <button
              onClick={() => setShowCancel(true)}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >取消並退款</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-5 mb-5">
        {/* 訂單基本資訊 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">訂單資訊</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">訂單號</span>
              <span className="text-sm font-mono font-medium text-gray-900">{displayId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">狀態</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.cls}`}>{st.label}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">座位數</span>
              <span className="text-sm text-gray-900">{booking.seats} 席</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">總金額</span>
              <span className="text-sm font-bold text-gray-900">NT$ {booking.totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">減碳貢獻</span>
              <span className="text-sm text-emerald-600 font-medium">{booking.co2Saved} kg CO₂</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">建立時間</span>
              <span className="text-xs text-gray-500">
                {new Date(booking.createdAt).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}
              </span>
            </div>
          </div>
          {booking.status === "completed" && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-400 text-center">此訂單已完成</div>
          )}
          {booking.status === "cancelled" && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg text-xs text-red-400 text-center">此訂單已取消</div>
          )}
        </div>

        {/* 乘客資訊 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">乘客資訊</h2>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold">
              {booking.passengerName[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{booking.passengerName}</p>
              <p className="text-xs text-gray-400">{booking.passengerPhone}</p>
            </div>
          </div>
          <Link
            href={`/admin/users/${booking.passengerId}`}
            className="text-sm text-emerald-600 hover:underline flex items-center gap-1"
          >查看會員詳情 →</Link>

          <div className="mt-5 pt-5 border-t border-gray-100">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">行程資訊</h2>
            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="text-gray-400 w-16 flex-shrink-0">路線</span>
                <span className="text-gray-800 font-medium">{booking.from} → {booking.to}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-400 w-16 flex-shrink-0">出發</span>
                <span className="text-gray-800">
                  {booking.departureTime
                    ? new Date(booking.departureTime).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })
                    : "—"}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-400 w-16 flex-shrink-0">單價</span>
                <span className="text-gray-800">NT$ {booking.ridePrice}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 相關交易記錄 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">相關交易記錄</h2>
        </div>
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
            {booking.transactions.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-400">暫無相關交易記錄</td></tr>
            ) : booking.transactions.map((t) => {
              const ty = TX_TYPE[t.type] ?? { label: t.type, cls: "bg-gray-100 text-gray-500" };
              return (
                <tr key={t.id} className="border-t border-gray-50">
                  <td className="px-6 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ty.cls}`}>{ty.label}</span></td>
                  <td className={`px-6 py-3 text-sm font-medium text-right ${t.amount >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {t.amount >= 0 ? "+" : ""}NT${Math.abs(t.amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">{t.description || "—"}</td>
                  <td className="px-6 py-3 text-xs text-gray-400">
                    {new Date(t.createdAt).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 取消退款 Modal */}
      {showCancel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">取消訂單並退款</h3>
            <p className="text-2xl font-bold text-red-600 text-center mb-4">退款 NT$ {booking.totalPrice.toLocaleString()}</p>
            <p className="text-sm text-gray-500 text-center mb-4">至 {booking.passengerName} 的揪車錢包</p>

            <label className="flex items-center gap-2 cursor-pointer mb-5 p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={sendNoti}
                onChange={(e) => setSendNoti(e.target.checked)}
                className="w-4 h-4 accent-emerald-600"
              />
              <span className="text-sm text-gray-700">同時發送取消通知給乘客</span>
            </label>
            {sendNoti && (
              <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3 mb-4">
                「您的訂單 #{displayId} 已取消，NT${booking.totalPrice.toLocaleString()} 已退回您的揪車錢包。」
              </p>
            )}

            <div className="flex gap-2">
              <button onClick={() => setShowCancel(false)} className="flex-1 py-2 rounded-lg text-sm border border-gray-200 hover:bg-gray-50">取消</button>
              <button
                onClick={handleCancel}
                disabled={cancelLoading}
                className="flex-1 py-2 rounded-lg text-sm bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50"
              >{cancelLoading ? "處理中…" : "確認取消並退款"}</button>
            </div>
          </div>
        </div>
      )}

      {/* 標記完成 Modal */}
      {showComplete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">標記訂單為已完成</h3>
            <p className="text-sm text-gray-500 text-center mb-5">確認後，乘客將可對此行程進行評價。</p>
            <div className="flex gap-2">
              <button onClick={() => setShowComplete(false)} className="flex-1 py-2 rounded-lg text-sm border border-gray-200 hover:bg-gray-50">取消</button>
              <button
                onClick={handleComplete}
                disabled={completeLoading}
                className="flex-1 py-2 rounded-lg text-sm bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50"
              >{completeLoading ? "處理中…" : "確認完成"}</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} ok={toast.ok} />}
    </div>
  );
}
