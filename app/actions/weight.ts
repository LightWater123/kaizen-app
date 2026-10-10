'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function checkInWeight(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized weight log context.')

  const newWeight = parseFloat(formData.get('weight') as string)
  if (isNaN(newWeight) || newWeight <= 0) throw new Error('Invalid weight payload submission.')

  const { error } = await supabase
    .from('profiles')
    .update({ 
      current_weight: newWeight,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) throw new Error(error.message)

  // Revalidate the dashboard cache so the DOTS math and weight label refresh instantly
  revalidatePath('/dashboard')
}