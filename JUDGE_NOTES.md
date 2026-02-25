# Judge Notes

This file is a reviewer quick-start for validating the end-to-end Pro upgrade and Reality Check flow.

## Canonical Routes

- Dashboard: `/app/app`
- Pricing: `/app/pricing`
- Checkout success redirect: `/app/app?checkout=success`
- Checkout cancel redirect: `/app/pricing?checkout=cancel`

## Environment Checklist

Required:

- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL`

Recommended for production:

- `STRIPE_PRICE_ID` (if absent, checkout uses inline `$49` fallback)

## Local Stripe Verification

1. Start app: `npm run dev`
2. Forward webhooks:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

3. Put printed `whsec_...` value into `STRIPE_WEBHOOK_SECRET`.
4. Sign in, open `/app/pricing`, click `Upgrade to Pro`.
5. Complete checkout with `4242 4242 4242 4242`.
6. Confirm redirect to `/app/app?checkout=success`.
7. Confirm Pro status is active and a Reality Check can be executed.

## Signals to Confirm in Logs

- Webhook receives event: `[webhook] Received event: ...`
- Duplicate events are ignored: `[webhook] Skipping already-processed event: ...`
- User upgrade succeeds by Clerk ID or Stripe customer ID.

## Manual Product Checks

1. Landing CTA takes signed-in user to dashboard path `/app/app`.
2. Pricing remains public for logged-out users (`/app/pricing`).
3. `POST /api/runs` is blocked for non-Pro users, enabled after successful checkout.
4. New run appears in Decision History ordered by newest first.

## Optional Reviewer Artifacts

- Short Loom (30-60s): sign in -> upgrade -> redirect -> Pro state -> run -> history.
- Test account prepared with Pro enabled for quick gating checks.
