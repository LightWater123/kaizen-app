'use client'

import { useState } from 'react'
import LoggingForm from './LoggingForm'

interface HistoryItem {
  id: number
  exercise: string
  weight: number
  reps: number
  rpe: number
  notes: string | null
  logged_at: string
}

interface TabsContainerProps {
  unit: 'kg' | 'lbs'
  historyLogs: HistoryItem[]
}

export default function TabsContainer({ unit, historyLogs }: TabsContainerProps) {
  const [activeTab, setActiveTab] = useState<'log' | 'history'>('log')

  return (
    <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200/90 dark:border-white/10 rounded-2xl p-6 md:p-8 shadow-sm max-w-xl mx-auto w-full transition-colors">

      {/* Tab Toggles */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 mb-6">
        <button
          onClick={() => setActiveTab('log')}
          className={`pb-3 text-sm font-bold tracking-wider uppercase border-b-2 px-4 transition ${
            activeTab === 'log' 
              ? 'border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100' 
              : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          Log Session
        </button>
        
      </div>

      {/* Tab Content Conditional Rendering */}
      {/* Tab Content Conditional Rendering */}
      {activeTab === 'log' ? (
        <div>
          <div className="mb-4">
            <p className="text-zinc-500 dark:text-zinc-400 text-xs">
              Instantly save your heaviest training set to regulate next session&apos;s predictions.
            </p>
          </div>
          <LoggingForm unit={unit} />
        </div>
      ) : (
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
          {historyLogs.length === 0 ? (
            <p className="text-center text-sm text-zinc-400 dark:text-zinc-500 py-8">
              No training history found. Log a set to calibrate!
            </p>
          ) : (
            historyLogs.map((log) => {
              const formattedDate = new Date(log.logged_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })

              return (
                <div key={log.id} className="p-4 bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 bg-zinc-200/70 dark:bg-zinc-800 px-2 py-0.5 rounded">
                      {log.exercise === 'bench' ? 'Bench Press' : log.exercise}
                    </span>
                    <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">{formattedDate}</span>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{log.weight}{unit}</span>
                    <span className="text-xs text-zinc-400 px-1">×</span>
                    <span className="text-md font-semibold text-zinc-700 dark:text-zinc-300">{log.reps} reps</span>
                    <span className="ml-auto text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                      RPE {log.rpe}
                    </span>
                  </div>

                  {log.notes && (
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800/80 pt-2 mt-1 italic">
                      &quot;{log.notes}&quot;
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}