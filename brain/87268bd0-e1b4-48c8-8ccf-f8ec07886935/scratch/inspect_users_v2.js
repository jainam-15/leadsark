
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fvelolcvpletdodsuskc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2ZWxvbGN2cGxldGRvZHN1c2tjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzgxODgyNywiZXhwIjoyMDkzMzk0ODI3fQ.VAgkntIdH0hO7d4TWxDFP-AOs5yafHd90qHweHnqzag';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspect() {
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  console.log('Auth Users Details:', JSON.stringify(authUsers.users.map(u => ({ 
    id: u.id, 
    email: u.email, 
    confirmed: !!u.email_confirmed_at,
    last_login: u.last_sign_in_at
  })), null, 2));
}

inspect().catch(console.error);
