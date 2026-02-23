# Sentinel — Reality Check for CEOs

Executive Decision Intelligence SaaS. Get a board-level reality check in under 60 seconds.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript** + **Tailwind CSS**
- **Clerk** — Authentication
- **Stripe** — Payments (Checkout)
- **Prisma 7** — ORM
- **Supabase Postgres** — Database
- **Vercel** — Deployment

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set environment variables

Copy `.env.example` to `.env` and fill in your values:

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
| `/app` | Protected dashboard (Pro-gated) |
| `/pricing` | Pricing page with upgrade button |
| `/api/stripe/checkout` | POST — Creates Stripe Checkout session |
| `/api/stripe/webhook` | POST — Handles Stripe webhook events |
| `/api/runs` | GET — List runs, POST — Create a new run |

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
