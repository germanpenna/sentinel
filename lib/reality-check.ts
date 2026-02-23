interface KpiInput {
  name: string;
  description?: string;
}

interface RealityCheckInput {
  objective: string;
  kpis: KpiInput[];
  industry?: string;
}

interface RealityCheckResult {
  score: number;
  riskLevel: "GREEN" | "YELLOW" | "RED";
  contradictions: string[];
  missingSignals: string[];
  actions24h: string[];
  executiveSummary: string;
  confidence: "High" | "Medium";
}

const KEYWORD_SETS: Record<string, string[]> = {
  growth: ["grow", "growth", "revenue", "top-line", "acquisition"],
  efficiency: ["cac", "payback", "roi", "roas", "efficiency", "unit economics"],
  profitability: ["profit", "margin", "ebitda", "contribution", "gross margin"],
  retention: ["retention", "churn", "repeat", "nrr", "grr"],
  activation: ["activation", "conversion", "funnel", "signup", "onboarding"],
  reliability: ["uptime", "latency", "incidents", "sla", "availability"],
};

function textMatchesCategory(text: string, category: string): boolean {
  const lower = text.toLowerCase();
  return KEYWORD_SETS[category].some((kw) => lower.includes(kw));
}

function kpisMatchCategory(kpis: KpiInput[], category: string): boolean {
  return kpis.some(
    (k) =>
      textMatchesCategory(k.name, category) ||
      textMatchesCategory(k.description ?? "", category)
  );
}

const FALLBACK_CONTRADICTIONS = [
  "Your objective is directional, but your KPIs don't prove causality — only movement.",
  "KPI ownership is unclear: the same number can be 'up' for the wrong reason.",
  "The KPI set lacks counter-metrics that prevent narrative gaming.",
];

const FALLBACK_MISSING = [
  "No KPI validates customer retention (churn/NRR).",
  "No KPI validates acquisition efficiency (CAC/payback).",
  "No KPI validates margin quality (gross/contribution margin).",
];

const ACTIONS = [
  "Assign an owner per KPI and document the definition + source of truth today.",
  "Add one counter-metric per objective (e.g., growth ↔ CAC/payback; profit ↔ margin quality).",
  "Run a 30-minute 'metric contradiction review' with Finance + Product to align narrative vs reality.",
];

export function runRealityCheck(input: RealityCheckInput): RealityCheckResult {
  const { objective, kpis } = input;
  const contradictions: string[] = [];
  const missingSignals: string[] = [];
  let directMatches = 0;

  if (
    textMatchesCategory(objective, "growth") &&
    kpisMatchCategory(kpis, "efficiency")
  ) {
    contradictions.push(
      "Growth is being celebrated while efficiency signals (CAC/Payback) suggest you may be buying revenue."
    );
    directMatches++;
  }

  if (
    textMatchesCategory(objective, "profitability") &&
    kpisMatchCategory(kpis, "growth") &&
    !kpisMatchCategory(kpis, "profitability")
  ) {
    contradictions.push(
      "You claim profitability, but you're not tracking margin-quality signals that prove it."
    );
    directMatches++;
  }

  if (
    textMatchesCategory(objective, "efficiency") &&
    kpisMatchCategory(kpis, "growth") &&
    !kpisMatchCategory(kpis, "efficiency")
  ) {
    contradictions.push(
      "Efficiency is your stated goal, but your KPIs are optimized for growth — not cost discipline."
    );
    directMatches++;
  }

  if (
    textMatchesCategory(objective, "activation") &&
    kpisMatchCategory(kpis, "retention") &&
    !kpisMatchCategory(kpis, "activation")
  ) {
    contradictions.push(
      "You mention activation, but your KPIs track retention without measuring funnel conversion."
    );
    directMatches++;
  }

  while (contradictions.length < 3) {
    const fallback = FALLBACK_CONTRADICTIONS[contradictions.length];
    if (fallback) contradictions.push(fallback);
    else break;
  }
  const finalContradictions = contradictions.slice(0, 3);

  if (
    textMatchesCategory(objective, "retention") &&
    !kpisMatchCategory(kpis, "retention")
  ) {
    missingSignals.push(
      "Retention is a stated objective, but retention/churn is not among your KPIs."
    );
    directMatches++;
  }

  if (
    textMatchesCategory(objective, "reliability") &&
    !kpisMatchCategory(kpis, "reliability")
  ) {
    missingSignals.push(
      "Reliability is a stated objective, but uptime/latency/incidents are not tracked."
    );
    directMatches++;
  }

  if (
    !kpisMatchCategory(kpis, "retention") &&
    !missingSignals.some((s) => s.includes("retention"))
  ) {
    missingSignals.push("No KPI validates customer retention (churn/NRR).");
  }

  if (
    !kpisMatchCategory(kpis, "efficiency") &&
    !missingSignals.some((s) => s.includes("efficiency"))
  ) {
    missingSignals.push(
      "No KPI validates acquisition efficiency (CAC/payback)."
    );
  }

  if (
    !kpisMatchCategory(kpis, "profitability") &&
    missingSignals.length < 2
  ) {
    missingSignals.push(
      "No KPI validates margin quality (gross/contribution margin)."
    );
  }

  while (missingSignals.length < 2) {
    const fallback =
      FALLBACK_MISSING.find((f) => !missingSignals.includes(f));
    if (fallback) missingSignals.push(fallback);
    else break;
  }
  const finalMissing = missingSignals.slice(0, 2);

  let score = 85;
  score -= finalContradictions.length * 15;
  score -= finalMissing.length * 10;
  score = Math.max(0, Math.min(100, score));

  const riskLevel: "GREEN" | "YELLOW" | "RED" =
    score >= 75 ? "GREEN" : score >= 50 ? "YELLOW" : "RED";

  const confidence: "High" | "Medium" = directMatches >= 2 ? "High" : "Medium";

  const riskWord =
    riskLevel === "GREEN"
      ? "acceptable"
      : riskLevel === "YELLOW"
        ? "moderate"
        : "critical";
  const executiveSummary = `Your objective "${objective.slice(0, 80)}" carries ${riskWord} risk (score ${score}/100). ${finalContradictions[0]} Additionally, ${finalMissing[0]?.toLowerCase()}`;

  return {
    score,
    riskLevel,
    contradictions: finalContradictions,
    missingSignals: finalMissing,
    actions24h: ACTIONS,
    executiveSummary,
    confidence,
  };
}
