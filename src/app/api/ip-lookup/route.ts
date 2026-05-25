import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const ip = req.nextUrl.searchParams.get("ip") || "";
  const url = ip ? `https://ipapi.co/${ip}/json/` : "https://ipapi.co/json/";

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "unified-tools-pro/1.0" },
      next: { revalidate: 60 },
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: true, reason: "Failed to fetch IP data" }, { status: 500 });
  }
}
