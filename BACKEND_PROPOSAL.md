# BACKEND_PROPOSAL.md — Sentinel (Hackathon Day 2)

You are the Lead Full-Stack Engineer. Ship a working SaaS demo end-to-end in Next.js App Router with:
- Auth (Clerk)
- Payments (Stripe Checkout)
- DB (Supabase Postgres) via Prisma
- Deployment on Vercel

CRITICAL CONSTRAINTS
- Do not change existing landing copy or structure.
- Add backend + app pages without breaking the landing.
- Keep the implementation minimal, deterministic, and demo-ready.
- Prefer the simplest working path over “best possible architecture”.

## Product requirements (demo)
Users can:
1) Visit landing page (`/`)
2) Sign up / log in (Clerk)
3) Access a protected app area (`/app`)
4) See a “Pro gate” if not paid
5) Click “Upgrade” to pay via Stripe Checkout
6) After successful payment, webhook marks user as Pro
7) Pro users can run “Reality Check” runs and see history

No multi-plan logic required. Single plan: PRO.

## Tech requirements
- Next.js 14+ App Router
- TypeScript
- Tailwind (existing)
- Prisma
- Supabase Postgres
- Stripe Checkout + Webhook
- Clerk Auth
- Vercel ready

## Repo structure (must follow)
- Landing already exists. Keep it at `/app/page.tsx`.
- Create protected app route at `/app/app/page.tsx` (yes, `/app/app` path).
- Create pricing route at `/app/pricing/page.tsx`.
- Create api routes:
  - `/app/api/stripe/checkout/route.ts`
  - `/app/api/stripe/webhook/route.ts`
  - `/app/api/runs/route.ts`

## Data model (Prisma)
Create a minimal Prisma schema:

### User
- id (uuid)
- clerkUserId (string, unique)
- email (string)
- isPro (boolean, default false)
- stripeCustomerId (string, optional)
- createdAt, updatedAt

### Run
- id (uuid)
- userId (FK to User)
- createdAt
- score (int 0..100)
- riskLevel ("GREEN" | "YELLOW" | "RED")
- warningsJson (json)
- evidenceJson (json)

## App behavior
### Auth
- Use Clerk for auth.
- Protect `/app/app` and all `/api/*` that need user context.
- Add a simple header component showing:
  - Logo (Sentinel)
  - Login/Logout button
  - Link to /app/app when logged in

### Stripe payments (Checkout)
- Use Stripe Checkout Session for PRO subscription (recurring monthly is OK; if easier, use one-time payment).
- API: POST `/api/stripe/checkout`
  - Requires auth (must have Clerk user)
  - Creates Stripe customer if missing
  - Creates Checkout session
  - Returns session URL
- Success URL: `/app/app?checkout=success`
- Cancel URL: `/pricing?checkout=cancel`

### Webhook
- API: POST `/api/stripe/webhook`
- Verify Stripe signature.
- On `checkout.session.completed` (and/or `invoice.paid` if subscription):
  - Look up user by stripeCustomerId (or metadata with clerkUserId)
  - Set `isPro = true`

### Pro gating
- In `/app/app`:
  - If `isPro=false`: show paywall card + “Upgrade to Pro” button
  - If `isPro=true`: show:
    - “Run a Reality Check” button
    - Latest verdict card
    - Recent runs list

### Reality Check runs
- API `/api/runs`
  - GET: list last 10 runs for user
  - POST: create a new run (requires Pro)
- Run generation: simple deterministic mock (no LLM needed):
  - score random but coherent
  - riskLevel derived from score thresholds
  - warnings/evidence from curated arrays
- Return the created run and display instantly.

## Environment variables
Document all required env vars in a `.env.example` file and in README.

Required:
- DATABASE_URL (Supabase Postgres)
- CLERK_SECRET_KEY
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- NEXT_PUBLIC_APP_URL (Vercel URL)

## Developer experience
Create a `README.md` with:
1) Install & run locally
2) Set env vars
3) Prisma migrate and seed
4) How to test Stripe locally (stripe listen)
5) How to configure Vercel env vars
6) How to configure Stripe webhook in prod

## Deliverables checklist
- ✅ Clerk integrated and `/app/app` is protected
- ✅ Pricing page exists with Upgrade button
- ✅ Stripe checkout works
- ✅ Stripe webhook marks user pro in DB
- ✅ Pro gating works
- ✅ Runs API works and persists to DB
- ✅ Vercel-ready
- ✅ Landing unaffected

Proceed to implement now.
