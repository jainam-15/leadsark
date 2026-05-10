import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from './useAuth';

export interface MessageTemplate {
  id: string;
  business_id: string;
  name: string;
  category: string;
  content: string;
  variables: string[];
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useTemplates() {
  const { profile, loading: authLoading } = useAuth();
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      if (profile.business_id) {
        fetchTemplates();
      } else {
        setLoading(false);
      }
    } else if (!authLoading) {
       // Auth finished but no profile
       setLoading(false);
    }
  }, [profile, authLoading]);

  const fetchTemplates = async () => {
    setLoading(true);
    if (!isSupabaseConfigured || !supabase || !profile?.business_id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('business_id', profile.business_id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (err: any) {
      console.error("Error fetching templates:", err);
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (template: Partial<MessageTemplate>) => {
    if (!supabase || !profile?.business_id) return { success: false };

    try {
      const { error } = await supabase
        .from('message_templates')
        .insert([{
          ...template,
          business_id: profile.business_id
        }]);
      
      if (error) throw error;
      await fetchTemplates();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateTemplate = async (id: string, updates: Partial<MessageTemplate>) => {
    if (!supabase) return { success: false };
    
    try {
      const { error } = await supabase
        .from('message_templates')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      await fetchTemplates();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!supabase) return { success: false };
    try {
      // We usually deactivate instead of delete
      const { error } = await supabase
        .from('message_templates')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      await fetchTemplates();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const resolveTemplate = (content: string, lead: any) => {
    let resolved = content;
    resolved = resolved.replace(/{{lead_name}}/g, lead.name || "Customer");
    resolved = resolved.replace(/{{business_name}}/g, profile?.business_name || "Our Business");
    resolved = resolved.replace(/{{phone}}/g, lead.phone || "");
    return resolved;
  };

  return { templates, loading, createTemplate, updateTemplate, deleteTemplate, resolveTemplate, fetchTemplates };
}
