
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length === 2) env[parts[0].trim()] = parts[1].trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectProfiles() {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, business_id, role');
  
  if (error) {
    console.error(error);
    return;
  }

  console.log('--- Profiles ---');
  profiles.forEach(p => {
    console.log(`${p.email} | ID: ${p.id} | Business: ${p.business_id || 'MISSING'} | Role: ${p.role}`);
  });
}

inspectProfiles();
