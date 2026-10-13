'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

interface HeaderProps {
  userEmail: string
  displayName: string
  preferredUnit: string
  experienceLevel: string
  targetReps: number
}

export default function Header({
  userEmail,
  displayName,
  preferredUnit,
  experienceLevel,
  targetReps,
}: HeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [menuView, setMenuView] = useState<'main' | 'settings'>('main')
  const [activeModal, setActiveModal] = useState<'none' | 'name' | 'reps'>('none')

  // Form states strictly for controlled modal inputs
  const [nameInput, setNameInput] = useState(displayName)
  const [repsInput, setRepsInput] = useState(targetReps)
  const [isUpdating, setIsUpdating] = useState(false)

  const menuRef = useRef<HTMLDivElement>(null)

  // Close dropdown and reset menu view on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
        setMenuView('main')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const handleCloseMenu = () => {
    setIsMenuOpen(false)
    setMenuView('main')
  }

  const handleOpenNameModal = () => {
    setNameInput(displayName)
    setActiveModal('name')
    handleCloseMenu()
  }

  const handleOpenRepsModal = () => {
    setRepsInput(targetReps)
    setActiveModal('reps')
    handleCloseMenu()
  }

  const handleUpdateProfile = async (
    field: 'display_name' | 'target_reps',
    value: string | number
  ) => {
    setIsUpdating(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      await supabase
        .from('profiles')
        .update({ [field]: value })
        .eq('id', user.id)

      setActiveModal('none')
      router.refresh()
    }
    setIsUpdating(false)
  }

  return (
    <>
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Navigation */}
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-sm">
                KZ
              </span>
              <span className="font-black text-lg tracking-wider text-white">
                KAIZEN
              </span>
            </Link>

            <nav className="hidden sm:flex items-center gap-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Link href="#analytics" className="hover:text-white transition">
                Ledger & Chart
              </Link>
              <Link href="#about" className="hover:text-white transition">
                About
              </Link>
            </nav>
          </div>

          {/* Quick Metrics & User Profile */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wider text-slate-400 uppercase">
              <span>Unit: {preferredUnit}</span>
              <span className="text-slate-700">|</span>
              <span>Level: {experienceLevel}</span>
              <span className="text-slate-700">|</span>
              <span className="text-blue-400">{targetReps} Rep Target</span>
            </div>

            {/* Profile Dropdown Trigger */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen((prev) => !prev)
                  setMenuView('main')
                }}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-200 focus:outline-none transition"
                aria-label="User settings menu"
              >
                <span className="text-xs font-bold uppercase">
                  {displayName ? displayName.slice(0, 2) : userEmail.slice(0, 2)}
                </span>
              </button>

              {/* Profile Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-sm">
                  
                  {/* VIEW 1: Main Dropdown View */}
                  {menuView === 'main' && (
                    <div>
                      {/* Account Summary */}
                      <div className="px-4 py-2.5 border-b border-slate-800/80">
                        <p className="font-bold text-white truncate">{displayName || 'Athlete'}</p>
                        <p className="text-xs text-slate-400 truncate">{userEmail}</p>
                      </div>

                      {/* Navigation Link to Settings Submenu */}
                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => setMenuView('settings')}
                          className="w-full text-left px-4 py-2.5 text-slate-200 hover:bg-slate-800/70 transition flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-2">
                            <span>⚙️</span>
                            <span>Settings</span>
                          </div>
                          <span className="text-xs text-slate-500 group-hover:text-slate-300 transition">
                            →
                          </span>
                        </button>
                      </div>

                      {/* Sign Out Action */}
                      <div className="border-t border-slate-800/80 pt-1">
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2 text-rose-400 hover:bg-rose-500/10 transition font-medium"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}

                  {/* VIEW 2: Nested Settings Submenu */}
                  {menuView === 'settings' && (
                    <div>
                      {/* Settings Header with Back Button */}
                      <div className="px-3 py-2 border-b border-slate-800/80 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setMenuView('main')}
                          className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition text-xs flex items-center gap-1 font-semibold"
                        >
                          <span>←</span>
                          <span>Back</span>
                        </button>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Settings
                        </span>
                      </div>

                      {/* Settings Options */}
                      <div className="py-1">
                        <button
                          type="button"
                          onClick={handleOpenNameModal}
                          className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-800/70 transition flex items-center justify-between"
                        >
                          <span>Edit Profile Name</span>
                          <span className="text-xs text-slate-500 font-mono">✎</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleOpenRepsModal}
                          className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-800/70 transition flex items-center justify-between"
                        >
                          <span>Edit Target Reps</span>
                          <span className="text-xs font-bold text-blue-400">{targetReps} reps</span>
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Edit Profile Name Modal */}
      {activeModal === 'name' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-lg font-bold text-white">Edit Profile Name</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleUpdateProfile('display_name', nameInput)
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-slate-600"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Target Reps Modal */}
      {activeModal === 'reps' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white">Edit Target Reps</h3>
              <p className="text-xs text-slate-400 mt-1">
                Progression loads will calculate your working sets relative to this rep goal.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleUpdateProfile('target_reps', Number(repsInput))
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Target Reps (1 - 12)
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={repsInput}
                  onChange={(e) => setRepsInput(Math.max(1, Math.min(12, Number(e.target.value))))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-bold"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}