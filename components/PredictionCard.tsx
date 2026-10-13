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
  previousDate?: string | null; // NEW: Optional date tracking string prop (e.g., "Jun 8")
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

  // Change card colors conditionally depending on engine status
  const cardBorderColor = isFirstSession 
    ? 'border-slate-800' 
    : isDeload 
      ? 'border-amber-500/70 bg-amber-950/10' 
      : 'border-slate-800';

  const badgeStyles = isDeload 
    ? 'text-amber-400 font-bold' 
    : 'text-emerald-400 font-medium';

  return (
    <div className={`border rounded-2xl p-6 shadow-xl text-white flex flex-col justify-between transition-all duration-300 ${cardBorderColor} ${isDeload ? 'bg-slate-900/40' : 'bg-slate-900'}`}>
      <div>
        <div className="flex justify-between items-start">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
            {exerciseName} Target
          </h3>
          {isDeload && (
            <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded border border-amber-500/30">
              Deload
            </span>
          )}
        </div>
        
        {isFirstSession ? (
          <div className="mt-2">
            <span className="text-xl font-bold text-white-400">Engine Calibrating</span>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">{message}</p>
          </div>
        ) : (
          <div className="mt-2">
            <div>
              <span className="text-5xl font-black tracking-tight text-white">
                {targetWeight}
                <span className="text-xl font-normal text-slate-500 ml-1">{unit}</span>
              </span>
              <span className="mx-3 text-3xl font-light text-slate-700">×</span>
              <span className="text-4xl font-extrabold text-blue-500">
                {targetReps}
                <span className="text-sm font-normal text-slate-500 ml-0.5"> reps</span>
              </span>
            </div>

            {/* UPDATED: Displays performance stats side-by-side with localized calendar date info */}
            {previousLift && (
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400 font-medium flex-wrap">
                <span className="text-slate-600">Last Session:</span>
                <span className="text-slate-300 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-md font-semibold">
                  {previousLift}
                </span>
                {previousDate && (
                  <span className="text-[11px] text-slate-500 font-medium font-mono">
                    on {previousDate}
                  </span>
                )}
              </div>
            )}

            {plates && Object.keys(plates.platesPerSide).length > 0 && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setShowPlates(!showPlates)}
                  className="text-xs text-slate-400 hover:text-blue-400 underline underline-offset-2 transition font-semibold"
                >
                  {showPlates ? 'Hide Plate Loader' : 'Show Plate Loading 🔍'}
                </button>

                {showPlates && (
                  <div className="mt-2 p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Plates per side ({plates.barbell}{unit} bar):
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {Object.entries(plates.platesPerSide).map(([plate, count]) => (
                        <span 
                          key={plate} 
                          className={`px-2.5 py-1 text-xs font-black rounded-lg bg-slate-900 border ${isDeload ? 'border-amber-900/60 text-amber-400' : 'border-blue-900/60 text-blue-400'}`}
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