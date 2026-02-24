interface KpiInput {
  name: string;
  description?: string;
}

interface RealityCheckInput {
  objective: string;
  kpis: KpiInput[];
  industry?: string;
}

interface Finding {
  text: string;
  isAdvisory: boolean;
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

const FALLBACK_CONTRADICTIONS: Finding[] = [
  { text: "Your objective is directional, but your KPIs don't prove causality — only movement.", isAdvisory: true },
  { text: "KPI ownership is unclear: the same number can be 'up' for the wrong reason.", isAdvisory: true },
  { text: "The KPI set lacks counter-metrics that prevent narrative gaming.", isAdvisory: true },
];

const FALLBACK_MISSING: Finding[] = [
  { text: "No KPI validates customer retention (churn/NRR).", isAdvisory: true },
  { text: "No KPI validates acquisition efficiency (CAC/payback).", isAdvisory: true },
  { text: "No KPI validates margin quality (gross/contribution margin).", isAdvisory: true },
];

const ACTIONS = [
  "Assign an owner per KPI and document the definition + source of truth today.",
  "Add one counter-metric per objective (e.g., growth ↔ CAC/payback; profit ↔ margin quality).",
  "Run a 30-minute 'metric contradiction review' with Finance + Product to align narrative vs reality.",
];

export function runRealityCheck(input: RealityCheckInput): RealityCheckResult {
  const { objective, kpis } = input;
  const contradictions: Finding[] = [];
  const missingSignals: Finding[] = [];
  let directMatches = 0;

  if (
    textMatchesCategory(objective, "growth") &&
    kpisMatchCategory(kpis, "efficiency")
  ) {
    contradictions.push({
      text: "Growth is being celebrated while efficiency signals (CAC/Payback) suggest you may be buying revenue.",
      isAdvisory: false,
    });
    directMatches++;
  }

  if (
    textMatchesCategory(objective, "profitability") &&
    kpisMatchCategory(kpis, "growth") &&
    !kpisMatchCategory(kpis, "profitability")
  ) {
    contradictions.push({
      text: "You claim profitability, but you're not tracking margin-quality signals that prove it.",
      isAdvisory: false,
    });
    directMatches++;
  }

  if (
    textMatchesCategory(objective, "efficiency") &&
    kpisMatchCategory(kpis, "growth") &&
    !kpisMatchCategory(kpis, "efficiency")
  ) {
    contradictions.push({
      text: "Efficiency is your stated goal, but your KPIs are optimized for growth — not cost discipline.",
      isAdvisory: false,
    });
    directMatches++;
  }

  if (
    textMatchesCategory(objective, "activation") &&
    kpisMatchCategory(kpis, "retention") &&
    !kpisMatchCategory(kpis, "activation")
  ) {
    contradictions.push({
      text: "You mention activation, but your KPIs track retention without measuring funnel conversion.",
      isAdvisory: false,
    });
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
    missingSignals.push({
      text: "Retention is a stated objective, but retention/churn is not among your KPIs.",
      isAdvisory: false,
    });
    directMatches++;
  }

  if (
    textMatchesCategory(objective, "reliability") &&
    !kpisMatchCategory(kpis, "reliability")
  ) {
    missingSignals.push({
      text: "Reliability is a stated objective, but uptime/latency/incidents are not tracked.",
      isAdvisory: false,
    });
    directMatches++;
  }

  if (
    !kpisMatchCategory(kpis, "retention") &&
    !missingSignals.some((s) => s.text.includes("retention"))
  ) {
    missingSignals.push({ text: "No KPI validates customer retention (churn/NRR).", isAdvisory: true });
  }

  if (
    !kpisMatchCategory(kpis, "efficiency") &&
    !missingSignals.some((s) => s.text.includes("efficiency"))
  ) {
    missingSignals.push({
      text: "No KPI validates acquisition efficiency (CAC/payback).",
      isAdvisory: true,
    });
  }

  if (
    !kpisMatchCategory(kpis, "profitability") &&
    missingSignals.length < 2
  ) {
    missingSignals.push({
      text: "No KPI validates margin quality (gross/contribution margin).",
      isAdvisory: true,
    });
  }

  while (missingSignals.length < 2) {
    const fallback =
      FALLBACK_MISSING.find((f) => !missingSignals.some((s) => s.text === f.text));
    if (fallback) missingSignals.push(fallback);
    else break;
  }
  const finalMissing = missingSignals.slice(0, 2);

  const scoredContradictions = finalContradictions.filter((f) => !f.isAdvisory).length;
  const scoredMissing = finalMissing.filter((f) => !f.isAdvisory).length;

  let score = 85;
  score -= scoredContradictions * 15;
  score -= scoredMissing * 10;
  score = Math.max(0, Math.min(100, score));

  const riskLevel: "GREEN" | "YELLOW" | "RED" =
    score >= 75 ? "GREEN" : score >= 50 ? "YELLOW" : "RED";

  const confidence: "High" | "Medium" = directMatches >= 2 ? "High" : "Medium";

  const contradictionTexts = finalContradictions.map((f) => f.text);
  const missingTexts = finalMissing.map((f) => f.text);

  const riskWord =
    riskLevel === "GREEN"
      ? "acceptable"
      : riskLevel === "YELLOW"
        ? "moderate"
        : "critical";
  const executiveSummary = `Your objective "${objective.slice(0, 80)}" carries ${riskWord} risk (score ${score}/100). ${contradictionTexts[0]} Additionally, ${missingTexts[0]?.toLowerCase()}`;

  return {
    score,
    riskLevel,
    contradictions: contradictionTexts,
    missingSignals: missingTexts,
    actions24h: ACTIONS,
    executiveSummary,
    confidence,
  };
}
