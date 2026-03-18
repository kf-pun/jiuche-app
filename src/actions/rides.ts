"use server";

import { createClient } from "@/lib/supabase/server";
import type { RideInsert } from "@/types/database";

// ── Search ──────────────────────────────────────────────────────────────────

export interface RideResult {
  id: string;
  from: string;
  to: string;
  departureTime: string; // "HH:MM" 台灣時間
  price: number;
  availableSeats: number;
  co2Saved: number;
  driver: {
    id: string;
    name: string;
    company: string;
    rating: number;
    totalRides: number;
    carModel: string;
  };
}

function toTWTime(isoStr: string): string {
  const d = new Date(new Date(isoStr).getTime() + 8 * 60 * 60 * 1000);
  return `${d.getUTCHours().toString().padStart(2, "0")}:${d.getUTCMinutes().toString().padStart(2, "0")}`;
}

export async function searchRides(
  from: string,
  to: string,
  date: string
): Promise<RideResult[]> {
  const supabase = await createClient();

  let query = supabase
    .from("rides")
    .select(`
      id, from_location, to_location, departure_time,
      price, available_seats, co2_saved,
      driver:users!driver_id (id, name, company, rating, rating_count, vehicle_type)
    `)
    .eq("status", "active")
    .gt("available_seats", 0);

  // 日期範圍（台灣時區當天）
  if (date) {
    const dayStart = new Date(`${date}T00:00:00+08:00`).toISOString();
    const dayEnd = new Date(`${date}T23:59:59+08:00`).toISOString();
    query = query.gte("departure_time", dayStart).lte("departure_time", dayEnd);
  }

  // 起迄點模糊搜尋
  if (from) query = query.ilike("from_location", `%${from}%`);
  if (to) query = query.ilike("to_location", `%${to}%`);

  query = query.order("departure_time", { ascending: true });

  const { data, error } = await query;

  if (error) {
    console.error("searchRides error:", error);
    return [];
  }

  return (data ?? []).map((r) => {
    const d = r.driver as unknown as { id: string; name: string; company: string; rating: number; rating_count: number; vehicle_type: string | null } | null;
    return {
      id: r.id,
      from: r.from_location,
      to: r.to_location,
      departureTime: toTWTime(r.departure_time),
      price: r.price,
      availableSeats: r.available_seats,
      co2Saved: Number(r.co2_saved),
      driver: {
        id: d?.id ?? "",
        name: d?.name ?? "未知",
        company: d?.company ?? "",
        rating: Number(d?.rating ?? 0),
        totalRides: d?.rating_count ?? 0,
        carModel: d?.vehicle_type ?? "未填寫",
      },
    };
  });
}

// ── Get Ride Detail ──────────────────────────────────────────────────────────

export interface RideDetail {
  id: string;
  from: string;
  to: string;
  date: string;           // YYYY-MM-DD
  departureTime: string;  // HH:MM
  price: number;
  availableSeats: number;
  totalSeats: number;
  co2Saved: number;
  meetingPoint: string;
  carModel: string;
  notes: string;
  driver: {
    id: string;
    name: string;
    avatar: string;
    company: string;
    rating: number;
    totalRides: number;
  };
}

export async function getRideDetail(id: string): Promise<RideDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("rides")
    .select(`
      id, from_location, to_location, departure_time,
      price, total_seats, available_seats, co2_saved,
      meeting_point, notes,
      driver:users!driver_id (id, name, company, rating, rating_count, vehicle_type, vehicle_color)
    `)
    .eq("id", id)
    .single();

  if (error || !data) return null;

  const d = data.driver as unknown as {
    id: string; name: string; company: string; rating: number;
    rating_count: number; vehicle_type: string | null; vehicle_color: string | null;
  } | null;

  // 轉台灣時間
  const tw = new Date(new Date(data.departure_time).getTime() + 8 * 3600000);
  const date = `${tw.getUTCFullYear()}-${(tw.getUTCMonth() + 1).toString().padStart(2, "0")}-${tw.getUTCDate().toString().padStart(2, "0")}`;
  const time = `${tw.getUTCHours().toString().padStart(2, "0")}:${tw.getUTCMinutes().toString().padStart(2, "0")}`;

  const carParts = [d?.vehicle_type, d?.vehicle_color].filter(Boolean).join(" · ");

  return {
    id: data.id,
    from: data.from_location,
    to: data.to_location,
    date,
    departureTime: time,
    price: data.price,
    availableSeats: data.available_seats,
    totalSeats: data.total_seats,
    co2Saved: Number(data.co2_saved),
    meetingPoint: data.meeting_point || "",
    carModel: carParts || "未填寫",
    notes: data.notes || "",
    driver: {
      id: d?.id ?? "",
      name: d?.name ?? "未知",
      avatar: (d?.name ?? "?")[0],
      company: d?.company ?? "",
      rating: Number(d?.rating ?? 0),
      totalRides: d?.rating_count ?? 0,
    },
  };
}

// ── Get Driver Reviews ───────────────────────────────────────────────────────

export interface DriverReviewItem {
  id: string;
  passengerName: string;  // 匿名：姓氏 + **
  rating: number;
  tags: string[];
  comment: string;
  relativeTime: string;
}

function anonymizeName(name: string): string {
  if (!name) return "用戶**";
  return name[0] + "**";
}

function relativeTime(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "今天";
  if (days < 7) return `${days} 天前`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} 週前`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} 個月前`;
  return `${Math.floor(months / 12)} 年前`;
}

export async function getDriverReviews(
  driverId: string,
  limit = 10
): Promise<DriverReviewItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select(`
      id, rating, tags, comment, created_at,
      reviewer:users!reviewer_id(name)
    `)
    .eq("reviewee_id", driverId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((r) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reviewer = r.reviewer as any;
    return {
      id: r.id,
      passengerName: anonymizeName(reviewer?.name ?? ""),
      rating: r.rating,
      tags: r.tags ?? [],
      comment: r.comment ?? "",
      relativeTime: relativeTime(r.created_at),
    };
  });
}

// ── Create Ride ──────────────────────────────────────────────────────────────

export interface CreateRideInput {
  from: string;
  to: string;
  date: string;      // YYYY-MM-DD
  time: string;      // HH:MM
  seats: string;
  price: string;
  meetingPoint: string;
  notes: string;
  recurring: boolean;
}

export interface CreateRideResult {
  success: boolean;
  rideId?: string;
  error?: string;
}

export async function createRide(input: CreateRideInput): Promise<CreateRideResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "未登入" };
  }

  // 組合出發時間（本地時間帶台灣時區）
  const departureTime = new Date(`${input.date}T${input.time}:00+08:00`).toISOString();
  const seats = parseInt(input.seats);
  const price = parseInt(input.price);

  const ride: RideInsert = {
    driver_id: user.id,
    from_location: input.from,
    to_location: input.to,
    departure_time: departureTime,
    price,
    total_seats: seats,
    available_seats: seats,
    is_recurring: input.recurring,
    recurring_days: null,
    co2_saved: parseFloat((seats * 0.6).toFixed(2)),
    meeting_point: input.meetingPoint || null,
    notes: input.notes || null,
    status: "active",
  };

  const { data, error } = await supabase
    .from("rides")
    .insert(ride)
    .select("id")
    .single();

  if (error) {
    console.error("createRide error:", error);
    return { success: false, error: error.message };
  }

  return { success: true, rideId: data.id };
}
