"use client";

import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { LeadType, LeadStatus } from '@/app/(dashboard)/leads/page';
import { useAuth } from './useAuth';

const mockLeads: LeadType[] = [
  { id: '1', name: "Sarah Jenkins", company: "CloudScale Systems", status: "Hot", snippet: "Can you send over the pricing tier...", time: "2 mins ago", unreadCount: 3 },
  { id: '2', name: "Marcus Thorne", company: "Vertex Media Group", status: "Warm", snippet: "I will check with my department head...", time: "2h", overdue: true },
  { id: '3', name: "Elena Rodriguez", company: "NexGen Logistics", status: "Cold", snippet: "Not interested at this moment...", time: "3 hours ago" },
  { id: '4', name: "David Chang", company: "Innovate Labs", status: "Hot", snippet: "Ready to sign the contract...", time: "5 hours ago" },
];

export function useLeads() {
  const { user, profile, loading: authLoading } = useAuth();
  const [leads, setLeads] = useState<LeadType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      if (profile.business_id) {
        fetchLeads();
      } else {
        setLoading(false);
      }
    } else if (!authLoading) {
       setLoading(false);
    }
  }, [profile, authLoading]);

  const fetchLeads = async () => {
    setLoading(true);
    if (!isSupabaseConfigured || !supabase || !profile?.business_id) {
      setLoading(false);
      return;
    }

    try {
      // Fetch leads for the current business
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .eq('business_id', profile.business_id)
        .order('last_message_at', { ascending: false });

      if (leadsError) throw leadsError;

      if (leadsData) {
        // Fetch latest message for each lead to show as snippet
        const { data: messagesData } = await supabase
          .from('messages')
          .select('lead_id, content, created_at')
          .in('lead_id', leadsData.map(l => l.id))
          .order('created_at', { ascending: false });

        // Map messages to leads
        const latestMessages: Record<string, any> = {};
        messagesData?.forEach(msg => {
          if (!latestMessages[msg.lead_id]) {
            latestMessages[msg.lead_id] = msg;
          }
        });

        const formatted = leadsData.map(dbLead => {
          const latestMsg = latestMessages[dbLead.id];
          return {
            id: dbLead.id,
            name: dbLead.name,
            company: dbLead.company || 'Unknown',
            status: dbLead.status as LeadStatus,
            snippet: latestMsg?.content || 'No recent messages',
            time: dbLead.last_message_at 
              ? new Date(dbLead.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : new Date(dbLead.created_at).toLocaleDateString(),
            phone: dbLead.phone || dbLead.whatsapp_phone,
            source: dbLead.source,
            last_message_at: dbLead.last_message_at,
            last_incoming_at: dbLead.last_incoming_at,
            is_blocked: dbLead.is_blocked,
            is_personal: dbLead.is_personal,
            automation_paused: dbLead.automation_paused,
            conversation_state: dbLead.conversation_state,
            lead_score: dbLead.lead_score || 0,
          };
        });
        setLeads(formatted);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleLeadField = async (id: string, field: 'is_blocked' | 'is_personal' | 'automation_paused' | 'is_manual_status', value: boolean) => {
    // Optimistic UI update
    setLeads(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('leads')
          .update({ [field]: value, updated_at: new Date().toISOString() })
          .eq('id', id);
        if (error) throw error;
      } catch (error) {
        console.error(`Error updating ${field}:`, error);
        fetchLeads();
      }
    }
  };

  const updateLeadStatus = async (id: string, status: LeadStatus, isManual: boolean = true) => {
    // Optimistic UI update
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status, is_manual_status: isManual, automation_paused: isManual } : l));

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('leads')
          .update({ 
            status, 
            is_manual_status: isManual, 
            automation_paused: isManual, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', id);
        if (error) throw error;
      } catch (error) {
        console.error('Error updating lead status:', error);
        fetchLeads();
      }
    }
  };

  const addLead = async (name: string, company: string, phone: string, email: string) => {
    if (!isSupabaseConfigured || !supabase || !profile?.business_id) {
      const newLead: LeadType = { id: Date.now().toString(), name, company, status: 'Cold', snippet: 'New lead', time: 'Just now' };
      if (!isSupabaseConfigured) setLeads([newLead, ...leads]);
      return { success: true, data: newLead };
    }

    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([{ business_id: profile.business_id, name, company, phone, email, status: 'Cold' }])
        .select()
        .single();
      
      if (error) throw error;
      
      const newLead: LeadType = {
        id: data.id,
        name: data.name,
        company: data.company || 'Unknown',
        status: data.status as LeadStatus,
        snippet: 'New lead',
        time: 'Just now'
      };
      
      setLeads([newLead, ...leads]);
      return { success: true, data: newLead };
    } catch (error: any) {
      console.error('Error creating lead:', error);
      return { success: false, error: error.message };
    }
  };

  return { leads, loading, fetchLeads, updateLeadStatus, addLead, toggleLeadField };
}
