"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { useEffect, useState } from "react";
import { getUnreadNotificationCount } from "@/actions/notifications";

export default function BottomNav() {
  const pathname = usePathname();
  const { user, isLoggedIn } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isLoggedIn) { setUnreadCount(0); return; }
    getUnreadNotificationCount().then(setUnreadCount);
  }, [isLoggedIn, pathname]);

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

        {/* 通知 */}
        <Link href="/notifications" className={`relative flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${isActive("/notifications") ? "text-green-600" : "text-gray-400 hover:text-green-500"}`}>
          <div className="relative">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            {unreadCount > 0 && (
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            )}
          </div>
          <span className="text-xs font-medium">通知</span>
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
