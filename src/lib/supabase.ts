import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== 'undefined') {
    console.error('CRITICAL: Supabase environment variables are missing! Check Vercel settings.');
  }
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Safe runtime check
if (typeof window !== 'undefined') {
  console.log('[Supabase] Frontend check:', {
    urlFound: !!supabaseUrl,
    keyFound: !!supabaseAnonKey,
    configured: isSupabaseConfigured
  });
}
