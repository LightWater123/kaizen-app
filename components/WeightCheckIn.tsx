'use client'

import React, { useState } from 'react'
import { checkInWeight } from '@/app/actions/weight'

interface WeightCheckInProps {
  currentWeight: number;
  unit: 'kg' | 'lbs';
}

// Keeps only digits and a single decimal point (max 3 whole digits, 1 decimal place)
function sanitizeWeight(raw: string): string {
  const cleaned = raw.replace(/[^0-9.]/g, '')
  const [whole, ...rest] = cleaned.split('.')
  const wholePart = whole.slice(0, 3)

  if (rest.length === 0) return wholePart
  return `${wholePart}.${rest.join('').slice(0, 1)}`
}

export default function WeightCheckIn({ currentWeight, unit }: WeightCheckInProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [pending, setPending] = useState(false)
  const [weightInput, setWeightInput] = useState('')

  const parsedWeight = parseFloat(weightInput)
  const isValid = !Number.isNaN(parsedWeight) && parsedWeight > 0

  function closeEditor() {
    setIsEditing(false)
    setWeightInput('')
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!isValid) return
    setPending(true)

    const formData = new FormData(e.currentTarget)
    try {
      await checkInWeight(formData)
      closeEditor()
    } catch (err) {
      console.error(err)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200/90 dark:border-white/10 rounded-2xl p-4 shadow-sm text-zinc-900 dark:text-zinc-50 transition-colors">
      {!isEditing ? (
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">
              Bodyweight Tracker
            </p>
            <p className="text-xl font-black mt-0.5 text-zinc-900 dark:text-zinc-50">
              {currentWeight} <span className="text-xs font-normal text-zinc-400 dark:text-zinc-500">{unit}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="px-3.5 py-1.5 text-xs font-bold bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl transition-all duration-150 ease-out hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer"
          >
            Update Weight ⚖️
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <p className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 tracking-wider">
            Log Morning Bodyweight
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*\.?[0-9]?"
                autoComplete="off"
                name="weight"
                required
                value={weightInput}
                onChange={(e) => setWeightInput(sanitizeWeight(e.target.value))}
                placeholder={currentWeight.toString()}
                disabled={pending}
                className="w-full bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm font-bold text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 disabled:opacity-50 transition font-mono"
              />
              <span className="absolute right-3 top-2.5 text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase">
                {unit}
              </span>
            </div>

            <button
              type="submit"
              disabled={pending || !isValid}
              className="px-4 py-2 text-sm font-bold bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-950 rounded-xl transition-all duration-150 ease-out hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {pending ? '...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={closeEditor}
              disabled={pending}
              className="px-3 py-2 text-sm font-semibold bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-xl transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}