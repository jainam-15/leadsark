
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fvelolcvpletdodsuskc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2ZWxvbGN2cGxldGRvZHN1c2tjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzgxODgyNywiZXhwIjoyMDkzMzk0ODI3fQ.VAgkntIdH0hO7d4TWxDFP-AOs5yafHd90qHweHnqzag';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function setupTestUser() {
  const userId = 'dd42c678-83b3-461e-a4db-13caf8c11fa9';
  const email = 'nomaill1q@gmail.com';

  console.log(`Setting up subscription for user: ${email}...`);

  try {
    const { data: biz } = await supabaseAdmin.from('businesses').select('id').eq('owner_id', userId).single();
    const businessId = biz.id;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 5);

    console.log('Creating Subscription (using plan: starter due to DB constraint)...');
    const { error: subError } = await supabaseAdmin
      .from('subscriptions')
      .insert([{
        business_id: businessId,
        plan: 'starter', // WORKAROUND for DB constraint
        status: 'trial',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        grace_until: endDate.toISOString()
      }]);

    if (subError) throw subError;
    console.log('Subscription created.');

  } catch (err) {
    console.error('Setup failed:', err);
  }
}

setupTestUser();
