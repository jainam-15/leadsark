import { supabase } from './supabase';
import { supabaseAdmin } from './supabaseAdmin';
import { PLANS } from "@/config/plans";

/**
 * Ensures a user has a profile, business, and subscription.
 * Strictly Idempotent: 1 User = 1 Business.
 * Uses admin client if available (server-side) to bypass RLS.
 */
export async function ensureUserBusinessSetup(
  userId: string, 
  email: string, 
  businessName: string, 
  fullName?: string
) {
  // Use admin client for setup if available (server-side)
  const client = supabaseAdmin || supabase;
  if (!client) {
    console.error('[Auth] No supabase client available for setup');
    return { success: false, error: 'Internal server error' };
  }

  const finalBusinessName = (businessName && businessName.trim() !== '') ? businessName.trim() : "Untitled Business";

  try {
    console.log(`[Auth] Ensuring setup for user ${userId}`);
    
    // 1. Create/Update Profile FIRST
    const { error: pError } = await client
      .from('profiles')
      .upsert({
        id: userId,
        full_name: fullName || email.split('@')[0],
        email: email,
        role: 'user',
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (pError) throw pError;

    // 2. Check for existing business
    const { data: existingBusiness } = await client
      .from('businesses')
      .select('id')
      .eq('owner_id', userId)
      .maybeSingle();

    let businessId = existingBusiness?.id;

    // 3. Create Business if not exists
    if (!businessId) {
      console.log(`[Auth] Creating new business for ${userId}`);
      const { data: newBusiness, error: bError } = await client
        .from('businesses')
        .insert([{ 
          name: finalBusinessName,
          owner_id: userId,
          status: 'active'
        }])
        .select()
        .single();

      if (bError) throw bError;
      businessId = newBusiness.id;

      // Link business back to profile
      await client
        .from('profiles')
        .update({ business_id: businessId })
        .eq('id', userId);
    } else {
      console.log(`[Auth] Business already exists: ${businessId}`);
      // Ensure profile is linked
      await client
        .from('profiles')
        .update({ business_id: businessId })
        .eq('id', userId);
    }

    // 4. Initialize Settings
    const { count: settingsCount } = await client
      .from('settings')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId);

    if (settingsCount === 0) {
      await client.from('settings').insert([{ business_id: businessId }]);
    }

    // 5. Initialize Trial Subscription
    const { data: existingSub } = await client
      .from('subscriptions')
      .select('id')
      .eq('business_id', businessId)
      .maybeSingle();

    if (!existingSub) {
      const trialPlan = PLANS.trial || { durationDays: 7 };
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + (trialPlan.durationDays || 7));

      await client
        .from('subscriptions')
        .insert([{
          business_id: businessId,
          plan: 'trial',
          status: 'trial',
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          grace_until: endDate.toISOString()
        }]);
    }

    return { success: true, businessId };
  } catch (err: any) {
    console.error('[Auth] Setup failed:', err);
    return { success: false, error: err.message || 'Unknown error' };
  }
}
