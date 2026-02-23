"use client";

import { AlertTriangle, TrendingDown, TrendingUp, Activity, ShieldAlert, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export function VerdictDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setTimeout(() => {
      setRefreshKey(prev => prev + 1);
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <motion.div 
      className="w-full max-w-5xl mx-auto px-4 perspective-[2000px]"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div 
        className="glass-panel rounded-2xl p-6 md:p-8 relative overflow-hidden bg-[#0A0A0A]/90 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)]"
        whileHover={{ rotateX: 1, rotateY: -1, translateZ: 10 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        {/* Subtle noise texture overlay for premium depth */}
        <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>
        
        {/* Animated Scanning Line on Refresh */}
        <AnimatePresence>
          {isRefreshing && (
            <motion.div 
              initial={{ top: "-10%" }}
              animate={{ top: "110%" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "linear" }}
              className="absolute left-0 w-full h-[2px] bg-accent/50 shadow-[0_0_20px_rgba(0,229,153,0.8)] z-50 pointer-events-none"
            />
          )}
        </AnimatePresence>
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center border border-white/10">
              <Activity className="w-4 h-4 text-neutral-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white leading-none mb-1">Sentinel Verdict</h2>
              <p className="text-xs text-neutral-500 font-mono">ID: CHK-8924 • Generated: Today, 08:14 AM</p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <button 
              onClick={handleRefresh}
              className={`p-2 rounded-lg border border-white/5 hover:bg-white/5 hover:border-white/10 transition-colors text-neutral-400 hover:text-white ${isRefreshing ? "opacity-50 cursor-not-allowed" : ""}`}
              title="Re-run Analysis"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-accent" : ""}`} />
            </button>
            <motion.div 
              key={`badge-${refreshKey}`}
              initial={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-risk-yellow/10 border border-risk-yellow/20 text-risk-yellow shadow-[0_0_15px_rgba(255,176,32,0.15)]"
            >
              <ShieldAlert className="w-4 h-4" />
              <span className="font-semibold text-xs tracking-wider uppercase">Elevated Risk</span>
            </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
          {/* Left Column: Score */}
          <div className="lg:col-span-1 flex flex-col justify-center items-center p-8 bg-gradient-to-b from-white/[0.03] to-transparent rounded-2xl border border-white/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">
            <div className="text-xs font-semibold text-neutral-500 mb-6 tracking-widest uppercase">Reality Score</div>
            <div className="relative flex items-center justify-center w-40 h-40">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="80" cy="80" r="76" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <motion.circle 
                  key={`circle-${refreshKey}`}
                  cx="80" cy="80" r="76" fill="none" stroke="#FFB020" strokeWidth="8" 
                  strokeDasharray="477" 
                  initial={{ strokeDashoffset: 477 }}
                  animate={{ strokeDashoffset: 181 }}
                  transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                  strokeLinecap="round" 
                  className="drop-shadow-[0_0_8px_rgba(255,176,32,0.5)]" 
                />
              </svg>
              <motion.div 
                key={`score-${refreshKey}`}
                initial={{ opacity: 0, filter: "blur(8px)", scale: 0.8 }}
                animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-6xl font-bold tracking-tighter text-white drop-shadow-md"
              >
                62
              </motion.div>
            </div>
            <p className="text-xs text-neutral-400 text-center mt-6 leading-relaxed">
              Deviation detected between stated objectives and core KPI momentum.
            </p>
          </div>

          {/* Right Column: Warnings & Evidence */}
          <div className="lg:col-span-2 space-y-8">
            {/* Executive Warnings */}
            <div>
              <h3 className="text-xs font-semibold text-neutral-500 mb-4 tracking-widest uppercase flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                Executive Warnings
              </h3>
              <div className="space-y-3">
                <motion.div 
                  key={`warn1-${refreshKey}`}
                  initial={{ opacity: 0, y: 10, filter: "blur(4px)" }} 
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} 
                  transition={{ delay: 0.6, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="p-4 rounded-xl bg-gradient-to-r from-white/[0.04] to-transparent border border-white/5 flex gap-4 hover:bg-white/[0.06] hover:border-white/10 transition-all cursor-default shadow-sm group"
                >
                  <div className="w-1.5 rounded-full bg-risk-red shadow-[0_0_10px_rgba(255,68,68,0.5)] group-hover:shadow-[0_0_15px_rgba(255,68,68,0.8)] transition-shadow" />
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1.5">Growth masking margin collapse</h4>
                    <p className="text-sm text-neutral-400 leading-relaxed">Top-line revenue is up 12%, but cost of delivery has outpaced it by 3x over the last 90 days. Current trajectory unsustainable.</p>
                  </div>
                </motion.div>
                <motion.div 
                  key={`warn2-${refreshKey}`}
                  initial={{ opacity: 0, y: 10, filter: "blur(4px)" }} 
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} 
                  transition={{ delay: 0.7, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="p-4 rounded-xl bg-gradient-to-r from-white/[0.04] to-transparent border border-white/5 flex gap-4 hover:bg-white/[0.06] hover:border-white/10 transition-all cursor-default shadow-sm group"
                >
                  <div className="w-1.5 rounded-full bg-risk-yellow shadow-[0_0_10px_rgba(255,176,32,0.5)] group-hover:shadow-[0_0_15px_rgba(255,176,32,0.8)] transition-shadow" />
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1.5">Unverifiable Objective: &quot;Q3 Expansion&quot;</h4>
                    <p className="text-sm text-neutral-400 leading-relaxed">The OKR for European expansion has no direct metric governance. Status is reported as &quot;Green&quot; but system sees zero linked data activity.</p>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Evidence Chips */}
            <div>
              <h3 className="text-xs font-semibold text-neutral-500 mb-4 tracking-widest uppercase flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" />
                Evidence Trends
              </h3>
              <div className="flex flex-wrap gap-3">
                <motion.div key={`chip1-${refreshKey}`} initial={{ opacity: 0, scale: 0.95, y: 5 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.4 }} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-risk-red/10 border border-risk-red/20 text-risk-red text-sm font-medium hover:bg-risk-red/15 transition-colors cursor-default">
                  <TrendingDown className="w-4 h-4" />
                  Gross Margin -4.2%
                </motion.div>
                <motion.div key={`chip2-${refreshKey}`} initial={{ opacity: 0, scale: 0.95, y: 5 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.85, duration: 0.4 }} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-risk-yellow/10 border border-risk-yellow/20 text-risk-yellow text-sm font-medium hover:bg-risk-yellow/15 transition-colors cursor-default">
                  <TrendingUp className="w-4 h-4" />
                  CAC Payback +2.1mo
                </motion.div>
                <motion.div key={`chip3-${refreshKey}`} initial={{ opacity: 0, scale: 0.95, y: 5 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.4 }} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-accent/10 border border-accent/20 text-accent text-sm font-medium hover:bg-accent/15 transition-colors cursor-default">
                  <TrendingUp className="w-4 h-4" />
                  Net Rev Retention 104%
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
