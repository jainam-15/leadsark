"use client";

import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { formatTime12Hour, formatDateTime12Hour } from '@/lib/date-utils';

export interface Message {
  id: string;
  whatsapp_message_id?: string;
  text: string;
  time: string;
  isSent: boolean;
  dateStr?: string;
}

const mockMessages: Message[] = [
  { id: '1', text: "Hi Alex, we reviewed the initial proposal you sent last Tuesday. The team is quite impressed with the automation features.", time: "4:12 PM", isSent: false, dateStr: "Yesterday • 4:12 PM" },
  { id: '2', text: "That's fantastic to hear! We designed those features specifically for teams looking to reduce manual entry by 40%.", time: "4:15 PM", isSent: true, dateStr: "Yesterday • 4:15 PM" },
  { id: '3', text: "Can you send over the pricing tier for the enterprise plan? We are looking to scale by next month and need to finalize the budget today.", time: "9:45 AM", isSent: false, dateStr: "Today • 9:45 AM" },
];

export function useMessages(leadId?: string) {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!leadId || !profile?.business_id) {
      setMessages([]);
      return;
    }
    fetchMessages(leadId);

    // Subscribe to new messages for this lead
    const channel = supabase
      ?.channel(`messages-lead-${leadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `lead_id=eq.${leadId}`
        },
        (payload) => {
          const newMsg = payload.new as any;
          setMessages(prev => {
            if (prev.find(m => m.id === newMsg.id || m.whatsapp_message_id === newMsg.whatsapp_message_id)) return prev;
            return [...prev, {
              id: newMsg.id,
              whatsapp_message_id: newMsg.whatsapp_message_id,
              text: newMsg.content,
              time: formatTime12Hour(newMsg.created_at),
              isSent: newMsg.direction === 'outgoing',
              dateStr: formatDateTime12Hour(newMsg.created_at)
            }];
          });
        }
      )
      .subscribe();

    return () => {
      if (channel) supabase?.removeChannel(channel);
    };
  }, [leadId, user, profile?.business_id]);

  const fetchMessages = async (id: string) => {
    setLoading(true);
    if (!isSupabaseConfigured || !supabase || !profile?.business_id) {
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

      if (data) {
        const formatted = data.map(dbMsg => ({
          id: dbMsg.id,
          whatsapp_message_id: dbMsg.whatsapp_message_id,
          text: dbMsg.content,
          time: formatTime12Hour(dbMsg.created_at),
          isSent: dbMsg.direction === 'outgoing',
          dateStr: formatDateTime12Hour(dbMsg.created_at)
        }));
        setMessages(formatted);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!leadId || !text.trim()) return;

    setSending(true);
    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId, message: text })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send message");
      }

      // The new message will come via real-time subscription, 
      // but we can also add it manually for immediate feedback if needed.
      // fetchMessages(leadId); 
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert(error.message);
    } finally {
      setSending(false);
    }
  };

  return { messages, loading, sending, sendMessage, fetchMessages };
}
