"use client";

import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from './useAuth';

export function useSettings() {
  const { user, profile: authProfile, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    businessName: "",
    phone: ""
  });
  const [settings, setSettings] = useState({
    autoReply: true,
    autoReplyMode: "new_leads_only",
    greetingMessage: "Hello! Thanks for reaching out to us. How can we help you today?",
    greetingTemplateId: "",
    workingHoursStart: "09:00",
    workingHoursEnd: "18:00",
    followupMode: "suggest_with_approval"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authProfile) {
      if (authProfile.business_id) {
        fetchSettings();
      } else {
        setLoading(false);
      }
    } else if (!authLoading) {
       setLoading(false);
    }
  }, [authProfile, authLoading]);

  const fetchSettings = async () => {
    setLoading(true);
    if (!isSupabaseConfigured || !supabase || !user || !authProfile?.business_id) {
      setLoading(false);
      return;
    }

    try {
      // Fetch profile and business
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, email, phone, businesses(name)')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile({
          name: profileData.full_name || '',
          email: profileData.email || '',
          businessName: (profileData.businesses as any)?.name || '',
          phone: profileData.phone || ''
        });
      }

      // Fetch settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('settings')
        .select('*')
        .eq('business_id', authProfile.business_id)
        .maybeSingle();

      if (settingsData) {
        setSettings({
          autoReply: settingsData.auto_reply_enabled,
          autoReplyMode: settingsData.auto_reply_mode || 'new_leads_only',
          greetingMessage: settingsData.greeting_message || '',
          greetingTemplateId: settingsData.greeting_template_id || '',
          workingHoursStart: settingsData.working_hours_start || '09:00',
          workingHoursEnd: settingsData.working_hours_end || '18:00',
          followupMode: settingsData.followup_mode || 'suggest_with_approval'
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (newProfile: any) => {
    setProfile(newProfile);
    if (!isSupabaseConfigured || !supabase || !user) return { success: true };

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          full_name: newProfile.name,
          phone: newProfile.phone
        })
        .eq('id', user.id);
      
      if (profileError) throw profileError;

      if (authProfile?.business_id) {
        const { error: businessError } = await supabase
          .from('businesses')
          .update({ name: newProfile.businessName })
          .eq('id', authProfile.business_id);
        if (businessError) throw businessError;
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Error updating profile:', error);
      return { success: false, error: error.message };
    }
  };

  const updateSettings = async (newSettings: any) => {
    setSettings(newSettings);
    if (!isSupabaseConfigured || !supabase || !authProfile?.business_id) return { success: true };

    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          business_id: authProfile.business_id,
          auto_reply_enabled: newSettings.autoReply,
          auto_reply_mode: newSettings.autoReplyMode,
          greeting_message: newSettings.greetingMessage,
          greeting_template_id: newSettings.greetingTemplateId || null,
          working_hours_start: newSettings.workingHoursStart,
          working_hours_end: newSettings.workingHoursEnd,
          followup_mode: newSettings.followupMode,
          updated_at: new Date().toISOString()
        }, { onConflict: 'business_id' });
      
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error updating settings:', error);
      return { success: false, error: error.message };
    }
  };

  return { profile, settings, loading, updateProfile, updateSettings };
}
