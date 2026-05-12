"use client";

import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { formatDateTime12Hour } from '@/lib/date-utils';

interface Note {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
  profiles?: {
    full_name: string;
  };
}

export default function LeadNotes({ leadId }: { leadId: string }) {
  const { profile } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [leadId]);

  const fetchNotes = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lead_notes')
        .select('*, profiles:created_by(full_name)')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !isSupabaseConfigured || !supabase || !profile) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('lead_notes')
        .insert([{
          business_id: profile.business_id,
          lead_id: leadId,
          created_by: profile.id,
          content: newNote
        }])
        .select('*, profiles:created_by(full_name)')
        .single();

      if (error) throw error;
      setNotes([data, ...notes]);
      setNewNote("");
    } catch (error) {
      console.error('Error adding note:', error);
      alert("Failed to add note");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddNote} className="space-y-2">
        <textarea 
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a private note..."
          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
          rows={3}
        />
        <button 
          type="submit"
          disabled={isSubmitting || !newNote.trim()}
          className="w-full py-2 bg-slate-900 text-white text-[10px] font-black uppercase rounded-lg disabled:opacity-50 hover:bg-slate-800 transition-all"
        >
          {isSubmitting ? "Saving..." : "Save Note"}
        </button>
      </form>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-4 text-slate-400 text-xs">Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs italic">No notes yet.</div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-primary uppercase">
                  {note.profiles?.full_name || 'System'}
                </span>
                <span className="text-[9px] text-slate-400">
                  {formatDateTime12Hour(note.created_at)}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{note.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
