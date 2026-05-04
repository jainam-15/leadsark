import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from './useAuth';

export interface Template {
  id: string;
  name: string;
  type: 'greeting' | 'reply' | 'followup' | 'closing';
  content: string;
}

export interface FlowStep {
  id: string;
  step_name: string;
  trigger_condition: string;
  reply_template_id: string;
  next_step: string;
}

export function useAutomation() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [flows, setFlows] = useState<FlowStep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.businessId) {
      fetchAutomationData();
    }
  }, [user]);

  const fetchAutomationData = async () => {
    setLoading(true);
    if (!isSupabaseConfigured || !supabase || !user?.businessId) {
      setLoading(false);
      return;
    }

    try {
      const [tRes, fRes] = await Promise.all([
        supabase.from('message_templates').select('*').eq('business_id', user.businessId),
        supabase.from('automation_flows').select('*').eq('business_id', user.businessId)
      ]);

      if (tRes.data) setTemplates(tRes.data as any);
      if (fRes.data) setFlows(fRes.data as any);
    } catch (err) {
      console.error("Error fetching automation data:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async (template: Partial<Template>) => {
    if (!supabase || !user?.businessId) return { success: false };
    
    try {
      if (template.id) {
        const { error } = await supabase
          .from('message_templates')
          .update({ ...template, updated_at: new Date().toISOString() })
          .eq('id', template.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('message_templates')
          .insert([{ ...template, business_id: user.businessId }]);
        if (error) throw error;
      }
      await fetchAutomationData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!supabase) return;
    await supabase.from('message_templates').delete().eq('id', id);
    await fetchAutomationData();
  };

  const saveFlowStep = async (step: Partial<FlowStep>) => {
    if (!supabase || !user?.businessId) return { success: false };
    
    try {
      if (step.id) {
        const { error } = await supabase
          .from('automation_flows')
          .update({ ...step, updated_at: new Date().toISOString() })
          .eq('id', step.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('automation_flows')
          .insert([{ ...step, business_id: user.businessId }]);
        if (error) throw error;
      }
      await fetchAutomationData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteFlowStep = async (id: string) => {
    if (!supabase) return;
    await supabase.from('automation_flows').delete().eq('id', id);
    await fetchAutomationData();
  };

  return { templates, flows, loading, saveTemplate, deleteTemplate, saveFlowStep, deleteFlowStep };
}
