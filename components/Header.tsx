'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Flame } from 'lucide-react'
import logo from '@/app/icon.png'

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

  const [nameInput, setNameInput] = useState(displayName)
  const [repsInput, setRepsInput] = useState(targetReps)
  const [isUpdating, setIsUpdating] = useState(false)

  const menuRef = useRef<HTMLDivElement>(null)

  // Click-Outside Dropdown Dismissal
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

  // Smooth Scroll Click Handler
  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

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
      {/* Frosted Glass Header */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-zinc-50/75 backdrop-blur-md backdrop-saturate-150 transition-colors duration-200 dark:border-white/10 dark:bg-zinc-950/70">
        <div className="px-4 md:px-8">
          <div className="max-w-6xl mx-auto h-16 flex items-center justify-between">
            
            {/* Logo & Navigation */}
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="flex items-center gap-2.5 group">
                <Image
                  src={logo}
                  alt="Kaizen logo"
                  width={42}
                  height={42}
                  priority
                  className="h-12 w-12 object-contain transition group-hover:scale-105"
                />
                <span className="font-black text-lg tracking-wider text-zinc-900 dark:text-zinc-100">
                  KAIZEN
                </span>
              </Link>

              <nav className="hidden sm:flex items-center gap-5 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                <a 
                  href="#analytics" 
                  onClick={(e) => handleScrollTo(e, 'analytics')}
                  className="hover:text-zinc-900 dark:hover:text-zinc-100 transition cursor-pointer"
                >
                  Performance & Analytics
                </a>
                <a 
                  href="#about" 
                  onClick={(e) => handleScrollTo(e, 'about')}
                  className="hover:text-zinc-900 dark:hover:text-zinc-100 transition cursor-pointer"
                >
                  About
                </a>
              </nav>
            </div>

            {/* Quick Metrics & Profile Dropdown */}
            <div className="flex items-center gap-3">
              
              {/* Active Streak Badge */}
              <div className="hidden lg:flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-400">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>Strength Phase</span>
              </div>

              {/* Metrics Pill */}
              <div className="hidden md:flex items-center gap-3 bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/90 dark:border-white/10 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wider text-zinc-600 dark:text-zinc-400 uppercase shadow-sm">
                <span>Unit: {preferredUnit}</span>
                <span className="text-zinc-300 dark:text-zinc-700">|</span>
                <span>Level: {experienceLevel}</span>
                <span className="text-zinc-300 dark:text-zinc-700">|</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">{targetReps} Rep Target</span>
              </div>

              {/* Profile Dropdown Trigger */}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen((prev) => !prev)
                    setMenuView('main')
                  }}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 hover:border-zinc-400 dark:hover:border-zinc-600 text-zinc-800 dark:text-zinc-200 focus:outline-none transition shadow-sm cursor-pointer"
                  aria-label="User settings menu"
                >
                  <span className="text-xs font-bold uppercase">
                    {displayName ? displayName.slice(0, 2) : userEmail.slice(0, 2)}
                  </span>
                </button>

                {/* Profile Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl py-2 z-50 text-sm animate-in fade-in zoom-in-95 duration-150">
                    
                    {/* VIEW 1: Main Dropdown */}
                    {menuView === 'main' && (
                      <div>
                        <div className="px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
                          <p className="font-bold text-zinc-900 dark:text-zinc-100 truncate">{displayName || 'Athlete'}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{userEmail}</p>
                        </div>

                        <div className="py-1">
                          <button
                            type="button"
                            onClick={() => setMenuView('settings')}
                            className="w-full text-left px-4 py-2 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 transition flex items-center justify-between group cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <span>⚙️</span>
                              <span>Settings</span>
                            </div>
                            <span className="text-xs text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition">
                              →
                            </span>
                          </button>
                        </div>

                        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-1">
                          <button
                            type="button"
                            onClick={handleSignOut}
                            className="w-full text-left px-4 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition font-medium cursor-pointer"
                          >
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}

                    {/* VIEW 2: Settings Submenu */}
                    {menuView === 'settings' && (
                      <div>
                        <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setMenuView('main')}
                            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition text-xs flex items-center gap-1 font-semibold cursor-pointer"
                          >
                            <span>←</span>
                            <span>Back</span>
                          </button>
                          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                            Settings
                          </span>
                        </div>

                        <div className="py-1">
                          <button
                            type="button"
                            onClick={handleOpenNameModal}
                            className="w-full text-left px-4 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 transition flex items-center justify-between cursor-pointer"
                          >
                            <span>Edit Profile Name</span>
                            <span className="text-xs text-zinc-400 font-mono">✎</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleOpenRepsModal}
                            className="w-full text-left px-4 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 transition flex items-center justify-between cursor-pointer"
                          >
                            <span>Edit Target Reps</span>
                            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{targetReps} reps</span>
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Edit Profile Name Modal */}
      {activeModal === 'name' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Edit Profile Name</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleUpdateProfile('display_name', nameInput)
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-950 rounded-xl transition disabled:opacity-50 cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Edit Target Reps</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
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
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1">
                  Target Reps (1 - 12)
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={repsInput}
                  onChange={(e) => setRepsInput(Math.max(1, Math.min(12, Number(e.target.value))))}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500 font-bold"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition disabled:opacity-50 cursor-pointer"
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