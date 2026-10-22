'use client'

import React, { useState, useEffect, useRef } from 'react'
import { updateLiftLog, deleteLiftLog } from '@/app/actions/lifts'

interface LedgerRowProps {
  log: {
    id: string;
    exercise: string;
    weight: number;
    reps: number;
    rpe: number;
    notes?: string;
    logged_at: string;
  };
  unit: 'kg' | 'lbs';
  isChecked: boolean;
  onToggleSelect: () => void;
}

// Converts an ISO timestamp into the local YYYY-MM-DD string a date input expects
function toDateInputValue(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Builds a new ISO timestamp from a picked date, keeping the original time of day
// so lifts logged on the same day stay in their original order
function buildTimestamp(dateStr: string, originalIso: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const orig = new Date(originalIso)
  const next = new Date(y, m - 1, d, orig.getHours(), orig.getMinutes(), orig.getSeconds())
  return next.toISOString()
}

const labelClass =
  'block mb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400'

const inputClass =
  'w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 font-mono font-bold focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/60 disabled:opacity-50 transition'

export default function LedgerRow({ log, unit, isChecked, onToggleSelect }: LedgerRowProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 })
  const [isEditing, setIsEditing] = useState(false)
  const [pending, setPending] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setMenuPos({ x: e.clientX, y: e.clientY })
    setShowMenu(true)
  }

  const handleMobileMenuClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    setMenuPos({ x: rect.left - 120, y: rect.top + rect.height + 4 })
    setShowMenu(true)
  }

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && menuRef.current.contains(e.target as Node)) return
      setShowMenu(false)
    }
    if (showMenu) window.addEventListener('click', handleOutsideClick)
    return () => window.removeEventListener('click', handleOutsideClick)
  }, [showMenu])

  const handleDelete = async () => {
    if (!confirm('Permanently delete this lift log record?')) return
    setPending(true)
    try {
      await deleteLiftLog(log.id)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An unknown database error occurred.')
    } finally {
      setPending(false)
    }
  }

  const handleUpdateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPending(true)

    const formData = new FormData(e.currentTarget)
    const weight = parseFloat(formData.get('weight') as string)
    const reps = parseInt(formData.get('reps') as string, 10)
    const rpe = parseFloat(formData.get('rpe') as string)
    const notes = formData.get('notes') as string
    const dateStr = formData.get('date') as string

    // Only change the timestamp if the date was actually edited
    const loggedAt =
      dateStr && dateStr !== toDateInputValue(log.logged_at)
        ? buildTimestamp(dateStr, log.logged_at)
        : log.logged_at

    try {
      await updateLiftLog(log.id, weight, reps, rpe, notes, loggedAt)
      setIsEditing(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to process lift log updates.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div
      onContextMenu={handleContextMenu}
      className="grid grid-cols-12 gap-2 p-3 text-xs border-b border-zinc-200 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/30 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 items-center transition group select-none"
    >
      {/* 1. CHECKBOX COLUMN BLOCK */}
      <div className="col-span-1 flex items-center pl-1" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={onToggleSelect}
          className="w-3.5 h-3.5 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 checked:bg-zinc-900 dark:checked:bg-amber-500 cursor-pointer accent-amber-500"
        />
      </div>

      {!isEditing ? (
        <>
          {/* Static Ledger View Row */}
          <div className="col-span-3 font-bold text-zinc-900 dark:text-zinc-100 capitalize">
            {log.exercise}
          </div>
          <div className="col-span-2 font-mono text-zinc-700 dark:text-zinc-300 font-medium">
            {log.weight}{unit}
          </div>
          <div className="col-span-2 font-mono text-zinc-700 dark:text-zinc-300 font-medium">
            {log.reps}
          </div>
          <div className="col-span-2 font-mono text-amber-700 dark:text-amber-400 font-bold">
            @{log.rpe}
          </div>
          <div className="col-span-1 font-mono text-zinc-400 dark:text-zinc-500 text-[10px]">
            {new Date(log.logged_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </div>

          <div className="col-span-1 text-right">
            <button
              type="button"
              onClick={handleMobileMenuClick}
              className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded transition md:opacity-0 group-hover:opacity-100 font-bold text-sm cursor-pointer"
            >
              ⋮
            </button>
          </div>

          {log.notes && (
            <div className="col-span-11 col-start-2 text-[11px] text-zinc-500 dark:text-zinc-400 italic pt-0.5">
              &apos;{log.notes}&apos;
            </div>
          )}
        </>
      ) : (
        /* Dynamic Inline Editor */
        <form
          onSubmit={handleUpdateSubmit}
          className="col-span-11 flex flex-col gap-3 select-text"
        >
          {/* Exercise title (not editable) */}
          <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100 capitalize">
            Editing {log.exercise}
          </div>

          {/* Weight / Reps / RPE / Date */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <label htmlFor={`weight-${log.id}`} className={labelClass}>
                Weight ({unit})
              </label>
              <input
                id={`weight-${log.id}`}
                type="number"
                name="weight"
                defaultValue={log.weight}
                step="0.5"
                min="0"
                disabled={pending}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label htmlFor={`reps-${log.id}`} className={labelClass}>
                Reps
              </label>
              <input
                id={`reps-${log.id}`}
                type="number"
                name="reps"
                defaultValue={log.reps}
                min="1"
                disabled={pending}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label htmlFor={`rpe-${log.id}`} className={labelClass}>
                RPE
              </label>
              <input
                id={`rpe-${log.id}`}
                type="number"
                name="rpe"
                defaultValue={log.rpe}
                step="0.5"
                min="5"
                max="10"
                disabled={pending}
                className={`${inputClass} !text-amber-700 dark:!text-amber-400`}
                required
              />
            </div>

            <div>
              <label htmlFor={`date-${log.id}`} className={labelClass}>
                Date
              </label>
              <input
                id={`date-${log.id}`}
                type="date"
                name="date"
                defaultValue={toDateInputValue(log.logged_at)}
                max={toDateInputValue(new Date().toISOString())}
                disabled={pending}
                className={`${inputClass} dark:[color-scheme:dark]`}
                required
              />
            </div>
          </div>

          {/* Notes + actions */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-2">
            <div className="flex-1">
              <label htmlFor={`notes-${log.id}`} className={labelClass}>
                Notes
              </label>
              <input
                id={`notes-${log.id}`}
                type="text"
                name="notes"
                defaultValue={log.notes}
                placeholder="Add a note..."
                disabled={pending}
                className={`${inputClass} font-sans font-normal`}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={pending}
                className="px-3 py-1.5 text-xs font-semibold bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pending}
                className="px-3 py-1.5 text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-950 rounded-lg transition cursor-pointer disabled:opacity-50"
              >
                {pending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Floating Context Menu */}
      {showMenu && (
        <div
          ref={menuRef}
          style={{ top: `${menuPos.y}px`, left: `${menuPos.x}px` }}
          className="fixed z-[9999] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl p-1 w-32 text-[11px] text-zinc-800 dark:text-zinc-200 animate-in fade-in zoom-in-95 duration-100"
        >
          <button
            type="button"
            onClick={() => { setIsEditing(true); setShowMenu(false) }}
            className="w-full text-left p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg font-semibold flex items-center gap-2 transition cursor-pointer"
          >
            Edit Lift
          </button>
          <button
            type="button"
            onClick={() => { handleDelete(); setShowMenu(false) }}
            className="w-full text-left p-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-lg font-semibold flex items-center gap-2 transition cursor-pointer"
          >
            Delete Log
          </button>
        </div>
      )}
    </div>
  )
}