"use server";

import { createServiceClient } from "@/lib/supabase/server";

export interface EsgStats {
  totalCo2: number;
  totalRides: number;
  totalPassengers: number;
  reducedCars: number;
}

export async function getEsgStats(year: number): Promise<EsgStats> {
  const service = await createServiceClient();

  const yearStart = new Date(`${year}-01-01T00:00:00+08:00`).toISOString();
  const yearEnd   = new Date(`${year}-12-31T23:59:59+08:00`).toISOString();

  const [ridesRes, bookingsRes] = await Promise.all([
    service
      .from("rides")
      .select("co2_saved")
      .eq("status", "completed")
      .gte("departure_time", yearStart)
      .lte("departure_time", yearEnd),
    service
      .from("bookings")
      .select("id")
      .eq("status", "completed")
      .gte("created_at", yearStart)
      .lte("created_at", yearEnd),
  ]);

  const totalCo2 = (ridesRes.data ?? []).reduce((s, r) => s + Number(r.co2_saved ?? 0), 0);
  const totalRides = (ridesRes.data ?? []).length;
  const totalPassengers = (bookingsRes.data ?? []).length;

  return {
    totalCo2: parseFloat(totalCo2.toFixed(1)),
    totalRides,
    totalPassengers,
    reducedCars: totalPassengers,
  };
}

export interface MonthlyTrendItem {
  month: string;  // "YYYY-MM"
  label: string;  // "1月"
  co2: number;
}

export async function getMonthlyTrend(year: number): Promise<MonthlyTrendItem[]> {
  const service = await createServiceClient();

  const yearStart = new Date(`${year}-01-01T00:00:00+08:00`).toISOString();
  const yearEnd   = new Date(`${year}-12-31T23:59:59+08:00`).toISOString();

  const { data } = await service
    .from("rides")
    .select("departure_time, co2_saved")
    .eq("status", "completed")
    .gte("departure_time", yearStart)
    .lte("departure_time", yearEnd);

  // GROUP BY month (台灣時區)
  const map = new Map<string, number>();
  for (const r of (data ?? [])) {
    const dt = new Date(new Date(r.departure_time).getTime() + 8 * 3600000);
    const key = `${dt.getUTCFullYear()}-${(dt.getUTCMonth() + 1).toString().padStart(2, "0")}`;
    map.set(key, (map.get(key) ?? 0) + Number(r.co2_saved ?? 0));
  }

  // 輸出近 6 個月
  const result: MonthlyTrendItem[] = [];
  const now = new Date(new Date().toLocaleString("sv-SE", { timeZone: "Asia/Taipei" }));
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
    result.push({
      month: key,
      label: `${d.getMonth() + 1}月`,
      co2: parseFloat((map.get(key) ?? 0).toFixed(1)),
    });
  }
  return result;
}

export interface CompanyRankItem {
  rank: number;
  company: string;
  tripCount: number;
  co2: number;
  grade: "A" | "B" | "C";
}

export async function getCompanyRanking(): Promise<CompanyRankItem[]> {
  const service = await createServiceClient();

  // bookings(completed) -> rides(co2_saved) + users(company of passenger)
  const { data: bookings } = await service
    .from("bookings")
    .select("id, passenger_id, ride_id, rides!inner(co2_saved)")
    .eq("status", "completed");

  if (!bookings || bookings.length === 0) return [];

  // 取所有乘客的公司
  const passengerIds = [...new Set(bookings.map((b) => b.passenger_id))];
  const { data: users } = await service
    .from("users")
    .select("id, company")
    .in("id", passengerIds);

  const companyMap = new Map<string, string>();
  (users ?? []).forEach((u) => companyMap.set(u.id, u.company ?? "未填寫"));

  // 統計各公司
  const stats = new Map<string, { trips: number; co2: number }>();
  for (const b of bookings) {
    const company = companyMap.get(b.passenger_id) ?? "未填寫";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const co2 = Number((b.rides as any)?.co2_saved ?? 0);
    const cur = stats.get(company) ?? { trips: 0, co2: 0 };
    stats.set(company, { trips: cur.trips + 1, co2: cur.co2 + co2 });
  }

  const sorted = Array.from(stats.entries())
    .sort((a, b) => b[1].co2 - a[1].co2)
    .slice(0, 10);

  return sorted.map(([company, s], i) => ({
    rank: i + 1,
    company,
    tripCount: s.trips,
    co2: parseFloat(s.co2.toFixed(1)),
    grade: s.co2 >= 100 ? "A" : s.co2 >= 50 ? "B" : "C",
  }));
}
