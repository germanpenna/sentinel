"use client";

import { motion } from "framer-motion";

export function StrategyTruth() {
  const steps = [
    {
      overline: "01 — The Narrative",
      title: "The stated objective",
      body: "The strategic goals, targets, and internal narrative your leadership team uses to project success."
    },
    {
      overline: "02 — The Evidence",
      title: "The governing metrics",
      body: "The operational KPIs and historical data used to justify confidence and claim the business is on track."
    },
    {
      overline: "03 — The Verdict",
      title: "The objective reality",
      body: "An unvarnished assessment of whether the business is structurally sound—or merely managing a coherent illusion."
    }
  ];

  return (
    <section className="py-24 relative z-10 border-t border-white/5 bg-background">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white tracking-tight drop-shadow-sm">
            Stop reporting. Start knowing.
          </h2>
          <p className="text-neutral-400 max-w-2xl mx-auto text-balance text-lg md:text-xl leading-relaxed">
            Sentinel checks whether your strategy, your KPIs, and your real performance are telling the same story.
          </p>
        </motion.div>

        {/* 3 Steps Process */}
        <div className="relative">
          {/* Subtle connecting line for desktop */}
          <div className="hidden md:block absolute top-[9px] left-0 w-full h-[1px] bg-gradient-to-r from-white/5 via-white/10 to-transparent" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {steps.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative pt-6 md:pt-8"
              >
                {/* Process Node */}
                <div className="absolute top-0 left-0 md:top-[-4px] md:left-0 w-2 h-2 rounded-full bg-background border border-neutral-600 shadow-[0_0_10px_rgba(255,255,255,0.1)]" />
                
                <div className="text-xs font-mono text-neutral-500 mb-4 tracking-widest uppercase">
                  {step.overline}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  {step.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Closing Lines */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-24 text-center border-t border-white/5 pt-12"
        >
          <p className="text-xl md:text-2xl font-medium text-white tracking-tight">
            Sentinel doesn’t give you more metrics.
          </p>
          <p className="text-xl md:text-2xl text-neutral-500 mt-2 tracking-tight">
            It tells you if your business story is true.
          </p>
        </motion.div>

      </div>
    </section>
  );
}
