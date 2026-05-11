
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'message_templates' });
  if (error) {
    // If RPC doesn't exist, try a direct query to information_schema
    const { data: cols, error: err2 } = await supabase.from('message_templates').select('*').limit(0);
    if (err2) {
      console.error('Error fetching columns:', err2);
    } else {
      console.log('Columns in message_templates:', Object.keys(cols[0] || {}));
    }
  } else {
    console.log('Columns:', data);
  }
}

checkSchema();
