'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized profile modification setup.')

  const age = parseInt(formData.get('age') as string, 10)
  const experience_level = formData.get('experience_level') as 'beginner' | 'intermediate' | 'advanced'
  const preferred_unit = formData.get('preferred_unit') as 'lbs' | 'kg'
  const current_weight = parseFloat(formData.get('current_weight') as string)
  const gender = formData.get('gender') as 'male' | 'female'

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      age,
      experience_level,
      preferred_unit,
      current_weight,
      gender,
      updated_at: new Date().toISOString()
    })

  if (error) throw new Error(error.message)

  redirect('/dashboard')
}