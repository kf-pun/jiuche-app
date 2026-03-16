"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";

type TripStatus = "confirmed" | "pending" | "completed" | "cancelled";

interface Trip {
  id: string;
  type: "passenger" | "driver";
  driverName?: string;
  passengerCount?: number;
  from: string;
  to: string;
  date: string;
  time: string;
  price: number;
  co2Saved: number;
  status: TripStatus;
  bookingId: string;
}

const mockTrips: Trip[] = [
  {
    id: "t1",
    type: "passenger",
    driverName: "王建國",
    from: "捷運市政府站",
    to: "南港軟體園區",
    date: "2026-03-17",
    time: "07:50",
    price: 70,
    co2Saved: 1.2,
    status: "confirmed",
    bookingId: "JC482901",
  },
  {
    id: "t2",
    type: "passenger",
    driverName: "陳大偉",
    from: "板橋車站",
    to: "內湖科學園區",
    date: "2026-03-18",
    time: "08:15",
    price: 120,
    co2Saved: 2.4,
    status: "pending",
    bookingId: "JC391024",
  },
  {
    id: "t3",
    type: "driver",
    passengerCount: 2,
    from: "新店總督府",
    to: "信義計畫區",
    date: "2026-03-15",
    time: "08:30",
    price: 80,
    co2Saved: 1.8,
    status: "completed",
    bookingId: "JC205847",
  },
  {
    id: "t4",
    type: "passenger",
    driverName: "林小雨",
    from: "捷運市政府站",
    to: "南港軟體園區",
    date: "2026-03-14",
    time: "08:30",
    price: 90,
    co2Saved: 1.2,
    status: "completed",
    bookingId: "JC183746",
  },
  {
    id: "t5",
    type: "passenger",
    driverName: "張美玲",
    from: "捷運市政府站",
    to: "南港軟體園區",
    date: "2026-03-12",
    time: "09:00",
    price: 85,
    co2Saved: 1.2,
    status: "cancelled",
    bookingId: "JC165392",
  },
];

const statusConfig: Record<TripStatus, { label: string; color: string; bg: string }> = {
  confirmed: { label: "已確認", color: "text-green-700", bg: "bg-green-50" },
  pending:   { label: "待確認", color: "text-orange-600", bg: "bg-orange-50" },
  completed: { label: "已完成", color: "text-gray-500",  bg: "bg-gray-100" },
  cancelled: { label: "已取消", color: "text-red-400",   bg: "bg-red-50" },
};

function TripCard({ trip }: { trip: Trip }) {
  const router = useRouter();
  const status = statusConfig[trip.status];
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
        <span className="text-xs text-gray-400">{trip.bookingId}</span>
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
            <p className="text-sm font-medium text-gray-800">{trip.from}</p>
            <span className="text-green-700 font-bold text-sm">{trip.time}</span>
          </div>
          <p className="text-sm text-gray-500">{trip.to}</p>
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
            <span className="text-xs text-gray-500">乘客 {trip.passengerCount} 人</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-green-600 font-medium">
            -{trip.co2Saved} kg CO₂
          </span>
          <span className="text-sm font-bold text-gray-700">NT${trip.price}</span>
        </div>
      </div>

      {/* Action buttons */}
      {trip.status === "confirmed" && (
        <div className="mt-3 flex gap-2">
          <button className="flex-1 py-2 rounded-xl bg-gray-50 text-gray-500 text-xs font-medium hover:bg-gray-100 transition-colors border border-gray-100">
            聯絡司機
          </button>
          <button className="flex-1 py-2 rounded-xl bg-red-50 text-red-400 text-xs font-medium hover:bg-red-100 transition-colors border border-red-100">
            取消行程
          </button>
        </div>
      )}
      {trip.status === "completed" && trip.type === "passenger" && (
        <div className="mt-3">
          <button
            onClick={() => router.push(`/trips/${trip.id}/review`)}
            className="w-full py-2 rounded-xl bg-yellow-50 text-yellow-600 text-xs font-semibold hover:bg-yellow-100 transition-colors border border-yellow-100 flex items-center justify-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            評價此行程
          </button>
        </div>
      )}
    </div>
  );
}

function TripsPage() {
  const [tab, setTab] = useState<"upcoming" | "history">("upcoming");

  const upcoming = mockTrips.filter((t) => t.status === "confirmed" || t.status === "pending");
  const history  = mockTrips.filter((t) => t.status === "completed" || t.status === "cancelled");

  const totalCo2 = mockTrips
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + t.co2Saved, 0);

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-500 px-5 pt-12 pb-6">
        <h1 className="text-2xl font-bold text-white">我的行程</h1>
        <p className="text-green-100 text-sm mt-1">管理你的共乘紀錄</p>

        {/* CO2 summary */}
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
            <p className="text-white text-xl font-bold">{history.filter(t => t.status === "completed").length} 趟</p>
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
        {tab === "upcoming" && (
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
          ) : upcoming.map((t) => <TripCard key={t.id} trip={t} />)
        )}
        {tab === "history" && (
          history.map((t) => <TripCard key={t.id} trip={t} />)
        )}
      </div>
    </div>
  );
}

export default function ProtectedTripsPage() {
  return <AuthGuard><TripsPage /></AuthGuard>;
}
