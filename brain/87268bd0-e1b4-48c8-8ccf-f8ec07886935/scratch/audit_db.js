
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fvelolcvpletdodsuskc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2ZWxvbGN2cGxldGRvZHN1c2tjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzgxODgyNywiZXhwIjoyMDkzMzk0ODI3fQ.VAgkntIdH0hO7d4TWxDFP-AOs5yafHd90qHweHnqzag';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function audit() {
  console.log('--- Database Audit ---');

  // 1. Check Profiles
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('*');
  console.log(`Total Profiles: ${profiles?.length || 0}`);

  // 2. Check Businesses
  const { data: businesses, error: bErr } = await supabase.from('businesses').select('*');
  console.log(`Total Businesses: ${businesses?.length || 0}`);

  // 3. Check Subscriptions
  const { data: subscriptions, error: sErr } = await supabase.from('subscriptions').select('*');
  console.log(`Total Subscriptions: ${subscriptions?.length || 0}`);

  // 4. Check Settings
  const { data: settings, error: stErr } = await supabase.from('settings').select('*');
  console.log(`Total Settings: ${settings?.length || 0}`);

  // 5. Orphans Check
  const orphans = {
    businessesNoOwner: businesses?.filter(b => !b.owner_id) || [],
    profilesNoBusiness: profiles?.filter(p => p.role === 'user' && !p.business_id) || [],
    subscriptionsNoBusiness: subscriptions?.filter(s => !s.business_id) || [],
    settingsNoBusiness: settings?.filter(s => !s.business_id) || []
  };

  console.log('Orphans:', JSON.stringify(orphans, null, 2));

  // 6. Duplicates Check (Owner ID)
  const ownerCounts = {};
  businesses?.forEach(b => {
    ownerCounts[b.owner_id] = (ownerCounts[b.owner_id] || 0) + 1;
  });
  const duplicates = Object.entries(ownerCounts).filter(([id, count]) => count > 1);
  console.log('Duplicate Businesses (owner_id):', duplicates);

  // 7. Check Test User: nomaill1q@gmail.com
  const testUserEmail = 'nomaill1q@gmail.com';
  const { data: testProfile } = await supabase.from('profiles').select('*, businesses(*)').eq('email', testUserEmail).maybeSingle();
  console.log('Test User Profile:', JSON.stringify(testProfile, null, 2));

  if (testProfile?.business_id) {
    const { data: testSub } = await supabase.from('subscriptions').select('*').eq('business_id', testProfile.business_id).maybeSingle();
    console.log('Test User Subscription:', JSON.stringify(testSub, null, 2));
    
    const { data: testSettings } = await supabase.from('settings').select('*').eq('business_id', testProfile.business_id).maybeSingle();
    console.log('Test User Settings:', testSettings ? 'Exists' : 'Missing');
  }

  // 8. Trial Expiry Check logic
  const now = new Date();
  const expiredCount = subscriptions?.filter(s => new Date(s.end_date) < now).length;
  console.log(`Subscriptions Expired (by end_date): ${expiredCount}`);

}

audit().catch(console.error);
