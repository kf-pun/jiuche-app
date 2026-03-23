"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

interface MapPickerModalProps {
  onConfirm: (address: string, lat: number, lng: number) => void;
  onClose: () => void;
}

// Default center: Taipei City Hall
const DEFAULT_CENTER = { lat: 25.0408, lng: 121.5676 };

export default function MapPickerModal({ onConfirm, onClose }: MapPickerModalProps) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [mapState, setMapState] = useState<"loading" | "ready" | "error">("loading");
  const [address, setAddress] = useState("");
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [searching, setSearching] = useState(false);

  const reverseGeocode = useCallback((lat: number, lng: number) => {
    if (!geocoderRef.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      geocoderRef.current!.geocode({ location: { lat, lng }, region: "TW" }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          setAddress(results[0].formatted_address);
        }
      });
    }, 500);
  }, []);

  // Search an address text → geocode → move marker
  const handleSearch = useCallback(() => {
    const query = searchInputRef.current?.value.trim();
    if (!query || !geocoderRef.current || !mapRef.current || !markerRef.current) return;
    setSearching(true);
    geocoderRef.current.geocode({ address: query, region: "TW" }, (results, status) => {
      setSearching(false);
      if (status === "OK" && results?.[0]?.geometry?.location) {
        const loc = results[0].geometry.location;
        const lat = loc.lat();
        const lng = loc.lng();
        mapRef.current!.panTo({ lat, lng });
        markerRef.current!.setPosition({ lat, lng });
        setPosition({ lat, lng });
        setAddress(results[0].formatted_address);
        if (searchInputRef.current) searchInputRef.current.value = "";
      }
    });
  }, []);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setMapState("error");
      return;
    }

    setOptions({ key: apiKey, language: "zh-TW", region: "TW" });

    Promise.all([
      importLibrary("maps"),
      importLibrary("geocoding"),
      importLibrary("marker"),
    ])
      .then(([mapsLib, geocodingLib]) => {
        if (!mapDivRef.current) return;

        const { Map } = mapsLib as google.maps.MapsLibrary;
        const { Geocoder } = geocodingLib as google.maps.GeocodingLibrary;

        const map = new Map(mapDivRef.current, {
          center: DEFAULT_CENTER,
          zoom: 14,
          disableDefaultUI: true,
          zoomControl: true,
          clickableIcons: false,
        });
        mapRef.current = map;
        geocoderRef.current = new Geocoder();

        const marker = new google.maps.Marker({
          map,
          position: DEFAULT_CENTER,
          draggable: true,
          animation: google.maps.Animation.DROP,
        });
        markerRef.current = marker;
        setPosition(DEFAULT_CENTER);
        reverseGeocode(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);

        // Click map to move pin
        map.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (!e.latLng) return;
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          marker.setPosition({ lat, lng });
          setPosition({ lat, lng });
          reverseGeocode(lat, lng);
        });

        // Drag pin to update address
        marker.addListener("dragend", () => {
          const pos = marker.getPosition();
          if (!pos) return;
          const lat = pos.lat();
          const lng = pos.lng();
          setPosition({ lat, lng });
          reverseGeocode(lat, lng);
        });

        setMapState("ready");
      })
      .catch(() => setMapState("error"));

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [reverseGeocode]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleConfirm = () => {
    if (!address || !position) return;
    onConfirm(address, position.lat, position.lng);
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end" role="dialog" aria-modal="true" aria-label="地圖選點">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Bottom sheet — constrained to app width */}
      <div className="relative w-full max-w-md mx-auto flex flex-col rounded-t-2xl overflow-hidden bg-white" style={{ height: "88vh" }}>
        {/* Search header */}
        <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            aria-label="關閉"
            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="輸入地址後按 Enter 搜尋..."
            aria-label="搜尋地點"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSearch(); } }}
            className="flex-1 h-12 text-sm text-gray-700 placeholder-gray-400 outline-none"
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            aria-label="搜尋"
            className="p-1.5 text-gray-400 hover:text-green-600 transition-colors flex-shrink-0 disabled:opacity-50"
          >
            {searching ? (
              <svg aria-hidden="true" className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            )}
          </button>
        </div>

        {/* Map area */}
        <div className="flex-1 relative overflow-hidden">
          {/* Skeleton */}
          {mapState === "loading" && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
              <svg aria-hidden="true" className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
          )}
          {/* Error */}
          {mapState === "error" && (
            <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center gap-2 text-gray-400">
              <svg aria-hidden="true" className="w-14 h-14 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <p className="text-sm font-medium">地圖無法載入</p>
              <p className="text-xs">請關閉後手動輸入地址</p>
            </div>
          )}
          {/* Map div (always rendered so ref is available) */}
          <div ref={mapDivRef} className="w-full h-full" />
        </div>

        {/* Bottom: address preview + actions */}
        <div className="flex-shrink-0 px-4 pt-3 pb-5 border-t border-gray-100 bg-white">
          <p className="text-xs text-gray-400 mb-0.5">選取地點</p>
          <p className="text-sm text-gray-700 font-medium mb-4 min-h-[20px] line-clamp-2">
            {address || "點擊地圖或拖曳大頭針選取地點"}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 active:scale-95 transition-all"
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              disabled={!address || !position}
              className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
            >
              確認地點
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
