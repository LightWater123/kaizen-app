'use client'

import React, { useState } from 'react'
import { updateProfile } from '@/app/actions/profile'

export default function WelcomePage() {
  const [unit, setUnit] = useState<'lbs' | 'kg'>('lbs')

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex items-center justify-center p-4 transition-colors duration-200">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900/60 border border-zinc-200/90 dark:border-white/10 rounded-2xl p-6 md:p-8 shadow-sm transition-colors duration-200">
        
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase">
            Initialize Profile
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">
            Calibrate Kaizen to your physical specs.
          </p>
        </div>

        <form action={updateProfile} className="space-y-4">
          
          {/* Age Numeric Field */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
              Age
            </label>
            <input
              type="number"
              name="age"
              min="14"
              max="90"
              placeholder="22"
              className="w-full bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 text-sm font-mono transition"
              required
            />
          </div>

          {/* Biological Sex Selection */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Biological Sex (For Competition Math Validation)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="cursor-pointer">
                <input 
                  type="radio" 
                  name="gender" 
                  value="male" 
                  defaultChecked 
                  className="sr-only peer" 
                />
                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-center font-bold text-sm text-zinc-600 dark:text-zinc-400 peer-checked:border-amber-500 peer-checked:text-amber-700 dark:peer-checked:text-amber-400 peer-checked:bg-amber-500/10 transition duration-150">
                  Male 🚹
                </div>
              </label>

              <label className="cursor-pointer">
                <input 
                  type="radio" 
                  name="gender" 
                  value="female" 
                  className="sr-only peer" 
                />
                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-center font-bold text-sm text-zinc-600 dark:text-zinc-400 peer-checked:border-amber-500 peer-checked:text-amber-700 dark:peer-checked:text-amber-400 peer-checked:bg-amber-500/10 transition duration-150">
                  Female 🚺
                </div>
              </label>
            </div>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1.5">
              Required to automatically assign competitive IPF weight divisions and calculate DOTS coefficients.
            </p>
          </div>

          {/* Metric & Weight Row */}
          <div className="grid grid-cols-2 gap-3">
            
            {/* Preferred Unit Selector */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                Preferred Metric
              </label>
              <select
                name="preferred_unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value as 'lbs' | 'kg')}
                className="w-full bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-3 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 text-sm transition cursor-pointer"
                required
              >
                <option value="lbs">Pounds (lbs)</option>
                <option value="kg">Kilograms (kg)</option>
              </select>
            </div>

            {/* Current Weight Input */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                Bodyweight ({unit})
              </label>
              <input
                type="number"
                name="current_weight"
                step="0.1"
                placeholder={unit === 'lbs' ? '180' : '80'}
                className="w-full bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 text-sm font-mono transition"
                required
              />
            </div>
          </div>

          {/* Training Experience Selection */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
              Training Experience
            </label>
            <select
              name="experience_level"
              className="w-full bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-3 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 text-sm transition cursor-pointer"
              required
            >
              <option value="beginner">Beginner (0 - 2 years consistent lifting)</option>
              <option value="intermediate">Intermediate (3 - 5 years consistent lifting)</option>
              <option value="advanced">Advanced (5+ years / Competitive athlete)</option>
            </select>
          </div>

          {/* Main Action CTA */}
          <button
            type="submit"
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-950 font-bold py-3.5 rounded-xl text-sm shadow-md mt-4 transition-all duration-150 ease-out hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            Complete Onboarding & Launch Dashboard
          </button>
        </form>

      </div>
    </main>
  )
}