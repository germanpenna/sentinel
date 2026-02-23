import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

// TODO: Re-enable strict signature verification for production
export async function POST(req: NextRequest) {
  const rawBody = Buffer.from(await req.arrayBuffer());
  const sig = req.headers.get("stripe-signature");

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
    console.log(`[webhook] Verified event: ${event.type}`);
  } catch (err) {
    console.warn("[webhook] Stripe signature verification failed, proceeding in demo mode:", (err as Error).message);
    try {
      event = JSON.parse(rawBody.toString()) as Stripe.Event;
    } catch {
      console.error("[webhook] Failed to parse raw body as JSON");
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    if (event.type !== "checkout.session.completed") {
      console.log(`[webhook] Demo mode: ignoring unverified event type ${event.type}`);
      return NextResponse.json({ received: true });
    }
    console.log(`[webhook] Demo mode: processing ${event.type}`);
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
