"use client";

import { Shield, Target, FileSearch, LineChart, AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export function Features() {
  const features = [
    {
      icon: <Target className="w-5 h-5 text-accent" />,
      title: "Reality Score",
      description: "A definitive 0-100 index quantifying the structural integrity of your business.",
      hint: (
        <div className="mt-6 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-black/50 border border-white/5 text-sm font-mono text-white shadow-inner w-fit">
          <span className="text-accent font-bold">72</span>
          <span className="text-neutral-600">/ 100</span>
        </div>
      )
    },
    {
      icon: <Shield className="w-5 h-5 text-risk-yellow" />,
      title: "Risk Level",
      description: "Immediate classification exposing hidden fragility before it becomes a board-level crisis.",
      hint: (
        <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-risk-yellow/10 border border-risk-yellow/20 text-xs font-semibold text-risk-yellow uppercase tracking-widest w-fit">
          <div className="w-1.5 h-1.5 rounded-full bg-risk-yellow animate-pulse" />
          Elevated
        </div>
      )
    },
    {
      icon: <FileSearch className="w-5 h-5 text-white" />,
      title: "Executive Warnings",
      description: "Direct, unmitigated alerts exposing specific contradictions between your narrative and your operational data.",
      hint: (
        <div className="mt-6 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-risk-red/10 border border-risk-red/20 text-xs font-medium text-risk-red w-fit">
          <AlertTriangle className="w-3.5 h-3.5" />
          3 Active Flags
        </div>
      )
    },
    {
      icon: <LineChart className="w-5 h-5 text-neutral-400" />,
      title: "Evidence Chips",
      description: "The irrefutable underlying trends driving the verdict, stripped of vanity metrics and presentation bias.",
      hint: (
        <div className="mt-6 flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-risk-red/5 border border-risk-red/10 text-xs font-medium text-risk-red">
            <TrendingDown className="w-3.5 h-3.5" />
            GM
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-risk-yellow/5 border border-risk-yellow/10 text-xs font-medium text-risk-yellow">
            <TrendingUp className="w-3.5 h-3.5" />
            CAC
          </div>
        </div>
      )
    }
  ];

  return (
    <section className="py-24 border-t border-white/5 bg-[#050505] relative z-10">
      <div className="absolute inset-0 bg-surface-gradient pointer-events-none" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white tracking-tight drop-shadow-sm">The 60-Second Verdict</h2>
          <p className="text-neutral-400 max-w-xl mx-auto text-balance text-lg">
            No new dashboards. No queries. Just an unvarnished assessment of business reality, ready for the investment committee.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-surface/30 border border-white/5 hover:border-white/10 hover:bg-surface/60 transition-all duration-300 shadow-surface-elevation group flex flex-col"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 border border-white/5">
                {feature.icon}
              </div>
              <h3 className="text-lg font-medium text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-neutral-400 leading-relaxed flex-grow">{feature.description}</p>
              {feature.hint}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
