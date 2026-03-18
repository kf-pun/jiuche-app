"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";

export interface PersonalEsgStats {
  co2Total: number;           // kg，完成行程加總
  totalRides: number;         // 完成趟數
  monthlyData: { month: string; kg: number }[]; // 近 6 個月
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  company: string;
  kg: number;
  rides: number;
  isMe: boolean;
}

export interface CompanyEsgData {
  company: string;
  totalKg: number;
  totalRides: number;
  activeUsers: number;
  leaderboard: LeaderboardEntry[];
}

// 取近 6 個月（含當月）的 key / label
function getLast6Months(): { key: string; label: string }[] {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      key:   `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: `${d.getMonth() + 1}月`,
    };
  });
}

/** 個人 ESG 統計（從 completed bookings 動態計算） */
export async function getPersonalEsgStats(): Promise<PersonalEsgStats> {
  const supabase = await createClient();
  const service  = await createServiceClient();

  const { data: { user } } = await supabase.auth.getUser();
  const months = getLast6Months();
  const emptyMonthly = months.map((m) => ({ month: m.label, kg: 0 }));
  if (!user) return { co2Total: 0, totalRides: 0, monthlyData: emptyMonthly };

  const { data: bookings } = await service
    .from("bookings")
    .select("seats, created_at")
    .eq("passenger_id", user.id)
    .eq("status", "completed");

  if (!bookings || bookings.length === 0) {
    return { co2Total: 0, totalRides: 0, monthlyData: emptyMonthly };
  }

  const co2Total  = parseFloat(bookings.reduce((s, b) => s + b.seats * 0.6, 0).toFixed(1));
  const totalRides = bookings.length;

  // 月份聚合（台灣時區）
  const monthlyMap: Record<string, number> = {};
  bookings.forEach((b) => {
    const d = new Date(b.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap[key] = (monthlyMap[key] ?? 0) + b.seats * 0.6;
  });

  const monthlyData = months.map((m) => ({
    month: m.label,
    kg:    parseFloat((monthlyMap[m.key] ?? 0).toFixed(1)),
  }));

  return { co2Total, totalRides, monthlyData };
}

/** 企業排行榜（同公司用戶，從 completed bookings 動態計算） */
export async function getCompanyEsgData(): Promise<CompanyEsgData | null> {
  const supabase = await createClient();
  const service  = await createServiceClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // 取當前用戶的公司
  const { data: me } = await service
    .from("users")
    .select("company")
    .eq("id", user.id)
    .single();

  if (!me?.company) return null;

  // 取同公司所有用戶（最多 50 人）
  const { data: companyUsers } = await service
    .from("users")
    .select("id, name, company")
    .eq("company", me.company)
    .limit(50);

  if (!companyUsers || companyUsers.length === 0) return null;

  const userIds = companyUsers.map((u) => u.id);

  // 取這些用戶的 completed bookings
  const { data: bookings } = await service
    .from("bookings")
    .select("passenger_id, seats")
    .in("passenger_id", userIds)
    .eq("status", "completed");

  // 彙整每人統計
  const statsMap: Record<string, { kg: number; rides: number }> = {};
  (bookings ?? []).forEach((b) => {
    if (!statsMap[b.passenger_id]) statsMap[b.passenger_id] = { kg: 0, rides: 0 };
    statsMap[b.passenger_id].kg     += b.seats * 0.6;
    statsMap[b.passenger_id].rides  += 1;
  });

  const leaderboard: LeaderboardEntry[] = companyUsers
    .map((u) => ({
      rank:    0,
      userId:  u.id,
      name:    u.name,
      company: u.company,
      kg:      parseFloat((statsMap[u.id]?.kg    ?? 0).toFixed(1)),
      rides:   statsMap[u.id]?.rides ?? 0,
      isMe:    u.id === user.id,
    }))
    .sort((a, b) => b.kg - a.kg)
    .map((u, i) => ({ ...u, rank: i + 1 }));

  const totalKg     = parseFloat(leaderboard.reduce((s, u) => s + u.kg, 0).toFixed(1));
  const totalRides  = leaderboard.reduce((s, u) => s + u.rides, 0);
  const activeUsers = leaderboard.filter((u) => u.rides > 0).length;

  return { company: me.company, totalKg, totalRides, activeUsers, leaderboard };
}
