"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/authContext";

const AUTH_TIMEOUT_MS = 8000;

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!authLoading) { setTimedOut(false); return; }
    const timer = setTimeout(() => setTimedOut(true), AUTH_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [authLoading]);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      sessionStorage.setItem("jiuche_redirect", pathname);
      router.replace("/auth/login");
    }
  }, [isLoggedIn, authLoading, router, pathname]);

  if (authLoading) {
    if (timedOut) {
      return (
        <div className="flex flex-col items-center justify-center min-h-full py-20 px-6 text-center">
          <svg className="w-10 h-10 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-gray-500 font-medium">連線逾時</p>
          <p className="text-gray-400 text-sm mt-1">無法驗證登入狀態，請重試</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 bg-green-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl active:scale-95 transition-all"
          >
            重新整理
          </button>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center min-h-full py-20">
        <svg className="w-6 h-6 animate-spin text-green-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!isLoggedIn) return null;

  return <>{children}</>;
}
