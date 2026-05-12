"use client";

import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { formatDateTime12Hour } from '@/lib/date-utils';

interface TimelineItem {
  id: string;
  type: 'activity' | 'message' | 'followup' | 'note';
  event_type: string;
  title: string;
  description?: string;
  time: string;
  metadata?: any;
}

export default function LeadTimeline({ leadId }: { leadId: string }) {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeline();
  }, [leadId]);

  const fetchTimeline = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    setLoading(true);

    try {
      // 1. Fetch activities
      const { data: activities } = await supabase
        .from('lead_activities')
        .select('*, profiles:actor_id(full_name)')
        .eq('lead_id', leadId);

      // 2. Fetch messages
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('lead_id', leadId);

      // 3. Fetch followups
      const { data: followups } = await supabase
        .from('followups')
        .select('*')
        .eq('lead_id', leadId);

      // 4. Fetch notes
      const { data: notes } = await supabase
        .from('lead_notes')
        .select('*, profiles:created_by(full_name)')
        .eq('lead_id', leadId);

      // Merge and Sort
      const timeline: TimelineItem[] = [
        ...(activities || []).map(a => ({
          id: a.id,
          type: 'activity' as const,
          event_type: a.activity_type,
          title: a.activity_type.charAt(0).toUpperCase() + a.activity_type.slice(1).replace('_', ' '),
          description: a.description,
          time: a.created_at,
          metadata: a.metadata
        })),
        ...(messages || []).map(m => ({
          id: m.id,
          type: 'message' as const,
          event_type: m.direction,
          title: m.direction === 'incoming' ? 'Message Received' : 'Message Sent',
          description: m.content,
          time: m.created_at
        })),
        ...(followups || []).map(f => ({
          id: f.id,
          type: 'followup' as const,
          event_type: f.status,
          title: 'Follow-up ' + f.status.charAt(0).toUpperCase() + f.status.slice(1),
          description: f.message || f.title,
          time: f.created_at
        })),
        ...(notes || []).map(n => ({
          id: n.id,
          type: 'note' as const,
          event_type: 'note',
          title: 'Note Added by ' + (n.profiles?.full_name || 'System'),
          description: n.content,
          time: n.created_at
        }))
      ];

      timeline.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setItems(timeline);

    } catch (error) {
      console.error('Error fetching timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-4 text-slate-400 text-xs">Loading timeline...</div>;

  return (
    <div className="relative pl-6 space-y-8 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-px before:bg-slate-200">
      {items.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-xs italic ml-[-24px]">No activity recorded yet.</div>
      ) : (
        items.map((item) => (
          <div key={`${item.type}-${item.id}`} className="relative">
            {/* Timeline Dot */}
            <div className={`absolute left-[-21px] top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
              item.type === 'message' ? (item.event_type === 'incoming' ? 'bg-wa-green' : 'bg-primary') :
              item.type === 'followup' ? 'bg-amber-500' :
              item.type === 'note' ? 'bg-indigo-500' :
              'bg-slate-400'
            }`} />
            
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{item.title}</span>
                <span className="text-[9px] text-slate-400 font-medium">{formatDateTime12Hour(item.time)}</span>
              </div>
              {item.description && (
                <p className="text-[11px] text-slate-600 leading-snug line-clamp-3">{item.description}</p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
