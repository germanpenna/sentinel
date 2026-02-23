export function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0 flex justify-center">
      {/* Original Static Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[600px] bg-hero-glow opacity-80" />
      
      {/* Subtle Vertical Data Flow Lines */}
      <div className="absolute inset-0 w-full max-w-5xl mx-auto flex justify-between px-8 opacity-[0.15] [mask-image:linear-gradient(to_bottom,transparent,white_10%,transparent_80%)]">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="relative w-[1px] h-full bg-white/5">
            <div 
              className="absolute top-0 left-0 w-full h-[150px] bg-gradient-to-b from-transparent via-accent to-transparent animate-signal-flow"
              style={{
                animationDelay: `${i * 1.2}s`,
                animationDuration: `${8 + (i % 3) * 2}s`
              }}
            />
          </div>
        ))}
      </div>
      
      {/* Lightweight Inline CSS Animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes signal-flow {
          0% { transform: translateY(-150px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        .animate-signal-flow {
          animation: signal-flow linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-signal-flow {
            animation: none;
            display: none;
          }
        }
      `}} />
    </div>
  );
}
