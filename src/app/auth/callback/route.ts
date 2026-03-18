import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`${origin}/auth/login?error=oauth_failed`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login`);
  }

  const supabase = await createClient();
  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError || !data.user) {
    return NextResponse.redirect(`${origin}/auth/login?error=oauth_failed`);
  }

  const userId = data.user.id;

  // 判斷新 / 舊用戶
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("id", userId)
    .single();

  if (existingUser) {
    // 舊用戶 — 導向原本目標頁（sessionStorage 無法在 server 讀取，直接導首頁）
    return NextResponse.redirect(`${origin}/`);
  } else {
    // 新用戶 — 導向註冊頁
    return NextResponse.redirect(`${origin}/auth/register`);
  }
}
