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
}

export default function Header({
  userEmail,
  displayName,
  preferredUnit,
  experienceLevel,
}: HeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [name, setName] = useState(displayName)
  const [isUpdating, setIsUpdating] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
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

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      await supabase
        .from('profiles')
        .update({ display_name: name })
        .eq('id', user.id)

      setIsEditModalOpen(false)
      setIsMenuOpen(false)
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
            </div>

            {/* Profile Menu Trigger */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-200 focus:outline-none transition"
                aria-label="User settings menu"
              >
                <span className="text-xs font-bold uppercase">
                  {name ? name.slice(0, 2) : userEmail.slice(0, 2)}
                </span>
              </button>

              {/* Settings Dropdown */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-2 z-50 text-sm">
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="font-semibold text-white truncate">{name || 'Athlete'}</p>
                    <p className="text-xs text-slate-400 truncate">{userEmail}</p>
                  </div>

                  <button
                    onClick={() => {
                      setIsEditModalOpen(true)
                      setIsMenuOpen(false)
                    }}
                    className="w-full text-left px-4 py-2.5 text-slate-300 hover:bg-slate-800/80 transition flex items-center gap-2"
                  >
                    <span>Edit Profile Name</span>
                  </button>

                  <div className="border-t border-slate-800 my-1" />

                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2.5 text-rose-400 hover:bg-rose-500/10 transition flex items-center gap-2"
                  >
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-lg font-bold text-white">Edit Profile Name</h3>
            <form onSubmit={handleUpdateName} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter name"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-slate-600"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
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
    </>
  )
}   