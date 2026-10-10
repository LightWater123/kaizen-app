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
  isChecked: boolean;              // Added: Check status parameter
  onToggleSelect: () => void;      // Added: Selection execution callback
}

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

    try {
      await updateLiftLog(log.id, weight, reps, rpe, notes)
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
      className="grid grid-cols-12 gap-2 p-3 text-xs border-b border-slate-800/50 bg-slate-900/20 hover:bg-slate-900/60 items-center transition group select-none"
    >
      {/* 1. CHECKBOX COLUMN BLOCK */}
      <div className="col-span-1 flex items-center pl-1" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={onToggleSelect}
          className="w-3.5 h-3.5 rounded bg-slate-950 border border-slate-800 checked:bg-blue-500 text-blue-500 cursor-pointer accent-blue-500"
        />
      </div>

      {!isEditing ? (
        <>
          {/* Static Spreadsheet Ledger View Adjusted column bounds */}
          <div className="col-span-3 font-bold text-white capitalize">{log.exercise}</div>
          <div className="col-span-2 font-mono text-slate-300">{log.weight}{unit}</div>
          <div className="col-span-2 font-mono text-slate-300">{log.reps}</div>
          <div className="col-span-2 font-mono text-blue-400 font-bold">@{log.rpe}</div>
          <div className="col-span-1 font-mono text-slate-500 text-[10px]">
            {new Date(log.logged_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
          </div>
          
          <div className="col-span-1 text-right">
            <button
              type="button"
              onClick={handleMobileMenuClick}
              className="p-1 text-slate-600 hover:text-white rounded transition md:opacity-0 group-hover:opacity-100 font-bold text-sm"
            >
              ⋮
            </button>
          </div>
          
          {log.notes && (
            <div className="col-span-11 col-start-2 text-[11px] text-slate-500 italic pt-0.5">
              &apos;{log.notes}&apos;
            </div>
          )}
        </>
      ) : (
        /* Dynamic Inline Editor Form Row */
        <form onSubmit={handleUpdateSubmit} className="col-span-11 grid grid-cols-11 gap-2 items-center">
          <div className="col-span-3 font-bold text-slate-400 capitalize">{log.exercise}</div>
          
          <input type="number" name="weight" defaultValue={log.weight} step="0.5" disabled={pending} className="col-span-2 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-white font-mono font-bold focus:outline-none focus:border-blue-500" required />
          <input type="number" name="reps" defaultValue={log.reps} disabled={pending} className="col-span-2 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-white font-mono font-bold focus:outline-none focus:border-blue-500" required />
          <input type="number" name="rpe" defaultValue={log.rpe} step="0.5" max="10" min="5" disabled={pending} className="col-span-2 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-blue-400 font-mono font-bold focus:outline-none focus:border-blue-500" required />
          <input type="text" name="notes" defaultValue={log.notes} placeholder="Edit note..." disabled={pending} className="col-span-1 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300 focus:outline-none text-[11px]" />

          <div className="col-span-1 flex gap-1 justify-end">
            <button type="submit" disabled={pending} className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded font-bold">✓</button>
            <button type="button" onClick={() => setIsEditing(false)} disabled={pending} className="p-1 text-slate-500 hover:bg-slate-800 rounded">✕</button>
          </div>
        </form>
      )}

      {showMenu && (
        <div 
          ref={menuRef}
          style={{ top: `${menuPos.y}px`, left: `${menuPos.x}px` }}
          className="fixed z-[9999] bg-slate-950 border border-slate-800 rounded-xl shadow-2xl p-1 w-32 text-[11px] text-white animate-in fade-in zoom-in-95 duration-100"
        >
          <button type="button" onClick={() => { setIsEditing(true); setShowMenu(false); }} className="w-full text-left p-2 hover:bg-slate-900 rounded-lg font-semibold flex items-center gap-2 transition">✏️ Edit Lift</button>
          <button type="button" onClick={() => { handleDelete(); setShowMenu(false); }} className="w-full text-left p-2 hover:bg-red-950/40 text-red-400 rounded-lg font-semibold flex items-center gap-2 transition">🗑️ Delete Log</button>
        </div>
      )}
    </div>
  )
}