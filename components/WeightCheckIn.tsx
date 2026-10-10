'use client'

import React, { useState } from 'react'
import { checkInWeight } from '@/app/actions/weight'

interface WeightCheckInProps {
  currentWeight: number;
  unit: 'kg' | 'lbs';
}

export default function WeightCheckIn({ currentWeight, unit }: WeightCheckInProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    
    const formData = new FormData(e.currentTarget)
    try {
      await checkInWeight(formData)
      setIsEditing(false)
    } catch (err) {
      console.error(err)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl text-white transition-all">
      {!isEditing ? (
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Bodyweight Tracker</p>
            <p className="text-xl font-black mt-0.5">
              {currentWeight} <span className="text-xs font-normal text-slate-500">{unit}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="px-3 py-1.5 text-xs font-bold bg-slate-950 border border-slate-800 hover:border-blue-500/50 hover:text-blue-400 rounded-xl transition duration-200"
          >
            Update Weight ⚖️
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <p className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Log Morning Bodyweight</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                name="weight"
                step="0.1"
                required
                placeholder={currentWeight.toString()}
                disabled={pending}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />
              <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-500 uppercase">{unit}</span>
            </div>
            
            <button
              type="submit"
              disabled={pending}
              className="px-4 py-2 text-sm font-black bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 text-slate-950 rounded-xl transition duration-200 shadow-lg shadow-emerald-500/10"
            >
              {pending ? '...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              disabled={pending}
              className="px-3 py-2 text-sm font-bold bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}