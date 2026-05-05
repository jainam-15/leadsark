import { supabase } from './supabase';

export interface SubscriptionStatus {
  isActive: boolean;
  plan: string;
  expiryDate: Date | null;
  status: 'active' | 'expired' | 'trial' | 'inactive';
}

/**
 * Checks if a business has an active subscription
 */
export async function checkSubscription(businessId: string): Promise<SubscriptionStatus> {
  if (!supabase) return { isActive: false, plan: 'Free', expiryDate: null, status: 'inactive' };

  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('plan_name, status, end_date')
      .eq('business_id', businessId)
      .single();

    if (error || !data) {
      // Default to trial or inactive if not found
      return {
        isActive: false,
        plan: 'Free',
        expiryDate: null,
        status: 'inactive'
      };
    }

    const expiryDate = new Date(data.end_date);
    const now = new Date();
    const isExpired = now > expiryDate;

    return {
      isActive: data.status === 'active' && !isExpired,
      plan: data.plan_name,
      expiryDate,
      status: isExpired ? 'expired' : data.status
    };
  } catch (err) {
    console.error("Error checking subscription:", err);
    return { isActive: false, plan: 'Free', expiryDate: null, status: 'inactive' };
  }
}
