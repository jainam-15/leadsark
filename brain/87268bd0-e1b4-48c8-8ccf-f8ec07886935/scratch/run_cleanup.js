
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fvelolcvpletdodsuskc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2ZWxvbGN2cGxldGRvZHN1c2tjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzgxODgyNywiZXhwIjoyMDkzMzk0ODI3fQ.VAgkntIdH0hO7d4TWxDFP-AOs5yafHd90qHweHnqzag';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanup() {
  console.log('--- Database Cleanup ---');

  // 1. Delete orphan businesses (owner_id is null)
  const { data: orphans, error: oErr } = await supabase.from('businesses').select('id').is('owner_id', null);
  if (orphans && orphans.length > 0) {
    console.log(`Deleting ${orphans.length} orphan businesses...`);
    const orphanIds = orphans.map(o => o.id);
    await supabase.from('subscriptions').delete().in('business_id', orphanIds);
    await supabase.from('settings').delete().in('business_id', orphanIds);
    await supabase.from('businesses').delete().in('id', orphanIds);
  }

  // 2. Delete duplicate businesses
  const { data: allBiz } = await supabase.from('businesses').select('*').order('created_at', { ascending: false });
  const ownerMap = new Map();
  const toDelete = [];
  
  allBiz.forEach(biz => {
    if (!biz.owner_id) return;
    if (ownerMap.has(biz.owner_id)) {
      toDelete.push(biz.id);
    } else {
      ownerMap.set(biz.owner_id, biz.id);
    }
  });

  if (toDelete.length > 0) {
    console.log(`Deleting ${toDelete.length} duplicate businesses...`);
    await supabase.from('subscriptions').delete().in('business_id', toDelete);
    await supabase.from('settings').delete().in('business_id', toDelete);
    await supabase.from('businesses').delete().in('id', toDelete);
  }

  // 3. Link profiles to businesses
  const { data: profiles } = await supabase.from('profiles').select('id, business_id').is('business_id', null).not('role', 'eq', 'admin');
  for (const p of (profiles || [])) {
    const { data: biz } = await supabase.from('businesses').select('id').eq('owner_id', p.id).maybeSingle();
    if (biz) {
      console.log(`Linking profile ${p.id} to business ${biz.id}...`);
      await supabase.from('profiles').update({ business_id: biz.id }).eq('id', p.id);
    }
  }

  console.log('Cleanup logic completed.');
}

cleanup().catch(console.error);
