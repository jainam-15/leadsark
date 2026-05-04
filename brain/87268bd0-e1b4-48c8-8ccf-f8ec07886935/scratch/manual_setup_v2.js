
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fvelolcvpletdodsuskc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2ZWxvbGN2cGxldGRvZHN1c2tjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzgxODgyNywiZXhwIjoyMDkzMzk0ODI3fQ.VAgkntIdH0hO7d4TWxDFP-AOs5yafHd90qHweHnqzag';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function setupTestUser() {
  const userId = 'dd42c678-83b3-461e-a4db-13caf8c11fa9';
  const email = 'nomaill1q@gmail.com';
  const businessName = "Test Business";

  console.log(`Setting up user: ${email} (${userId})...`);

  try {
    // 1. Create Profile First
    console.log('Upserting Profile...');
    const { error: pError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        full_name: email.split('@')[0],
        email: email,
        role: 'user',
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (pError) throw pError;
    console.log('Profile upserted.');

    // 2. Create Business
    console.log('Creating Business...');
    const { data: newBusiness, error: bError } = await supabaseAdmin
      .from('businesses')
      .insert([{ 
        name: businessName,
        owner_id: userId,
        status: 'active'
      }])
      .select()
      .single();

    if (bError) throw bError;
    const businessId = newBusiness.id;
    console.log('New Business ID:', businessId);

    // 3. Link Business back to Profile
    console.log('Linking Business to Profile...');
    await supabaseAdmin
      .from('profiles')
      .update({ business_id: businessId })
      .eq('id', userId);

    // 4. Initialize Settings
    console.log('Creating Settings...');
    await supabaseAdmin.from('settings').insert([{ business_id: businessId }]);

    // 5. Trial Sub
    console.log('Creating Subscription...');
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 5);

    const { error: subError } = await supabaseAdmin
      .from('subscriptions')
      .insert([{
        business_id: businessId,
        plan: 'trial',
        status: 'trial',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        grace_until: endDate.toISOString()
      }]);

    if (subError) throw subError;
    console.log('Subscription created.');

    console.log('Setup complete.');
  } catch (err) {
    console.error('Setup failed:', err);
  }
}

setupTestUser();
