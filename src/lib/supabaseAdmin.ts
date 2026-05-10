import { createClient } from '@supabase/supabase-js';

// SECURE: This client uses the service_role key and MUST ONLY be used in server-side code.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Initialize the admin client ONLY if the service key is available
const client = (supabaseUrl && supabaseServiceKey) 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Export the client. It will be null on the frontend but won't crash during import.
// Server-side code should always have the keys configured.
export const supabaseAdmin = client!;

if (typeof window !== 'undefined' && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('SECURITY WARNING: SUPABASE_SERVICE_ROLE_KEY is exposed to the client!');
}
