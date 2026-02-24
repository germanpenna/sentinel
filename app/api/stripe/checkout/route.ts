import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { getOrCreateUser } from "@/lib/user";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let stripeCustomerId = user.stripeCustomerId;

    const stripe = getStripe();

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { clerkUserId: user.clerkUserId },
      });
      stripeCustomerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId },
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Sentinel Pro",
              description: "Unlimited Reality Checks for your executive decisions",
            },
            unit_amount: 4900,
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/app?checkout=success`,
      cancel_url: `${appUrl}/app/pricing?checkout=cancel`,
      metadata: { clerkUserId: user.clerkUserId },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
