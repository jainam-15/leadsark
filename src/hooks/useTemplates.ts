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
    if (!supabase) return { success: false, error: { message: "Supabase client not initialized" } };
    if (!profile?.business_id) return { success: false, error: { message: "Business ID not found in profile" } };

    try {
      // Sync category to type for legacy support/constraints
      const payload = {
        ...template,
        business_id: profile.business_id,
        type: template.category || (template as any).type,
        variables: template.variables || []
      };

      const { error } = await supabase
        .from('message_templates')
        .insert([payload]);
      
      if (error) {
        console.error("Supabase insert error:", error);
        return { success: false, error };
      }
      
      await fetchTemplates();
      return { success: true };
    } catch (err: any) {
      console.error("Unexpected createTemplate error:", err);
      return { success: false, error: { message: err.message || "An unexpected error occurred" } };
    }
  };

  const updateTemplate = async (id: string, updates: Partial<MessageTemplate>) => {
    if (!supabase) return { success: false, error: { message: "Supabase client not initialized" } };
    
    try {
      // Sync category to type if present
      const payload: any = { ...updates };
      if (updates.category) payload.type = updates.category;

      const { error } = await supabase
        .from('message_templates')
        .update(payload)
        .eq('id', id);
      
      if (error) {
        console.error("Supabase update error:", error);
        return { success: false, error };
      }
      
      await fetchTemplates();
      return { success: true };
    } catch (err: any) {
      console.error("Unexpected updateTemplate error:", err);
      return { success: false, error: { message: err.message || "An unexpected error occurred" } };
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!supabase) return { success: false, error: { message: "Supabase client not initialized" } };
    try {
      // We usually deactivate instead of delete
      const { error } = await supabase
        .from('message_templates')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        console.error("Supabase delete error:", error);
        return { success: false, error };
      }
      
      await fetchTemplates();
      return { success: true };
    } catch (err: any) {
      console.error("Unexpected deleteTemplate error:", err);
      return { success: false, error: { message: err.message || "An unexpected error occurred" } };
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
