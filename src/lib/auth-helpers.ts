import { supabase } from './supabase';
import { supabaseAdmin } from './supabaseAdmin';

/**
 * Ensures a user has a profile, business, and subscription.
 * This is the single source of truth for setting up a new tenant.
 */
export async function ensureUserBusinessSetup(
  userId: string, 
  email: string, 
  businessName: string, 
  fullName?: string
) {
  // Use admin client for setup to bypass RLS during onboarding
  const client = supabaseAdmin || supabase;
  if (!client) return null;

  // 1. Validation
  if (!businessName || businessName.trim() === '') {
    console.error('ensureUserBusinessSetup: businessName is required');
    return null;
  }

  try {
    // 2. Check if profile already exists with a business
    const { data: existingProfile } = await client
      .from('profiles')
      .select('id, business_id')
      .eq('id', userId)
      .maybeSingle();

    if (existingProfile?.business_id) {
      return existingProfile.business_id;
    }

    // 3. Create/Update Profile FIRST (without business_id)
    // This satisfies the foreign key constraint on the businesses table
    const { error: pErrorInitial } = await client
      .from('profiles')
      .upsert({
        id: userId,
        email: email,
        full_name: fullName || email.split('@')[0],
        role: 'user',
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (pErrorInitial) {
      console.error('Error creating initial profile:', pErrorInitial);
      throw pErrorInitial;
    }

    // 4. Create Business (now that owner profile exists)
    const { data: business, error: bError } = await client
      .from('businesses')
      .insert([{ 
        name: businessName,
        owner_id: userId,
        status: 'active'
      }])
      .select()
      .single();

    if (bError) {
      console.error('Error creating business:', bError);
      throw bError;
    }

    const businessId = business.id;

    // 5. Update Profile with the new business_id
    const { error: pErrorFinal } = await client
      .from('profiles')
      .update({ business_id: businessId })
      .eq('id', userId);

    if (pErrorFinal) {
      console.error('Error linking business to profile:', pErrorFinal);
      throw pErrorFinal;
    }

    // 5. Initialize Settings
    const { error: sError } = await client
      .from('settings')
      .insert([{ business_id: businessId }]);
    
    if (sError) console.error('Error creating settings:', sError);

    // 6. Initialize 7-day Trial Subscription
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 7);
    const graceUntil = new Date(endDate);
    graceUntil.setDate(endDate.getDate() + 3);

    const { error: subError } = await client
      .from('subscriptions')
      .insert([{
        business_id: businessId,
        plan: 'starter',
        status: 'trial',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        grace_until: graceUntil.toISOString()
      }]);

    if (subError) console.error('Error creating trial subscription:', subError);

    return businessId;
  } catch (err) {
    console.error('Failed to complete business setup:', err);
    return null;
  }
}
