'use client'

import { useState, useActionState } from 'react'
import { logLift } from '@/app/actions/lifts'

interface LoggingFormProps {
  unit: 'kg' | 'lbs'
}

export default function LoggingForm({ unit }: LoggingFormProps) {
  const [rpe, setRpe] = useState('8')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [today] = useState(() => new Date().toISOString().split('T')[0])

  const [, formAction, isSubmitting] = useActionState(async (prevState: unknown, formData: FormData) => {
    setErrorMessage(null)
    try {
      const result = await logLift(formData)
      if (result && !result.success) {
        setErrorMessage(result.error)
      }
    } catch (err) {
      console.error(err)
      setErrorMessage("An unexpected network transmission error occurred.")
    }
  }, null)

  // Standard input appearance classes
  const inputBaseClasses = 
    "w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 text-sm transition font-medium"

  return (
    <>
      {/* Scoped CSS for the Amber Range Slider thumb */}
      <style jsx>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 9999px;
          background: #f59e0b; /* Amber 500 */
          cursor: pointer;
          border: 2px solid #18181b;
          box-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
          transition: transform 0.1s ease;
        }
        input[type='range']::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
        input[type='range']::-moz-range-thumb {
          height: 18px;
          width: 18px;
          border-radius: 9999px;
          background: #f59e0b;
          cursor: pointer;
          border: 2px solid #18181b;
          box-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
        }
      `}</style>

      <form action={formAction} className="space-y-4 text-zinc-100">
        
        {/* Error banner */}
        {errorMessage && (
          <div className="p-3 text-xs bg-rose-950/40 border border-rose-900/50 text-rose-300 rounded-xl font-medium leading-relaxed">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Exercise Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
            Exercise
          </label>
          <div className="relative">
            <select 
              name="exercise" 
              className={`${inputBaseClasses} cursor-pointer appearance-none pr-10`}
              required
            >
              <option value="squat" className="bg-zinc-900 text-zinc-100">Squat</option>
              <option value="bench" className="bg-zinc-900 text-zinc-100">Bench Press</option>
              <option value="deadlift" className="bg-zinc-900 text-zinc-100">Deadlift</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Weight Working Input */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Weight ({unit})
            </label>
            <input
              type="number"
              name="weight"
              step={unit === 'lbs' ? '5' : '2.5'}
              placeholder={unit === 'lbs' ? '225' : '100'}
              className={inputBaseClasses}
              required
            />
          </div>

          {/* Reps Working Input */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Reps
            </label>
            <input
              type="number"
              name="reps"
              placeholder="5"
              className={inputBaseClasses}
              required
            />
          </div>
        </div>

        {/* RPE Selector Track Slider */}
        <div className="pt-1">
          <div className="flex justify-between text-xs font-semibold uppercase tracking-wider mb-2">
            <span className="text-zinc-400">RPE</span>
            <span className="text-amber-400 font-bold tracking-normal">RPE {rpe}</span>
          </div>
          
          <input type="hidden" name="rpe" value={rpe} />
          
          <input
            type="range"
            min="6"
            max="10"
            step="0.5"
            value={rpe}
            onChange={(e) => setRpe(e.target.value)}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer outline-none transition"
          />
          
          <div className="flex justify-between text-[11px] text-zinc-500 px-0.5 mt-2 font-medium">
            <span>6 (Light)</span>
            <span className="text-zinc-400">8 (Target)</span>
            <span>10 (Max Effort)</span>
          </div>
        </div>

        {/* Optional Training Notes */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
            Training Notes (Optional)
          </label>
          <input
            type="text"
            name="notes"
            placeholder="Mover felt smooth, focus on leg drive"
            className={inputBaseClasses}
          />
        </div>

        {/* Calendar Date Picker */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
            Training Date Calibration
          </label>
          <input
            type="date"
            name="logged_at"
            defaultValue={today}
            max={today}
            className={`${inputBaseClasses} cursor-pointer [color-scheme:dark]`}
            required
          />
          <p className="text-[11px] text-zinc-500 mt-1.5">
            Forget to track a workout? Use this selector to backdate older training sessions.
          </p>
        </div>

        {/* Primary Action Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-zinc-100 hover:bg-white text-zinc-950 font-bold py-3.5 rounded-xl text-sm shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-md disabled:opacity-50 transition-all duration-150 ease-out cursor-pointer mt-4"
        >
          {isSubmitting ? 'Saving Performance...' : 'Log Top Set'}
        </button>
      </form>
    </>
  )
}