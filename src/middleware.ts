import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const token = req.cookies.get('sb-auth-token')?.value;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  });

  // 1. If no token, allow only public routes
  if (!token) {
    if (req.nextUrl.pathname.startsWith('/admin') || 
        req.nextUrl.pathname.startsWith('/dashboard') ||
        req.nextUrl.pathname.startsWith('/leads') ||
        req.nextUrl.pathname.startsWith('/settings')) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return res;
  }

  // 2. Verify User
  const { data: { user } } = await supabase.auth.getUser(token);

  if (!user) {
    if (!req.nextUrl.pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return res;
  }

  // 3. Fetch Role for redirects
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = profile?.role || 'user';

  // 4. If logged in and visiting login, redirect to respective home
  if (req.nextUrl.pathname.startsWith('/login')) {
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // 5. Protect Admin Routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // 6. Protect Dashboard Routes (Admins go to /admin)
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/login',
    '/dashboard/:path*',
    '/admin/:path*',
    '/leads/:path*',
    '/settings/:path*',
    '/follow-ups/:path*',
    '/analytics/:path*',
  ],
};
