"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";

export interface AdminNotificationLog {
  id: string;
  title: string;
  body: string;
  targetLabel: string;   // 「全體用戶」/ 「[公司名] 員工」/ 「[用戶姓名]」
  recipientCount: number;
  createdAt: string;
}

export interface AdminNotificationLogsResult {
  logs: AdminNotificationLog[];
  total: number;
}

export async function getAdminNotificationLogs(params: {
  dateFrom?: string;
  dateTo?: string;
  page?: number;
}): Promise<AdminNotificationLogsResult> {
  const service = await createServiceClient();
  const page = params.page ?? 1;
  const pageSize = 20;
  const from = (page - 1) * pageSize;

  // 只取管理員手動發送的（created_by IS NOT NULL），
  // 以 title + body + created_by + created_at 分組統計人數
  // 由於 Supabase 不直接支援 GROUP BY，我們先取所有管理員通知，前端再聚合
  let query = service
    .from("notifications")
    .select("id, title, body, created_at, user_id, created_by, target_label", { count: "exact" })
    .not("created_by", "is", null)
    .order("created_at", { ascending: false });

  if (params.dateFrom) query = query.gte("created_at", params.dateFrom);
  if (params.dateTo) {
    const end = new Date(params.dateTo);
    end.setDate(end.getDate() + 1);
    query = query.lt("created_at", end.toISOString().slice(0, 10));
  }

  const { data } = await query;

  // 以 (title, body, created_at 前 16 碼) 聚合：同一次群發的通知只顯示一筆
  const seen = new Map<string, AdminNotificationLog>();
  for (const n of (data ?? [])) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec = n as any;
    const key = `${rec.title}||${rec.body}||${rec.created_at.slice(0, 16)}`;
    if (seen.has(key)) {
      seen.get(key)!.recipientCount++;
    } else {
      seen.set(key, {
        id: rec.id,
        title: rec.title,
        body: rec.body,
        targetLabel: rec.target_label ?? "全體用戶",
        recipientCount: 1,
        createdAt: rec.created_at,
      });
    }
  }

  const all = Array.from(seen.values());
  const paginated = all.slice(from, from + pageSize);

  return { logs: paginated, total: all.length };
}

export async function getCompanies(): Promise<string[]> {
  const service = await createServiceClient();
  const { data } = await service
    .from("users")
    .select("company")
    .eq("is_active", true)
    .neq("role", "admin");

  const companies = [...new Set((data ?? []).map((u) => u.company).filter(Boolean))];
  return companies as string[];
}

export async function searchUsersForNotification(
  query: string
): Promise<{ id: string; name: string; company: string }[]> {
  if (!query.trim()) return [];
  const service = await createServiceClient();
  const { data } = await service
    .from("users")
    .select("id, name, company")
    .ilike("name", `%${query}%`)
    .eq("is_active", true)
    .neq("role", "admin")
    .limit(5);
  return (data ?? []).map((u) => ({ id: u.id, name: u.name, company: u.company }));
}

export async function countTargetUsers(params: {
  targetType: "all" | "company" | "user";
  company?: string;
  userId?: string;
}): Promise<number> {
  const service = await createServiceClient();
  if (params.targetType === "user") return params.userId ? 1 : 0;

  let query = service
    .from("users")
    .select("id", { count: "exact" })
    .eq("is_active", true)
    .neq("role", "admin");

  if (params.targetType === "company" && params.company) {
    query = query.eq("company", params.company);
  }

  const { count } = await query;
  return count ?? 0;
}

export interface SendAnnouncementResult {
  success: boolean;
  count?: number;
  error?: string;
}

export async function sendSystemAnnouncement(params: {
  targetType: "all" | "company" | "user";
  company?: string;
  userId?: string;
  title: string;
  body: string;
}): Promise<SendAnnouncementResult> {
  const service = await createServiceClient();
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "未登入" };

  // 取目標用戶 ID 清單
  let userIds: string[] = [];

  if (params.targetType === "user" && params.userId) {
    userIds = [params.userId];
  } else {
    let query = service
      .from("users")
      .select("id")
      .eq("is_active", true)
      .neq("role", "admin");

    if (params.targetType === "company" && params.company) {
      query = query.eq("company", params.company);
    }

    const { data } = await query;
    userIds = (data ?? []).map((u) => u.id);
  }

  if (userIds.length === 0) return { success: false, error: "找不到目標用戶" };

  // 計算 target_label
  let targetLabel = "全體用戶";
  if (params.targetType === "company" && params.company) {
    targetLabel = `${params.company} 員工`;
  } else if (params.targetType === "user") {
    const { data: u } = await service.from("users").select("name").eq("id", params.userId!).single();
    targetLabel = u?.name ?? "指定用戶";
  }

  // 分批寫入（每批 100 筆）
  const batchSize = 100;
  for (let i = 0; i < userIds.length; i += batchSize) {
    const batch = userIds.slice(i, i + batchSize).map((uid) => ({
      user_id: uid,
      type: "system" as const,
      title: params.title,
      body: params.body,
      is_read: false,
      reference_id: null,
      created_by: user.id,
      target_label: targetLabel,
    }));
    await service.from("notifications").insert(batch);
  }

  return { success: true, count: userIds.length };
}
