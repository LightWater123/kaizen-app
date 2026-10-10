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
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl max-w-xl mx-auto">
      {/* Tab Toggles */}
      <div className="flex border-b border-slate-800 mb-6">
        <button
          onClick={() => setActiveTab('log')}
          className={`pb-3 text-sm font-bold tracking-wider uppercase border-b-2 px-4 transition ${
            activeTab === 'log' 
              ? 'border-blue-500 text-blue-400' 
              : 'border-transparent text-slate-500 hover:text-slate-400'
          }`}
        >
          Log Session
        </button>
        {/* <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 text-sm font-bold tracking-wider uppercase border-b-2 px-4 transition ${
            activeTab === 'history' 
              ? 'border-blue-500 text-blue-400' 
              : 'border-transparent text-slate-500 hover:text-slate-400'
          }`}
        >
          History Logs ({historyLogs.length})
        </button> */}
      </div>

      {/* Tab Content Conditional Rendering */}
      {activeTab === 'log' ? (
        <div>
          <div className="mb-4">
            <p className="text-slate-400 text-xs">
              Instantly save your heaviest training set to regulate next session&apos;s predictions.
            </p>
          </div>
          <LoggingForm unit={unit} />
        </div>
      ) : (
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
          {historyLogs.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-8">No training history found. Log a set to calibrate!</p>
          ) : (
            historyLogs.map((log) => {
              const formattedDate = new Date(log.logged_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })

              return (
                <div key={log.id} className="p-4 bg-slate-950 border border-slate-800/60 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-wider text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-900/30">
                      {log.exercise === 'bench' ? 'Bench Press' : log.exercise}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">{formattedDate}</span>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-white">{log.weight}{unit}</span>
                    <span className="text-xs text-slate-600 px-1">×</span>
                    <span className="text-md font-semibold text-slate-300">{log.reps} reps</span>
                    <span className="ml-auto text-xs font-bold text-amber-500/90 bg-amber-500/10 px-2 py-0.5 rounded">
                      RPE {log.rpe}
                    </span>
                  </div>

                  {log.notes && (
                    <div className="text-xs text-slate-400 border-t border-slate-800/50 pt-2 mt-1 italic">
                      &quot; {log.notes} &quot;
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