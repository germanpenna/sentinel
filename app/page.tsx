import { Hero } from "@/components/Hero";
import { VerdictDashboard } from "@/components/VerdictDashboard";
import { StrategyTruth } from "@/components/StrategyTruth";
import { Features } from "@/components/Features";
import { AppHeader } from "@/components/AppHeader";

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center w-full relative">
      {/* Subtle Executive Grid Background */}
      <div className="absolute inset-0 bg-grid-pattern [mask-image:radial-gradient(ellipse_at_top,transparent_20%,black)] pointer-events-none" />
      
      <AppHeader />

      <div className="w-full pt-20 flex flex-col items-center relative z-10">
        <Hero />
        
        <div id="verdict-demo" className="w-full relative z-20 -mt-8 pb-16 flex justify-center px-4 scroll-mt-20">
          <div className="w-full max-w-5xl rounded-3xl p-[1px] bg-gradient-to-b from-white/15 to-transparent shadow-[0_20px_80px_-20px_rgba(0,0,0,1)]">
            <VerdictDashboard />
          </div>
        </div>

        <div className="w-full">
          <StrategyTruth />
        </div>
        
        <div className="w-full">
          <Features />
        </div>
      </div>
    </main>
  );
}
