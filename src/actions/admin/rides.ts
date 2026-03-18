"use server";

import { createServiceClient } from "@/lib/supabase/server";

export interface AdminRideItem {
  id: string;
  from: string;
  to: string;
  driverName: string;
  driverId: string;
  departureTime: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  co2Saved: number;
  status: string;
}

export interface AdminRideListResult {
  rides: AdminRideItem[];
  total: number;
}

export async function getAdminRides(params: {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
}): Promise<AdminRideListResult> {
  const service = await createServiceClient();
  const page = params.page ?? 1;
  const pageSize = 20;
  const from = (page - 1) * pageSize;

  let query = service
    .from("rides")
    .select(
      "id, from_location, to_location, departure_time, price, total_seats, available_seats, co2_saved, status, driver:users(id, name)",
      { count: "exact" }
    )
    .order("departure_time", { ascending: false })
    .range(from, from + pageSize - 1);

  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }
  if (params.dateFrom) {
    query = query.gte("departure_time", params.dateFrom);
  }
  if (params.dateTo) {
    const end = new Date(params.dateTo);
    end.setDate(end.getDate() + 1);
    query = query.lt("departure_time", end.toISOString().slice(0, 10));
  }

  const { data, count } = await query;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let items: AdminRideItem[] = (data ?? []).map((r: any) => ({
    id: r.id,
    from: r.from_location,
    to: r.to_location,
    driverName: r.driver?.name ?? "—",
    driverId: r.driver?.id ?? "",
    departureTime: r.departure_time,
    price: r.price,
    totalSeats: r.total_seats,
    availableSeats: r.available_seats,
    co2Saved: Number(r.co2_saved),
    status: r.status,
  }));

  if (params.search) {
    const q = params.search.toLowerCase();
    items = items.filter(
      (r) =>
        r.from.toLowerCase().includes(q) ||
        r.to.toLowerCase().includes(q) ||
        r.driverName.toLowerCase().includes(q)
    );
  }

  return { rides: items, total: count ?? 0 };
}

export interface RidePassenger {
  bookingId: string;
  passengerId: string;
  passengerName: string;
  passengerPhone: string;
  seats: number;
  totalPrice: number;
  status: string;
}

export interface AdminRideDetail extends AdminRideItem {
  meetingPoint: string | null;
  notes: string | null;
  passengers: RidePassenger[];
}

export async function getAdminRideDetail(rideId: string): Promise<AdminRideDetail | null> {
  const service = await createServiceClient();

  const { data: ride } = await service
    .from("rides")
    .select("*, driver:users(id, name, phone)")
    .eq("id", rideId)
    .single();

  if (!ride) return null;

  const { data: bookings } = await service
    .from("bookings")
    .select("id, seats, total_price, status, passenger:users(id, name, phone)")
    .eq("ride_id", rideId)
    .order("created_at");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = ride as any;
  return {
    id: ride.id,
    from: ride.from_location,
    to: ride.to_location,
    driverName: r.driver?.name ?? "—",
    driverId: r.driver?.id ?? "",
    departureTime: ride.departure_time,
    price: ride.price,
    totalSeats: ride.total_seats,
    availableSeats: ride.available_seats,
    co2Saved: Number(ride.co2_saved),
    status: ride.status,
    meetingPoint: ride.meeting_point,
    notes: ride.notes,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    passengers: (bookings ?? []).map((b: any) => ({
      bookingId: b.id,
      passengerId: b.passenger?.id ?? "",
      passengerName: b.passenger?.name ?? "—",
      passengerPhone: b.passenger?.phone ?? "—",
      seats: b.seats,
      totalPrice: b.total_price,
      status: b.status,
    })),
  };
}

export interface ActionResult { success: boolean; error?: string }

export async function forceCancelRide(
  rideId: string,
  sendNotification: boolean
): Promise<ActionResult> {
  const service = await createServiceClient();

  // 取行程與 confirmed bookings
  const { data: ride } = await service
    .from("rides")
    .select("id, status, from_location, to_location")
    .eq("id", rideId)
    .single();

  if (!ride) return { success: false, error: "找不到行程" };
  if (ride.status !== "active") return { success: false, error: "此行程無法取消" };

  const { data: bookings } = await service
    .from("bookings")
    .select("id, passenger_id, seats, total_price")
    .eq("ride_id", rideId)
    .eq("status", "confirmed");

  // 1. 更新行程狀態
  await service.from("rides").update({ status: "cancelled" }).eq("id", rideId);

  // 2. 批次退款
  for (const b of bookings ?? []) {
    // 取消訂單
    await service.from("bookings").update({ status: "cancelled" }).eq("id", b.id);

    // 寫退款交易
    await service.from("wallet_transactions").insert({
      user_id: b.passenger_id,
      type: "refund",
      amount: b.total_price,
      description: `行程強制取消退款（${ride.from_location}→${ride.to_location}）`,
      reference_id: b.id,
    });

    // 更新餘額
    const { data: user } = await service
      .from("users")
      .select("balance")
      .eq("id", b.passenger_id)
      .single();
    if (user) {
      await service
        .from("users")
        .update({ balance: user.balance + b.total_price })
        .eq("id", b.passenger_id);
    }

    // 發通知
    if (sendNotification) {
      await service.from("notifications").insert({
        user_id: b.passenger_id,
        type: "system",
        title: "行程取消通知",
        body: `您預訂的行程（${ride.from_location}→${ride.to_location}）已被取消，NT$${b.total_price} 已退回您的揪車錢包。`,
        reference_id: b.id,
      });
    }
  }

  return { success: true };
}
