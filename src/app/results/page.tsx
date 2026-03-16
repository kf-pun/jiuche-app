"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { mockRides, Ride } from "@/lib/mockData";
import Link from "next/link";

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5 text-yellow-400 text-xs font-semibold">
      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      {rating.toFixed(1)}
    </span>
  );
}

function RideCard({ ride }: { ride: Ride }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(`/results/${ride.id}`)}
      className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-left hover:border-green-300 hover:shadow-md active:scale-[0.99] transition-all"
    >
      {/* Top row: avatar + name + rating + seats */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
          {ride.driver.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800 text-sm">{ride.driver.name}</span>
            <StarRating rating={ride.driver.rating} />
          </div>
          <p className="text-xs text-gray-400">{ride.driver.company} · 共乘 {ride.driver.totalRides} 次</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-green-600 font-bold text-base">NT${ride.price}</p>
          <p className="text-xs text-gray-400">/ 人</p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-dashed border-gray-100 mb-3" />

      {/* Route + time */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex flex-col items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <div className="w-0.5 h-6 bg-gray-200" />
          <div className="w-2 h-2 rounded-full bg-emerald-700" />
        </div>
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700 font-medium">{ride.from}</p>
            <span className="text-green-700 font-bold text-sm bg-green-50 px-2 py-0.5 rounded-lg">{ride.departureTime}</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{ride.to}</p>
            <span className="text-xs text-gray-400">{ride.duration} 分鐘</span>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="flex items-center gap-1 bg-green-50 text-green-600 text-xs px-2.5 py-1 rounded-full font-medium">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          省 {ride.co2Saved} kg CO₂
        </span>
        <span className="bg-gray-100 text-gray-500 text-xs px-2.5 py-1 rounded-full">
          {ride.carModel}
        </span>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ride.availableSeats === 1 ? "bg-orange-50 text-orange-500" : "bg-blue-50 text-blue-500"}`}>
          剩 {ride.availableSeats} 座
        </span>
      </div>
    </button>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const date = searchParams.get("date") || "";

  const formatted = date
    ? new Date(date + "T00:00:00").toLocaleDateString("zh-TW", { month: "long", day: "numeric", weekday: "short" })
    : "";

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-500 px-5 pt-12 pb-6">
        <Link href="/" className="flex items-center gap-1.5 text-white/80 text-sm mb-4 hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          返回搜尋
        </Link>
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-1 mt-1">
            <div className="w-2 h-2 rounded-full bg-white" />
            <div className="w-0.5 h-5 bg-white/40" />
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-white font-semibold text-base leading-tight">{from || "出發地"}</p>
            <p className="text-white/70 text-sm">{to || "目的地"}</p>
          </div>
        </div>
        <p className="text-white/60 text-xs mt-3">{formatted}</p>
      </div>

      {/* Result count */}
      <div className="px-4 pt-4 pb-2">
        <p className="text-sm text-gray-500">
          找到 <span className="font-bold text-green-600">{mockRides.length}</span> 筆順路行程
        </p>
      </div>

      {/* Ride list */}
      <div className="px-4 pb-6 flex flex-col gap-3">
        {mockRides.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">找不到順路行程</p>
            <p className="text-gray-400 text-sm mt-1">試試其他日期或地點</p>
            <Link href="/" className="mt-4 text-green-600 text-sm font-medium">重新搜尋</Link>
          </div>
        ) : (
          mockRides.map((ride) => <RideCard key={ride.id} ride={ride} />)
        )}
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense>
      <ResultsContent />
    </Suspense>
  );
}
