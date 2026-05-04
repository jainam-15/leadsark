"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { PLANS } from "@/config/plans";

/**
 * Server Action to ensure a user has a profile, business, and subscription.
 * Strictly Idempotent: 1 User = 1 Business.
 */
export async function ensureUserBusinessSetupAction(
  userId: string, 
  email: string, 
  businessName: string, 
  fullName?: string
) {
  if (!supabaseAdmin) {
    console.error('ensureUserBusinessSetupAction: Admin client not initialized');
    return { success: false, error: 'Internal server error' };
  }

  // 1. Validation
  const finalBusinessName = (businessName && businessName.trim() !== '') ? businessName.trim() : "Untitled Business";

  try {
    // 2. CREATE/UPDATE PROFILE FIRST (to satisfy FK for businesses.owner_id)
    const { error: pError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        full_name: fullName || email.split('@')[0],
        email: email,
        role: 'user',
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (pError) throw pError;

    // 3. Check if business already exists for this owner
    const { data: existingBusiness } = await supabaseAdmin
      .from('businesses')
      .select('id')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let businessId = existingBusiness?.id;

    // 4. Create Business only if not exists
    if (!businessId) {
      const { data: newBusiness, error: bError } = await supabaseAdmin
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

      // 5. LINK BUSINESS BACK TO PROFILE
      const { error: pUpdateError } = await supabaseAdmin
        .from('profiles')
        .update({ business_id: businessId })
        .eq('id', userId);
      
      if (pUpdateError) throw pUpdateError;
    } else {
      // Ensure profile is linked to existing business if not already
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('business_id')
        .eq('id', userId)
        .single();
      
      if (!profile?.business_id) {
        await supabaseAdmin
          .from('profiles')
          .update({ business_id: businessId })
          .eq('id', userId);
      }
    }

    // 6. Initialize Settings if not exists
    const { count: settingsCount } = await supabaseAdmin
      .from('settings')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId);

    if (settingsCount === 0) {
      await supabaseAdmin.from('settings').insert([{ business_id: businessId }]);
    }

    // 7. Initialize 5-day Trial Subscription if not exists
    const { data: existingSub } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('business_id', businessId)
      .maybeSingle();

    if (!existingSub) {
      const trialPlan = PLANS.trial;
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + trialPlan.durationDays);

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

      if (subError) console.error('Error creating trial subscription:', subError);
    }

    return { success: true, businessId };
  } catch (err: any) {
    console.error('Failed to complete business setup:', err);
    return { success: false, error: err.message || 'Unknown error' };
  }
}
