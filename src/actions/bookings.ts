"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { BookingInsert, WalletTransactionInsert } from "@/types/database";

// ---- 我的行程用 ----

export interface TripBookingItem {
  bookingId: string;
  rideId: string;
  seats: number;
  totalPrice: number;
  status: "confirmed" | "cancelled" | "completed";
  from: string;
  to: string;
  departureTime: string; // ISO string
  co2Saved: number;
  driverName: string;
  driverAvatar: string | null;
  hasReview: boolean;
}

export interface TripRideItem {
  rideId: string;
  status: "active" | "cancelled" | "completed";
  from: string;
  to: string;
  departureTime: string; // ISO string
  price: number;
  co2Saved: number;
  bookedSeats: number;
}

export interface BookingDetailForReview {
  bookingId: string;
  from: string;
  to: string;
  departureTime: string;
  driverName: string;
  driverAvatar: string | null;
}

/** 乘客：取得當前用戶的所有預訂 */
export async function getUserBookings(): Promise<TripBookingItem[]> {
  const supabase = await createClient();
  const service = await createServiceClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await service
    .from("bookings")
    .select(`
      id, ride_id, seats, total_price, status,
      ride:rides (
        from_location, to_location, departure_time, co2_saved,
        driver:users ( name, avatar_url )
      ),
      reviews ( id )
    `)
    .eq("passenger_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("getUserBookings error:", error);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((b) => ({
    bookingId: b.id,
    rideId: b.ride_id,
    seats: b.seats,
    totalPrice: b.total_price,
    status: b.status,
    from: b.ride?.from_location ?? "",
    to: b.ride?.to_location ?? "",
    departureTime: b.ride?.departure_time ?? "",
    co2Saved: parseFloat((b.seats * 0.6).toFixed(1)),
    driverName: b.ride?.driver?.name ?? "司機",
    driverAvatar: b.ride?.driver?.avatar_url ?? null,
    hasReview: Array.isArray(b.reviews) && b.reviews.length > 0,
  }));
}

/** 司機：取得當前用戶發布的所有行程 */
export async function getUserRides(): Promise<TripRideItem[]> {
  const supabase = await createClient();
  const service = await createServiceClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await service
    .from("rides")
    .select("id, from_location, to_location, departure_time, price, total_seats, available_seats, co2_saved, status")
    .eq("driver_id", user.id)
    .order("departure_time", { ascending: false });

  if (error || !data) {
    console.error("getUserRides error:", error);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((r) => ({
    rideId: r.id,
    status: r.status,
    from: r.from_location,
    to: r.to_location,
    departureTime: r.departure_time,
    price: r.price,
    co2Saved: Number(r.co2_saved),
    bookedSeats: r.total_seats - r.available_seats,
  }));
}

/** 評價頁：根據 bookingId 取得行程基本資訊 */
export async function getBookingDetail(bookingId: string): Promise<BookingDetailForReview | null> {
  const supabase = await createClient();
  const service = await createServiceClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await service
    .from("bookings")
    .select(`
      id,
      ride:rides (
        from_location, to_location, departure_time,
        driver:users ( name, avatar_url )
      )
    `)
    .eq("id", bookingId)
    .eq("passenger_id", user.id)
    .single();

  if (error || !data) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = data as any;
  return {
    bookingId: d.id,
    from: d.ride?.from_location ?? "",
    to: d.ride?.to_location ?? "",
    departureTime: d.ride?.departure_time ?? "",
    driverName: d.ride?.driver?.name ?? "司機",
    driverAvatar: d.ride?.driver?.avatar_url ?? null,
  };
}

export interface CreateBookingResult {
  success: boolean;
  bookingId?: string;
  error?: string;
}

export async function createBooking(
  rideId: string,
  seats: number
): Promise<CreateBookingResult> {
  const supabase = await createClient();
  const service = await createServiceClient();

  // 1. 確認登入
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "未登入" };

  // 2. 取得行程（加鎖確認座位）
  const { data: ride, error: rideErr } = await service
    .from("rides")
    .select("id, price, available_seats, status")
    .eq("id", rideId)
    .single();

  if (rideErr || !ride) return { success: false, error: "找不到行程" };
  if (ride.status !== "active") return { success: false, error: "此行程已關閉" };
  if (ride.available_seats < seats) {
    return { success: false, error: `剩餘座位不足（剩 ${ride.available_seats} 席）` };
  }

  // 3. 確認用戶餘額
  const { data: userRow } = await service
    .from("users")
    .select("balance")
    .eq("id", user.id)
    .single();

  const totalPrice = ride.price * seats;
  if (!userRow || userRow.balance < totalPrice) {
    return { success: false, error: "餘額不足，請先儲值" };
  }

  // 4. 建立 booking 記錄
  const booking: BookingInsert = {
    ride_id: rideId,
    passenger_id: user.id,
    seats,
    total_price: totalPrice,
    status: "confirmed",
  };

  const { data: bookingData, error: bookingErr } = await service
    .from("bookings")
    .insert(booking)
    .select("id")
    .single();

  if (bookingErr || !bookingData) {
    console.error("createBooking insert error:", bookingErr);
    return { success: false, error: "建立訂單失敗" };
  }

  // 5. 扣除可用座位
  await service
    .from("rides")
    .update({ available_seats: ride.available_seats - seats })
    .eq("id", rideId);

  // 6. 寫入 wallet_transactions（付款）
  const tx: WalletTransactionInsert = {
    user_id: user.id,
    type: "payment",
    amount: -totalPrice,
    description: `共乘付款`,
    reference_id: bookingData.id,
  };
  await service.from("wallet_transactions").insert(tx);

  // 7. 更新用戶餘額
  await service
    .from("users")
    .update({ balance: userRow.balance - totalPrice })
    .eq("id", user.id);

  return { success: true, bookingId: bookingData.id };
}
