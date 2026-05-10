import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { LeadType } from '@/app/(dashboard)/leads/page';

export interface Followup {
  id: string;
  business_id: string;
  lead_id: string;
  title: string;
  message: string;
  scheduled_at: string;
  status: 'pending' | 'sent' | 'skipped' | 'completed' | 'failed';
  send_mode: 'manual' | 'automatic';
  template_id?: string;
  sent_at?: string;
  created_at?: string;
  updated_at?: string;
  lead?: any;
  leads?: any; // For joint queries
  isOverdue?: boolean;
}

export function useFollowups() {
  const { user, profile } = useAuth();
  const [followUps, setFollowUps] = useState<Followup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      if (profile.business_id) {
        fetchFollowups();
      } else {
        setLoading(false);
      }
    } else if (!useAuth().loading) {
       setLoading(false);
    }
  }, [profile, useAuth().loading]);

  const fetchFollowups = async () => {
    setLoading(true);
    if (!isSupabaseConfigured || !supabase || !profile?.business_id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('followups')
        .select(`
          *,
          leads (id, name, company, phone, whatsapp_phone)
        `)
        .eq('business_id', profile.business_id)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      
      const now = new Date();
      const enrichedData = data.map((f: any) => ({
        ...f,
        lead: f.leads,
        isOverdue: new Date(f.scheduled_at) < now && f.status === 'pending'
      }));

      setFollowUps(enrichedData);
    } catch (err: any) {
      console.error("Error fetching followups:", err);
    } finally {
      setLoading(false);
    }
  };

  const scheduleFollowup = async (data: Partial<Followup>) => {
    if (!supabase || !profile?.business_id) return { success: false };

    try {
      const { error } = await supabase
        .from('followups')
        .insert([{
          ...data,
          business_id: profile.business_id,
          status: 'pending'
        }]);
      
      if (error) throw error;
      await fetchFollowups();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateFollowup = async (id: string, data: Partial<Followup>) => {
    if (!supabase) return { success: false };
    
    try {
      const { error } = await supabase
        .from('followups')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
      await fetchFollowups();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteFollowup = async (id: string) => {
    if (!supabase) return { success: false };
    try {
      const { error } = await supabase.from('followups').delete().eq('id', id);
      if (error) throw error;
      await fetchFollowups();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const sendNow = async (followupId: string) => {
    try {
      const response = await fetch('/api/followups/send-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followup_id: followupId })
      });
      const res = await response.json();
      if (res.success) {
        await fetchFollowups();
        return { success: true };
      } else {
        return { success: false, error: res.error };
      }
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const toggleComplete = async (id: string, currentlyCompleted: boolean) => {
    return await updateFollowup(id, { 
      status: currentlyCompleted ? 'pending' : 'completed',
      sent_at: currentlyCompleted ? undefined : new Date().toISOString()
    });
  };

  return { followUps, loading, scheduleFollowup, updateFollowup, deleteFollowup, sendNow, toggleComplete, fetchFollowups };
}
