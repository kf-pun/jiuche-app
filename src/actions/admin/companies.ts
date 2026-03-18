"use server";

import { createServiceClient } from "@/lib/supabase/server";

export interface CompanyItem {
  company: string;
  employeeCount: number;
  co2Total: number;
  monthlySpend: number;
  hasActiveEmployee: boolean;
}

export interface CompanyListResult {
  companies: CompanyItem[];
  total: number;
}

export async function getAdminCompanies(params: {
  search?: string;
  page?: number;
}): Promise<CompanyListResult> {
  const service = await createServiceClient();
  const page = params.page ?? 1;
  const pageSize = 20;

  // Fetch all users with a company name set
  let query = service
    .from("users")
    .select("company, co2_total, is_active")
    .neq("company", "")
    .not("company", "is", null);

  if (params.search) {
    query = query.ilike("company", `%${params.search}%`);
  }

  const { data, error } = await query;
  if (error || !data) return { companies: [], total: 0 };

  // Group by company
  const map = new Map<string, { co2Total: number; employeeCount: number; hasActive: boolean }>();
  for (const row of data) {
    const key = row.company as string;
    const existing = map.get(key) ?? { co2Total: 0, employeeCount: 0, hasActive: false };
    existing.co2Total += row.co2_total ?? 0;
    existing.employeeCount += 1;
    if (row.is_active) existing.hasActive = true;
    map.set(key, existing);
  }

  // Fetch monthly spend per company (current month payments)
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { data: txData } = await service
    .from("wallet_transactions")
    .select("user_id, amount")
    .eq("type", "payment")
    .gte("created_at", monthStart);

  // Get user → company mapping for spend calculation
  const { data: userData } = await service
    .from("users")
    .select("id, company")
    .neq("company", "")
    .not("company", "is", null);

  const userCompanyMap = new Map<string, string>();
  for (const u of userData ?? []) {
    if (u.company) userCompanyMap.set(u.id, u.company);
  }

  const spendMap = new Map<string, number>();
  for (const tx of txData ?? []) {
    const company = userCompanyMap.get(tx.user_id);
    if (!company) continue;
    spendMap.set(company, (spendMap.get(company) ?? 0) + Math.abs(tx.amount));
  }

  // Build sorted list
  const all: CompanyItem[] = Array.from(map.entries()).map(([company, stats]) => ({
    company,
    employeeCount: stats.employeeCount,
    co2Total: stats.co2Total,
    monthlySpend: spendMap.get(company) ?? 0,
    hasActiveEmployee: stats.hasActive,
  }));

  all.sort((a, b) => b.employeeCount - a.employeeCount);

  const total = all.length;
  const from = (page - 1) * pageSize;
  const companies = all.slice(from, from + pageSize);

  return { companies, total };
}

// ── Company detail ───────────────────────────────────────────

export interface CompanyEmployee {
  id: string;
  name: string;
  phone: string;
  balance: number;
  role: "user" | "admin";
  isActive: boolean;
  createdAt: string;
}

export interface CompanyDetailResult {
  company: string;
  employeeCount: number;
  co2Total: number;
  monthlySpend: number;
  employees: CompanyEmployee[];
  total: number;
}

export async function getAdminCompanyDetail(params: {
  company: string;
  page?: number;
}): Promise<CompanyDetailResult | null> {
  const service = await createServiceClient();
  const page = params.page ?? 1;
  const pageSize = 20;
  const from = (page - 1) * pageSize;

  const { data: allEmployees, error } = await service
    .from("users")
    .select("id, name, phone, balance, role, is_active, co2_total, created_at", { count: "exact" })
    .eq("company", params.company)
    .order("created_at", { ascending: false });

  if (error || !allEmployees) return null;

  const total = allEmployees.length;
  const co2Total = allEmployees.reduce((sum, u) => sum + (u.co2_total ?? 0), 0);

  // Monthly spend
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const userIds = allEmployees.map((u) => u.id);

  let monthlySpend = 0;
  if (userIds.length > 0) {
    const { data: txData } = await service
      .from("wallet_transactions")
      .select("amount")
      .in("user_id", userIds)
      .eq("type", "payment")
      .gte("created_at", monthStart);
    monthlySpend = (txData ?? []).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }

  const employees: CompanyEmployee[] = allEmployees.slice(from, from + pageSize).map((u) => ({
    id: u.id,
    name: u.name,
    phone: u.phone,
    balance: u.balance,
    role: u.role,
    isActive: u.is_active,
    createdAt: u.created_at,
  }));

  return {
    company: params.company,
    employeeCount: total,
    co2Total,
    monthlySpend,
    employees,
    total,
  };
}

// ── CSV export ───────────────────────────────────────────────

const TYPE_LABEL: Record<string, string> = {
  topup: "儲值",
  payment: "行程付款",
  refund: "退款",
  earning: "收入",
  adjustment: "手動調整",
};

export async function getCompanyExpensesCSV(company: string): Promise<string> {
  const service = await createServiceClient();

  const { data: employees } = await service
    .from("users")
    .select("id, name")
    .eq("company", company);

  if (!employees || employees.length === 0) return "";

  const userIds = employees.map((u) => u.id);
  const nameMap = new Map(employees.map((u) => [u.id, u.name]));

  const { data: txData } = await service
    .from("wallet_transactions")
    .select("user_id, type, amount, description, created_at")
    .in("user_id", userIds)
    .order("created_at", { ascending: false });

  const rows = (txData ?? []).map((tx) => {
    const date = new Date(tx.created_at).toLocaleDateString("zh-TW");
    const name = nameMap.get(tx.user_id) ?? "";
    const type = TYPE_LABEL[tx.type] ?? tx.type;
    const amount = tx.amount;
    const desc = (tx.description ?? "").replace(/,/g, "，");
    return `${date},${name},${type},${amount},${desc}`;
  });

  const header = "日期,員工姓名,類型,金額(NT$),說明";
  return "\uFEFF" + [header, ...rows].join("\n");
}
