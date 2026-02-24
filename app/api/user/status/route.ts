import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/user";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ isPro: user.isPro });
  } catch (error) {
    console.error("GET /api/user/status error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
