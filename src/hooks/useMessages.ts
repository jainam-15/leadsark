"use client";

import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from './useAuth';

export interface Message {
  id: string;
  text: string;
  time: string;
  isSent: boolean;
  dateStr?: string;
}

const mockMessages: Message[] = [
  { id: '1', text: "Hi Alex, we reviewed the initial proposal you sent last Tuesday. The team is quite impressed with the automation features.", time: "16:12", isSent: false, dateStr: "Yesterday" },
  { id: '2', text: "That's fantastic to hear! We designed those features specifically for teams looking to reduce manual entry by 40%.", time: "16:15", isSent: true },
  { id: '3', text: "Can you send over the pricing tier for the enterprise plan? We are looking to scale by next month and need to finalize the budget today.", time: "09:45", isSent: false, dateStr: "Today" },
];

export function useMessages(leadId?: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!leadId) {
      setMessages([]);
      return;
    }
    fetchMessages(leadId);
  }, [leadId, user]);

  const fetchMessages = async (id: string) => {
    setLoading(true);
    if (!isSupabaseConfigured || !supabase || !user?.businessId) {
      setMessages(mockMessages);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('lead_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const formatted = data.map(dbMsg => ({
          id: dbMsg.id,
          text: dbMsg.text,
          time: new Date(dbMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSent: dbMsg.is_sent,
          // Simple dateStr grouping logic could be added here
        }));
        setMessages(formatted);
      } else {
        setMessages([]); // No messages for this lead
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages(mockMessages);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!leadId) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSent: true
    };

    // Optimistic update
    setMessages(prev => [...prev, newMsg]);

    if (isSupabaseConfigured && supabase && user?.businessId) {
      try {
        const { error } = await supabase
          .from('messages')
          .insert([{ lead_id: leadId, business_id: user.businessId, text, is_sent: true }]);
        if (error) throw error;
      } catch (error) {
        console.error('Error sending message:', error);
        // Could revert or show error state here
      }
    }
  };

  return { messages, loading, sendMessage };
}
