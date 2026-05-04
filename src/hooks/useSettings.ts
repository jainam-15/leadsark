"use client";

import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from './useAuth';

export function useSettings() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: "Alex Rivera",
    email: "alex@cloudscale.com",
    businessName: "CloudScale Systems",
    phone: "+1 (555) 123-4567"
  });
  const [settings, setSettings] = useState({
    autoReply: true,
    autoReplyMode: "new_leads_only",
    autoFollowUp: true,
    followUpTiming: "24",
    whatsappConnected: false,
    workingHoursStart: "09:00",
    workingHoursEnd: "18:00",
    greetingTemplateId: "",
    followupTemplateId: "",
    followupMode: "suggest_with_approval"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchSettings();
  }, [user]);

  const fetchSettings = async () => {
    setLoading(true);
    if (!isSupabaseConfigured || !supabase || !user?.businessId) {
      setLoading(false);
      return;
    }

    try {
      // Fetch profile and business
      const { data: profileData } = await supabase
        .from('profiles')
        .select(`
          full_name,
          email,
          businesses (
            name
          )
        `)
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile({
          name: profileData.full_name || '',
          email: profileData.email || '',
          businessName: (profileData.businesses as any)?.name || '',
          phone: '' // Add phone to schema if needed
        });
      }

      // Fetch settings
      const { data: settingsData } = await supabase
        .from('settings')
        .select('*')
        .eq('business_id', user.businessId)
        .single();

      if (settingsData) {
        setSettings({
          autoReply: settingsData.auto_reply,
          autoReplyMode: settingsData.auto_reply_mode || 'new_leads_only',
          autoFollowUp: settingsData.auto_follow_up,
          followUpTiming: settingsData.follow_up_timing,
          whatsappConnected: settingsData.whatsapp_connected,
          workingHoursStart: settingsData.working_hours_start || '09:00',
          workingHoursEnd: settingsData.working_hours_end || '18:00',
          greetingTemplateId: settingsData.greeting_template_id || '',
          followupTemplateId: settingsData.followup_template_id || '',
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
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: newProfile.name })
        .eq('id', user.id);
      
      if (profileError) throw profileError;

      // Update business name if changed
      if (user.businessId) {
        const { error: businessError } = await supabase
          .from('businesses')
          .update({ name: newProfile.businessName })
          .eq('id', user.businessId);
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
    if (!isSupabaseConfigured || !supabase || !user?.businessId) return { success: true };

    try {
      const { error } = await supabase
        .from('settings')
        .update({
          auto_reply: newSettings.autoReply,
          auto_reply_mode: newSettings.autoReplyMode,
          auto_follow_up: newSettings.autoFollowUp,
          follow_up_timing: newSettings.followUpTiming,
          working_hours_start: newSettings.workingHoursStart,
          working_hours_end: newSettings.workingHoursEnd,
          greeting_template_id: newSettings.greetingTemplateId || null,
          followup_template_id: newSettings.followupTemplateId || null,
          followup_mode: newSettings.followupMode
        })
        .eq('business_id', user.businessId);
      
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error updating settings:', error);
      return { success: false, error: error.message };
    }
  };

  return { profile, settings, loading, updateProfile, updateSettings };
}
