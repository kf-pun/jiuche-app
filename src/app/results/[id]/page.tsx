"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getRideDetail, getDriverReviews, type RideDetail, type DriverReviewItem } from "@/actions/rides";
import Link from "next/link";

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm text-gray-700 font-medium mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function RideDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [ride, setRide] = useState<RideDetail | null | undefined>(undefined);
  const [seats, setSeats] = useState(1);
  const [reviews, setReviews] = useState<DriverReviewItem[]>([]);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    getRideDetail(params.id as string).then((r) => {
      setRide(r);
      if (r?.driver?.id) {
        getDriverReviews(r.driver.id, 10).then(setReviews);
      }
    });
  }, [params.id]);

  if (ride === undefined) {
    return (
      <div className="flex items-center justify-center min-h-full py-20">
        <svg className="w-6 h-6 animate-spin text-green-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full py-20">
        <p className="text-gray-500">找不到此行程</p>
        <Link href="/results" className="mt-4 text-green-600 text-sm font-medium">返回列表</Link>
      </div>
    );
  }

  const formatted = new Date(ride.date + "T00:00:00").toLocaleDateString("zh-TW", {
    year: "numeric", month: "long", day: "numeric", weekday: "long",
  });

  const handleBook = () => {
    router.push(`/booking/confirm?rideId=${ride.id}&seats=${seats}`);
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-500 px-5 pt-12 pb-8">
        <Link href="/results" className="flex items-center gap-1.5 text-white/80 text-sm mb-5 hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          返回列表
        </Link>

        {/* Driver info */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white text-2xl font-bold">
            {ride.driver.avatar}
          </div>
          <div>
            <h2 className="text-white text-xl font-bold">{ride.driver.name}</h2>
            <p className="text-white/70 text-sm">{ride.driver.company}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1 text-yellow-300 text-sm font-semibold">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {ride.driver.rating.toFixed(1)}
              </span>
              <span className="text-white/60 text-sm">· 共乘 {ride.driver.totalRides} 次</span>
            </div>
          </div>
        </div>
      </div>

      {/* Route card */}
      <div className="px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <div className="w-3 h-3 rounded-full border-2 border-green-500 bg-white" />
              <div className="w-0.5 h-8 bg-gray-200" />
              <div className="w-3 h-3 rounded-full bg-emerald-600" />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-gray-800 font-semibold text-sm">{ride.from}</p>
                <span className="bg-green-100 text-green-700 text-sm font-bold px-3 py-1 rounded-lg">{ride.departureTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-gray-500 text-sm">{ride.to}</p>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-50">
            <p className="text-xs text-gray-400">{formatted}</p>
          </div>
        </div>
      </div>

      {/* ESG highlight */}
      <div className="px-4 mt-3">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 flex items-center gap-4">
          <div className="bg-white/20 rounded-xl p-2.5">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-4.97 4.97-4.97 13.03 0 18 4.97-4.97 4.97-13.03 0-18z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c4.97 4.97 4.97 13.03 0 18" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18" />
            </svg>
          </div>
          <div>
            <p className="text-white/80 text-xs">這趟共乘預估可減少</p>
            <p className="text-white text-2xl font-bold">{ride.co2Saved} <span className="text-base font-medium">kg CO₂</span></p>
            <p className="text-white/70 text-xs">相當於種下 0.{Math.round(ride.co2Saved * 8)} 棵樹</p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="px-4 mt-3">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <InfoRow
            icon={<svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>}
            label="集合地點"
            value={ride.meetingPoint || "見詳情"}
          />
          <InfoRow
            icon={<svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8H3a2 2 0 00-2 2v6a2 2 0 002 2h2m7-2V8"/></svg>}
            label="車輛"
            value={ride.carModel}
          />
          <InfoRow
            icon={<svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>}
            label="剩餘座位"
            value={`${ride.availableSeats} / ${ride.totalSeats} 座`}
          />
          {ride.notes && (
            <InfoRow
              icon={<svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>}
              label="備註"
              value={ride.notes}
            />
          )}
        </div>
      </div>

      {/* Seat selector */}
      {ride.availableSeats > 1 && (
        <div className="px-4 mt-3">
          <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700">訂位人數</p>
              <p className="text-xs text-gray-400 mt-0.5">最多可訂 {ride.availableSeats} 席</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSeats(s => Math.max(1, s - 1))}
                disabled={seats <= 1}
                className="w-9 h-9 rounded-xl bg-gray-100 text-gray-600 font-bold text-lg flex items-center justify-center disabled:opacity-40 active:scale-95 transition-all"
              >
                −
              </button>
              <span className="text-lg font-bold text-gray-800 w-6 text-center">{seats}</span>
              <button
                onClick={() => setSeats(s => Math.min(ride.availableSeats, s + 1))}
                disabled={seats >= ride.availableSeats}
                className="w-9 h-9 rounded-xl bg-green-600 text-white font-bold text-lg flex items-center justify-center disabled:opacity-40 active:scale-95 transition-all"
              >
                ＋
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Driver Reviews */}
      <div className="px-4 mt-3">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            司機評價（{reviews.length} 則）
          </h3>
          {reviews.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">此司機尚無評價</p>
          ) : (
            <>
              {(showAllReviews ? reviews : reviews.slice(0, 5)).map((r) => (
                <div key={r.id} className="bg-white border border-gray-100 rounded-xl p-4 mb-3 last:mb-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 text-sm font-medium flex items-center justify-center flex-shrink-0">
                      {r.passengerName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700">{r.passengerName}</p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg key={i} className={`w-3 h-3 ${i < r.rating ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        ))}
                        <span className="text-xs text-gray-400 ml-1">{r.relativeTime}</span>
                      </div>
                    </div>
                  </div>
                  {r.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {r.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="bg-green-100 text-green-700 rounded-full px-2 py-0.5 text-xs">{tag}</span>
                      ))}
                    </div>
                  )}
                  {r.comment && (
                    <p className="text-sm text-gray-600 line-clamp-3">{r.comment}</p>
                  )}
                </div>
              ))}
              {!showAllReviews && reviews.length > 5 && (
                <button
                  onClick={() => setShowAllReviews(true)}
                  className="text-green-600 text-sm underline mt-1"
                >
                  + {reviews.length - 5} 則更多評價
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Bottom booking bar */}
      <div className="px-4 mt-4 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div>
            <p className="text-xs text-gray-400">費用</p>
            <p className="text-2xl font-bold text-gray-800">
              NT${(ride.price * seats).toLocaleString()}
              {seats > 1 && <span className="text-sm font-normal text-gray-400"> ({seats} 人)</span>}
            </p>
          </div>
          <button
            onClick={handleBook}
            disabled={ride.availableSeats === 0}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold py-3.5 rounded-xl shadow hover:from-green-700 hover:to-emerald-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {ride.availableSeats === 0 ? "已額滿" : "立即預訂"}
          </button>
        </div>
      </div>
    </div>
  );
}
