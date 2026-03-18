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
