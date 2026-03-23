"use client";

import { useState } from "react";

interface GpsButtonProps {
  onLocate: (address: string, lat: number, lng: number) => void;
}

export default function GpsButton({ onLocate }: GpsButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");

  const handleClick = () => {
    if (!navigator.geolocation) {
      setState("error");
      return;
    }

    setState("loading");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`/api/geocode?lat=${latitude}&lng=${longitude}`);
          const data = await res.json();
          if (data.address) {
            onLocate(data.address, latitude, longitude);
            setState("idle");
          } else {
            setState("error");
          }
        } catch {
          setState("error");
        }
      },
      () => {
        setState("error");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (state === "loading") {
    return (
      <button
        disabled
        aria-label="定位中"
        className="flex items-center gap-1 bg-green-50 text-green-500 border border-green-200 rounded-lg px-2 py-1 text-xs flex-shrink-0"
      >
        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        定位中
      </button>
    );
  }

  if (state === "error") {
    return (
      <button
        onClick={() => setState("idle")}
        title="無法取得位置，請手動輸入。點擊重試"
        aria-label="定位失敗，點擊重試"
        className="flex items-center gap-1 bg-red-50 text-red-500 border border-red-200 rounded-lg px-2 py-1 text-xs flex-shrink-0"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        失敗
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      aria-label="使用 GPS 定位出發地"
      className="flex items-center gap-1 bg-green-50 text-green-600 border border-green-200 rounded-lg px-2 py-1 text-xs flex-shrink-0 hover:bg-green-100 active:scale-95 transition-all"
    >
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
        <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        <circle cx="12" cy="12" r="8" />
      </svg>
      定位
    </button>
  );
}
