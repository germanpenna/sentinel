"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Suspense } from "react";

function PricingContent() {
  const searchParams = useSearchParams();
  const { isSignedIn } = useUser();
  const cancelled = searchParams.get("checkout") === "cancel";

  const handleUpgrade = async () => {
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-lg w-full space-y-8 text-center">
        <div className="flex items-center justify-center gap-4">
          <Link href="/" className="text-sm text-neutral-500 hover:text-white transition-colors">
            ← Back to home
          </Link>
          {isSignedIn && (
            <>
              <span className="text-neutral-700">·</span>
              <Link href="/app" className="text-sm text-neutral-500 hover:text-white transition-colors">
                Go to Dashboard
              </Link>
            </>
          )}
        </div>

        {cancelled && (
          <div className="rounded-xl border border-risk-yellow/20 bg-risk-yellow/5 p-4 text-sm text-risk-yellow">
            Checkout was cancelled. You can try again anytime.
          </div>
        )}

        <h1 className="text-4xl font-bold">Go Pro</h1>
        <p className="text-neutral-400 text-lg">
          Unlock unlimited Reality Checks and get board-level intelligence on demand.
        </p>

        <div className="rounded-2xl border border-white/10 bg-surface p-8 space-y-6">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-5xl font-bold">$49</span>
            <span className="text-neutral-500">one-time</span>
          </div>
          <ul className="space-y-3 text-left">
            {[
              "Unlimited Reality Checks",
              "Full risk analysis with warnings",
              "Evidence-backed verdicts",
              "Run history & tracking",
              "Priority support",
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-neutral-300">
                <span className="text-accent">✓</span> {feature}
              </li>
            ))}
          </ul>
          <button
            onClick={handleUpgrade}
            className="w-full py-3 px-6 bg-accent text-black font-semibold rounded-xl hover:bg-accent/90 transition-colors"
          >
            Upgrade to Pro
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <PricingContent />
    </Suspense>
  );
}
