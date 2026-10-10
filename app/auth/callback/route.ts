import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // 1. Get the authenticated user's metadata
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // 2. Fetch the profile row specifically tracking our new mandatory specs
        const { data: profile } = await supabase
          .from('profiles')
          .select('age, current_weight')
          .eq('id', user.id)
          .single()

        // 3. CRITICAL CHECK: If they don't have a profile yet, OR if age/weight 
        // are completely empty (null), they MUST go to onboarding.
        if (!profile || profile.age === null || profile.current_weight === null) {
          return NextResponse.redirect(`${origin}/welcome`)
        }
        
        // 4. Otherwise, they are a fully configured returning lifter!
        return NextResponse.redirect(`${origin}/dashboard`)
      }
    }
  }

  // Fallback for failed handshakes
  return NextResponse.redirect(`${origin}/?error=auth-failed`)
}