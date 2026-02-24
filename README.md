# Sentinel — Reality Check for CEOs

Executive Decision Intelligence SaaS. Get a board-level reality check in under 60 seconds.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript** + **Tailwind CSS**
- **Clerk** — Authentication
- **Stripe** — Payments (Checkout)
- **Prisma 5** — ORM
- **Supabase Postgres** — Database
- **Vercel** — Deployment

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set environment variables

Copy `.env.example` to `.env` and fill in your values:
(A env.example file is added if .env.example is not visible)

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

## Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/app/app` | Dashboard — canonical (Protected, Pro-gated) |
| `/app/pricing` | Pricing page — canonical |
| `/app` | Dashboard alias (same as `/app/app`) |
| `/pricing` | Pricing alias (same as `/app/pricing`) |
| `/api/stripe/checkout` | POST — Creates Stripe Checkout session |
| `/api/stripe/webhook` | POST — Handles Stripe webhook events |
| `/api/runs` | GET — List runs, POST — Create a new run |
| `/api/user/status` | GET — Current user Pro status |

## How It Works

1. User visits the landing page (`/`)
2. Signs up / logs in via Clerk
3. Accesses `/app` — sees Pro gate if not paid
4. Clicks "Upgrade to Pro" → Stripe Checkout ($49 one-time)
5. After payment, webhook sets `isPro = true` in DB
6. Pro users can run "Reality Checks" and see history

## Vercel Deployment

1. Push to GitHub
2. Import project in Vercel
3. Set all environment variables in Vercel dashboard
4. Configure Stripe webhook endpoint: `https://your-domain.vercel.app/api/stripe/webhook`
5. Deploy!

## How to Test End-to-End

1. Sign up or log in via Clerk on `/`
2. Navigate to `/pricing` and click "Upgrade to Pro"
3. Complete Stripe Checkout (use test card `4242 4242 4242 4242`)
4. After payment, you are redirected to `/app?checkout=success`
5. The dashboard polls until `isPro` flips to `true`
6. Fill in an objective + 3 KPIs and click "Run Reality Check"
7. See the Sentinel Score, contradictions, missing signals, and 24h actions
8. Verify the run appears in "Recent Runs"
