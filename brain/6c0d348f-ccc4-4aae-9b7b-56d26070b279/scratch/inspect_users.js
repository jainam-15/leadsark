
const { createClient } = require('@supabase/supabase-js');

async function inspectUser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const bizId = 'd070a18e-3db0-4103-93b0-a149f2ca0234';

  console.log('--- SUBSCRIPTION INSPECTION ---');
  const { data: subs } = await supabase.from('subscriptions').select('*').eq('business_id', bizId);
  console.log('Subscriptions for biz:', bizId);
  console.log(subs);

  const { data: biz } = await supabase.from('businesses').select('*').eq('id', bizId).single();
  console.log('Business:', biz);
}

inspectUser();
