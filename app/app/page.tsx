"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface KpiField {
  name: string;
  description: string;
}

interface WarningsJson {
  contradictions: string[];
  missingSignals: string[];
}

interface EvidenceJson {
  objective: string;
  kpis: KpiField[];
  industry: string;
  actions24h: string[];
  executiveSummary: string;
  boardSummary?: string;
  confidence: string;
}

interface Run {
  id: string;
  createdAt: string;
  score: number;
  riskLevel: string;
  warningsJson: WarningsJson | string[];
  evidenceJson: EvidenceJson | string[];
}

function isNewFormat(run: Run): run is Run & { warningsJson: WarningsJson; evidenceJson: EvidenceJson } {
  return run.warningsJson && typeof run.warningsJson === "object" && !Array.isArray(run.warningsJson);
}

const SAMPLE_DATA = {
  objective: "Improve profitability without slowing growth.",
  kpis: [
    { name: "Monthly Revenue Growth", description: "MoM revenue increase %" },
    { name: "CAC Payback Period", description: "Months to recover acquisition cost" },
    { name: "Logo Churn Rate", description: "% of customers lost per month" },
  ] as KpiField[],
  industry: "SaaS" as string,
};

const INDUSTRIES = ["SaaS", "E-commerce", "Fintech", "Marketplace", "Media", "Other"];

const RISK_COLORS: Record<string, { text: string; bg: string; dot: string }> = {
  GREEN: { text: "text-emerald-400", bg: "bg-emerald-400/10", dot: "bg-emerald-400" },
  YELLOW: { text: "text-amber-400", bg: "bg-amber-400/10", dot: "bg-amber-400" },
  RED: { text: "text-rose-400", bg: "bg-rose-400/10", dot: "bg-rose-400" },
};

const ANALYSIS_STEPS = [
  "Ingesting KPIs…",
  "Checking strategy alignment…",
  "Computing reality score…",
  "Generating executive verdict…",
];

function RiskBadge({ level }: { level: string }) {
  const c = RISK_COLORS[level] ?? RISK_COLORS.RED;
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${c.bg} ${c.text}`}>
      {level}
    </span>
  );
}

function AnalysisProgress({ step }: { step: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-surface p-6 space-y-4">
      <h2 className="text-lg font-semibold text-neutral-300">Running Analysis…</h2>
      <div className="space-y-3">
        {ANALYSIS_STEPS.map((label, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
              idx < step ? "bg-accent/20" : idx === step ? "bg-accent/10" : "bg-white/5"
            }`}>
              {idx < step ? (
                <svg className="w-3 h-3 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              ) : idx === step ? (
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-white/20" />
              )}
            </div>
            <span className={`text-sm transition-colors duration-300 ${
              idx < step ? "text-neutral-400" : idx === step ? "text-neutral-200" : "text-neutral-600"
            }`}>{label}</span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-neutral-600 uppercase tracking-widest">Deterministic · Rules-based · No hallucinations</p>
    </div>
  );
}

