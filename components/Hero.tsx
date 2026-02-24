"use client";

import { ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";
import { HeroBackground } from "./HeroBackground";

export function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] as const } }
  };

  return (
    <section className="relative pt-32 pb-20 overflow-hidden w-full flex justify-center">
      <HeroBackground />
      
      <motion.div 
        className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface/80 backdrop-blur-sm border border-white/10 mb-8 shadow-surface-elevation">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_10px_rgba(0,229,153,0.8)]" />
          <span className="text-xs font-medium tracking-widest text-neutral-300 uppercase">Executive Decision Intelligence</span>
        </motion.div>

        {/* Headline */}
        <motion.div variants={itemVariants}>
          <h1 className="text-5xl md:text-7xl lg:text-[5rem] font-bold tracking-tighter mb-6 max-w-4xl text-balance leading-[1.05]">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/70">Your dashboards look fine.</span><br />
            <span className="text-white/40">Your business might not.</span>
          </h1>
        </motion.div>

        {/* Subheadline */}
        <motion.p variants={itemVariants} className="text-lg md:text-xl text-neutral-400 max-w-2xl mb-6 text-balance leading-relaxed">
          Sentinel analyzes the gap between your stated strategy, your governing KPIs, and actual performance—delivering an unvarnished board-level verdict in under 60 seconds.
        </motion.p>

        {/* Proof element */}
        <motion.div variants={itemVariants} className="flex flex-col items-center gap-3 mb-10">
          <p className="text-sm text-neutral-500 tracking-wide">Built for exec teams. Deterministic rules. No hallucinations.</p>
          <div className="flex items-center gap-2">
            {["Audit-friendly", "Deterministic", "Decision-ready"].map((badge) => (
              <span key={badge} className="text-[11px] font-medium px-3 py-1 rounded-full border border-white/10 text-neutral-400 bg-surface/50">
                {badge}
              </span>
            ))}
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4">
          <button className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-accent text-black font-semibold hover:bg-accent/90 transition-all shadow-[0_0_40px_-10px_rgba(0,229,153,0.4)] hover:shadow-[0_0_60px_-15px_rgba(0,229,153,0.6)] hover:-translate-y-0.5 duration-300">
            Initiate Reality Check
            <ArrowRight className="w-4 h-4" />
          </button>
          <button className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-surface/50 backdrop-blur-md hover:bg-surface border border-white/10 text-white font-medium transition-all shadow-surface-elevation hover:-translate-y-0.5 duration-300">
            <Play className="w-4 h-4 text-neutral-400" fill="currentColor" />
            Review sample verdict
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}
