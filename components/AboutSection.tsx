export default function AboutSection() {
  return (
    <section id="about" className="border-t border-slate-800/80 pt-12 pb-16 scroll-mt-20">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 md:p-8 space-y-6">
        
        {/* Header */}
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            About Kaizen
          </span>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Built for Continuous Progression
          </h2>
          <p className="text-sm text-slate-400">
            A smart analytics platform engineered to eliminate guesswork from progressive overload.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-4 space-y-2">
            <h3 className="text-sm font-semibold text-slate-200">
              RPE & Load Prediction
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calculates dynamic training targets based on recent session volume, recovery, and RPE history.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-4 space-y-2">
            <h3 className="text-sm font-semibold text-slate-200">
              Comprehensive Ledger
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Detailed historical tracking for compound movements with visual trend trajectories.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-4 space-y-2">
            <h3 className="text-sm font-semibold text-slate-200">
              Relative Strength Index
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Benchmarks your big three lifts against your current body weight to scale performance tiers.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-800/60 pt-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
          <p>
            Crafted by: <span className="text-slate-300 font-medium">Red Guzman</span>
          </p>
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-slate-300 transition">
              GitHub
            </a>    
            <span>•</span>
            <span>v1.0.0</span>
          </div>
        </div>

      </div>
    </section>
  )
}