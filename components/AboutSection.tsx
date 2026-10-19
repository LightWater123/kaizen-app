export default function AboutSection() {
  return (
    <section id="about" className="border-t border-zinc-200 dark:border-zinc-800/80 pt-12 pb-16 scroll-mt-20">
      <div className="rounded-2xl border border-zinc-200/90 dark:border-white/10 bg-white dark:bg-zinc-900/60 p-6 md:p-8 space-y-6 shadow-sm transition-colors duration-200">
        
        {/* Header */}
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            About Kaizen
          </span>
          <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Built for Continuous Progression
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            A smart analytics platform engineered to eliminate guesswork from progressive overload.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/60 p-4 space-y-2">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              RPE & Load Prediction
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Calculates dynamic training targets based on recent session volume, recovery, and RPE history.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/60 p-4 space-y-2">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Comprehensive Ledger
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Detailed historical tracking for compound movements with visual trend trajectories.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/60 p-4 space-y-2">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Relative Strength Index
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Benchmarks your big three lifts against your current body weight to scale performance tiers.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="border-t border-zinc-200 dark:border-zinc-800/80 pt-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 gap-2">
          <p>
            Crafted by: <span className="text-zinc-900 dark:text-zinc-200 font-medium">Red Guzman</span>
          </p>
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-zinc-900 dark:hover:text-zinc-100 transition"
            >
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