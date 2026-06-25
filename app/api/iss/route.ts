import { NextResponse } from "next/server";
import { fetchIss } from "@/lib/iss";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await fetchIss();
  if (!data) {
    return NextResponse.json({ error: "ISS unavailable" }, { status: 502 });
  }
  return NextResponse.json(data);
}
