"use server";

import { createServiceClient } from "@/lib/supabase/server";

// 台灣時區今日 00:00:00 的 ISO 字串
function getTodayTST() {
  const now = new Date();
  const tst = new Date(now.toLocaleString("sv-SE", { timeZone: "Asia/Taipei" }) + "Z");
  tst.setHours(0, 0, 0, 0);
  return tst.toISOString();
}

function getYesterdayTST() {
  const d = new Date(getTodayTST());
  d.setDate(d.getDate() - 1);
  return d.toISOString();
}

function get30DaysAgoTST() {
  const d = new Date(getTodayTST());
  d.setDate(d.getDate() - 29);
  return d.toISOString();
}

export interface DashboardKpi {
  todayUsers: number;
  todayRides: number;
  todayBookings: number;
  totalCo2: number;
  yesterdayUsers: number;
  yesterdayRides: number;
  yesterdayBookings: number;
}

export async function getDashboardKpi(): Promise<DashboardKpi> {
  const service = await createServiceClient();
  const today = getTodayTST();
  const yesterday = getYesterdayTST();

  const [
    { count: todayUsers },
    { count: todayRides },
    { count: todayBookings },
    { count: yesterdayUsers },
    { count: yesterdayRides },
    { count: yesterdayBookings },
    { data: co2Data },
  ] = await Promise.all([
    service.from("users").select("id", { count: "exact", head: true }).gte("created_at", today),
    service.from("rides").select("id", { count: "exact", head: true }).gte("created_at", today),
    service.from("bookings").select("id", { count: "exact", head: true }).gte("created_at", today),
    service.from("users").select("id", { count: "exact", head: true }).gte("created_at", yesterday).lt("created_at", today),
    service.from("rides").select("id", { count: "exact", head: true }).gte("created_at", yesterday).lt("created_at", today),
    service.from("bookings").select("id", { count: "exact", head: true }).gte("created_at", yesterday).lt("created_at", today),
    service.from("bookings").select("seats").eq("status", "completed"),
  ]);

  const totalCo2 = parseFloat(((co2Data ?? []).reduce((s, b) => s + b.seats * 0.6, 0)).toFixed(1));

  return {
    todayUsers:       todayUsers ?? 0,
    todayRides:       todayRides ?? 0,
    todayBookings:    todayBookings ?? 0,
    totalCo2,
    yesterdayUsers:   yesterdayUsers ?? 0,
    yesterdayRides:   yesterdayRides ?? 0,
    yesterdayBookings: yesterdayBookings ?? 0,
  };
}

export interface TrendPoint { date: string; count: number }

export async function getBookingsTrend(): Promise<TrendPoint[]> {
  const service = await createServiceClient();
  const since = get30DaysAgoTST();

  const { data } = await service
    .from("bookings")
    .select("created_at")
    .gte("created_at", since)
    .order("created_at");

  const map: Record<string, number> = {};
  // 初始化近 30 天
  for (let i = 0; i < 30; i++) {
    const d = new Date(getTodayTST());
    d.setDate(d.getDate() - (29 - i));
    const key = d.toLocaleDateString("sv-SE", { timeZone: "Asia/Taipei" });
    map[key] = 0;
  }
  (data ?? []).forEach((b) => {
    const key = new Date(b.created_at).toLocaleDateString("sv-SE", { timeZone: "Asia/Taipei" });
    if (key in map) map[key]++;
  });

  return Object.entries(map).map(([date, count]) => ({ date, count }));
}

export interface LatestBookingItem {
  id: string;
  passengerName: string;
  from: string;
  to: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

export async function getLatestBookings(): Promise<LatestBookingItem[]> {
  const service = await createServiceClient();
  const { data } = await service
    .from("bookings")
    .select("id, total_price, status, created_at, ride:rides(from_location, to_location), passenger:users(name)")
    .order("created_at", { ascending: false })
    .limit(5);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((b: any) => ({
    id: b.id,
    passengerName: b.passenger?.name ?? "—",
    from: b.ride?.from_location ?? "—",
    to: b.ride?.to_location ?? "—",
    totalPrice: b.total_price,
    status: b.status,
    createdAt: b.created_at,
  }));
}

export interface LatestUserItem {
  id: string;
  name: string;
  company: string;
  balance: number;
  createdAt: string;
}

export async function getLatestUsers(): Promise<LatestUserItem[]> {
  const service = await createServiceClient();
  const { data } = await service
    .from("users")
    .select("id, name, company, balance, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  return (data ?? []).map((u) => ({
    id: u.id,
    name: u.name,
    company: u.company,
    balance: u.balance,
    createdAt: u.created_at,
  }));
}
