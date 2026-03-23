"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { getUserBookings, getUserRides, cancelBooking } from "@/actions/bookings";
import type { TripBookingItem, TripRideItem } from "@/actions/bookings";
import { cancelRide } from "@/actions/rides";

type TripStatus = "confirmed" | "pending" | "completed" | "cancelled";

/** 去除 geocode 回傳的郵遞區號與國家前綴，例：「100台灣臺北市中正區...」→「臺北市中正區...」 */
function cleanAddress(addr: string): string {
  return addr.replace(/^\d{3,5}台灣/, "").trim();
}

interface Trip {
  id: string;          // bookingId（乘客）或 rideId（司機）
  type: "passenger" | "driver";
  driverName?: string;
  driverPhone?: string | null;
  bookedSeats?: number;
  from: string;
  to: string;
  date: string;        // YYYY-MM-DD
  time: string;        // HH:MM
  price: number;
  co2Saved: number;
  status: TripStatus;
  displayId: string;   // 顯示用訂單號（取前8碼）
  hasReview?: boolean;
}

function bookingToTrip(b: TripBookingItem): Trip {
  const dt = new Date(b.departureTime);
  return {
    id: b.bookingId,
    type: "passenger",
    driverName: b.driverName,
    driverPhone: b.driverPhone,
    from: b.from,
    to: b.to,
    date: dt.toLocaleDateString("sv-SE", { timeZone: "Asia/Taipei" }),
    time: dt.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Taipei" }),
    price: b.totalPrice,
    co2Saved: b.co2Saved,
    status: b.status,
    displayId: "JC" + b.bookingId.replace(/-/g, "").slice(0, 6).toUpperCase(),
    hasReview: b.hasReview,
  };
}

function rideToTrip(r: TripRideItem): Trip {
  const dt = new Date(r.departureTime);
  // rides 的 status: active → confirmed（即將出發）
  const statusMap: Record<string, TripStatus> = {
    active: "confirmed",
    completed: "completed",
    cancelled: "cancelled",
  };
  return {
    id: r.rideId,
    type: "driver",
    bookedSeats: r.bookedSeats,
    from: r.from,
    to: r.to,
    date: dt.toLocaleDateString("sv-SE", { timeZone: "Asia/Taipei" }),
    time: dt.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Taipei" }),
    price: r.price,
    co2Saved: r.co2Saved,
    status: statusMap[r.status] ?? "confirmed",
    displayId: "JC" + r.rideId.replace(/-/g, "").slice(0, 6).toUpperCase(),
  };
}

const statusConfig: Record<TripStatus, { label: string; color: string; bg: string }> = {
  confirmed: { label: "已確認", color: "text-green-700", bg: "bg-green-50" },
  pending:   { label: "待確認", color: "text-orange-600", bg: "bg-orange-50" },
  completed: { label: "已完成", color: "text-gray-500",  bg: "bg-gray-100" },
  cancelled: { label: "已取消", color: "text-red-400",   bg: "bg-red-50"   },
};

