"use client";

import { useAuth } from "@/lib/authContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

function StatCard({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div className="flex-1 bg-white/15 rounded-2xl p-3 text-center">
      <p className="text-white text-xl font-bold">{value}<span className="text-sm font-medium ml-0.5">{unit}</span></p>
      <p className="text-white/70 text-xs mt-0.5">{label}</p>
    </div>
  );
}

function MenuItem({ icon, label, value, href, danger, onClick }: {
  icon: React.ReactNode; label: string; value?: string; href?: string; danger?: boolean; onClick?: () => void;
}) {
  const cls = `flex items-center gap-3 py-3.5 border-b border-gray-50 last:border-0 ${danger ? "text-red-400" : "text-gray-700"} hover:opacity-70 transition-opacity`;
  const inner = (
    <>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${danger ? "bg-red-50" : "bg-green-50"}`}>
        {icon}
      </div>
      <span className={`flex-1 text-sm font-medium ${danger ? "text-red-400" : "text-gray-700"}`}>{label}</span>
      {value && <span className="text-xs text-gray-400">{value}</span>}
      <svg className={`w-4 h-4 ${danger ? "text-red-300" : "text-gray-300"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </>
  );
  if (href) return <Link href={href} className={cls}>{inner}</Link>;
  return <button onClick={onClick} className={`w-full text-left ${cls}`}>{inner}</button>;
}

export default function ProfilePage() {
  const { user, isLoggedIn, logout } = useAuth();
  const router = useRouter();

  if (!isLoggedIn || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full px-6 py-20">
        <div className="bg-green-50 rounded-full w-20 h-20 flex items-center justify-center mb-5">
          <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <p className="text-gray-700 font-semibold text-lg">尚未登入</p>
        <p className="text-gray-400 text-sm mt-1 mb-6">登入後可查看個人資料與錢包</p>
        <Link href="/auth/login" className="w-full max-w-xs bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold py-4 rounded-xl text-center block shadow active:scale-95 transition-all">
          立即登入
        </Link>
      </div>
    );
  }

  const handleLogout = () => { logout(); router.replace("/"); };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-500 px-5 pt-12 pb-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white text-2xl font-bold">
            {user.avatar}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">{user.name}</h1>
            <p className="text-white/70 text-sm">{user.company}</p>
            <p className="text-white/60 text-xs mt-0.5">{user.phone}</p>
          </div>
          <Link href="/profile/edit" className="bg-white/20 rounded-xl p-2 hover:bg-white/30 transition-colors">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Link>
        </div>

        {/* Stats */}
        <div className="flex gap-2">
          <StatCard label="共乘次數" value={user.totalRides} unit="趟" />
          <StatCard label="累計減碳" value={user.co2Total.toFixed(1)} unit="kg" />
          <StatCard label="評分" value={user.rating.toFixed(1)} unit="★" />
        </div>
      </div>

      {/* Balance card */}
      <div className="px-4 -mt-3">
        <Link href="/wallet" className="block bg-white rounded-2xl shadow-md p-4 border border-gray-100 hover:border-green-300 transition-colors active:scale-[0.99]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-400">揪車錢包餘額</p>
                <p className="text-xl font-bold text-gray-800">NT$ {user.balance.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-green-50 text-green-600 text-xs font-semibold px-3 py-1.5 rounded-lg">儲值</span>
              <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      </div>

      {/* Menu sections */}
      <div className="px-4 mt-4 flex flex-col gap-3 mb-6">
        {/* 我的設定 */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">帳號設定</p>
          <MenuItem
            href="/profile/edit"
            label="個人資料"
            value={user.name}
            icon={<svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>}
          />
          {user.isDriver && (
            <MenuItem
              href="/profile/car"
              label="車輛資訊"
              value={`${user.carModel} ${user.carPlate}`}
              icon={<svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4c-1.5 0-6 1.5-6 7v4l-1 2h14l-1-2v-4c0-5.5-4.5-7-6-7zm0 0V2m-2 16v1a2 2 0 004 0v-1"/></svg>}
            />
          )}
          <MenuItem
            href="/wallet"
            label="我的錢包"
            value={`NT$ ${user.balance.toLocaleString()}`}
            icon={<svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>}
          />
          <MenuItem
            href="/notifications"
            label="通知設定"
            icon={<svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>}
          />
        </div>

        {/* ESG */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">環保貢獻</p>
          <MenuItem
            href="/esg"
            label="ESG 減碳儀表板"
            value={`${user.co2Total.toFixed(1)} kg 累計`}
            icon={<svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-4.97 4.97-4.97 13.03 0 18 4.97-4.97 4.97-13.03 0-18z"/><path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18"/></svg>}
          />
        </div>

        {/* 其他 */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">其他</p>
          <MenuItem label="客服中心" icon={<svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/></svg>} />
          <MenuItem label="關於揪車" icon={<svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>} />
          <MenuItem label="登出" danger onClick={handleLogout}
            icon={<svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>}
          />
        </div>

        {/* Version */}
        <p className="text-center text-xs text-gray-300">揪車 JiuChe v0.1.0 Prototype</p>
      </div>
    </div>
  );
}
