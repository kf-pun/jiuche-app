"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { createClient } from "@/lib/supabase/client";
import { ensureDevUser } from "@/actions/auth";

const DEV_MODE = true; // Prototype mode: OTP bypass enabled (use 888888)
const DEV_OTP = "888888";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

type Step = "phone" | "otp";

function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return "+886" + digits.slice(1);
  return "+" + digits;
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const supabase = createClient();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("error") === "oauth_failed") {
      setError("Google 登入失敗，請重試或使用手機號碼登入");
    }
  }, [searchParams]);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${SITE_URL}/auth/callback` },
    });
    // 瀏覽器會跳轉，不需要 setGoogleLoading(false)
  };

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((c) => { if (c <= 1) { clearInterval(timer); return 0; } return c - 1; });
    }, 1000);
  };

  const handleSendOtp = async () => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 9) { setError("請輸入正確的手機號碼"); return; }
    setError("");

    if (DEV_MODE) {
      setStep("otp");
      return;
    }

    setSending(true);
    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: toE164(phone),
    });
    setSending(false);
    if (otpError) { setError("發送失敗，請稍後再試"); return; }
    setStep("otp");
    startCountdown();
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) { setError("請輸入完整的驗證碼"); return; }
    setError("");
    setVerifying(true);

    let userId: string;

    if (DEV_MODE) {
      if (code !== DEV_OTP) {
        setVerifying(false);
        setError(`開發模式：請輸入 ${DEV_OTP}`);
        setOtp(["", "", "", "", "", ""]);
        document.getElementById("otp-0")?.focus();
        return;
      }
      // 確保此電話號碼對應的 dev user 存在（固定 email/password，同一手機永遠同一個 auth user）
      const { email, password } = await ensureDevUser(phone);
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError || !signInData.user) {
        setVerifying(false);
        setError("開發模式登入失敗，請稍後再試");
        return;
      }
      userId = signInData.user.id;
    } else {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        phone: toE164(phone),
        token: code,
        type: "sms",
      });
      if (verifyError || !data.user) {
        setVerifying(false);
        setError("驗證碼錯誤，請重新輸入");
        setOtp(["", "", "", "", "", ""]);
        document.getElementById("otp-0")?.focus();
        return;
      }
      userId = data.user.id;
    }

    // 判斷新 / 舊用戶
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .single();

    setVerifying(false);

    if (existingUser) {
      await refreshUser();
      const redirect = sessionStorage.getItem("jiuche_redirect") || "/";
      sessionStorage.removeItem("jiuche_redirect");
      router.replace(redirect);
    } else {
      router.replace(`/auth/register?phone=${encodeURIComponent(phone)}`);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-gradient-to-b from-green-600 to-emerald-500">
      {/* Top branding */}
      <div className="flex flex-col items-center pt-16 pb-10 px-6 relative">
        <button
          onClick={() => router.back()}
          aria-label="返回上一頁"
          className="absolute top-4 left-0 flex items-center gap-1 text-white/70 text-sm hover:text-white transition-colors px-2 py-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          返回
        </button>
        <div className="bg-white/20 rounded-2xl p-4 mb-4">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-4.97 4.97-4.97 13.03 0 18 4.97-4.97 4.97-13.03 0-18z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c4.97 4.97 4.97 13.03 0 18" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white">揪車</h1>
        <p className="text-white/70 text-sm mt-1">減碳共乘平台</p>
      </div>

      {/* Card */}
      <div className="flex-1 bg-gray-50 rounded-t-3xl px-5 pt-8 pb-10">
        {step === "phone" && (
          <>
            <h2 className="text-xl font-bold text-gray-800 mb-1">登入 / 註冊</h2>
            <p className="text-gray-400 text-sm mb-6">輸入手機號碼，我們將發送驗證碼</p>

            <div className="mb-4">
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">手機號碼</label>
              <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3.5 border border-gray-200 focus-within:border-green-400 shadow-sm transition-colors">
                <span className="text-gray-400 text-sm font-medium flex-shrink-0">🇹🇼 +886</span>
                <div className="w-px h-5 bg-gray-200" />
                <input
                  type="tel"
                  placeholder="0912-345-678"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                  autoFocus
                />
              </div>
              {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
            </div>

            <button
              onClick={handleSendOtp}
              disabled={sending || !phone}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold py-4 rounded-xl shadow disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              {sending ? (
                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>發送中...</>
              ) : "發送驗證碼"}
            </button>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 border-t border-gray-200" />
              <span className="text-xs text-gray-400">或使用社群帳號登入</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full bg-white border border-gray-200 rounded-xl py-3.5 flex items-center justify-center gap-3 shadow-sm hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-60"
            >
              {googleLoading ? (
                <svg className="w-5 h-5 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              <span className="text-sm font-medium text-gray-700">
                {googleLoading ? "連線中…" : "使用 Google 帳號繼續"}
              </span>
            </button>

            <p className="text-center text-xs text-gray-400 mt-6">
              登入即表示您同意{" "}
              <button onClick={() => alert("服務條款功能開發中，敬請期待。")} className="text-green-600 underline">服務條款</button>
              {" "}與{" "}
              <button onClick={() => alert("隱私政策功能開發中，敬請期待。")} className="text-green-600 underline">隱私政策</button>
            </p>
          </>
        )}

        {step === "otp" && (
          <>
            <button onClick={() => { setStep("phone"); setOtp(["","","","","",""]); setError(""); }} className="flex items-center gap-1.5 text-gray-400 text-sm mb-6 hover:text-gray-600 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              返回
            </button>

            <h2 className="text-xl font-bold text-gray-800 mb-1">輸入驗證碼</h2>
            {DEV_MODE ? (
              <p className="text-amber-500 text-xs font-medium mb-6 bg-amber-50 px-3 py-2 rounded-lg">
                🛠 開發模式 — 輸入 {DEV_OTP}
              </p>
            ) : (
              <p className="text-gray-400 text-sm mb-6">已發送簡訊至 {phone}</p>
            )}

            <div className="flex justify-between gap-2 mb-4">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className={`w-11 h-12 text-center text-xl font-bold rounded-xl border-2 outline-none transition-colors ${
                    digit ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 bg-white text-gray-700"
                  } focus:border-green-400`}
                />
              ))}
            </div>

            {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

            <button
              onClick={handleVerify}
              disabled={verifying || otp.join("").length < 6}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold py-4 rounded-xl shadow disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95 transition-all mb-4"
            >
              {verifying ? (
                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>驗證中...</>
              ) : "確認登入"}
            </button>

            <button
              disabled={countdown > 0}
              onClick={handleSendOtp}
              className="w-full text-center text-sm text-gray-400 disabled:text-gray-300"
            >
              {countdown > 0 ? `重新發送（${countdown}s）` : "重新發送驗證碼"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
