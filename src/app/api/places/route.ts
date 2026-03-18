import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const input = req.nextUrl.searchParams.get("input");
  if (!input || input.trim().length < 2) {
    return NextResponse.json([]);
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    // 未設定 API Key：靜默降級，回傳空陣列
    return NextResponse.json([]);
  }

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/place/autocomplete/json");
    url.searchParams.set("input", input);
    url.searchParams.set("key", apiKey);
    url.searchParams.set("language", "zh-TW");
    url.searchParams.set("components", "country:tw");

    const res = await fetch(url.toString(), { next: { revalidate: 0 } });
    const json = await res.json();

    if (json.status !== "OK" && json.status !== "ZERO_RESULTS") {
      return NextResponse.json([]);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const suggestions = (json.predictions ?? []).slice(0, 5).map((p: any) => ({
      description: p.description as string,
      mainText: (p.structured_formatting?.main_text ?? p.description) as string,
      secondaryText: (p.structured_formatting?.secondary_text ?? "") as string,
    }));

    return NextResponse.json(suggestions);
  } catch {
    return NextResponse.json([]);
  }
}
