'use client'

import React, { useState } from 'react'
import { calculatePlates } from '@/utils/plates'

interface PredictionCardProps {
  exerciseName: string;
  targetWeight: number | null;
  targetReps: number | null;
  message: string;
  isFirstSession: boolean;
  isDeload?: boolean;
  unit: 'lbs' | 'kg';
  previousLift?: string | null;
  previousDate?: string | null;
}

export default function PredictionCard({ 
  exerciseName, 
  targetWeight, 
  targetReps, 
  message, 
  isFirstSession,
  isDeload = false,
  unit,
  previousLift,
  previousDate
}: PredictionCardProps) {
  const [showPlates, setShowPlates] = useState(false);
  const plates = targetWeight ? calculatePlates(targetWeight, unit) : null;

  // Outer container color variables
  const cardBorderColor = isDeload 
    ? 'border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/10 dark:border-amber-500/30' 
    : 'border-zinc-200/90 dark:border-white/10 bg-white dark:bg-zinc-900/60';

  const badgeStyles = isDeload 
    ? 'text-amber-700 dark:text-amber-400 font-semibold' 
    : 'text-zinc-600 dark:text-zinc-300 font-medium';

  return (
    <div className={`border rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all duration-300 ${cardBorderColor}`}>
      <div>
        <div className="flex justify-between items-start">
          <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1">
            {exerciseName} Target
          </h3>
          {isDeload && (
            <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded border border-amber-500/30">
              Deload
            </span>
          )}
        </div>
        
        {isFirstSession ? (
          <div className="mt-2">
            <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Engine Calibrating</span>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">{message}</p>
          </div>
        ) : (
          <div className="mt-2">
            <div>
              <span className="text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                {targetWeight}
                <span className="text-xl font-normal text-zinc-400 dark:text-zinc-500 ml-1">{unit}</span>
              </span>
              <span className="mx-3 text-3xl font-light text-zinc-400 dark:text-zinc-600">×</span>
              <span className="text-4xl font-extrabold text-amber-600 dark:text-amber-400">
                {targetReps}
                <span className="text-sm font-normal text-zinc-400 dark:text-zinc-500 ml-0.5"> reps</span>
              </span>
            </div>

            {/* Previous Session Badge */}
            {previousLift && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium flex-wrap">
                <span className="text-zinc-400 dark:text-zinc-500">Last Session:</span>
                <span className="text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded-md font-semibold font-mono text-[11px]">
                  {previousLift}
                </span>
                {previousDate && (
                  <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium font-mono">
                    on {previousDate}
                  </span>
                )}
              </div>
            )}

            {/* REFACTORED PLATE LOADER SECTION */}
            {plates && Object.keys(plates.platesPerSide).length > 0 && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setShowPlates(!showPlates)}
                  className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 underline underline-offset-2 transition font-semibold cursor-pointer"
                >
                  {showPlates ? 'Hide Plate Loader' : 'Show Plate Loading 🔍'}
                </button>

                {showPlates && (
                  <div className="mt-2 p-3 bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                    <p className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                      Plates per side ({plates.barbell}{unit} bar):
                    </p>
                    <div className="flex flex-wrap gap-2 pt-0.5">
                      {Object.entries(plates.platesPerSide).map(([plate, count]) => (
                        <span 
                          key={plate} 
                          className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-white dark:bg-zinc-900 border border-amber-500/30 text-amber-700 dark:text-amber-400 shadow-xs"
                        >
                          {count}x {plate}{unit}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <p className={`text-xs mt-4 flex items-center gap-1 leading-relaxed ${badgeStyles}`}>
              {isDeload ? '🔋' : '⚡'} {message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}