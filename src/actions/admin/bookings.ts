"use server";

import { createServiceClient } from "@/lib/supabase/server";

export interface AdminBookingItem {
  id: string;
  passengerName: string;
  passengerId: string;
  from: string;
  to: string;
  seats: number;
  totalPrice: number;
  status: string;
  createdAt: string;
}

export interface AdminBookingListResult {
  bookings: AdminBookingItem[];
  total: number;
}

export async function getAdminBookings(params: {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
}): Promise<AdminBookingListResult> {
  const service = await createServiceClient();
  const page = params.page ?? 1;
  const pageSize = 20;
  const from = (page - 1) * pageSize;

  let query = service
    .from("bookings")
    .select(
      "id, seats, total_price, status, created_at, ride:rides(from_location, to_location), passenger:users(id, name)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);

  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }
  if (params.dateFrom) {
    query = query.gte("created_at", params.dateFrom);
  }
  if (params.dateTo) {
    // dateTo 加一天，涵蓋當天全天
    const end = new Date(params.dateTo);
    end.setDate(end.getDate() + 1);
    query = query.lt("created_at", end.toISOString().slice(0, 10));
  }

  const { data, count } = await query;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let items: AdminBookingItem[] = (data ?? []).map((b: any) => ({
    id: b.id,
    passengerName: b.passenger?.name ?? "—",
    passengerId: b.passenger?.id ?? "",
    from: b.ride?.from_location ?? "—",
    to: b.ride?.to_location ?? "—",
    seats: b.seats,
    totalPrice: b.total_price,
    status: b.status,
    createdAt: b.created_at,
  }));

  // 姓名搜尋（DB 端不支援 join 欄位過濾，在記憶體過濾）
  if (params.search) {
    const q = params.search.toLowerCase();
    items = items.filter(
      (b) => b.passengerName.toLowerCase().includes(q) || b.id.replace(/-/g, "").toLowerCase().includes(q)
    );
  }

  return { bookings: items, total: count ?? 0 };
}

export interface AdminBookingDetail {
  id: string;
  status: string;
  createdAt: string;
  seats: number;
  totalPrice: number;
  serviceFee: number;
  driverEarning: number;
  passengerId: string;
  passengerName: string;
  passengerPhone: string;
  driverId: string;
  driverName: string;
  from: string;
  to: string;
  departureTime: string;
  ridePrice: number;
  co2Saved: number;
  transactions: { id: string; type: string; amount: number; description: string; createdAt: string }[];
}

export async function getAdminBookingDetail(bookingId: string): Promise<AdminBookingDetail | null> {
  const service = await createServiceClient();
  const { data: b } = await service
    .from("bookings")
    .select(`
      id, seats, total_price, service_fee, status, created_at,
      ride:rides (from_location, to_location, departure_time, price, co2_saved, driver:users(id, name)),
      passenger:users (id, name, phone)
    `)
    .eq("id", bookingId)
    .single();

  if (!b) return null;

  const { data: txs } = await service
    .from("wallet_transactions")
    .select("id, type, amount, description, created_at")
    .eq("reference_id", bookingId)
    .order("created_at");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bd = b as any;
  const serviceFee = bd.service_fee ?? 0;
  return {
    id: b.id,
    status: b.status,
    createdAt: b.created_at,
    seats: b.seats,
    totalPrice: b.total_price,
    serviceFee,
    driverEarning: b.total_price - serviceFee,
    passengerId: bd.passenger?.id ?? "",
    passengerName: bd.passenger?.name ?? "—",
    passengerPhone: bd.passenger?.phone ?? "—",
    driverId: bd.ride?.driver?.id ?? "",
    driverName: bd.ride?.driver?.name ?? "—",
    from: bd.ride?.from_location ?? "—",
    to: bd.ride?.to_location ?? "—",
    departureTime: bd.ride?.departure_time ?? "",
    ridePrice: bd.ride?.price ?? 0,
    co2Saved: parseFloat((b.seats * 0.6).toFixed(1)),
    transactions: (txs ?? []).map((t) => ({
      id: t.id, type: t.type, amount: t.amount, description: t.description, createdAt: t.created_at,
    })),
  };
}

