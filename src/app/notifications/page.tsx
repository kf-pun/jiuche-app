"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/actions/notifications";
import type { NotificationItem, NotiUIType } from "@/actions/notifications";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "剛剛";
  if (minutes < 60) return `${minutes} 分鐘前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小時前`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "昨天";
  if (days < 7) return `${days} 天前`;
  return `${Math.floor(days / 7)} 週前`;
}

const typeConfig: Record<NotiUIType, { bg: string; icon: React.ReactNode }> = {
  booking: {
    bg: "bg-green-50",
    icon: <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>,
  },
  payment: {
    bg: "bg-blue-50",
    icon: <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>,
  },
  reminder: {
    bg: "bg-orange-50",
    icon: <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  },
  review: {
    bg: "bg-yellow-50",
    icon: <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>,
  },
  esg: {
    bg: "bg-emerald-50",
    icon: <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-4.97 4.97-4.97 13.03 0 18 4.97-4.97 4.97-13.03 0-18z"/><path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18"/></svg>,
  },
  system: {
    bg: "bg-gray-100",
    icon: <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  },
};

function NotificationsPage() {
  const [notis, setNotis] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserNotifications().then((data) => {
      setNotis(data);
      setLoading(false);
    });
  }, []);

  const unreadCount = notis.filter((n) => !n.isRead).length;

  const handleMarkRead = (id: string) => {
    setNotis((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    markNotificationRead(id);
  };

  const handleMarkAllRead = () => {
    setNotis((prev) => prev.map((n) => ({ ...n, isRead: true })));
    markAllNotificationsRead();
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-500 px-5 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">通知</h1>
            {unreadCount > 0 && (
              <p className="text-white/70 text-sm mt-0.5">{unreadCount} 則未讀</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="bg-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-white/30 transition-colors"
            >
              全部已讀
            </button>
          )}
        </div>
      </div>

      {/* Notification list */}
      <div className="flex-1 px-4 py-4 flex flex-col gap-2">
        {loading ? (
          <div className="flex justify-center py-16">
            <svg className="w-8 h-8 animate-spin text-green-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : notis.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
            </div>
            <p className="text-gray-500 font-medium">沒有通知</p>
          </div>
        ) : (
          notis.map((noti) => {
            const cfg = typeConfig[noti.type];
            const Inner = (
              <div
                className={`flex gap-3 p-4 rounded-2xl border transition-all ${noti.isRead ? "bg-white border-gray-100" : "bg-white border-green-200 shadow-sm"}`}
                onClick={() => handleMarkRead(noti.id)}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.bg}`}>
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold ${noti.isRead ? "text-gray-700" : "text-gray-900"}`}>{noti.title}</p>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(noti.createdAt)}</span>
                      {!noti.isRead && <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{noti.body}</p>
                </div>
              </div>
            );

            return noti.link ? (
              <Link key={noti.id} href={noti.link}>{Inner}</Link>
            ) : (
              <div key={noti.id}>{Inner}</div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function ProtectedNotificationsPage() {
  return <AuthGuard><NotificationsPage /></AuthGuard>;
}
