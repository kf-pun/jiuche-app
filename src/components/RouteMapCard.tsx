"use client";

import { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

interface RouteMapCardProps {
  originLat: number;
  originLng: number;
  destinationLat: number;
  destinationLng: number;
}

interface RouteInfo {
  distanceText: string;
  durationText: string;
  overviewPolyline: string;
  bounds: {
    northeast: { lat: number; lng: number };
    southwest: { lat: number; lng: number };
  };
}

export default function RouteMapCard({
  originLat,
  originLng,
  destinationLat,
  destinationLng,
}: RouteMapCardProps) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setState("error");
      return;
    }

    // Fetch route info from our proxy
    fetch(
      `/api/directions?origin=${originLat},${originLng}&destination=${destinationLat},${destinationLng}`
    )
      .then((r) => r.json())
      .then(async (data) => {
        if (!data.route) {
          setState("error");
          return;
        }

        const info: RouteInfo = data.route;
        setRouteInfo(info);

        // Load Maps JS API and render
        setOptions({ key: apiKey, language: "zh-TW", region: "TW" });
        const [mapsLib, geometryLib] = await Promise.all([
          importLibrary("maps"),
          importLibrary("geometry"),
        ]);

        if (!mapDivRef.current) return;

        const { Map } = mapsLib as google.maps.MapsLibrary;
        const { encoding } = (geometryLib as google.maps.GeometryLibrary);

        const origin = { lat: originLat, lng: originLng };
        const destination = { lat: destinationLat, lng: destinationLng };

        const map = new Map(mapDivRef.current, {
          zoom: 12,
          center: origin,
          disableDefaultUI: true,
          gestureHandling: "none",
          clickableIcons: false,
        });

        // Fit map to route bounds
        const bounds = new google.maps.LatLngBounds(
          { lat: info.bounds.southwest.lat, lng: info.bounds.southwest.lng },
          { lat: info.bounds.northeast.lat, lng: info.bounds.northeast.lng }
        );
        map.fitBounds(bounds, 24);

        // Draw route polyline
        const path = encoding.decodePath(info.overviewPolyline);
        new google.maps.Polyline({
          path,
          strokeColor: "#16a34a",
          strokeOpacity: 0.9,
          strokeWeight: 4,
          map,
        });

        // Origin marker (green)
        new google.maps.Marker({
          position: origin,
          map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#16a34a",
            fillOpacity: 1,
            strokeColor: "#fff",
            strokeWeight: 2,
          },
        });

        // Destination marker (red)
        new google.maps.Marker({
          position: destination,
          map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#dc2626",
            fillOpacity: 1,
            strokeColor: "#fff",
            strokeWeight: 2,
          },
        });

        setState("ready");
      })
      .catch(() => setState("error"));
  }, [originLat, originLng, destinationLat, destinationLng]);

  if (state === "error") return null;

  return (
    <div>
      {/* Map */}
      <div className="rounded-xl overflow-hidden shadow-sm h-[200px] relative bg-gray-100">
        {state === "loading" && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
        )}
        <div ref={mapDivRef} className="w-full h-full" />
      </div>

      {/* Distance / Duration info */}
      {routeInfo && (
        <div className="flex gap-4 text-sm text-gray-500 mt-2">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            {routeInfo.distanceText}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
            </svg>
            約 {routeInfo.durationText}
          </span>
        </div>
      )}
    </div>
  );
}
