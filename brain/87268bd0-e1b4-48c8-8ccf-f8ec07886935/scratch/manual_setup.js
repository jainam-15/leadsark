
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
    // 2. Check if profile already exists
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, business_id')
      .eq('id', userId)
      .maybeSingle();
    
    console.log('Existing Profile:', profile);

    // 3. Check if business already exists for this owner
    const { data: existingBusiness } = await supabaseAdmin
      .from('businesses')
      .select('id')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    console.log('Existing Business:', existingBusiness);

    let businessId = existingBusiness?.id;

    // 4. Create Business only if not exists
    if (!businessId) {
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
      businessId = newBusiness.id;
      console.log('New Business ID:', businessId);
    }

    // 5. Update/Create Profile and Link Business
    console.log('Upserting Profile...');
    const { error: pError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        business_id: businessId,
        full_name: email.split('@')[0],
        email: email,
        role: 'user',
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (pError) throw pError;
    console.log('Profile upserted.');

    // 6. Initialize Settings
    const { count: settingsCount } = await supabaseAdmin
      .from('settings')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId);

    if (settingsCount === 0) {
      console.log('Creating Settings...');
      await supabaseAdmin.from('settings').insert([{ business_id: businessId }]);
    }

    // 7. Trial Sub
    const { data: existingSub } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('business_id', businessId)
      .maybeSingle();

    if (!existingSub) {
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
    }

    console.log('Setup complete.');
  } catch (err) {
    console.error('Setup failed:', err);
  }
}

setupTestUser();
