"use server";

import { createServiceClient } from "@/lib/supabase/server";

function getMonthStart() {
  const now = new Date(new Date().toLocaleString("sv-SE", { timeZone: "Asia/Taipei" }) + "Z");
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

export interface MonthlyStats {
  totalTopup: number;
  totalPayment: number;
  totalRefund: number;
  netRevenue: number;
}

export async function getMonthlyStats(): Promise<MonthlyStats> {
  const service = await createServiceClient();
  const since = getMonthStart();

  const { data } = await service
    .from("wallet_transactions")
    .select("type, amount")
    .gte("created_at", since);

  let totalTopup = 0, totalPayment = 0, totalRefund = 0;
  (data ?? []).forEach((t) => {
    if (t.type === "topup") totalTopup += t.amount;
    if (t.type === "payment") totalPayment += Math.abs(t.amount);
    if (t.type === "refund") totalRefund += t.amount;
  });

  return {
    totalTopup,
    totalPayment,
    totalRefund,
    netRevenue: totalPayment - totalRefund,
  };
}

export interface AdminTxItem {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
}

export interface AdminTxListResult {
  transactions: AdminTxItem[];
  total: number;
}

export async function getAdminTransactions(params: {
  search?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
}): Promise<AdminTxListResult> {
  const service = await createServiceClient();
  const page = params.page ?? 1;
  const pageSize = 20;
  const from = (page - 1) * pageSize;

  let query = service
    .from("wallet_transactions")
    .select("id, user_id, type, amount, description, created_at, user:users(id, name, phone)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);

  if (params.type && params.type !== "all") {
    query = query.eq("type", params.type);
  }
  if (params.dateFrom) query = query.gte("created_at", params.dateFrom);
  if (params.dateTo) {
    const end = new Date(params.dateTo);
    end.setDate(end.getDate() + 1);
    query = query.lt("created_at", end.toISOString().slice(0, 10));
  }

  const { data, count } = await query;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let items: AdminTxItem[] = (data ?? []).map((t: any) => ({
    id: t.id,
    userId: t.user?.id ?? t.user_id,
    userName: t.user?.name ?? "—",
    userPhone: t.user?.phone ?? "—",
    type: t.type,
    amount: t.amount,
    description: t.description,
    createdAt: t.created_at,
  }));

  if (params.search) {
    const q = params.search.toLowerCase();
    items = items.filter((t) => t.userName.toLowerCase().includes(q));
  }

  return { transactions: items, total: count ?? 0 };
}

export async function getAllTransactionsForExport(params: {
  search?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<AdminTxItem[]> {
  const service = await createServiceClient();

  let query = service
    .from("wallet_transactions")
    .select("id, user_id, type, amount, description, created_at, user:users(id, name, phone)")
    .order("created_at", { ascending: false })
    .limit(5000);

  if (params.type && params.type !== "all") query = query.eq("type", params.type);
  if (params.dateFrom) query = query.gte("created_at", params.dateFrom);
  if (params.dateTo) {
    const end = new Date(params.dateTo);
    end.setDate(end.getDate() + 1);
    query = query.lt("created_at", end.toISOString().slice(0, 10));
  }

  const { data } = await query;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let items: AdminTxItem[] = (data ?? []).map((t: any) => ({
    id: t.id,
    userId: t.user?.id ?? t.user_id,
    userName: t.user?.name ?? "—",
    userPhone: t.user?.phone ?? "—",
    type: t.type,
    amount: t.amount,
    description: t.description,
    createdAt: t.created_at,
  }));

  if (params.search) {
    const q = params.search.toLowerCase();
    items = items.filter((t) => t.userName.toLowerCase().includes(q));
  }

  return items;
}

export interface UserSearchResult { id: string; name: string; phone: string; balance: number }
export async function searchUsersForCompensation(query: string): Promise<UserSearchResult[]> {
  if (!query.trim()) return [];
  const service = await createServiceClient();
  const { data } = await service
    .from("users")
    .select("id, name, phone, balance")
    .ilike("name", `%${query}%`)
    .limit(5);
  return (data ?? []).map((u) => ({ id: u.id, name: u.name, phone: u.phone, balance: u.balance }));
}

export interface CompensationResult { success: boolean; error?: string }
export async function createCompensation(
  userId: string,
  amount: number,
  note: string
): Promise<CompensationResult> {
  const service = await createServiceClient();
  const { data: user } = await service.from("users").select("balance").eq("id", userId).single();
  if (!user) return { success: false, error: "找不到用戶" };

  await service.from("wallet_transactions").insert({
    user_id: userId, type: "adjustment", amount, description: note, reference_id: null,
  });
  await service.from("users").update({ balance: user.balance + amount }).eq("id", userId);
  return { success: true };
}
