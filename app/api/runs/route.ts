import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import { runRealityCheck } from "@/lib/reality-check";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const runs = await prisma.run.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({ runs });
  } catch (error) {
    console.error("GET /api/runs error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user.isPro) {
      return NextResponse.json(
        { error: "Pro subscription required. Upgrade at /pricing." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { objective, kpis, industry } = body;

    if (
      !objective ||
      !Array.isArray(kpis) ||
      kpis.length < 3 ||
      !kpis.every((k: { name?: string }) => k.name)
    ) {
      return NextResponse.json(
        { error: "Objective and 3 KPIs with names are required." },
        { status: 400 }
      );
    }

    const result = runRealityCheck({ objective, kpis, industry });

    const run = await prisma.run.create({
      data: {
        userId: user.id,
        score: result.score,
        riskLevel: result.riskLevel,
        warningsJson: {
          contradictions: result.contradictions,
          missingSignals: result.missingSignals,
        },
        evidenceJson: {
          objective,
          kpis,
          industry: industry ?? "Other",
          actions24h: result.actions24h,
          executiveSummary: result.executiveSummary,
          confidence: result.confidence,
        },
      },
    });

    return NextResponse.json({ run });
  } catch (error) {
    console.error("POST /api/runs error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
