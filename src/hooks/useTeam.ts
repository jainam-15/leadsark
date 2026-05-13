"use client";

import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from './useAuth';

export interface TeamMember {
  id: string;
  business_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'agent';
  display_name: string;
  created_at: string;
  email?: string;
  avatar_url?: string;
}

export interface Invitation {
  id: string;
  business_id: string;
  email: string;
  role: 'admin' | 'agent';
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export function useTeam() {
  const { profile } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.business_id) {
      fetchTeam();
    } else {
      setLoading(false);
    }
  }, [profile?.business_id]);

  const fetchTeam = async () => {
    if (!isSupabaseConfigured || !supabase || !profile?.business_id) return;
    setLoading(true);

    try {
      // Fetch members with profile info
      const { data: membersData, error: membersError } = await supabase
        .from('team_members')
        .select(`
          *,
          profiles:user_id (
            email,
            full_name
          )
        `)
        .eq('business_id', profile.business_id);

      if (membersError) throw membersError;

      const formattedMembers = membersData.map((m: any) => ({
        ...m,
        display_name: m.display_name || m.profiles?.full_name || 'Unknown User',
        email: m.profiles?.email
      }));

      setMembers(formattedMembers);

      // Fetch pending invitations
      const { data: invitesData, error: invitesError } = await supabase
        .from('invitations')
        .select('*')
        .eq('business_id', profile.business_id)
        .is('accepted_at', null);

      if (invitesError) throw invitesError;
      setInvitations(invitesData);

    } catch (error) {
      console.error('Error fetching team:', error);
    } finally {
      setLoading(false);
    }
  };

  const inviteMember = async (email: string, role: 'admin' | 'agent') => {
    if (!isSupabaseConfigured || !supabase) return { success: false, error: "Supabase not configured" };
    if (!profile?.business_id) return { success: false, error: "No business ID found in profile. Please refresh." };

    try {
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      const { data, error } = await supabase
        .from('invitations')
        .insert([{
          business_id: profile.business_id,
          email,
          role,
          token,
          expires_at: expiresAt.toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      setInvitations(prev => [...prev, data]);
      return { success: true };
    } catch (error: any) {
      console.error('Error inviting member:', error);
      return { success: false, error: error.message || JSON.stringify(error) };
    }
  };

  const removeMember = async (memberId: string) => {
    if (!isSupabaseConfigured || !supabase) return { success: false };

    // Prevent removing owner via UI logic (RLS also handles it)
    const member = members.find(m => m.id === memberId);
    if (member?.role === 'owner') return { success: false, error: "Cannot remove owner" };

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      setMembers(prev => prev.filter(m => m.id !== memberId));
      return { success: true };
    } catch (error: any) {
      console.error('Error removing member:', error);
      return { success: false, error: error.message };
    }
  };

  const updateRole = async (memberId: string, role: 'admin' | 'agent') => {
    if (!isSupabaseConfigured || !supabase) return { success: false };

    try {
      const { error } = await supabase
        .from('team_members')
        .update({ role })
        .eq('id', memberId);

      if (error) throw error;
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role } : m));
      return { success: true };
    } catch (error: any) {
      console.error('Error updating role:', error);
      return { success: false, error: error.message };
    }
  };

  const cancelInvitation = async (inviteId: string) => {
    if (!isSupabaseConfigured || !supabase) return { success: false };

    try {
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', inviteId);

      if (error) throw error;
      setInvitations(prev => prev.filter(i => i.id !== inviteId));
      return { success: true };
    } catch (error: any) {
      console.error('Error cancelling invitation:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    members,
    invitations,
    loading,
    inviteMember,
    removeMember,
    updateRole,
    cancelInvitation,
    fetchTeam
  };
}
