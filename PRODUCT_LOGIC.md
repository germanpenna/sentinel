# PRODUCT_LOGIC.md — Sentinel Reality Check (No LLM, Demo-Ready)

You are the Lead Product + Design Engineer. We already have working infra:
- Landing at `/` (do not change)
- Auth via Clerk (working)
- Stripe checkout (working)
- DB via Supabase + Prisma with models `User` and `Run`
- App route is `/app/app` (this is the ONLY “dashboard” UX; keep it)
- `/app/app` must remain protected by auth, and gated by `User.isPro`

Your task: implement the **core Sentinel experience** inside `/app/app` using deterministic logic (NO LLM).

## Hard constraints
- Do NOT change landing copy or structure.
- Do NOT change Stripe flow or URLs.
- Do NOT rename Prisma models or DB tables.
- Keep token usage minimal (no LLM calls at all).
- Keep implementation robust: app must never show empty results; always produce a strong verdict.

---

## Goal (what the demo must do)
A Pro user can:
1) Open `/app/app`
2) Provide a business objective + 3 KPIs (simple form)
3) Click **Run Reality Check**
4) Immediately get a “boardroom-grade” verdict (score, risk, contradictions, missing signals, actions)
5) The run is persisted in DB and shows in a **Recent Runs** list
6) Clicking a run shows details (modal or detail panel)

A non-Pro user sees:
- A clear paywall card + CTA to upgrade (link to `/pricing`)

---

## UX spec for `/app/app`
### Page layout (single page, strong impact)
1) **Header strip**
   - Title: “Sentinel Dashboard”
   - Subtitle: “Reality-check your KPIs against the objectives you claim.”
   - Right side: user status badge (Pro / Free) + Logout (existing Clerk components)

2) **Main grid (2 columns on desktop, 1 column on mobile)**
   - Left: **Run a Reality Check** (form + run button)
   - Right: **Latest Verdict** (shows last run, or a strong empty state)

3) **Below**
   - **Recent Runs** list (last 5) with: timestamp, score, risk badge, “View” button
   - Clicking “View” opens a modal (or expands a detail panel) showing full run details

### Form fields
- Objective (required): textarea, placeholder:
  “Example: Improve profitability without slowing growth.”
- KPI 1 name (required): input
- KPI 1 description (optional): input (short)
- KPI 2 name (required)
- KPI 2 description (optional)
- KPI 3 name (required)
- KPI 3 description (optional)

Optional (nice-to-have, only if easy):
- “Industry” dropdown with 6 values (SaaS, E-commerce, Fintech, Marketplace, Media, Other) used only to slightly vary default contradictions/actions.

### Buttons
- Primary: “Run Reality Check”
- Secondary: “Use a sample” (fills the form with a powerful example)

### Empty states
- Latest Verdict empty state should still feel premium:
  - “No checks yet. Run your first Reality Check.”
  - Show 3 sample “what you’ll get” bullets.

---

## API spec (use existing /api/runs)
Implement/ensure these behaviors in `app/api/runs/route.ts`:

### GET /api/runs
- Requires auth
- Returns last 10 runs for the user (descending by createdAt)

### POST /api/runs
- Requires auth
- Requires Pro (`User.isPro === true`) — otherwise return 402 or 403 with clear message
- Body:
  ```json
  {
    "objective": "...",
    "kpis": [
      {"name":"...", "description":"..."},
      {"name":"...", "description":"..."},
      {"name":"...", "description":"..."}
    ],
    "industry": "SaaS"
  }
  ```
- Returns created run record

### Persistence
Store the following in `Run`:
- score: int 0..100
- riskLevel: "GREEN" | "YELLOW" | "RED"
- warningsJson: JSON (use for contradictions + missingSignals)
- evidenceJson: JSON (use for objective, KPIs, actions, summary)

Do not add DB fields unless absolutely necessary. Prefer JSON payloads.

---

## Deterministic “Reality Check Engine” (no LLM)
Implement a deterministic function (server-side) that produces:

- score (0..100)
- riskLevel
- contradictions: array of 3 strings
- missingSignals: array of 2 strings
- actions24h: array of 3 strings
- executiveSummary: 2–3 sentences
- confidence: "High" | "Medium" (always deterministic)

### Scoring rules (simple, credible)
Start at 85.
- -15 per contradiction (max 3)
- -10 per missing signal (max 2)
Clamp to [0, 100].

Risk mapping:
- GREEN: score >= 75
- YELLOW: 50–74
- RED: < 50

### How to generate contradictions/missing signals
Use objective text + KPI names/descriptions keyword matching (lowercased).

Define keyword sets:
- growth: grow, growth, revenue, top-line, acquisition
- efficiency: cac, payback, roi, roas, efficiency, unit economics
- profitability: profit, margin, ebitda, contribution, gross margin
- retention: retention, churn, repeat, nrr, grr
- activation: activation, conversion, funnel, signup, onboarding
- reliability: uptime, latency, incidents, sla, availability

Rules (examples):
1) If objective includes growth keywords AND there is any efficiency KPI keyword → add contradiction:
   “Growth is being celebrated while efficiency signals (CAC/Payback) suggest you may be buying revenue.”
2) If objective includes profitability keywords AND there is any growth KPI keyword but no margin/profit KPI → contradiction:
   “You claim profitability, but you’re not tracking margin-quality signals that prove it.”
3) If objective includes retention keywords AND no KPI mentions churn/retention/nrr/grr → missing signal:
   “Retention is a stated objective, but retention/churn is not among your KPIs.”
4) If objective includes reliability keywords AND no KPI mentions uptime/latency/incidents → missing signal.
5) If no rules match sufficiently, fallback to strong generic contradictions:
   - “Your objective is directional, but your KPIs don’t prove causality — only movement.”
   - “KPI ownership is unclear: the same number can be ‘up’ for the wrong reason.”
   - “The KPI set lacks counter-metrics that prevent narrative gaming.”

Missing signals fallback (if fewer than 2):
- “No KPI validates customer retention (churn/NRR).”
- “No KPI validates acquisition efficiency (CAC/payback).”
- “No KPI validates margin quality (gross/contribution margin).”

Actions (always 3):
- “Assign an owner per KPI and document the definition + source of truth today.”
- “Add one counter-metric per objective (e.g., growth ↔ CAC/payback; profit ↔ margin quality).”
- “Run a 30-minute ‘metric contradiction review’ with Finance + Product to align narrative vs reality.”

Executive summary template:
- 2–3 sentences that reference objective + riskLevel + 1 contradiction + 1 missing signal.

Confidence:
- High if at least 2 of the generated items came from direct keyword matches, else Medium.

---

## UI rendering rules
- Use clear, punchy typography and strong hierarchy.
- Risk badge colors:
  - GREEN: emerald
  - YELLOW: amber
  - RED: rose
- Score should feel “premium”: big number + label “Sentinel Score”
- Lists should be tight, with icons (check, warning, alert) if already available in the project.

Do NOT add new heavy UI libraries. Prefer existing Tailwind + any existing shadcn components already installed.

---

## Compatibility and routing
- `/app/app` is the canonical dashboard route.
- If there is an existing `/app` route used as an alias, keep it as-is.
- Ensure `/app/app` always works.

---

## Final acceptance criteria
1) Free users see paywall + CTA to /pricing.
2) Pro users can run a check and immediately see a verdict.
3) Runs persist in Supabase; Recent Runs shows at least last 5.
4) Clicking a run shows details.
5) The app never returns empty/blank verdicts; always returns 3 contradictions, 2 missing signals, 3 actions.
6) No landing changes.

Proceed to implement now.
