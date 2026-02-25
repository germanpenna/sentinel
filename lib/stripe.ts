import Stripe from "stripe";
import { getRequiredEnv } from "@/lib/env";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const stripeSecretKey = getRequiredEnv("STRIPE_SECRET_KEY");
    _stripe = new Stripe(stripeSecretKey, {
      typescript: true,
    });
  }
  return _stripe;
}
