
const { createClient } = require('@supabase/supabase-js');

async function auditDatabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing env vars');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('--- AUDIT REPORT ---');

  // 1. Check for bad data
  const { data: badBusinesses } = await supabase.from('businesses').select('id, owner_id, name').is('owner_id', null);
  console.log('Businesses with owner_id NULL:', badBusinesses?.length || 0);
  if (badBusinesses?.length) console.log(badBusinesses);

  const { data: allBusinesses } = await supabase.from('businesses').select('owner_id');
  const ownerCounts = allBusinesses.reduce((acc, b) => {
    acc[b.owner_id] = (acc[b.owner_id] || 0) + 1;
    return acc;
  }, {});
  const duplicates = Object.entries(ownerCounts).filter(([_, count]) => count > 1);
  console.log('Owners with duplicate businesses:', duplicates.length);
  if (duplicates.length) console.log(duplicates);

  const { data: subsWithoutBiz } = await supabase.from('subscriptions').select('id').is('business_id', null);
  console.log('Subscriptions without business_id:', subsWithoutBiz?.length || 0);

  const { data: profilesWithoutBiz } = await supabase.from('profiles').select('id, email').is('business_id', null);
  console.log('Profiles without business_id:', profilesWithoutBiz?.length || 0);
  if (profilesWithoutBiz?.length) console.log(profilesWithoutBiz);

  // 2. Check the specific signup user
  const { data: testUser } = await supabase.from('profiles').select('*').eq('email', 'audit.test.1.leadsark@gmail.com').maybeSingle();
  console.log('Test Signup User Profile:', testUser);

  // 3. Admin user check
  const { data: adminProfile } = await supabase.from('profiles').select('*').eq('email', 'jainam15business@gmail.com').maybeSingle();
  console.log('Admin Profile Role:', adminProfile?.role);

  // 4. Test business user check
  const { data: bizUser } = await supabase.from('profiles').select('*').eq('email', 'nomaill1q@gmail.com').maybeSingle();
  console.log('Test Business User Profile:', bizUser);
}

auditDatabase();