function TripCard({ trip, onCancelled }: { trip: Trip; onCancelled?: () => void }) {
  const router = useRouter();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const status = statusConfig[trip.status];

  const handleCancel = async () => {
    setCancelling(true);
    const result = trip.type === "driver"
      ? await cancelRide(trip.id)
      : await cancelBooking(trip.id);
    setCancelling(false);
    setConfirmCancel(false);
    if (result.success) {
      onCancelled?.();
    } else {
      alert(result.error || "取消失敗，請再試一次");
    }
  };
  const dateObj = new Date(trip.date + "T00:00:00");
  const dateStr = dateObj.toLocaleDateString("zh-TW", { month: "short", day: "numeric", weekday: "short" });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.bg} ${status.color}`}>
            {status.label}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            trip.type === "driver" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
          }`}>
            {trip.type === "driver" ? "司機" : "乘客"}
          </span>
        </div>
        <span className="text-xs text-gray-400">{trip.displayId}</span>
      </div>

      {/* Route */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex flex-col items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <div className="w-0.5 h-5 bg-gray-200" />
          <div className="w-2 h-2 rounded-full bg-emerald-700" />
        </div>
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-800">{cleanAddress(trip.from)}</p>
            <span className="text-green-700 font-bold text-sm">{trip.time}</span>
          </div>
          <p className="text-sm text-gray-500">{cleanAddress(trip.to)}</p>
        </div>
      </div>

      {/* Info row */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{dateStr}</span>
          {trip.type === "passenger" && trip.driverName && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-[8px] font-bold">
                {trip.driverName[0]}
              </div>
              {trip.driverName}
            </span>
          )}
          {trip.type === "driver" && (
            <span className="text-xs text-gray-500">乘客 {trip.bookedSeats ?? 0} 人</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-green-600 font-medium">
            省下 {trip.co2Saved.toFixed(1)} kg CO₂
          </span>
          <span className="text-sm font-bold text-gray-700">NT${trip.price}</span>
        </div>
      </div>

      {/* Action buttons — 司機 */}
      {trip.status === "confirmed" && trip.type === "driver" && (
        <div className="mt-3">
          <button
            onClick={() => setConfirmCancel(true)}
            className="w-full py-2 rounded-xl bg-red-50 text-red-400 text-xs font-medium hover:bg-red-100 transition-colors border border-red-100"
          >
            取消行程
          </button>
        </div>
      )}

      {/* Action buttons — 乘客 */}
      {trip.status === "confirmed" && trip.type === "passenger" && (
        <div className="mt-3 flex gap-2">
          {trip.driverPhone ? (
            <a
              href={`tel:${trip.driverPhone}`}
              className="flex-1 py-2 rounded-xl bg-gray-50 text-gray-500 text-xs font-medium hover:bg-gray-100 transition-colors border border-gray-100 text-center"
            >
              聯絡司機
            </a>
          ) : (
            <button disabled className="flex-1 py-2 rounded-xl bg-gray-50 text-gray-300 text-xs font-medium border border-gray-100 cursor-not-allowed">
              聯絡司機
            </button>
          )}
          <button
            onClick={() => setConfirmCancel(true)}
            className="flex-1 py-2 rounded-xl bg-red-50 text-red-400 text-xs font-medium hover:bg-red-100 transition-colors border border-red-100"
          >
            取消行程
          </button>
        </div>
      )}

      {/* 取消確認 dialog */}
      {confirmCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-base font-semibold text-gray-800 mb-2">確認取消行程？</h3>
            <p className="text-sm text-gray-500 mb-5">
              {trip.type === "driver"
                ? "取消後，所有已預訂的乘客將自動退款。此操作無法復原。"
                : `取消後將全額退款 NT$${trip.price} 至錢包。`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmCancel(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50"
              >
                返回
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50"
              >
                {cancelling ? "取消中…" : "確認取消"}
              </button>
            </div>
          </div>
        </div>
      )}
      {trip.status === "completed" && trip.type === "passenger" && (
        <div className="mt-3">
          {trip.hasReview ? (
            <div className="w-full py-2 rounded-xl bg-gray-50 text-gray-400 text-xs font-medium border border-gray-100 flex items-center justify-center gap-1.5 cursor-default">
              <svg className="w-3.5 h-3.5 fill-current text-yellow-400" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              已評價
            </div>
          ) : (
            <button
              onClick={() => router.push(`/trips/${trip.id}/review`)}
              className="w-full py-2 rounded-xl bg-yellow-50 text-yellow-600 text-xs font-semibold hover:bg-yellow-100 transition-colors border border-yellow-100 flex items-center justify-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              評價此行程
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function TripsPage() {
  const [tab, setTab] = useState<"upcoming" | "history">("upcoming");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [bookings, rides] = await Promise.all([getUserBookings(), getUserRides()]);
    const all = [
      ...bookings.map(bookingToTrip),
      ...rides.map(rideToTrip),
    ];
    // 依出發時間排序（最近優先）
    all.sort((a, b) => (a.date + a.time) > (b.date + b.time) ? -1 : 1);
    setTrips(all);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const upcoming = trips.filter((t) => t.status === "confirmed" || t.status === "pending");
  const history  = trips.filter((t) => t.status === "completed" || t.status === "cancelled");

  const totalCo2 = trips
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + t.co2Saved, 0);

  const completedCount = history.filter((t) => t.status === "completed").length;

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-500 px-5 pt-12 pb-6">
        <h1 className="text-2xl font-bold text-white">我的行程</h1>
        <p className="text-green-100 text-sm mt-1">管理你的共乘紀錄</p>

        <div className="mt-4 bg-white/15 rounded-2xl p-4 flex items-center gap-4">
          <div className="bg-white/20 rounded-xl p-2.5">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-4.97 4.97-4.97 13.03 0 18 4.97-4.97 4.97-13.03 0-18z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18" />
            </svg>
          </div>
          <div>
            <p className="text-white/70 text-xs">累計減碳貢獻</p>
            <p className="text-white text-2xl font-bold">{totalCo2.toFixed(1)} <span className="text-base font-medium">kg CO₂</span></p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-white/70 text-xs">完成共乘</p>
            <p className="text-white text-xl font-bold">{completedCount} 趟</p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex bg-white border-b border-gray-100">
        {(["upcoming", "history"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3.5 text-sm font-semibold transition-colors relative ${
              tab === t ? "text-green-600" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {t === "upcoming" ? `即將出發（${upcoming.length}）` : `歷史紀錄（${history.length}）`}
            {tab === t && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-green-600 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Trip list */}
      <div className="px-4 py-4 flex flex-col gap-3">
        {loading ? (
          <div className="flex justify-center py-16">
            <svg className="w-8 h-8 animate-spin text-green-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : tab === "upcoming" ? (
          upcoming.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-green-50 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">尚無即將出發的行程</p>
              <Link href="/" className="mt-3 text-green-600 text-sm font-medium">立即搜尋共乘</Link>
            </div>
          ) : (
            upcoming.map((t) => <TripCard key={t.id} trip={t} onCancelled={load} />)
          )
        ) : (
          history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <svg className="w-24 h-24 text-gray-200 mb-4" viewBox="0 0 96 96" fill="none" aria-hidden="true">
                <rect x="16" y="36" width="64" height="44" rx="6" stroke="currentColor" strokeWidth="3" />
                <path d="M28 36V28a20 20 0 0 1 40 0v8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <circle cx="48" cy="58" r="8" stroke="currentColor" strokeWidth="3" />
                <line x1="48" y1="66" x2="48" y2="74" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <p className="text-gray-500 font-medium">還沒有歷史行程</p>
              <p className="text-gray-400 text-sm mt-1">趕快搭乘第一趟，開始累積 ESG 減碳足跡！</p>
              <Link href="/" className="mt-4 bg-green-600 text-white rounded-xl px-6 py-3 text-sm font-medium hover:bg-green-700 transition-colors">
                搜尋共乘
              </Link>
            </div>
          ) : (
            history.map((t) => <TripCard key={t.id} trip={t} />)
          )
        )}
      </div>
    </div>
  );
}

export default function ProtectedTripsPage() {
  return <AuthGuard><TripsPage /></AuthGuard>;
}
