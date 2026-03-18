"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { ReviewInsert } from "@/types/database";

export interface CreateReviewResult {
  success: boolean;
  error?: string;
}

export async function createReview(params: {
  bookingId: string;
  rating: number;
  tags: string[];
  comment: string;
}): Promise<CreateReviewResult> {
  const supabase = await createClient();
  const service = await createServiceClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "未登入" };

  // 1. 取得 booking（確認歸屬 + completed + 拿 driver_id）
  const { data: booking, error: bErr } = await service
    .from("bookings")
    .select("id, status, ride:rides(driver_id)")
    .eq("id", params.bookingId)
    .eq("passenger_id", user.id)
    .single();

  if (bErr || !booking) return { success: false, error: "找不到預訂記錄" };
  if (booking.status !== "completed") return { success: false, error: "行程尚未完成" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const driverId = (booking as any).ride?.driver_id;
  if (!driverId) return { success: false, error: "找不到司機資訊" };

  // 2. 防止重複評價
  const { data: existing } = await service
    .from("reviews")
    .select("id")
    .eq("booking_id", params.bookingId)
    .maybeSingle();

  if (existing) return { success: false, error: "此行程已評價" };

  // 3. 寫入 reviews 表
  const review: ReviewInsert = {
    booking_id: params.bookingId,
    reviewer_id: user.id,
    reviewee_id: driverId,
    rating: params.rating,
    tags: params.tags.length > 0 ? params.tags : null,
    comment: params.comment.trim() || null,
  };

  const { error: insertErr } = await service.from("reviews").insert(review);
  if (insertErr) {
    console.error("createReview insert error:", insertErr);
    return { success: false, error: "評價送出失敗，請稍後再試" };
  }

  // 4. 更新司機平均評分
  const { data: driver } = await service
    .from("users")
    .select("rating, rating_count")
    .eq("id", driverId)
    .single();

  if (driver) {
    const newCount = driver.rating_count + 1;
    const newRating = ((Number(driver.rating) * driver.rating_count) + params.rating) / newCount;
    await service
      .from("users")
      .update({
        rating: parseFloat(newRating.toFixed(2)),
        rating_count: newCount,
      })
      .eq("id", driverId);
  }

  return { success: true };
}
