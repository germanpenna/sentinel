import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  console.log("[webhook] DEBUG — WEBHOOK_SECRET_DEFINED:", !!webhookSecret);
  console.log("[webhook] DEBUG — WEBHOOK_SECRET_PREFIX:", webhookSecret?.slice(0, 8) ?? "N/A");
  console.log("[webhook] DEBUG — WEBHOOK_SECRET_LENGTH:", webhookSecret?.length ?? 0);

  const rawBody = Buffer.from(await req.arrayBuffer());
  const sig = req.headers.get("stripe-signature");
  console.log("[webhook] DEBUG — SIG_HEADER_PRESENT:", !!sig);
  console.log("[webhook] DEBUG — RAW_BODY_LENGTH:", rawBody.length);

  if (!sig) {
    console.warn("[webhook] Missing stripe-signature header");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  const stripe = getStripe();

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log(`[webhook] Received event: ${event.type}`);

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
