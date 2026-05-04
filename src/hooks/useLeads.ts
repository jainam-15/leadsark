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
  const { user } = useAuth();
  const [leads, setLeads] = useState<LeadType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchLeads();
  }, [user]);

  const fetchLeads = async () => {
    setLoading(true);
    if (!isSupabaseConfigured || !supabase || !user?.businessId) {
      setLeads(mockLeads);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        // Map DB structure to UI structure
        const formatted = data.map(dbLead => ({
          id: dbLead.id,
          name: dbLead.name,
          company: dbLead.company || 'Unknown',
          status: dbLead.status as LeadStatus,
          snippet: 'No recent messages',
          time: new Date(dbLead.created_at).toLocaleDateString(),
          is_blocked: dbLead.is_blocked,
          is_personal: dbLead.is_personal,
          automation_paused: dbLead.automation_paused,
          conversation_state: dbLead.conversation_state,
          lead_score: dbLead.lead_score || 0,
          is_manual_status: dbLead.is_manual_status || false,
        }));
        setLeads(formatted);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      setLeads(mockLeads);
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
    if (!isSupabaseConfigured || !supabase || !user?.businessId) {
      const newLead: LeadType = { id: Date.now().toString(), name, company, status: 'Cold', snippet: 'New lead', time: 'Just now' };
      setLeads([newLead, ...leads]);
      return { success: true, data: newLead };
    }

    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([{ business_id: user.businessId, name, company, phone, email, status: 'Cold' }])
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
