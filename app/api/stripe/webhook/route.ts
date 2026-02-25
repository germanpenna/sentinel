import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { MissingEnvError, getRequiredEnv } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import Stripe from "stripe";

function isStripeEventSchemaDriftError(error: unknown) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return false;
  if (error.code !== "P2022") return false;
  const column = (error.meta as { column?: string } | undefined)?.column;
  return typeof column === "string" && column.startsWith("StripeEvent.");
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  let webhookSecret: string;

  try {
    webhookSecret = getRequiredEnv("STRIPE_WEBHOOK_SECRET");
  } catch (error) {
    if (error instanceof MissingEnvError) {
      console.error(`[webhook] ${error.message}`);
      return NextResponse.json(
        { error: error.message, code: "MISSING_ENV" },
        { status: 500 }
      );
    }
    throw error;
  }

  if (!sig) {
    console.warn("[webhook] Missing stripe-signature header");
    return NextResponse.json({ error: "Missing signature", code: "MISSING_SIGNATURE" }, { status: 400 });
  }

  let event: Stripe.Event;
  const stripe = getStripe();

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      webhookSecret
    );
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature", code: "INVALID_SIGNATURE" }, { status: 400 });
  }

  console.log(`[webhook] Received event: ${event.type}`);

  try {
    const existing = await prisma.stripeEvent.findUnique({ where: { id: event.id } });
    if (existing) {
      console.log(`[webhook] Skipping already-processed event: ${event.id}`);
      return NextResponse.json({ received: true, deduplicated: true });
    }

    await prisma.stripeEvent.create({ data: { id: event.id, type: event.type } });
  } catch (error) {
    if (isStripeEventSchemaDriftError(error)) {
      console.warn(
        "[webhook] StripeEvent table is missing expected columns. Continuing without webhook deduplication for this request."
      );
    } else {
      throw error;
    }
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "invoice.paid"
  ) {
    const obj = event.data.object;
    const customerId =
      typeof obj.customer === "string" ? obj.customer : obj.customer?.toString();
    const clerkUserId =
      "metadata" in obj ? (obj.metadata?.clerkUserId ?? null) : null;

    console.log(
      `[webhook] Processing ${event.type} — customerId=${customerId}, clerkUserId=${clerkUserId}`
    );

    let updated = false;

    if (clerkUserId) {
      const result = await prisma.user.updateMany({
        where: { clerkUserId },
        data: { isPro: true },
      });
      updated = result.count > 0;
      console.log(
        `[webhook] Updated by clerkUserId=${clerkUserId}: ${result.count} row(s)`
      );
    }

    if (!updated && customerId) {
      const result = await prisma.user.updateMany({
        where: { stripeCustomerId: customerId },
        data: { isPro: true },
      });
      updated = result.count > 0;
      console.log(
        `[webhook] Updated by stripeCustomerId=${customerId}: ${result.count} row(s)`
      );
    }

    if (!updated) {
      console.warn(
        `[webhook] Could not find user to mark Pro — clerkUserId=${clerkUserId}, customerId=${customerId}`
      );
    }
  }

  return NextResponse.json({ received: true });
}
