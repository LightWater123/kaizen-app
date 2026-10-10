'use client'

import React, { useState } from 'react'
import { updateProfile } from '@/app/actions/profile'

export default function WelcomePage() {
  // Keep track of the active unit selection to update the placeholder dynamically
  const [unit, setUnit] = useState<'lbs' | 'kg'>('lbs')

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl">
        
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-black tracking-tight text-white uppercase">Initialize Profile</h1>
          <p className="text-slate-400 text-xs mt-1">Calibrate Kaizen to your physical specs.</p>
        </div>

        <form action={updateProfile} className="space-y-4">
          
          {/* Age Numeric Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Age
            </label>
            <input
              type="number"
              name="age"
              min="14"
              max="90"
              placeholder="22"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required
            />
          </div>

          {/* Gender / Biological Sex Selection for DOTS Formula Calibration */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Biological Sex (For Competition Math Validation)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="cursor-pointer">
                <input 
                  type="radio" 
                  name="gender" 
                  value="male" 
                  defaultChecked 
                  className="sr-only peer" 
                />
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center font-bold text-sm text-slate-400 peer-checked:border-blue-500 peer-checked:text-blue-400 peer-checked:bg-blue-500/5 transition duration-200">
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
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center font-bold text-sm text-slate-400 peer-checked:border-pink-500 peer-checked:text-pink-400 peer-checked:bg-pink-500/5 transition duration-200">
                  Female 🚺
                </div>
              </label>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Required to automatically assign competitive IPF weight divisions and calculate DOTS coefficients.
            </p>
          </div>

          {/* Metric & Weight Row */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Preferred Unit Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Preferred Metric
              </label>
              <select
                name="preferred_unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value as 'lbs' | 'kg')}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                required
              >
                <option value="lbs">Pounds (lbs)</option>
                <option value="kg">Kilograms (kg)</option>
              </select>
            </div>

            {/* Current Weight Input with Smart Dynamic Placeholders */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Bodyweight ({unit})
              </label>
              <input
                type="number"
                name="current_weight"
                step="0.1"
                placeholder={unit === 'lbs' ? '180' : '80'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                required
              />
            </div>
          </div>

          {/* Training Experience Selection with clear clear breakdowns */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Training Experience
            </label>
            <select
              name="experience_level"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required
            >
              <option value="beginner">Beginner (0 - 2 years consistent lifting)</option>
              <option value="intermediate">Intermediate (3 - 5 years consistent lifting)</option>
              <option value="advanced">Advanced (5+ years / Competitive powerlifter/bodybuilder)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 font-bold py-3 rounded-xl transition text-sm shadow-lg mt-4 shadow-blue-600/10"
          >
            Complete Onboarding & Launch Dashboard
          </button>
        </form>

      </div>
    </main>
  )
}