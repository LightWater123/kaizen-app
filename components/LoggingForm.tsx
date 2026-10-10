'use client'

import { useState, useActionState } from 'react'
import { logLift } from '@/app/actions/lifts'

interface LoggingFormProps {
  unit: 'kg' | 'lbs'
}

export default function LoggingForm({ unit }: LoggingFormProps) {
  const [rpe, setRpe] = useState('8')
  // NEW: Added local state tracking to hold server validation reject messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // Safely initialize today's local date string to set constraints
  const [today] = useState(() => new Date().toISOString().split('T')[0])

  // Native Next.js hook automatically tracks action completion and resets state
  const [, formAction, isSubmitting] = useActionState(async (prevState: unknown, formData: FormData) => {
    setErrorMessage(null) // Reset banner display on every fresh click frame
    try {
      const result = await logLift(formData)
      
      // NEW: Intercept the structured action return parameter instead of crashing
      if (result && !result.success) {
        setErrorMessage(result.error)
      }
    } catch (err) {
      console.error(err)
      setErrorMessage("An unexpected network transmission error occurred.")
    }
  }, null)

  return (
    // Replaced action and removed manual onSubmit handler
    <form action={formAction} className="space-y-4 text-white">
      
      {/* NEW: DYNAMIC ERROR WARNING BANNER ROW */}
      {errorMessage && (
        <div className="p-3 text-xs bg-red-950/40 border border-red-500/20 text-red-400 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200 font-medium leading-relaxed">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Exercise Dropdown Selection Menu */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Exercise
        </label>
        <select 
          name="exercise" 
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          required
        >
          <option value="squat">Squat</option>
          <option value="bench">Bench Press</option>
          <option value="deadlift">Deadlift</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Weight Working Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Weight ({unit})
          </label>
          <input
            type="number"
            name="weight"
            step={unit === 'lbs' ? '5' : '2.5'}
            placeholder={unit === 'lbs' ? '225' : '100'}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            required
          />
        </div>

        {/* Reps Working Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Reps
          </label>
          <input
            type="number"
            name="reps"
            placeholder="5"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            required
          />
        </div>
      </div>

      {/* RPE Selector Track Slider */}
      <div>
        <div className="flex justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
          <span>RPE</span>
          <span className="text-blue-400 font-bold">RPE {rpe}</span>
        </div>
        
        {/* HIDDEN BACKUP INPUT: This guarantees the server always receives a value */}
        <input type="hidden" name="rpe" value={rpe} />
        
        <input
          type="range"
          min="6"
          max="10"
          step="0.5"
          value={rpe}
          onChange={(e) => setRpe(e.target.value)}
          className="w-full h-2 bg-slate-950 border border-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        
        <div className="flex justify-between text-[10px] text-slate-600 px-1 mt-1 font-bold">
          <span>6 (Light)</span>
          <span>8 (Target)</span>
          <span>10 (Max Effort)</span>
        </div>
      </div>

      {/* Optional Training Notes */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Training Notes (Optional)
        </label>
        <input
          type="text"
          name="notes"
          placeholder="Mover felt smooth, focus on leg drive"
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      {/* Calendar Date Picker Integration */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Training Date Calibration
        </label>
        <input
          type="date"
          name="logged_at"
          defaultValue={today}
          max={today}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm scheme-dark cursor-pointer font-medium"
          required
        />
        <p className="text-[10px] text-slate-500 mt-1">
          Forget to track a workout? Use this selector to backdate older training sessions.
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-6z00 hover:bg-blue-500 font-semibold py-3 rounded-xl transition text-sm shadow-lg shadow-blue-600/10 mt-2 disabled:opacity-50"
      >
        {isSubmitting ? 'Saving Performance...' : 'Log Top Set'}
      </button>
    </form>
  )
}