
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPolicies() {
  const { data, error } = await supabase.rpc('get_policies', { table_name: 'message_templates' });
  if (error) {
    console.log('RPC get_policies failed, likely not defined. Trying query...');
    const { data: policies, error: err2 } = await supabase.rpc('exec_sql', { sql: "SELECT * FROM pg_policies WHERE tablename = 'message_templates';" });
    if (err2) {
      console.error('Error fetching policies:', err2);
    } else {
      console.log('Policies for message_templates:', policies);
    }
  } else {
    console.log('Policies:', data);
  }
}

checkPolicies();
