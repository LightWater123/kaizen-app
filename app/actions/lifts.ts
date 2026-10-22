'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Logs a new lift entry with an idempotency guard check
 */
export async function logLift(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized operational context.' }

  const exercise = formData.get('exercise') as string
  const weight = parseFloat(formData.get('weight') as string)
  const reps = parseInt(formData.get('reps') as string, 10)
  const notes = formData.get('notes') as string
  
  const rawRpe = formData.get('rpe')
  const rpe = rawRpe && rawRpe.toString().trim() !== "" 
    ? parseFloat(rawRpe as string) 
    : 8.0

  const customDate = formData.get('logged_at') as string
  const loggedAtTimestamp = customDate 
    ? new Date(customDate).toISOString() 
    : new Date().toISOString()

  const { error } = await supabase
    .from('lift_logs')
    .insert({
      user_id: user.id,
      exercise,
      weight,
      reps,
      rpe,
      notes,
      logged_at: loggedAtTimestamp 
    })

  if (error) {
    // Catch Postgres Unique Index conflict code (23505) or unique constraint keywords
    if (error.code === '23505' || error.message?.includes('unique')) {
      return { 
        success: false, 
        error: `You've already logged a ${exercise} for this date! Right-click or tap the options menu on your existing log below to edit your weights instead.` 
      }
    }   
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true, error: null }
}

/**
 * Updates an existing lift log record from the spreadsheet ledger editor.
 * `loggedAt` is optional so existing callers keep working; when provided,
 * it must be a valid ISO timestamp.
 */
export async function updateLiftLog(
  id: string,
  weight: number,
  reps: number,
  rpe: number,
  notes?: string,
  loggedAt?: string
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized operational context.')

  const updates: Record<string, unknown> = {
    weight,
    reps,
    rpe,
    notes,
  }

  if (loggedAt) {
    const parsed = new Date(loggedAt)
    if (Number.isNaN(parsed.getTime())) {
      throw new Error('Invalid date provided.')
    }
    updates.logged_at = parsed.toISOString()
  }

  const { error } = await supabase
    .from('lift_logs')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    // Moving a lift onto a date that already has an entry for the same exercise
    if (error.code === '23505' || error.message?.includes('unique')) {
      throw new Error(
        'You already have a log for this exercise on that date. Pick a different date or edit the existing entry.'
      )
    }
    throw new Error(error.message)
  }
  
  revalidatePath('/dashboard')
}

/**
 * Deletes a lift log record from the database completely
 */
export async function deleteLiftLog(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized operational context.')

  const { error } = await supabase
    .from('lift_logs')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  
  revalidatePath('/dashboard')
}

/**
 * Deletes multiple lift log records at once (Bulk Purge)
 */
export async function deleteMultipleLiftLogs(ids: string[]) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized operational context.')

  if (ids.length === 0) return

  const { error } = await supabase
    .from('lift_logs')
    .delete()
    .in('id', ids)

  if (error) throw new Error(error.message)
  
  revalidatePath('/dashboard')
}