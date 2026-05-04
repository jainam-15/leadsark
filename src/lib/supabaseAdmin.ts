import { createClient } from '@supabase/supabase-js';

// SECURE: This client uses the service_role key and MUST ONLY be used in server-side code.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Initialize ONLY on server
export const supabaseAdmin = (typeof window === 'undefined' && supabaseServiceKey)
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

if (typeof window !== 'undefined' && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('SECURITY WARNING: SUPABASE_SERVICE_ROLE_KEY is exposed to the client!');
}
