
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length === 2) env[parts[0].trim()] = parts[1].trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPolicies() {
  try {
    const { data, error } = await supabase.from('pg_policies').select('*').eq('tablename', 'message_templates');
    // pg_policies is a view in pg_catalog, standard Supabase role can't read it easily via .from()
    // We'll try to just run a SELECT 1 from the table and see if it works
    const { error: readError } = await supabase.from('message_templates').select('id').limit(1);
    if (readError) {
      console.log('Read test failed:', readError.message);
    } else {
      console.log('Read test successful.');
    }
    
    // Check if we can insert
    const { error: insertError } = await supabase.from('message_templates').insert({ name: 'test', business_id: '00000000-0000-0000-0000-000000000000' }).select();
    if (insertError) {
       console.log('Insert test failed:', insertError.message);
    } else {
       console.log('Insert test successful (should fail if 0000.. is not valid but it validates policy)');
    }
  } catch (err) {
    console.error(err);
  }
}

checkPolicies();