export interface ActionResult { success: boolean; error?: string }

export async function cancelBookingWithRefund(
  bookingId: string,
  sendNotification: boolean
): Promise<ActionResult> {
  const service = await createServiceClient();

  // 取 booking 資料
  const { data: booking } = await service
    .from("bookings")
    .select("id, ride_id, passenger_id, seats, total_price, status")
    .eq("id", bookingId)
    .single();

  if (!booking) return { success: false, error: "找不到訂單" };
  if (booking.status !== "confirmed") return { success: false, error: "此訂單無法取消" };

  // 1. 更新 booking 狀態
  await service.from("bookings").update({ status: "cancelled" }).eq("id", bookingId);

  // 2. 寫退款交易
  await service.from("wallet_transactions").insert({
    user_id: booking.passenger_id,
    type: "refund",
    amount: booking.total_price,
    description: `訂單取消退款 #JC${bookingId.replace(/-/g, "").slice(0, 6).toUpperCase()}`,
    reference_id: bookingId,
  });

  // 3. 更新用戶餘額
  const { data: user } = await service.from("users").select("balance").eq("id", booking.passenger_id).single();
  if (user) {
    await service.from("users").update({ balance: user.balance + booking.total_price }).eq("id", booking.passenger_id);
  }

  // 4. 還原座位
  const { data: ride } = await service.from("rides").select("available_seats").eq("id", booking.ride_id).single();
  if (ride) {
    await service.from("rides").update({ available_seats: ride.available_seats + booking.seats }).eq("id", booking.ride_id);
  }

  // 5. 發送通知（可選）
  if (sendNotification) {
    await service.from("notifications").insert({
      user_id: booking.passenger_id,
      type: "system",
      title: "訂單取消通知",
      body: `您的訂單 #JC${bookingId.replace(/-/g, "").slice(0, 6).toUpperCase()} 已取消，NT$${booking.total_price} 已退回您的揪車錢包。`,
      reference_id: bookingId,
    });
  }

  return { success: true };
}

export async function completeBooking(bookingId: string): Promise<ActionResult> {
  const service = await createServiceClient();

  const { data: booking } = await service
    .from("bookings")
    .select("id, status, total_price, service_fee, ride_id, passenger_id")
    .eq("id", bookingId)
    .single();
  if (!booking) return { success: false, error: "找不到訂單" };
  if (booking.status !== "confirmed") return { success: false, error: "此訂單無法標記完成" };

  // 取得司機 ID
  const { data: ride } = await service
    .from("rides")
    .select("driver_id")
    .eq("id", booking.ride_id)
    .single();
  if (!ride) return { success: false, error: "找不到對應行程" };

  const shortId = `#JC${bookingId.replace(/-/g, "").slice(0, 6).toUpperCase()}`;

  // 1. 更新訂單狀態
  await service.from("bookings").update({ status: "completed" }).eq("id", bookingId);

  // 2. 計算司機應得金額（總金額 - 平台服務費）
  const driverEarning = (booking.total_price ?? 0) - (booking.service_fee ?? 0);

  // 3. 寫入司機 earning 交易
  await service.from("wallet_transactions").insert({
    user_id: ride.driver_id,
    type: "earning" as const,
    amount: driverEarning,
    description: `共乘收入 ${shortId}`,
    reference_id: bookingId,
  });

  // 4. 更新司機餘額
  const { data: driver } = await service
    .from("users").select("balance").eq("id", ride.driver_id).single();
  if (driver) {
    await service
      .from("users")
      .update({ balance: driver.balance + driverEarning })
      .eq("id", ride.driver_id);
  }

  // 5. 發送司機收款通知
  await service.from("notifications").insert({
    user_id: ride.driver_id,
    type: "payment" as const,
    title: "收款通知",
    body: `訂單 ${shortId} 已完成，NT$${driverEarning} 已入帳至您的揪車錢包。`,
    reference_id: bookingId,
  });

  return { success: true };
}
