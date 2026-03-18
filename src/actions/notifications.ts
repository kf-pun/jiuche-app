"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";

export type NotiUIType = "booking" | "payment" | "reminder" | "review" | "esg" | "system";

export interface NotificationItem {
  id: string;
  type: NotiUIType;
  title: string;
  body: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

// DB type → UI type
const DB_TO_UI_TYPE: Record<string, NotiUIType> = {
  booking_confirmed: "booking",
  ride_reminder:     "reminder",
  payment:           "payment",
  review:            "review",
  esg:               "esg",
  system:            "system",
};

// 依 type + reference_id 推導跳轉連結
function deriveLink(type: string, referenceId: string | null): string | undefined {
  switch (type) {
    case "booking_confirmed": return "/trips";
    case "ride_reminder":     return "/trips";
    case "payment":           return "/wallet";
    case "review":            return referenceId ? `/trips/${referenceId}/review` : "/trips";
    case "esg":               return "/esg";
    default:                  return undefined;
  }
}

export async function getUserNotifications(): Promise<NotificationItem[]> {
  const supabase = await createClient();
  const service  = await createServiceClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await service
    .from("notifications")
    .select("id, type, title, body, is_read, reference_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("getUserNotifications error:", error);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((n) => ({
    id:        n.id,
    type:      DB_TO_UI_TYPE[n.type] ?? "system",
    title:     n.title,
    body:      n.body,
    isRead:    n.is_read,
    link:      deriveLink(n.type, n.reference_id),
    createdAt: n.created_at,
  }));
}

export async function markNotificationRead(id: string): Promise<void> {
  const supabase = await createClient();
  const service  = await createServiceClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await service
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id)
    .eq("user_id", user.id);
}

export async function markAllNotificationsRead(): Promise<void> {
  const supabase = await createClient();
  const service  = await createServiceClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await service
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);
}

export async function getUnreadNotificationCount(): Promise<number> {
  const supabase = await createClient();
  const service  = await createServiceClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await service
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) return 0;
  return count ?? 0;
}
