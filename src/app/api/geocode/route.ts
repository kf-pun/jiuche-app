import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get("lat");
  const lng = req.nextUrl.searchParams.get("lng");
  const address = req.nextUrl.searchParams.get("address");

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ address: null, lat: null, lng: null });
  }

  // 正向地理編碼：address → lat/lng
  if (address) {
    try {
      const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
      url.searchParams.set("address", address);
      url.searchParams.set("key", apiKey);
      url.searchParams.set("language", "zh-TW");
      url.searchParams.set("region", "TW");

      const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
      const json = await res.json();

      if (json.status !== "OK" || !json.results?.length) {
        return NextResponse.json({ lat: null, lng: null });
      }

      const loc = json.results[0].geometry.location;
      return NextResponse.json({ lat: loc.lat as number, lng: loc.lng as number });
    } catch {
      return NextResponse.json({ lat: null, lng: null });
    }
  }

  // 反向地理編碼：lat/lng → address
  if (!lat || !lng) {
    return NextResponse.json({ address: null }, { status: 400 });
  }

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
    url.searchParams.set("latlng", `${lat},${lng}`);
    url.searchParams.set("key", apiKey);
    url.searchParams.set("language", "zh-TW");
    url.searchParams.set("region", "TW");

    const res = await fetch(url.toString(), { next: { revalidate: 0 } });
    const json = await res.json();

    if (json.status !== "OK" || !json.results?.length) {
      return NextResponse.json({ address: null });
    }

    const priority = ["street_address", "premise", "subpremise", "route"];
    const result =
      priority.reduce<typeof json.results[0] | null>((found, type) => {
        if (found) return found;
        return json.results.find((r: { types: string[] }) => r.types.includes(type)) ?? null;
      }, null) ?? json.results[0];

    let addr = result.formatted_address as string;
    const numIdx = addr.indexOf("號");
    if (numIdx !== -1) addr = addr.slice(0, numIdx + 1);

    return NextResponse.json({ address: addr });
  } catch {
    return NextResponse.json({ address: null });
  }
}
