"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getBookingDetail } from "@/actions/bookings";
import type { BookingDetailForReview } from "@/actions/bookings";
import { createReview } from "@/actions/reviews";

const QUICK_TAGS = [
  { id: "ontime",  label: "準時出發", icon: "⏰" },
  { id: "safe",    label: "駕駛穩健", icon: "🛡️" },
  { id: "clean",   label: "車內整潔", icon: "✨" },
  { id: "chat",    label: "友善健談", icon: "💬" },
  { id: "quiet",   label: "安靜舒適", icon: "🤫" },
  { id: "eco",     label: "環保意識強", icon: "🌿" },
];

function StarRow({ rating, setRating }: { rating: number; setRating: (n: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-2 justify-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => setRating(star)}
          className="transition-transform active:scale-90"
        >
          <svg
            className={`w-10 h-10 transition-colors ${(hovered || rating) >= star ? "text-yellow-400" : "text-gray-200"}`}
            fill="currentColor" viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
        </button>
      ))}
    </div>
  );
}

const ratingLabel = ["", "很差", "不太好", "普通", "不錯", "非常棒！"];
const ratingColor  = ["", "text-red-400", "text-orange-400", "text-yellow-500", "text-green-500", "text-green-600"];

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [trip, setTrip] = useState<BookingDetailForReview | null | undefined>(undefined); // undefined=loading
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    getBookingDetail(id).then(setTrip);
  }, [id]);

  const toggleTag = (tagId: string) =>
    setTags((prev) => prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]);

  const handleSubmit = async () => {
    if (rating === 0 || !trip) return;
    setLoading(true);
    setSubmitError("");
    const result = await createReview({
      bookingId: trip.bookingId,
      rating,
      tags,
      comment,
    });
    setLoading(false);
    if (result.success) {
      setSubmitted(true);
    } else {
      setSubmitError(result.error ?? "送出失敗，請稍後再試");
    }
  };

  // 載入中
  if (trip === undefined) {
    return (
      <div className="flex justify-center items-center min-h-full py-20">
        <svg className="w-8 h-8 animate-spin text-green-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  // 找不到行程
  if (trip === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full py-20 px-6 text-center">
        <p className="text-gray-400 font-medium">找不到行程</p>
        <Link href="/trips" className="mt-4 text-green-600 text-sm">返回我的行程</Link>
      </div>
    );
  }

  const dateStr = (() => {
    const dt = new Date(trip.departureTime);
    return dt.toLocaleDateString("zh-TW", { month: "numeric", day: "numeric", timeZone: "Asia/Taipei" });
  })();

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full bg-gradient-to-b from-green-50 to-gray-50 px-6 py-20">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center shadow-lg mb-5 animate-bounce">
          <span className="text-3xl">⭐</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">感謝您的評價！</h2>
        <p className="text-gray-400 text-sm mt-2">您的回饋幫助我們提升共乘品質</p>

        <div className="mt-6 bg-white rounded-2xl shadow-sm p-5 w-full max-w-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold">
              {trip.driverName[0]}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">{trip.driverName}</p>
              <div className="flex gap-0.5 mt-0.5">
                {[1,2,3,4,5].map((s) => (
                  <svg key={s} className={`w-3.5 h-3.5 ${s <= rating ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
            </div>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => {
                const tag = QUICK_TAGS.find((q) => q.id === t);
                return tag ? (
                  <span key={t} className="bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full">{tag.icon} {tag.label}</span>
                ) : null;
              })}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 mt-6 w-full max-w-sm">
          <Link href="/trips" className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold py-4 rounded-xl text-center block shadow active:scale-95 transition-all">
            返回我的行程
          </Link>
          <Link href="/" className="w-full bg-white text-gray-600 font-medium py-3.5 rounded-xl border border-gray-200 text-center block hover:bg-gray-50 active:scale-95 transition-all">
            回首頁搜尋
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-500 px-5 pt-12 pb-6">
        <Link href="/trips" className="flex items-center gap-1.5 text-white/80 text-sm mb-4 hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          返回行程
        </Link>
        <h1 className="text-xl font-bold text-white">評價行程</h1>
        <p className="text-white/70 text-sm mt-0.5">{trip.from} → {trip.to}・{dateStr}</p>
      </div>

      <div className="flex-1 px-4 py-5 flex flex-col gap-4">
        {/* Driver info */}
        <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-2xl font-bold mb-3">
            {trip.driverName[0]}
          </div>
          <p className="text-base font-bold text-gray-800">{trip.driverName}</p>
          <p className="text-xs text-gray-400 mt-0.5 mb-5">這次共乘體驗如何？</p>

          <StarRow rating={rating} setRating={setRating} />

          {rating > 0 && (
            <p className={`text-base font-bold mt-3 transition-all ${ratingColor[rating]}`}>
              {ratingLabel[rating]}
            </p>
          )}
        </div>

        {/* Quick tags */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-700 mb-3">快速標籤（可複選）</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 border ${
                  tags.includes(tag.id)
                    ? "bg-green-600 text-white border-green-600 shadow-sm"
                    : "bg-gray-50 text-gray-600 border-gray-100 hover:border-green-300"
                }`}
              >
                <span>{tag.icon}</span>
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-700 mb-2">留言給司機（選填）</p>
          <textarea
            placeholder="分享這次共乘的體驗或給司機的建議..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={200}
            className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none border border-gray-100 focus:border-green-400 transition-colors resize-none"
          />
          <p className="text-xs text-gray-300 text-right mt-1">{comment.length}/200</p>
        </div>

        {/* ESG note */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3.5 flex items-center gap-3">
          <span className="text-2xl flex-shrink-0">🌿</span>
          <p className="text-sm text-emerald-700">感謝您本次共乘，已為地球減少碳排放！您的評價也鼓勵更多人參與。</p>
        </div>

        {submitError && (
          <p className="text-red-500 text-sm text-center -mb-1">{submitError}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={rating === 0 || loading}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold py-4 rounded-xl shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95 transition-all mb-2"
        >
          {loading ? (
            <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>送出中...</>
          ) : "送出評價"}
        </button>
        <Link href="/trips" className="text-center text-sm text-gray-400 hover:text-gray-500 transition-colors">
          略過，稍後再評價
        </Link>
      </div>
    </div>
  );
}
