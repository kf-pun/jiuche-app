"use server";

import { createServiceClient } from "@/lib/supabase/server";

const DEV_PASSWORD = "jiuche_dev_2026";

function getDevEmail(phone: string): string {
  return `dev_${phone.replace(/\D/g, "")}@jiuche.dev`;
}

function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return "+886" + digits.slice(1);
  return "+" + digits;
}

/**
 * DEV_MODE: 確保指定電話號碼的 dev user 存在於 auth.users（已 email_confirm）
 * 若 public.users 中已有此電話的舊帳號（可能為 anonymous auth），則將 email 認證遷移到該帳號，
 * 並刪除無對應資料的孤兒 dev auth user。
 * 回傳 email/password 供 client 端 signInWithPassword 使用。
 */
export async function ensureDevUser(phone: string): Promise<{ email: string; password: string }> {
  const supabase = await createServiceClient();
  const email = getDevEmail(phone);
  const e164 = toE164(phone);

  // Check if a public.users record already exists for this phone (may be under old auth ID)
  const { data: existingPublicUser } = await supabase
    .from("users")
    .select("id")
    .eq("phone", e164)
    .single();

  if (existingPublicUser) {
    // Existing user: ensure email auth is linked to their real account
    // List auth users to find any orphan dev email user
    const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    const devEmailUser = users?.find((u) => u.email === email);

    if (devEmailUser && devEmailUser.id !== existingPublicUser.id) {
      // Orphan dev email user exists (no public.users record) — delete it
      await supabase.auth.admin.deleteUser(devEmailUser.id);
    }

    // Link email/password auth to the real existing user
    await supabase.auth.admin.updateUserById(existingPublicUser.id, {
      email,
      password: DEV_PASSWORD,
      email_confirm: true,
    });
  } else {
    // New user: create a fresh dev auth account (idempotent — ignores "already exists")
    await supabase.auth.admin.createUser({
      email,
      password: DEV_PASSWORD,
      email_confirm: true,
    });
  }

  return { email, password: DEV_PASSWORD };
}
