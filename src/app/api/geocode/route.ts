import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get("lat");
  const lng = req.nextUrl.searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ address: null }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ address: null });
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

    // 優先取 street_address 或 premise 類型，其次 route，最後 fallback results[0]
    const priority = ["street_address", "premise", "subpremise", "route"];
    const result =
      priority.reduce<typeof json.results[0] | null>((found, type) => {
        if (found) return found;
        return json.results.find((r: { types: string[] }) => r.types.includes(type)) ?? null;
      }, null) ?? json.results[0];

    // 截到「號」，去除樓層資訊（e.g. "100號5樓" → "100號"）
    let address = result.formatted_address as string;
    const numIdx = address.indexOf("號");
    if (numIdx !== -1) address = address.slice(0, numIdx + 1);

    return NextResponse.json({ address });
  } catch {
    return NextResponse.json({ address: null });
  }
}
