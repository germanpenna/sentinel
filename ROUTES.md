# Sentinel — Route Map

## Pages

| Route | Description | Auth |
|---|---|---|
| `/` | Landing page | Public |
| `/app/app` | Dashboard (canonical) | Protected, Pro-gated |
| `/app/pricing` | Pricing / upgrade page | Public |
| `/app` | Dashboard alias (renders same as `/app/app`) | Protected, Pro-gated |
| `/pricing` | Pricing alias (renders same as `/app/pricing`) | Public |

## API Routes

| Route | Method | Description | Auth |
|---|---|---|---|
| `/api/stripe/checkout` | POST | Creates Stripe Checkout session | Signed-in required |
| `/api/stripe/webhook` | POST | Handles Stripe webhook events | Public (signature-verified) |
| `/api/runs` | GET | List user's runs | Protected |
| `/api/runs` | POST | Create a new reality check run | Protected, Pro-gated |
| `/api/user/status` | GET | Returns current user's isPro status | Protected |
