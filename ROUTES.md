# Sentinel — Route Map

## Pages

| Route | Description | Auth |
|---|---|---|
| `/` | Landing page | Public |
| `/app` | Dashboard (canonical) | Protected, Pro-gated |
| `/app/app` | Dashboard alias (same component as `/app`) | Protected, Pro-gated |
| `/app/pricing` | Pricing / upgrade page (canonical) | **Public** (excluded from middleware) |
| `/pricing` | Pricing alias (renders same as `/app/pricing`) | Public |
| `/app/app/pricing` | Pricing alias (same component as `/app/pricing`) | Public |

## API Routes

| Route | Method | Description | Auth |
|---|---|---|---|
| `/api/stripe/checkout` | POST | Creates Stripe Checkout session | Signed-in required |
| `/api/stripe/webhook` | POST | Handles Stripe webhook events | Public (signature-verified) |
| `/api/runs` | GET | List user's runs | Protected |
| `/api/runs` | POST | Create a new reality check run | Protected, Pro-gated |
| `/api/user/status` | GET | Returns `{ isPro: boolean }` | Protected |

## Middleware Logic

The Clerk middleware protects `/app/app(.*)` and `/app$` but **explicitly excludes** `/app/pricing(.*)` so the pricing page is accessible to logged-out users.

## Stripe Redirect URLs

| Event | URL |
|---|---|
| Checkout success | `/app/app?checkout=success` |
| Checkout cancel | `/app/pricing?checkout=cancel` |