function VerdictCard({ run, durationMs }: { run: Run; durationMs?: number }) {
  if (!isNewFormat(run)) {
    return (
      <div className="rounded-2xl border border-white/10 bg-surface p-6 space-y-4">
        <h2 className="text-lg font-semibold text-neutral-300">Executive Verdict</h2>
        <div className="flex items-center gap-4">
          <div className={`text-5xl font-bold ${RISK_COLORS[run.riskLevel]?.text ?? "text-rose-400"}`}>
            {run.score}
          </div>
          <div>
            <RiskBadge level={run.riskLevel} />
            <p className="text-neutral-500 text-sm mt-1">{new Date(run.createdAt).toLocaleString()}</p>
          </div>
        </div>
      </div>
    );
  }

  const w = run.warningsJson;
  const e = run.evidenceJson;
  const c = RISK_COLORS[run.riskLevel] ?? RISK_COLORS.RED;

  return (
    <div className="rounded-2xl border border-white/10 bg-surface p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-300">Executive Verdict</h2>
        <div className="flex items-center gap-2">
          {durationMs != null && (
            <span className="text-[10px] text-neutral-600 font-mono">Generated in {durationMs}ms</span>
          )}
          <span className={`text-xs px-2 py-0.5 rounded ${e.confidence === "High" ? "bg-emerald-400/10 text-emerald-400" : "bg-amber-400/10 text-amber-400"}`}>
            {e.confidence} confidence
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className={`text-5xl font-bold ${c.text}`}>{run.score}</div>
          <div className="text-[10px] uppercase tracking-widest text-neutral-500 mt-1">Sentinel Score</div>
        </div>
        <div className="space-y-1">
          <RiskBadge level={run.riskLevel} />
          <p className="text-neutral-500 text-sm">{new Date(run.createdAt).toLocaleString()}</p>
        </div>
      </div>

      <p className="text-sm text-neutral-300 leading-relaxed">{e.executiveSummary}</p>

      {e.boardSummary && (
        <div className="border-l-2 border-accent/30 pl-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Board Summary</h3>
          <p className="text-sm text-neutral-400 italic leading-relaxed">{e.boardSummary}</p>
        </div>
      )}

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">Contradictions</h3>
        <ul className="space-y-1.5">
          {w.contradictions.map((t, i) => (
            <li key={i} className="text-sm text-neutral-300 flex gap-2">
              <span className="text-rose-400 shrink-0">✕</span> {t}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">Missing Signals</h3>
        <ul className="space-y-1.5">
          {w.missingSignals.map((t, i) => (
            <li key={i} className="text-sm text-neutral-300 flex gap-2">
              <span className="text-amber-400 shrink-0">⚠</span> {t}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">24h Actions</h3>
        <ul className="space-y-1.5">
          {e.actions24h.map((t, i) => (
            <li key={i} className="text-sm text-neutral-300 flex gap-2">
              <span className="text-accent shrink-0">→</span> {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function EmptyState({ onRunNow, onUseSample, loading }: { onRunNow: () => void; onUseSample: () => void; loading: boolean }) {
  return (
    <div className="col-span-1 lg:col-span-2 rounded-2xl border border-white/10 bg-surface p-10 text-center space-y-6">
      <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto">
        <svg className="w-7 h-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-2">Initiate your first Reality Check</h2>
        <p className="text-neutral-400 max-w-md mx-auto">
          Sentinel runs a deterministic, rules-based analysis of your strategy-to-KPI alignment — delivering an audit-friendly executive verdict.
        </p>
      </div>
      <ul className="inline-flex flex-col items-start gap-2 text-sm text-neutral-400">
        <li className="flex gap-2"><span className="text-rose-400">✕</span> Contradictions between strategy &amp; metrics</li>
        <li className="flex gap-2"><span className="text-amber-400">⚠</span> Missing signals your board should see</li>
        <li className="flex gap-2"><span className="text-accent">→</span> 24-hour recommended actions</li>
      </ul>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={onRunNow}
          className="py-2.5 px-6 bg-accent text-black font-semibold rounded-xl hover:bg-accent/90 transition-colors"
        >
          Run now
        </button>
        <button
          onClick={onUseSample}
          disabled={loading}
          className="py-2.5 px-6 border border-white/10 text-neutral-400 text-sm rounded-xl hover:border-white/20 hover:text-neutral-300 transition-colors disabled:opacity-50"
        >
          {loading ? "Creating…" : "Use sample data"}
        </button>
      </div>
    </div>
  );
}

function RunDetailModal({ run, durationMs, onClose }: { run: Run; durationMs?: number; onClose: () => void }) {
  const hasNew = isNewFormat(run);
  const w = hasNew ? (run.warningsJson as WarningsJson) : null;
  const e = hasNew ? (run.evidenceJson as EvidenceJson) : null;
  const c = RISK_COLORS[run.riskLevel] ?? RISK_COLORS.RED;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-surface border border-white/10 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 space-y-4" onClick={(ev) => ev.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">Executive Brief</h2>
            {durationMs != null && (
              <span className="text-[10px] text-neutral-600 font-mono">Generated in {durationMs}ms</span>
            )}
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-300 text-xl leading-none">&times;</button>
        </div>

        <div className="flex items-center gap-3">
          <div className={`text-4xl font-bold ${c.text}`}>{run.score}</div>
          <div>
            <RiskBadge level={run.riskLevel} />
            <p className="text-neutral-500 text-xs mt-1">{new Date(run.createdAt).toLocaleString()}</p>
          </div>
        </div>

        {e && <p className="text-sm text-neutral-300">{e.executiveSummary}</p>}

        {e?.boardSummary && (
          <div className="border-l-2 border-accent/30 pl-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Board Summary</h3>
            <p className="text-sm text-neutral-400 italic leading-relaxed">{e.boardSummary}</p>
          </div>
        )}

        {e && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Objective</h3>
            <p className="text-sm text-neutral-300">{e.objective}</p>
          </div>
        )}

        {e && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">KPIs</h3>
            <ul className="space-y-1">
              {e.kpis.map((k, i) => (
                <li key={i} className="text-sm text-neutral-300">
                  <span className="font-medium">{k.name}</span>
                  {k.description && <span className="text-neutral-500"> — {k.description}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {w && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Contradictions</h3>
            <ul className="space-y-1">
              {w.contradictions.map((t, i) => (
                <li key={i} className="text-sm text-neutral-300 flex gap-2"><span className="text-rose-400 shrink-0">✕</span> {t}</li>
              ))}
            </ul>
          </div>
        )}

        {w && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Missing Signals</h3>
            <ul className="space-y-1">
              {w.missingSignals.map((t, i) => (
                <li key={i} className="text-sm text-neutral-300 flex gap-2"><span className="text-amber-400 shrink-0">⚠</span> {t}</li>
              ))}
            </ul>
          </div>
        )}

        {e && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">24h Actions</h3>
            <ul className="space-y-1">
              {e.actions24h.map((t, i) => (
                <li key={i} className="text-sm text-neutral-300 flex gap-2"><span className="text-accent shrink-0">→</span> {t}</li>
              ))}
            </ul>
          </div>
        )}

        {!hasNew && Array.isArray(run.warningsJson) && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Warnings</h3>
            <ul className="space-y-1">
              {(run.warningsJson as string[]).map((t, i) => (
                <li key={i} className="text-sm text-neutral-300 flex gap-2"><span className="text-amber-400 shrink-0">⚠</span> {t}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-2 border-t border-white/5">
          <p className="text-[10px] text-neutral-600 uppercase tracking-widest">Deterministic · Audit-friendly · Rules-based analysis</p>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const [isPro, setIsPro] = useState<boolean | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [runLoading, setRunLoading] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(-1);
  const [selectedRun, setSelectedRun] = useState<Run | null>(null);
  const [lastDurationMs, setLastDurationMs] = useState<number | undefined>();
  const [checkoutVerifying, setCheckoutVerifying] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const verdictRef = useRef<HTMLDivElement>(null);

  const [objective, setObjective] = useState("");
  const [kpis, setKpis] = useState<KpiField[]>([
    { name: "", description: "" },
    { name: "", description: "" },
    { name: "", description: "" },
  ]);
  const [industry, setIndustry] = useState("SaaS");
  const [error, setError] = useState("");

  const fetchStatus = useCallback(async () => {
    const res = await fetch("/api/user/status");
    if (res.ok) {
      const data = await res.json();
      setIsPro(data.isPro);
    }
  }, []);

  const fetchRuns = useCallback(async () => {
    const res = await fetch("/api/runs");
    if (res.ok) {
      const data = await res.json();
      setRuns(data.runs);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !user) return;
    const init = async () => {
      await fetchStatus();
      const isCheckoutSuccess = searchParams.get("checkout") === "success";
      if (isCheckoutSuccess) {
        setCheckoutVerifying(true);
        let attempts = 0;
        const poll = async () => {
          const res = await fetch("/api/user/status");
          if (res.ok) {
            const data = await res.json();
            if (data.isPro) {
              setIsPro(true);
              setCheckoutVerifying(false);
              setCheckoutSuccess(true);
              await fetchRuns();
              setLoading(false);
              setTimeout(() => setCheckoutSuccess(false), 8000);
              return;
            }
          }
          attempts++;
          if (attempts < 10) setTimeout(poll, 2000);
          else {
            setCheckoutVerifying(false);
            setLoading(false);
          }
        };
        poll();
      } else {
        await fetchRuns();
        setLoading(false);
      }
    };
    init();
  }, [isLoaded, user, searchParams, fetchStatus, fetchRuns]);

  const fillSample = () => {
    setObjective(SAMPLE_DATA.objective);
    setKpis([...SAMPLE_DATA.kpis]);
    setIndustry(SAMPLE_DATA.industry);
  };

  const submitRun = async (payload: { objective: string; kpis: KpiField[]; industry: string }) => {
    setError("");
    setRunLoading(true);
    setAnalysisStep(0);

    const stepInterval = setInterval(() => {
      setAnalysisStep((prev) => {
        if (prev >= ANALYSIS_STEPS.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 400);

    const t0 = performance.now();
    try {
      const res = await fetch("/api/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const elapsed = Math.round(performance.now() - t0);
      clearInterval(stepInterval);

      const minDelay = Math.max(0, 1800 - elapsed);
      await new Promise((r) => setTimeout(r, minDelay));

      setAnalysisStep(ANALYSIS_STEPS.length);

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong.");
      } else {
        setLastDurationMs(elapsed);
        await fetchRuns();
        setObjective("");
        setKpis([{ name: "", description: "" }, { name: "", description: "" }, { name: "", description: "" }]);
        setTimeout(() => verdictRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 200);
      }
    } catch {
      clearInterval(stepInterval);
      setError("Network error. Please try again.");
    }
    setRunLoading(false);
    setAnalysisStep(-1);
  };

  const handleRunCheck = async () => {
    if (!objective.trim()) { setError("Objective is required."); return; }
    if (kpis.some((k) => !k.name.trim())) { setError("All 3 KPI names are required."); return; }
    await submitRun({ objective, kpis, industry });
  };

  const handleUseSample = async () => {
    await submitRun(SAMPLE_DATA);
  };

  const updateKpi = (idx: number, field: keyof KpiField, value: string) => {
    setKpis((prev) => prev.map((k, i) => (i === idx ? { ...k, [field]: value } : k)));
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          {checkoutVerifying && (
            <p className="text-sm text-neutral-400 animate-pulse">Verifying payment…</p>
          )}
        </div>
      </div>
    );
  }

  if (!isPro) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-white/10 bg-surface p-8 text-center space-y-6">
          <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">Upgrade to Pro</h2>
          <p className="text-neutral-400">
            Get unlimited Reality Checks for your executive decisions. One-time payment of $49.
          </p>
          <a
            href="/pricing"
            className="block w-full py-3 px-6 bg-accent text-black font-semibold rounded-xl hover:bg-accent/90 transition-colors text-center"
          >
            View Pricing & Upgrade
          </a>
        </div>
      </div>
    );
  }

  const latestRun = runs[0];
  const recentRuns = runs.slice(0, 5);
  const hasRuns = runs.length > 0;
  const showAnalysis = analysisStep >= 0;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8 pt-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Sentinel Dashboard</h1>
            <p className="text-neutral-500 text-sm mt-1">Executive-grade, rules-based reality check for your KPIs.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-400/10 text-emerald-400">PRO</span>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>

        {checkoutSuccess && (
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4 flex items-center gap-3">
            <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            <p className="text-sm text-emerald-300">Payment confirmed! You now have Pro access. Run your first Reality Check below.</p>
          </div>
        )}

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {!hasRuns && !showAnalysis ? (
            <EmptyState
              onRunNow={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}
              onUseSample={handleUseSample}
              loading={runLoading}
            />
          ) : (
            <>
              {/* Left: Form */}
              <div ref={formRef} className="rounded-2xl border border-white/10 bg-surface p-6 space-y-4">
                <h2 className="text-lg font-semibold text-neutral-300">Run a Reality Check</h2>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block mb-1">Objective</label>
                  <textarea
                    value={objective}
                    onChange={(ev) => setObjective(ev.target.value)}
                    placeholder="Example: Improve profitability without slowing growth."
                    rows={3}
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-accent/50 resize-none"
                  />
                </div>

                {kpis.map((kpi, idx) => (
                  <div key={idx} className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block mb-1">KPI {idx + 1} Name *</label>
                      <input
                        value={kpi.name}
                        onChange={(ev) => updateKpi(idx, "name", ev.target.value)}
                        placeholder={`KPI ${idx + 1} name`}
                        className="w-full bg-background border border-white/10 rounded-xl px-4 py-2 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-accent/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block mb-1">Description</label>
                      <input
                        value={kpi.description}
                        onChange={(ev) => updateKpi(idx, "description", ev.target.value)}
                        placeholder="Optional description"
                        className="w-full bg-background border border-white/10 rounded-xl px-4 py-2 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-accent/50"
                      />
                    </div>
                  </div>
                ))}

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block mb-1">Industry</label>
                  <select
                    value={industry}
                    onChange={(ev) => setIndustry(ev.target.value)}
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-2 text-sm text-neutral-200 focus:outline-none focus:border-accent/50"
                  >
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                {error && <p className="text-rose-400 text-sm">{error}</p>}

                <div className="flex gap-3">
                  <button
                    onClick={handleRunCheck}
                    disabled={runLoading}
                    className="flex-1 py-2.5 px-6 bg-accent text-black font-semibold rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-50"
                  >
                    {runLoading ? "Analyzing…" : "Run Reality Check"}
                  </button>
                  <button
                    onClick={fillSample}
                    disabled={runLoading}
                    className="py-2.5 px-4 border border-white/10 text-neutral-400 text-sm rounded-xl hover:border-white/20 hover:text-neutral-300 transition-colors disabled:opacity-50"
                  >
                    Use a sample
                  </button>
                </div>
              </div>

              {/* Right: Latest Verdict or Analysis Progress */}
              <div ref={verdictRef}>
                {showAnalysis ? (
                  <AnalysisProgress step={analysisStep} />
                ) : latestRun ? (
                  <VerdictCard run={latestRun} durationMs={lastDurationMs} />
                ) : null}
              </div>
            </>
          )}
        </div>

        {/* Form (shown below empty state so "Run now" can scroll to it) */}
        {!hasRuns && !showAnalysis && (
          <div ref={formRef} className="rounded-2xl border border-white/10 bg-surface p-6 space-y-4 max-w-2xl mx-auto">
            <h2 className="text-lg font-semibold text-neutral-300">Run a Reality Check</h2>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block mb-1">Objective</label>
              <textarea
                value={objective}
                onChange={(ev) => setObjective(ev.target.value)}
                placeholder="Example: Improve profitability without slowing growth."
                rows={3}
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-accent/50 resize-none"
              />
            </div>

            {kpis.map((kpi, idx) => (
              <div key={idx} className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block mb-1">KPI {idx + 1} Name *</label>
                  <input
                    value={kpi.name}
                    onChange={(ev) => updateKpi(idx, "name", ev.target.value)}
                    placeholder={`KPI ${idx + 1} name`}
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-2 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-accent/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block mb-1">Description</label>
                  <input
                    value={kpi.description}
                    onChange={(ev) => updateKpi(idx, "description", ev.target.value)}
                    placeholder="Optional description"
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-2 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-accent/50"
                  />
                </div>
              </div>
            ))}

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block mb-1">Industry</label>
              <select
                value={industry}
                onChange={(ev) => setIndustry(ev.target.value)}
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-2 text-sm text-neutral-200 focus:outline-none focus:border-accent/50"
              >
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            {error && <p className="text-rose-400 text-sm">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={handleRunCheck}
                disabled={runLoading}
                className="flex-1 py-2.5 px-6 bg-accent text-black font-semibold rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                {runLoading ? "Analyzing…" : "Run Reality Check"}
              </button>
              <button
                onClick={fillSample}
                className="py-2.5 px-4 border border-white/10 text-neutral-400 text-sm rounded-xl hover:border-white/20 hover:text-neutral-300 transition-colors"
              >
                Use a sample
              </button>
            </div>
          </div>
        )}

        {/* Decision History */}
        {recentRuns.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-surface p-6">
            <h2 className="text-lg font-semibold text-neutral-300 mb-4">Decision History</h2>
            <div className="space-y-2">
              {recentRuns.map((run, idx) => {
                const c = RISK_COLORS[run.riskLevel] ?? RISK_COLORS.RED;
                const ev = isNewFormat(run) ? (run.evidenceJson as EvidenceJson) : null;
                return (
                  <div key={run.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${c.dot}`} />
                      <span className={`text-lg font-bold ${c.text} w-10`}>{run.score}</span>
                      <RiskBadge level={run.riskLevel} />
                      {ev && <span className="text-sm text-neutral-500 truncate">{ev.objective.slice(0, 50)}</span>}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {idx === 0 && lastDurationMs != null && (
                        <span className="text-[10px] text-neutral-600 font-mono">{lastDurationMs}ms</span>
                      )}
                      <span className="text-xs text-neutral-500">{new Date(run.createdAt).toLocaleDateString()}</span>
                      <button
                        onClick={() => setSelectedRun(run)}
                        className="text-xs text-accent hover:text-accent/80 font-medium"
                      >
                        Open Brief
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {selectedRun && (
        <RunDetailModal
          run={selectedRun}
          durationMs={selectedRun.id === runs[0]?.id ? lastDurationMs : undefined}
          onClose={() => setSelectedRun(null)}
        />
      )}
    </div>
  );
}

export default function AppPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AppContent />
    </Suspense>
  );
}
