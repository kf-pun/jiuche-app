"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import PlacesAutocomplete from "@/components/PlacesAutocomplete";
import GpsButton from "@/components/GpsButton";
import dynamic from "next/dynamic";
const MapPickerModal = dynamic(() => import("@/components/MapPickerModal"), { ssr: false });

const SEARCH_HISTORY_KEY = "jiuche_search_guest";

function getSearchHistoryKey(): string {
  try {
    const raw = localStorage.getItem("jiuche_user");
    if (raw) {
      const u = JSON.parse(raw);
      if (u?.id) return `jiuche_search_${u.id}`;
    }
  } catch { /* ignore */ }
  return SEARCH_HISTORY_KEY;
}

function loadSearchHistory(): string[] {
  try {
    const raw = localStorage.getItem(getSearchHistoryKey());
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch { return []; }
}

function saveSearchTerm(term: string) {
  try {
    const key = getSearchHistoryKey();
    const existing = loadSearchHistory().filter((t) => t !== term);
    const updated = [term, ...existing].slice(0, 5);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch { /* ignore */ }
}

export default function Home() {
  const router = useRouter();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [mapTarget, setMapTarget] = useState<"from" | "to" | null>(null);

  useEffect(() => {
    setSearchHistory(loadSearchHistory());
    // 在 client 端設定今天日期（避免 SSR UTC 與台灣本地時間不同步）
    setDate(new Date().toLocaleDateString("en-CA"));
  }, []);

  const handleSearch = () => {
    if (!from || !to || !date) return;
    setLoading(true);
    saveSearchTerm(`${from} → ${to}`);
    setTimeout(() => {
      router.push(`/results?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}`);
    }, 1000);
  };

  const today = date; // 與 date state 同步，確保 min 不早於今天

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-500 px-6 pt-14 pb-10">
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-white/20 rounded-xl p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-4.97 4.97-4.97 13.03 0 18 4.97-4.97 4.97-13.03 0-18z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c4.97 4.97 4.97 13.03 0 18" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide">揪車 JiuChe</h1>
            <p className="text-green-100 text-xs">減碳共乘平台</p>
          </div>
        </div>
        <p className="text-white/80 text-sm mt-4">
          找順路夥伴，一起上班，一起減碳 🌿
        </p>
      </div>

      {/* Search Card */}
      <div className="px-4 -mt-5">
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <h2 className="text-gray-700 font-semibold text-base mb-4">搜尋共乘行程</h2>

          {/* From */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-500" htmlFor="home-from">出發地</label>
              <div className="flex items-center gap-1.5">
                <GpsButton onLocate={setFrom} />
                <button
                  onClick={() => setMapTarget("from")}
                  aria-label="用地圖選取出發地"
                  className="flex items-center gap-1 bg-green-50 text-green-600 border border-green-200 rounded-lg px-2 py-1 text-xs hover:bg-green-100 active:scale-95 transition-all"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  地圖
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 focus-within:border-green-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v3M12 19v3M2 12h3M19 12h3" />
              </svg>
              <PlacesAutocomplete
                id="home-from"
                value={from}
                onChange={setFrom}
                placeholder="輸入出發地點"
                aria-label="出發地"
                className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
              />
            </div>
          </div>

          {/* Swap button */}
          <div className="flex items-center justify-center my-1 mb-3">
            <div className="flex-1 border-t border-dashed border-gray-200" />
            <button
              onClick={() => { const tmp = from; setFrom(to); setTo(tmp); }}
              aria-label="互換出發地與目的地"
              title="互換起迄"
              className="mx-3 bg-green-50 rounded-full p-1.5 hover:bg-green-100 active:scale-90 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
            <div className="flex-1 border-t border-dashed border-gray-200" />
          </div>

          {/* To */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-500" htmlFor="home-to">目的地</label>
              <button
                onClick={() => setMapTarget("to")}
                aria-label="用地圖選取目的地"
                className="flex items-center gap-1 bg-green-50 text-green-600 border border-green-200 rounded-lg px-2 py-1 text-xs hover:bg-green-100 active:scale-95 transition-all"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                地圖
              </button>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 focus-within:border-green-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
              </svg>
              <PlacesAutocomplete
                id="home-to"
                value={to}
                onChange={setTo}
                placeholder="輸入目的地點"
                aria-label="目的地"
                className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
              />
            </div>
          </div>

          {/* Date */}
          <div className="mb-5">
            <label className="text-xs font-medium text-gray-500 mb-1 block">出發日期</label>
            <div
              className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 focus-within:border-green-400 transition-colors cursor-pointer"
              onClick={() => dateInputRef.current?.showPicker?.()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <input
                ref={dateInputRef}
                type="date"
                value={date}
                min={today}
                onChange={(e) => setDate(e.target.value)}
                className="flex-1 bg-transparent text-sm text-gray-700 outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={!from || !to || !date || loading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold py-4 rounded-xl shadow-md hover:from-green-700 hover:to-emerald-600 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                搜尋中...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                尋找順路車
              </>
            )}
          </button>
        </div>
      </div>

      {/* 搜尋歷史 */}
      {searchHistory.length > 0 && (
        <div className="px-4 mt-5 mb-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">最近搜尋</p>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((h) => {
              const parts = h.split(" → ");
              return (
                <button
                  key={h}
                  onClick={() => {
                    if (parts.length === 2) { setFrom(parts[0]); setTo(parts[1]); }
                  }}
                  className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full hover:bg-green-50 hover:text-green-700 transition-colors"
                >
                  {h}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Suggestions */}
      <div className="px-4 mt-5 mb-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">熱門路線</p>
        <div className="flex flex-col gap-2">
          {[
            { from: "捷運市政府站", to: "南港軟體園區", co2: "1.2 kg" },
            { from: "板橋車站", to: "內湖科學園區", co2: "2.4 kg" },
            { from: "新店總督府", to: "信義計畫區", co2: "1.8 kg" },
          ].map((route, i) => (
            <button
              key={i}
              onClick={() => {
                setFrom(route.from);
                setTo(route.to);
              }}
              className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100 hover:border-green-300 active:scale-98 transition-all text-left"
            >
              <div className="bg-green-50 rounded-lg p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 font-medium truncate">{route.from} → {route.to}</p>
                <p className="text-xs text-green-500 mt-0.5">可減碳 {route.co2} CO₂</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* ESG Banner */}
      <div className="px-4 mb-6">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 flex items-center gap-4">
          <div className="bg-white/20 rounded-xl p-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 0 1 2 2v1a2 2 0 0 0 2 2 2 2 0 0 1 2 2v2.945" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 3.935V5.5A2.5 2.5 0 0 0 10.5 8h.5a2 2 0 0 1 2 2 2 2 0 0 0 4 0 2 2 0 0 1 2-2h1.064" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-sm">本月企業減碳成果</p>
            <p className="text-white/80 text-xs mt-0.5">共完成 <span className="font-bold text-white">1,247</span> 趟共乘</p>
            <p className="text-white/80 text-xs">減少排放 <span className="font-bold text-white">2.3 噸</span> CO₂</p>
          </div>
        </div>
      </div>

      {/* Map Picker Modal */}
      {mapTarget && (
        <MapPickerModal
          onClose={() => setMapTarget(null)}
          onConfirm={(addr) => {
            if (mapTarget === "from") setFrom(addr);
            else setTo(addr);
            setMapTarget(null);
          }}
        />
      )}
    </div>
  );
}
