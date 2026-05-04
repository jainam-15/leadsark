import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { LeadType } from '@/app/(dashboard)/leads/page';

export interface Followup {
  id: string;
  lead_id: string;
  scheduled_at: string;
  status: 'pending' | 'sent' | 'skipped';
  message_template_id: string;
  lead?: any;
  isOverdue?: boolean;
}

export function useFollowups() {
  const { user } = useAuth();
  const [followUps, setFollowUps] = useState<Followup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.businessId) {
      fetchFollowups();
    }
  }, [user]);

  const fetchFollowups = async () => {
    console.log("fetchFollowups triggered", { businessId: user?.businessId });
    setLoading(true);
    if (!isSupabaseConfigured || !supabase || !user?.businessId) {
      console.warn("Followups fetch skipped: Pre-conditions not met");
      setLoading(false);
      return;
    }

    try {
      console.log("Executing simplified query for followups...");
      const { data, error, status, statusText } = await supabase
        .from('followups')
        .select('*')
        .eq('business_id', user.businessId);

      if (error) {
        console.error("Supabase error (stringified):", JSON.stringify(error, null, 2));
        console.error("Status info:", { status, statusText });
        throw error;
      }
      
      console.log("Followups data received:", { count: data?.length });
      setFollowUps(data as any);
    } catch (err: any) {
      console.error("Final catch block error:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    } finally {
      setLoading(false);
    }
  };

  const scheduleFollowup = async (leadId: string, scheduledAt: Date, templateId?: string) => {
    if (!supabase || !user?.businessId) return { success: false };

    try {
      const { error } = await supabase
        .from('followups')
        .insert([{
          lead_id: leadId,
          business_id: user.businessId,
          scheduled_at: scheduledAt.toISOString(),
          message_template_id: templateId,
          status: 'pending'
        }]);
      
      if (error) throw error;
      await fetchFollowups();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateFollowupStatus = async (id: string, status: 'sent' | 'skipped') => {
    if (!supabase) return;
    
    try {
      const updateData: any = { status };
      if (status === 'sent') updateData.sent_at = new Date().toISOString();

      const { error } = await supabase
        .from('followups')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
      await fetchFollowups();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const toggleComplete = async (id: string, currentlyCompleted: boolean) => {
    return await updateFollowupStatus(id, currentlyCompleted ? 'pending' : 'sent' as any);
  };

  return { followUps, loading, scheduleFollowup, updateFollowupStatus, toggleComplete, fetchFollowups };
}
