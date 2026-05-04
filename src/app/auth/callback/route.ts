import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { ensureUserBusinessSetup } from '@/lib/auth-helpers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && session) {
      // Set a cookie manually for our middleware (since we aren't using @supabase/ssr yet)
      const response = NextResponse.redirect(new URL('/dashboard', request.url))
      response.cookies.set('sb-auth-token', session.access_token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
      })

      // Ensure business setup is done
      await ensureUserBusinessSetup(
        session.user.id, 
        session.user.email!,
        session.user.user_metadata?.business_name,
        session.user.user_metadata?.full_name
      )
      
      return response
    }
  }

  // URL to redirect to if error or no code
  return NextResponse.redirect(new URL('/login', request.url))
}
