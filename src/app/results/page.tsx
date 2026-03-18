"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { searchRides, type RideResult } from "@/actions/rides";

type SortKey = "time" | "price" | "co2" | "rating";

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

function RideCard({ ride }: { ride: RideResult }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(`/results/${ride.id}`)}
      className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-left hover:border-green-300 hover:shadow-md active:scale-[0.99] transition-all"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
          {ride.driver.name[0] ?? "?"}
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

      <div className="border-t border-dashed border-gray-100 mb-3" />

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
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="flex items-center gap-1 bg-green-50 text-green-600 text-xs px-2.5 py-1 rounded-full font-medium">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          省 {ride.co2Saved.toFixed(1)} kg CO₂
        </span>
        <span className="bg-gray-100 text-gray-500 text-xs px-2.5 py-1 rounded-full">
          {ride.driver.carModel}
        </span>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ride.availableSeats === 1 ? "bg-orange-50 text-orange-500" : "bg-blue-50 text-blue-500"}`}>
          剩 {ride.availableSeats} 座
        </span>
      </div>
    </button>
  );
}

function FilterBar({
  sort, setSort, timeRange, setTimeRange,
}: {
  sort: SortKey; setSort: (v: SortKey) => void;
  timeRange: string; setTimeRange: (v: string) => void;
}) {
  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "time", label: "最早出發" },
    { key: "price", label: "最低價" },
    { key: "co2", label: "最多減碳" },
    { key: "rating", label: "最高評分" },
  ];

  return (
    <div className="bg-white border-b border-gray-100 shadow-sm">
      <div className="flex gap-2 px-4 py-2.5 overflow-x-auto no-scrollbar">
        {sortOptions.map((o) => (
          <button
            key={o.key}
            onClick={() => setSort(o.key)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              sort === o.key
                ? "bg-green-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 px-4 pb-2.5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setTimeRange(timeRange === "morning" ? "all" : "morning")}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
            timeRange === "morning"
              ? "bg-emerald-50 border-emerald-400 text-emerald-700"
              : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
          }`}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.66-10h-1M4.34 12h-1m15.07-6.07l-.71.71M5.64 18.36l-.71.71M18.36 18.36l-.71-.71M5.64 5.64l-.71-.71M12 7a5 5 0 100 10A5 5 0 0012 7z" />
          </svg>
          早班（07–09）
        </button>

        <button
          onClick={() => setTimeRange(timeRange === "late" ? "all" : "late")}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
            timeRange === "late"
              ? "bg-emerald-50 border-emerald-400 text-emerald-700"
              : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
          }`}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          晚班（09+）
        </button>
      </div>
    </div>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const date = searchParams.get("date") || "";

  const [rides, setRides] = useState<RideResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortKey>("time");
  const [timeRange, setTimeRange] = useState<string>("all");

  useEffect(() => {
    searchRides(from, to, date).then((result) => {
      setRides(result);
      setLoading(false);
    });
  }, [from, to, date]);

  const formatted = date
    ? new Date(date + "T00:00:00").toLocaleDateString("zh-TW", { month: "long", day: "numeric", weekday: "short" })
    : "";

  const filtered = useMemo(() => {
    let list = [...rides];

    if (timeRange === "morning") list = list.filter((r) => r.departureTime < "09:00");
    if (timeRange === "late") list = list.filter((r) => r.departureTime >= "09:00");

    list.sort((a, b) => {
      if (sort === "time") return a.departureTime.localeCompare(b.departureTime);
      if (sort === "price") return a.price - b.price;
      if (sort === "co2") return b.co2Saved - a.co2Saved;
      if (sort === "rating") return b.driver.rating - a.driver.rating;
      return 0;
    });

    return list;
  }, [rides, sort, timeRange]);

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-500 px-5 pt-12 pb-5">
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
        <p className="text-white/60 text-xs mt-2">{formatted}</p>
      </div>

      {/* Filter bar */}
      <FilterBar sort={sort} setSort={setSort} timeRange={timeRange} setTimeRange={setTimeRange} />

      {/* Result count */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        {loading ? (
          <p className="text-sm text-gray-400">搜尋中...</p>
        ) : (
          <p className="text-sm text-gray-500">
            找到 <span className="font-bold text-green-600">{filtered.length}</span> 筆順路行程
          </p>
        )}
        {timeRange !== "all" && (
          <button
            onClick={() => setTimeRange("all")}
            className="text-xs text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            清除篩選
          </button>
        )}
      </div>

      {/* Ride list */}
      <div className="px-4 pb-6 flex flex-col gap-3">
        {loading ? (
          <div className="flex justify-center py-16">
            <svg className="w-8 h-8 animate-spin text-green-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">沒有符合條件的行程</p>
            <p className="text-gray-400 text-sm mt-1">試試調整篩選條件</p>
            {timeRange !== "all" && (
              <button
                onClick={() => setTimeRange("all")}
                className="mt-3 text-green-600 text-sm font-medium"
              >
                清除篩選
              </button>
            )}
          </div>
        ) : (
          filtered.map((ride) => <RideCard key={ride.id} ride={ride} />)
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
