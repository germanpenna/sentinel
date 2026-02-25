# Sentinel — Reality Check for CEOs

Executive Decision Intelligence SaaS. Get a board-level reality check in under 60 seconds.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript** + **Tailwind CSS**
- **Clerk** — Authentication
- **Stripe** — Payments (Checkout)
- **Prisma 5** — ORM
- **Supabase Postgres** — Database
- **Zod** — Request validation
- **Vercel** — Deployment

## Architecture

```
sentinel/
├── app/
│   ├── page.tsx              # Landing page (public)
│   ├── app/
│   │   ├── page.tsx          # Dashboard (canonical, protected, Pro-gated)
│   │   └── pricing/
│   │       └── page.tsx      # Pricing page (public under /app)
│   ├── pricing/
│   │   └── page.tsx          # Pricing alias (public)
│   └── api/
│       ├── runs/route.ts     # GET list runs, POST create run
│       ├── stripe/
│       │   ├── checkout/route.ts  # POST create checkout session
│       │   └── webhook/route.ts   # POST Stripe webhook handler
│       └── user/
│           └── status/route.ts    # GET user Pro status
├── lib/
│   ├── reality-check.ts      # Deterministic scoring engine
│   ├── prisma.ts             # Prisma client singleton
│   └── stripe.ts             # Stripe client
├── components/
│   ├── Hero.tsx               # Landing hero section
│   └── ...                    # UI components
├── prisma/
│   └── schema.prisma          # Database schema
├── middleware.ts               # Clerk auth middleware
├── .env.example                # Environment variable template
└── ROUTES.md                   # Route documentation
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set environment variables

Copy `.env.example` to `.env` and fill in your values:
(A file `env.example` is included just in case the original file is hidden)

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Supabase Postgres connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRICE_ID` | Stripe Price ID for Sentinel Pro (recommended for production) |
| `NEXT_PUBLIC_APP_URL` | Your app URL (e.g., `http://localhost:3000`) |

### 3. Set up the database

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Run locally

```bash
npm run dev
```

### 5. Test Stripe locally

Install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and forward webhooks:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook signing secret it prints and set it as `STRIPE_WEBHOOK_SECRET` in `.env`.

For production checkout configuration, set `STRIPE_PRICE_ID` to a Stripe Price (for example `price_...`).  
If `STRIPE_PRICE_ID` is not set, the app falls back to inline `price_data` (`$49`) for local/demo usage.

## Routes

See [ROUTES.md](./ROUTES.md) for the full route map.

| Route | Description |
|---|---|
| `/` | Landing page |
| `/app/app` | Dashboard (canonical, protected, Pro-gated) |
| `/app` | Dashboard alias (renders same component as `/app/app`) |
| `/app/pricing` | Pricing page — canonical (**Public**, excluded from auth middleware) |
| `/pricing` | Pricing alias |
| `/api/stripe/checkout` | POST — Creates Stripe Checkout session |
| `/api/stripe/webhook` | POST — Handles Stripe webhook events |
| `/api/runs` | GET — List runs, POST — Create a new run |
| `/api/user/status` | GET — Current user Pro status |

## Reality Check Engine

The core analysis engine (`lib/reality-check.ts`) is **fully deterministic** — no LLM calls, no randomness.

### Scoring Algorithm (spec-aligned)

| Parameter | Value |
|---|---|
| Base score | 85 |
| Per contradiction | −15 (max 3 contradictions) |
| Per missing signal | −10 (max 2 missing signals) |
| Score range | [0, 100] |

### Risk Thresholds

| Risk Level | Score Range |
|---|---|
| 🟢 GREEN | ≥ 75 |
| 🟡 YELLOW | 50 – 74 |
| 🔴 RED | < 50 |

### How Determinism Works

- Inputs (objective + KPIs + industry) are hashed to a stable integer
- Keyword matching selects relevant contradictions/missing signals from curated pools
- Advisory findings fill remaining slots using the hash for variety
- Same input → same output, every time

## How It Works

1. User visits the landing page (`/`)
2. Signs up / logs in via Clerk
3. Accesses `/app/app` — sees Pro gate if not paid
4. Clicks "Upgrade to Pro" → Stripe Checkout ($49 one-time)
5. After payment, webhook sets `isPro = true` in DB
6. User is redirected to `/app/app?checkout=success`
7. Dashboard polls `/api/user/status` until Pro status is confirmed
8. Pro users can run "Reality Checks" — fill objective + 3 KPIs + industry
9. Results show Sentinel Score, contradictions, missing signals, and 24h actions

## How to Test End-to-End

1. Sign up or log in via Clerk on `/`
2. Navigate to `/app/pricing` and click "Upgrade to Pro"
3. Complete Stripe Checkout (use test card `4242 4242 4242 4242`)
4. After payment, you are redirected to `/app/app?checkout=success`
5. The dashboard polls until `isPro` flips to `true`
6. Fill in an objective + 3 KPIs and click "Run Reality Check"
7. See the Sentinel Score, contradictions, missing signals, and 24h actions
8. Verify the run appears in "Decision History"

## Judge Verification Notes

For fast evaluator setup (Stripe CLI flow, expected logs, and a short manual verification checklist), see [JUDGE_NOTES.md](./JUDGE_NOTES.md).

Implementation hardening already included:

- Webhook idempotency via persisted `StripeEvent` IDs.
- DB index on `Run(userId, createdAt DESC)` for dashboard history queries.
- Fail-fast Stripe env checks (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`).
- Lightweight in-memory rate limit on `POST /api/runs` (10 requests/min per user).

Submission prep checklist:

- See [SUBMISSION_CHECKLIST.md](./SUBMISSION_CHECKLIST.md) for judge-friendly artifact packaging in supported formats.

## Vercel Deployment

1. Push to GitHub
2. Import project in Vercel
3. Set all environment variables in Vercel dashboard
4. Configure Stripe webhook endpoint: `https://your-domain.vercel.app/api/stripe/webhook`
5. Deploy!
