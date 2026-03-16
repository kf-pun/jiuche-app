"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/",
    label: "搜尋",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
      </svg>
    ),
  },
  {
    href: "/trips",
    label: "我的行程",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2" />
      </svg>
    ),
  },
  {
    href: "/esg",
    label: "ESG 減碳",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-4.97 4.97-4.97 13.03 0 18 4.97-4.97 4.97-13.03 0-18z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c4.97 4.97 4.97 13.03 0 18" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex items-center h-16">
        {/* 左側兩個 nav items */}
        {navItems.slice(0, 2).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                isActive ? "text-green-600" : "text-gray-400 hover:text-green-500"
              }`}
            >
              {item.icon}
              <span className={`text-xs font-medium ${isActive ? "text-green-600" : "text-gray-400"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* 中間發布按鈕 */}
        <div className="flex flex-col items-center justify-center flex-shrink-0 px-3 -mt-5">
          <Link
            href="/post"
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 ${
              pathname === "/post"
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

        {/* 右側一個 nav item */}
        {navItems.slice(2).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                isActive ? "text-green-600" : "text-gray-400 hover:text-green-500"
              }`}
            >
              {item.icon}
              <span className={`text-xs font-medium ${isActive ? "text-green-600" : "text-gray-400"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
