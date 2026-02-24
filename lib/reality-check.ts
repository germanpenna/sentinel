interface KpiInput {
  name: string;
  description?: string;
}

interface RealityCheckInput {
  objective: string;
  kpis: KpiInput[];
  industry?: string;
  runIndex?: number;
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
  boardSummary: string;
  confidence: "High" | "Medium";
}

function stableHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

const KEYWORD_SETS: Record<string, string[]> = {
  growth: ["grow", "growth", "revenue", "top-line", "acquisition", "scale", "expand", "expansion"],
  efficiency: ["cac", "payback", "roi", "roas", "efficiency", "unit economics", "cost", "spend"],
  profitability: ["profit", "margin", "ebitda", "contribution", "gross margin", "bottom-line"],
  retention: ["retention", "churn", "repeat", "nrr", "grr", "loyalty"],
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

const CONTRADICTION_POOL: Finding[] = [
  { text: "Growth is being celebrated while efficiency signals (CAC/Payback) suggest you may be buying revenue.", isAdvisory: false },
  { text: "You claim profitability, but you're not tracking margin-quality signals that prove it.", isAdvisory: false },
  { text: "Efficiency is your stated goal, but your KPIs are optimized for growth — not cost discipline.", isAdvisory: false },
  { text: "You mention activation, but your KPIs track retention without measuring funnel conversion.", isAdvisory: false },
  { text: "Your objective is directional, but your KPIs don't prove causality — only movement.", isAdvisory: true },
  { text: "KPI ownership is unclear: the same number can be 'up' for the wrong reason.", isAdvisory: true },
  { text: "The KPI set lacks counter-metrics that prevent narrative gaming.", isAdvisory: true },
  { text: "Strategy language implies urgency, but no KPI has a time-bound target or threshold.", isAdvisory: true },
  { text: "Multiple KPIs overlap in what they measure, creating redundancy without coverage breadth.", isAdvisory: true },
  { text: "The objective frames success qualitatively, but all KPIs are lagging indicators.", isAdvisory: true },
];

const MISSING_POOL: Finding[] = [
  { text: "No KPI validates customer retention (churn/NRR).", isAdvisory: true },
  { text: "No KPI validates acquisition efficiency (CAC/payback).", isAdvisory: true },
  { text: "No KPI validates margin quality (gross/contribution margin).", isAdvisory: true },
  { text: "No leading indicator is present — all KPIs are backward-looking.", isAdvisory: true },
  { text: "No operational health metric (e.g., cycle time, defect rate) is tracked.", isAdvisory: true },
  { text: "No customer satisfaction proxy (NPS, CSAT, support volume) is included.", isAdvisory: true },
];

const ACTION_POOL = [
  "Assign an owner per KPI and document the definition + source of truth today.",
  "Add one counter-metric per objective (e.g., growth ↔ CAC/payback; profit ↔ margin quality).",
  "Run a 30-minute 'metric contradiction review' with Finance + Product to align narrative vs reality.",
  "Define explicit red/yellow/green thresholds for each KPI before next board review.",
  "Schedule a cross-functional alignment session to validate KPI-to-strategy traceability.",
  "Identify and document one leading indicator per lagging KPI within this sprint.",
];

const BOARD_TEMPLATES = [
  "Sentinel finds structural misalignment between stated strategy and KPI momentum, indicating elevated execution risk under current conditions.",
  "Analysis reveals partial coherence between strategic intent and measurement framework. Key blind spots remain in counter-metric coverage.",
  "The current KPI configuration demonstrates directional alignment but lacks the diagnostic depth required for board-level confidence.",
  "Sentinel identifies material gaps between the executive narrative and the underlying metric architecture. Remediation is recommended before the next review cycle.",
  "Strategic objectives are partially supported by the measurement set, but critical counter-signals are absent — increasing the risk of narrative bias.",
];

export function runRealityCheck(input: RealityCheckInput): RealityCheckResult {
  const { objective, kpis, industry, runIndex } = input;
  const inputKey = objective + kpis.map((k) => k.name + (k.description ?? "")).join("|") + (industry ?? "") + (runIndex ?? 0);
  const hash = stableHash(inputKey);

  const contradictions: Finding[] = [];
  const missingSignals: Finding[] = [];
  let directMatches = 0;

  if (textMatchesCategory(objective, "growth") && kpisMatchCategory(kpis, "efficiency")) {
    contradictions.push(CONTRADICTION_POOL[0]);
    directMatches++;
  }

  if (textMatchesCategory(objective, "profitability") && kpisMatchCategory(kpis, "growth") && !kpisMatchCategory(kpis, "profitability")) {
    contradictions.push(CONTRADICTION_POOL[1]);
    directMatches++;
  }

  if (textMatchesCategory(objective, "efficiency") && kpisMatchCategory(kpis, "growth") && !kpisMatchCategory(kpis, "efficiency")) {
    contradictions.push(CONTRADICTION_POOL[2]);
    directMatches++;
  }

  if (textMatchesCategory(objective, "activation") && kpisMatchCategory(kpis, "retention") && !kpisMatchCategory(kpis, "activation")) {
    contradictions.push(CONTRADICTION_POOL[3]);
    directMatches++;
  }

  const advisoryPool = CONTRADICTION_POOL.filter(
    (f) => f.isAdvisory && !contradictions.some((c) => c.text === f.text)
  );
  let poolIdx = hash % advisoryPool.length;
  while (contradictions.length < 3 && advisoryPool.length > 0) {
    contradictions.push(advisoryPool[poolIdx % advisoryPool.length]);
    poolIdx++;
  }
  const finalContradictions = contradictions.slice(0, 3);

  if (textMatchesCategory(objective, "retention") && !kpisMatchCategory(kpis, "retention")) {
    missingSignals.push({ text: "Retention is a stated objective, but retention/churn is not among your KPIs.", isAdvisory: false });
    directMatches++;
  }

  if (textMatchesCategory(objective, "reliability") && !kpisMatchCategory(kpis, "reliability")) {
    missingSignals.push({ text: "Reliability is a stated objective, but uptime/latency/incidents are not tracked.", isAdvisory: false });
    directMatches++;
  }

  const missingPool = MISSING_POOL.filter(
    (f) => !missingSignals.some((s) => s.text === f.text)
  );
  let mIdx = (hash >> 4) % missingPool.length;
  while (missingSignals.length < 2 && missingPool.length > 0) {
    const candidate = missingPool[mIdx % missingPool.length];
    if (!missingSignals.some((s) => s.text === candidate.text)) {
      missingSignals.push(candidate);
    }
    mIdx++;
  }
  const finalMissing = missingSignals.slice(0, 2);

  // Spec-aligned scoring:
  // Base: 85, -15 per contradiction (max 3), -10 per missing signal (max 2), clamp [0, 100]
  const numContradictions = finalContradictions.length;
  const numMissing = finalMissing.length;
  let score = 85 - numContradictions * 15 - numMissing * 10;
  score = Math.max(0, Math.min(100, score));

  // Spec-aligned risk thresholds: GREEN >= 75, YELLOW 50-74, RED < 50
  const riskLevel: "GREEN" | "YELLOW" | "RED" =
    score >= 75 ? "GREEN" : score >= 50 ? "YELLOW" : "RED";

  const confidence: "High" | "Medium" = directMatches >= 2 ? "High" : "Medium";

  const contradictionTexts = finalContradictions.map((f) => f.text);
  const missingTexts = finalMissing.map((f) => f.text);

  const aIdx = (hash >> 2) % ACTION_POOL.length;
  const actions24h = [
    ACTION_POOL[aIdx % ACTION_POOL.length],
    ACTION_POOL[(aIdx + 1) % ACTION_POOL.length],
    ACTION_POOL[(aIdx + 2) % ACTION_POOL.length],
  ];

  const riskWord = riskLevel === "GREEN" ? "acceptable" : riskLevel === "YELLOW" ? "moderate" : "critical";
  const executiveSummary = `Your objective "${objective.slice(0, 80)}" carries ${riskWord} risk (score ${score}/100). ${contradictionTexts[0]} Additionally, ${missingTexts[0]?.toLowerCase()}`;

  const boardSummary = BOARD_TEMPLATES[hash % BOARD_TEMPLATES.length];

  return {
    score,
    riskLevel,
    contradictions: contradictionTexts,
    missingSignals: missingTexts,
    actions24h,
    executiveSummary,
    boardSummary,
    confidence,
  };
}
