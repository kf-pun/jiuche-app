"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/authContext";

export default function BottomNav() {
  const pathname = usePathname();
  const { user, isLoggedIn } = useAuth();

  // 登入/註冊頁不顯示 BottomNav
  if (pathname.startsWith("/auth")) return null;

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex items-center h-16">

        {/* 搜尋 */}
        <Link href="/" className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${isActive("/") ? "text-green-600" : "text-gray-400 hover:text-green-500"}`}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <span className="text-xs font-medium">搜尋</span>
        </Link>

        {/* 我的行程 */}
        <Link href="/trips" className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${isActive("/trips") ? "text-green-600" : "text-gray-400 hover:text-green-500"}`}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="text-xs font-medium">行程</span>
        </Link>

        {/* 中間發布 FAB */}
        <div className="flex flex-col items-center justify-center flex-shrink-0 px-3 -mt-5">
          <Link
            href="/post"
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 ${
              isActive("/post")
                ? "bg-emerald-600 shadow-emerald-300"
                : "bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-300 hover:shadow-green-400"
            }`}
          >
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </Link>
          <span className="text-xs font-medium text-green-600 mt-0.5">發布</span>
        </div>

        {/* ESG */}
        <Link href="/esg" className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${isActive("/esg") ? "text-green-600" : "text-gray-400 hover:text-green-500"}`}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-4.97 4.97-4.97 13.03 0 18 4.97-4.97 4.97-13.03 0-18z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c4.97 4.97 4.97 13.03 0 18" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18" />
          </svg>
          <span className="text-xs font-medium">ESG</span>
        </Link>

        {/* 個人 */}
        <Link href="/profile" className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${isActive("/profile") ? "text-green-600" : "text-gray-400 hover:text-green-500"}`}>
          {isLoggedIn && user ? (
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isActive("/profile") ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"}`}>
              {user.avatar}
            </div>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )}
          <span className="text-xs font-medium">我的</span>
        </Link>

      </div>
    </nav>
  );
}
