import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.searchParams.get("origin");
  const destination = req.nextUrl.searchParams.get("destination");

  if (!origin || !destination) {
    return NextResponse.json({ error: "Missing origin or destination" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ route: null });
  }

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/directions/json");
    url.searchParams.set("origin", origin);
    url.searchParams.set("destination", destination);
    url.searchParams.set("mode", "driving");
    url.searchParams.set("language", "zh-TW");
    url.searchParams.set("region", "TW");
    url.searchParams.set("key", apiKey);

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    const json = await res.json();

    if (json.status !== "OK" || !json.routes?.length) {
      return NextResponse.json({ route: null });
    }

    const leg = json.routes[0].legs[0];
    return NextResponse.json({
      route: {
        distanceText: leg.distance.text as string,
        distanceValue: leg.distance.value as number, // metres
        durationText: leg.duration.text as string,
        durationValue: leg.duration.value as number, // seconds
        // Encoded polyline for drawing the route
        overviewPolyline: json.routes[0].overview_polyline.points as string,
        // Bounding box for fitting the map
        bounds: json.routes[0].bounds as {
          northeast: { lat: number; lng: number };
          southwest: { lat: number; lng: number };
        },
      },
    });
  } catch {
    return NextResponse.json({ route: null });
  }
}
