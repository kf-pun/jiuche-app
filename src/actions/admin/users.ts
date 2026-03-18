"use server";

import { createServiceClient } from "@/lib/supabase/server";

export interface AdminUserItem {
  id: string;
  name: string;
  phone: string;
  company: string;
  role: "user" | "admin";
  isActive: boolean;
  balance: number;
  rating: number;
  ratingCount: number;
  createdAt: string;
}

export interface AdminUserListResult {
  users: AdminUserItem[];
  total: number;
}

export async function getAdminUsers(params: {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
}): Promise<AdminUserListResult> {
  const service = await createServiceClient();
  const page = params.page ?? 1;
  const pageSize = 20;
  const from = (page - 1) * pageSize;

  let query = service
    .from("users")
    .select("id, name, phone, company, role, is_active, balance, rating, rating_count, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);

  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,phone.ilike.%${params.search}%`);
  }
  if (params.role && params.role !== "all") {
    query = query.eq("role", params.role);
  }
  if (params.status === "active") {
    query = query.eq("is_active", true);
  } else if (params.status === "suspended") {
    query = query.eq("is_active", false);
  }

  const { data, count } = await query;
  return {
    users: (data ?? []).map((u) => ({
      id: u.id,
      name: u.name,
      phone: u.phone,
      company: u.company,
      role: u.role as "user" | "admin",
      isActive: u.is_active,
      balance: u.balance,
      rating: Number(u.rating),
      ratingCount: u.rating_count,
      createdAt: u.created_at,
    })),
    total: count ?? 0,
  };
}

export interface AdminUserDetail extends AdminUserItem {
  isDriver: boolean;
  vehicleType: string | null;
  co2Total: number;
}

export async function getAdminUserDetail(userId: string): Promise<AdminUserDetail | null> {
  const service = await createServiceClient();
  const { data } = await service
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (!data) return null;
  return {
    id: data.id,
    name: data.name,
    phone: data.phone,
    company: data.company,
    role: data.role as "user" | "admin",
    isActive: data.is_active,
    balance: data.balance,
    rating: Number(data.rating),
    ratingCount: data.rating_count,
    createdAt: data.created_at,
    isDriver: data.is_driver,
    vehicleType: data.vehicle_type,
    co2Total: data.co2_total,
  };
}

export interface UserBookingTabItem {
  id: string; from: string; to: string; seats: number; totalPrice: number; status: string; createdAt: string;
}
export async function getUserBookingsAdmin(userId: string): Promise<UserBookingTabItem[]> {
  const service = await createServiceClient();
  const { data } = await service
    .from("bookings")
    .select("id, seats, total_price, status, created_at, ride:rides(from_location, to_location)")
    .eq("passenger_id", userId)
    .order("created_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((b: any) => ({
    id: b.id, from: b.ride?.from_location ?? "—", to: b.ride?.to_location ?? "—",
    seats: b.seats, totalPrice: b.total_price, status: b.status, createdAt: b.created_at,
  }));
}

export interface UserRideTabItem {
  id: string; from: string; to: string; departureTime: string; price: number; totalSeats: number; availableSeats: number; status: string;
}
export async function getUserRidesAdmin(userId: string): Promise<UserRideTabItem[]> {
  const service = await createServiceClient();
  const { data } = await service
    .from("rides")
    .select("id, from_location, to_location, departure_time, price, total_seats, available_seats, status")
    .eq("driver_id", userId)
    .order("departure_time", { ascending: false });

  return (data ?? []).map((r) => ({
    id: r.id, from: r.from_location, to: r.to_location,
    departureTime: r.departure_time, price: r.price,
    totalSeats: r.total_seats, availableSeats: r.available_seats, status: r.status,
  }));
}

export interface UserTxTabItem {
  id: string; type: string; amount: number; description: string; createdAt: string;
}
export async function getUserTransactionsAdmin(userId: string): Promise<UserTxTabItem[]> {
  const service = await createServiceClient();
  const { data } = await service
    .from("wallet_transactions")
    .select("id, type, amount, description, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((t) => ({
    id: t.id, type: t.type, amount: t.amount, description: t.description, createdAt: t.created_at,
  }));
}

export interface AdjustBalanceResult { success: boolean; error?: string; newBalance?: number }
export async function adjustUserBalance(userId: string, amount: number, note: string): Promise<AdjustBalanceResult> {
  const service = await createServiceClient();
  const { data: user } = await service.from("users").select("balance").eq("id", userId).single();
  if (!user) return { success: false, error: "找不到用戶" };

  const newBalance = user.balance + amount;
  await service.from("wallet_transactions").insert({
    user_id: userId, type: "adjustment", amount, description: note, reference_id: null,
  });
  await service.from("users").update({ balance: newBalance }).eq("id", userId);
  return { success: true, newBalance };
}

export interface ToggleActiveResult { success: boolean; error?: string }
export async function toggleUserActive(userId: string, isActive: boolean): Promise<ToggleActiveResult> {
  const service = await createServiceClient();
  const { error } = await service.from("users").update({ is_active: isActive }).eq("id", userId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}
