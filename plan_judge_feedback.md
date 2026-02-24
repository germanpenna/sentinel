# Plan: Judge Feedback Fixes (91→100)
**Date**: 2026-02-24

## TL;DR
Address all 5 actionable issues from judge feedback + documentation polish.

## Issues & Fixes

### 1. Stripe success_url spec drift
- **Current**: `/app?checkout=success`
- **Spec**: `/app/app?checkout=success`
- **File**: `app/api/stripe/checkout/route.ts`

### 2. Middleware: /app/pricing unprotected
- **Current**: `/app(.*)` protects everything including pricing
- **Fix**: Exclude `/app/pricing` from protection
- **File**: `middleware.ts`

### 3. Reality Check scoring misaligned with spec
- **Spec**: base=85, -15/contradiction (max 3), -10/missing (max 2), clamp [0,100], GREEN>=75, YELLOW 50-74, RED<50
- **Current**: base=82+(hash%7), different penalties, clamp [12,95], thresholds 72/45
- **File**: `lib/reality-check.ts`

### 4. cancel_url consistency
- **Current**: `/pricing?checkout=cancel`
- **Fix**: `/app/pricing?checkout=cancel` (canonical)
- **File**: `app/api/stripe/checkout/route.ts`

### 5. Documentation polish
- ROUTES.md: clarify auth on /app/pricing
- README.md: improve for judges (add architecture, test instructions)
- .env.example ✓ already committed
- schema.prisma ✓ already committed
