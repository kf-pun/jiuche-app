"use server";

import { createServiceClient } from "@/lib/supabase/server";

export interface AdminReviewItem {
  id: string;
  passengerId: string;
  passengerName: string;
  driverId: string;
  driverName: string;
  rating: number;
  tags: string[];
  comment: string;
  createdAt: string;
}

export interface AdminReviewListResult {
  reviews: AdminReviewItem[];
  total: number;
}

export async function getAdminReviews(params: {
  search?: string;
  rating?: number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
}): Promise<AdminReviewListResult> {
  const service = await createServiceClient();
  const page = params.page ?? 1;
  const pageSize = 20;
  const from = (page - 1) * pageSize;

  // reviews -> bookings -> rides (for driver_id) + users x2
  let query = service
    .from("reviews")
    .select(
      `id, rating, tags, comment, created_at,
       reviewer_id,
       reviewee_id,
       passenger:users!reviewer_id(id, name),
       driver:users!reviewee_id(id, name)`,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);

  if (params.rating && params.rating > 0) {
    query = query.eq("rating", params.rating);
  }
  if (params.dateFrom) query = query.gte("created_at", params.dateFrom);
  if (params.dateTo) {
    const end = new Date(params.dateTo);
    end.setDate(end.getDate() + 1);
    query = query.lt("created_at", end.toISOString().slice(0, 10));
  }

  const { data, count } = await query;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let items: AdminReviewItem[] = (data ?? []).map((r: any) => ({
    id: r.id,
    passengerId: r.reviewer_id,
    passengerName: r.passenger?.name ?? "—",
    driverId: r.reviewee_id,
    driverName: r.driver?.name ?? "—",
    rating: r.rating,
    tags: r.tags ?? [],
    comment: r.comment ?? "",
    createdAt: r.created_at,
  }));

  if (params.search) {
    const q = params.search.toLowerCase();
    items = items.filter(
      (r) =>
        r.passengerName.toLowerCase().includes(q) ||
        r.driverName.toLowerCase().includes(q)
    );
  }

  return { reviews: items, total: count ?? 0 };
}

export interface DeleteReviewResult {
  success: boolean;
  error?: string;
}

export async function deleteReview(
  reviewId: string,
  driverId: string
): Promise<DeleteReviewResult> {
  const service = await createServiceClient();

  // 刪除評價
  const { error } = await service
    .from("reviews")
    .delete()
    .eq("id", reviewId);

  if (error) return { success: false, error: error.message };

  // 重算司機平均分
  const { data: remaining } = await service
    .from("reviews")
    .select("rating")
    .eq("reviewee_id", driverId);

  if (remaining && remaining.length > 0) {
    const avg = remaining.reduce((s, r) => s + r.rating, 0) / remaining.length;
    await service
      .from("users")
      .update({ rating: parseFloat(avg.toFixed(2)), rating_count: remaining.length })
      .eq("id", driverId);
  } else {
    // 無剩餘評價
    await service
      .from("users")
      .update({ rating: 0, rating_count: 0 })
      .eq("id", driverId);
  }

  return { success: true };
}
