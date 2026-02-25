import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import { runRealityCheck } from "@/lib/reality-check";
import { z } from "zod";

const RunInputSchema = z.object({
  objective: z.string().min(1, "Objective is required."),
  kpis: z
    .array(
      z.object({
        name: z.string().min(1, "KPI name is required."),
        description: z.string().optional().default(""),
      })
    )
    .min(3, "At least 3 KPIs are required."),
  industry: z.string().optional().default("Other"),
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const runs = await prisma.run.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({ runs });
  } catch (error) {
    console.error("GET /api/runs error:", error);
    return NextResponse.json({ error: "Internal error", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    if (!user.isPro) {
      return NextResponse.json(
        { error: "Pro subscription required.", code: "PRO_REQUIRED", upgradeUrl: "/app/pricing" },
        { status: 402 }
      );
    }

    const body = await req.json();
    const parsed = RunInputSchema.safeParse(body);

    if (!parsed.success) {
      const messages = parsed.error.issues.map((i) => i.message);
      return NextResponse.json(
        { error: messages.join(" "), code: "VALIDATION_ERROR", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { objective, kpis, industry } = parsed.data;

    const runCount = await prisma.run.count({ where: { userId: user.id } });
    const result = runRealityCheck({ objective, kpis, industry, runIndex: runCount });

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
          boardSummary: result.boardSummary,
          confidence: result.confidence,
        },
      },
    });

    return NextResponse.json({ run });
  } catch (error) {
    console.error("POST /api/runs error:", error);
    return NextResponse.json({ error: "Internal error", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
