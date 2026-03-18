"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getAdminRideDetail, forceCancelRide } from "@/actions/admin/rides";
import type { AdminRideDetail } from "@/actions/admin/rides";

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  active:    { label: "進行中", cls: "bg-green-100 text-green-700" },
  completed: { label: "已完成", cls: "bg-gray-100 text-gray-500" },
  cancelled: { label: "已取消", cls: "bg-red-100 text-red-600" },
};

const BOOKING_STATUS: Record<string, { label: string; cls: string }> = {
  confirmed: { label: "已確認", cls: "bg-green-100 text-green-700" },
  completed: { label: "已完成", cls: "bg-gray-100 text-gray-500" },
  cancelled: { label: "已取消", cls: "bg-red-100 text-red-600" },
};

function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-lg text-white text-sm z-50 ${ok ? "bg-green-600" : "bg-red-600"}`}>
      {msg}
    </div>
  );
}

export default function AdminRideDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [ride, setRide] = useState<AdminRideDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancel, setShowCancel] = useState(false);
  const [sendNoti, setSendNoti] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), ok ? 3000 : 5000);
  };

  const load = useCallback(async () => {
    const d = await getAdminRideDetail(id);
    setRide(d);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function handleForceCancel() {
    setCancelLoading(true);
    const res = await forceCancelRide(id, sendNoti);
    setCancelLoading(false);
    setShowCancel(false);
    if (res.success) {
      showToast("行程已強制取消，乘客退款完成", true);
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

  if (!ride) return <div className="p-8 text-gray-500">找不到此行程</div>;

  const st = STATUS_LABEL[ride.status] ?? { label: ride.status, cls: "bg-gray-100 text-gray-500" };
  const confirmedPassengers = ride.passengers.filter((p) => p.status === "confirmed");
  const totalRefund = confirmedPassengers.reduce((s, p) => s + p.totalPrice, 0);

  return (
    <div className="p-8">
      <Link href="/admin/rides" className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-5">
        ← 返回行程列表
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{ride.from} → {ride.to}</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {new Date(ride.departureTime).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}
          </p>
        </div>
        {ride.status === "active" && (
          <button
            onClick={() => setShowCancel(true)}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
          >強制取消行程</button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-5 mb-5">
        {/* 行程資訊 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">行程資訊</h2>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.cls}`}>{st.label}</span>
          </div>
          <div className="space-y-3">
            {[
              ["單價", `NT$ ${ride.price}`],
              ["總座位", `${ride.totalSeats} 席`],
              ["已訂座位", `${ride.totalSeats - ride.availableSeats} 席`],
              ["CO₂ 減碳", `${ride.co2Saved} kg`],
              ...(ride.meetingPoint ? [["集合地點", ride.meetingPoint]] : []),
              ...(ride.notes ? [["備註", ride.notes]] : []),
            ].map(([label, value]) => (
              <div key={label} className="flex items-start justify-between">
                <span className="text-sm text-gray-400">{label}</span>
                <span className="text-sm text-gray-800 text-right max-w-[60%]">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 司機資訊 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">司機資訊</h2>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold">
              {ride.driverName[0]}
            </div>
            <p className="text-sm font-medium text-gray-900">{ride.driverName}</p>
          </div>
          <Link href={`/admin/users/${ride.driverId}`} className="text-sm text-emerald-600 hover:underline">
            查看會員詳情 →
          </Link>
        </div>
      </div>

      {/* 乘客名單 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">
            已訂乘客（{ride.passengers.length} 人）
          </h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              {["乘客", "電話", "座位", "付款金額", "訂單狀態", "訂單"].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs text-gray-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ride.passengers.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400">目前尚無乘客預訂此行程</td></tr>
            ) : ride.passengers.map((p) => {
              const bst = BOOKING_STATUS[p.status] ?? { label: p.status, cls: "bg-gray-100 text-gray-500" };
              return (
                <tr key={p.bookingId} className={`border-t border-gray-50 hover:bg-gray-50 ${p.status === "cancelled" ? "opacity-50" : ""}`}>
                  <td className="px-6 py-3">
                    <Link href={`/admin/users/${p.passengerId}`} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">
                        {p.passengerName[0]}
                      </div>
                      <span className="text-sm text-gray-800">{p.passengerName}</span>
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-xs text-gray-500">{p.passengerPhone}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{p.seats} 席</td>
                  <td className="px-6 py-3 text-sm text-gray-700">NT${p.totalPrice}</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${bst.cls}`}>{bst.label}</span>
                  </td>
                  <td className="px-6 py-3">
                    <Link href={`/admin/bookings/${p.bookingId}`} className="text-xs text-emerald-600 hover:underline">
                      查看訂單 →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 強制取消 Modal */}
      {showCancel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-3">確認強制取消此行程？</h3>
            <div className="bg-red-50 rounded-xl p-4 mb-4 text-center">
              <p className="text-sm text-red-700">共 <span className="font-bold">{confirmedPassengers.length}</span> 位乘客將收到退款</p>
              <p className="text-lg font-bold text-red-600 mt-1">總退款金額：NT$ {totalRefund.toLocaleString()}</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer mb-5 p-3 bg-gray-50 rounded-lg">
              <input type="checkbox" checked={sendNoti} onChange={(e) => setSendNoti(e.target.checked)} className="w-4 h-4 accent-emerald-600" />
              <span className="text-sm text-gray-700">同時發送取消通知給所有乘客</span>
            </label>
            <div className="flex gap-2">
              <button onClick={() => setShowCancel(false)} className="flex-1 py-2 rounded-lg text-sm border border-gray-200 hover:bg-gray-50">取消</button>
              <button
                onClick={handleForceCancel}
                disabled={cancelLoading}
                className="flex-1 py-2 rounded-lg text-sm bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50"
              >{cancelLoading ? "處理中…" : "確認強制取消"}</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} ok={toast.ok} />}
    </div>
  );
}
