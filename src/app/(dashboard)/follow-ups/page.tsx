"use client";

import { useFollowups, Followup } from "@/hooks/useFollowups";
import { useLeads } from "@/hooks/useLeads";
import { useState } from "react";
import { formatDateTime12Hour, formatTime12Hour } from "@/lib/date-utils";

export default function FollowUpsPage() {
  const { followUps, loading, scheduleFollowup, updateFollowup, deleteFollowup, sendNow, toggleComplete } = useFollowups();
  const { leads } = useLeads();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newFollowup, setNewFollowup] = useState<Partial<Followup>>({
    lead_id: "",
    title: "",
    message: "",
    scheduled_at: new Date().toISOString().slice(0, 16),
    send_mode: "manual"
  });

  const filtered = followUps.filter(f => 
    (f.lead?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.lead?.whatsapp_phone || "").includes(searchQuery) ||
    (f.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const overdue = filtered.filter(f => f.isOverdue && f.status === 'pending');
  const upcoming = filtered.filter(f => !f.isOverdue && f.status === 'pending');
  const completed = filtered.filter(f => ['sent', 'completed', 'skipped', 'failed'].includes(f.status));

  const handleSendNow = async (id: string) => {
    const res = await sendNow(id);
    if (!res.success) {
      alert(res.error || "Failed to send follow-up");
    }
  };

  const handleCreateFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFollowup.lead_id || !newFollowup.title) {
      alert("Lead and Title are required");
      return;
    }
    
    setIsSaving(true);
    const res = await scheduleFollowup(newFollowup);
    setIsSaving(false);
    
    if (res.success) {
      setIsModalOpen(false);
      setNewFollowup({
        lead_id: "",
        title: "",
        message: "",
        scheduled_at: new Date().toISOString().slice(0, 16),
        send_mode: "manual"
      });
    } else {
      alert("Error: " + res.error);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading follow-ups...</div>;
  }

  return (
    <div className="p-lg space-y-gutter max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="font-h2 text-h2 text-slate-900 tracking-tight">Follow-up Dashboard</h1>
          <p className="text-body-md text-slate-500 mt-1">Manage your relationship building tasks.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 md:flex-none px-6 py-2.5 bg-slate-900 text-white rounded-xl shadow-md hover:shadow-lg transition-all font-bold text-sm flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span> Create Follow-up
          </button>
        </div>
        <div className="relative w-full md:w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
          <input 
            type="text" 
            placeholder="Search by lead or task..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Overdue Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <span className="material-symbols-outlined text-error text-xl">alarm</span>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Overdue</h2>
            <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-[10px] font-black">{overdue.length}</span>
          </div>
          <div className="space-y-3">
            {overdue.map(f => (
              <FollowupCard key={f.id} followup={f} onSend={() => handleSendNow(f.id)} onSkip={() => updateFollowup(f.id, { status: 'skipped' })} onComplete={() => toggleComplete(f.id, false)} isOverdue />
            ))}
            {overdue.length === 0 && (
              <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-sm">Everything caught up!</div>
            )}
          </div>
        </div>

        {/* Upcoming Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <span className="material-symbols-outlined text-amber-500 text-xl">event_upcoming</span>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Upcoming</h2>
            <span className="bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full text-[10px] font-black">{upcoming.length}</span>
          </div>
          <div className="space-y-3">
            {upcoming.map(f => (
              <FollowupCard key={f.id} followup={f} onSend={() => handleSendNow(f.id)} onSkip={() => updateFollowup(f.id, { status: 'skipped' })} onComplete={() => toggleComplete(f.id, false)} />
            ))}
            {upcoming.length === 0 && (
              <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-sm">No upcoming tasks.</div>
            )}
          </div>
        </div>

        {/* History Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <span className="material-symbols-outlined text-slate-400 text-xl">history</span>
            <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest">Recent Activity</h2>
          </div>
          <div className="space-y-3 opacity-80">
            {completed.slice(0, 10).map(f => (
              <div key={f.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="flex justify-between items-start">
                   <div>
                    <h4 className="text-xs font-bold text-slate-700">{f.lead?.name}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">{f.title || "Follow-up"}</p>
                   </div>
                   <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                     f.status === 'sent' ? 'bg-teal-50 text-teal-600' : 
                     f.status === 'skipped' ? 'bg-slate-200 text-slate-500' : 
                     f.status === 'failed' ? 'bg-red-50 text-red-600' : 
                     'bg-blue-50 text-blue-600'
                   }`}>
                     {f.status}
                   </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 italic">
                  {f.sent_at ? `Completed on ${formatDateTime12Hour(f.sent_at)}` : `Closed on ${formatDateTime12Hour(f.updated_at || "")}`}
                </p>
              </div>
            ))}
            {completed.length === 0 && (
               <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-sm">No activity yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Create Follow-up Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[500px] min-h-[400px] overflow-hidden flex flex-col scale-100 opacity-100 transition-transform">
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
              <h2 className="text-lg font-bold text-slate-900">New Follow-up Task</h2>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            
            <form onSubmit={handleCreateFollowup} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Select Lead</label>
                <select 
                  required
                  value={newFollowup.lead_id}
                  onChange={e => setNewFollowup({...newFollowup, lead_id: e.target.value})}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-wa-green/20 text-sm font-medium transition-all"
                >
                  <option value="">Choose a lead...</option>
                  {leads.map(lead => (
                    <option key={lead.id} value={lead.id}>{lead.name} ({lead.company})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Task Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Call to discuss pricing"
                  value={newFollowup.title}
                  onChange={e => setNewFollowup({...newFollowup, title: e.target.value})}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-wa-green/20 text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Follow-up Message</label>
                <textarea 
                  placeholder="What needs to be discussed? (Used for automatic send)"
                  value={newFollowup.message}
                  onChange={e => setNewFollowup({...newFollowup, message: e.target.value})}
                  className="w-full h-28 px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-wa-green/20 text-sm resize-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Schedule For</label>
                  <input 
                    type="datetime-local" 
                    required
                    value={newFollowup.scheduled_at}
                    onChange={e => setNewFollowup({...newFollowup, scheduled_at: e.target.value})}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-wa-green/20 text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Send Mode</label>
                  <select 
                    value={newFollowup.send_mode}
                    onChange={e => setNewFollowup({...newFollowup, send_mode: e.target.value as any})}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-wa-green/20 text-sm font-medium transition-all"
                  >
                    <option value="manual">Manual (I will send)</option>
                    <option value="automatic">Automatic (System sends)</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 text-slate-500 font-bold text-sm hover:bg-slate-50 rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex-[2] py-3 bg-slate-900 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>Save Follow-up</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FollowupCard({ followup, onSend, onSkip, onComplete, isOverdue }: { 
  followup: Followup; 
  onSend: () => void; 
  onSkip: () => void; 
  onComplete: () => void;
  isOverdue?: boolean;
}) {
  return (
    <div className={`glass-panel p-5 rounded-2xl border-l-4 transition-all hover:-translate-y-1 ${isOverdue ? 'border-error' : 'border-amber-400'}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-slate-900 leading-tight">{followup.lead?.name || "Unknown Lead"}</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{followup.lead?.company || "No Company"}</p>
        </div>
        <div className="text-right">
          <p className={`text-[10px] font-black uppercase ${isOverdue ? 'text-error' : 'text-slate-500'}`}>
            {formatDateTime12Hour(followup.scheduled_at)}
          </p>
        </div>
      </div>

      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
        <h4 className="text-[11px] font-bold text-slate-800 mb-1">{followup.title || "Follow-up"}</h4>
        <p className="text-xs text-slate-600 line-clamp-2 italic">"{followup.message}"</p>
        {followup.send_mode === 'automatic' && (
          <div className="mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px] text-teal-600">auto_mode</span>
            <span className="text-[9px] font-black text-teal-600 uppercase">Automatic Send</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button 
          onClick={onSend}
          className="flex-1 py-2 bg-wa-green text-white rounded-xl text-[10px] font-black uppercase shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm">send</span> Send Now
        </button>
        <button 
          onClick={onComplete}
          className="p-2 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-teal-600 hover:border-teal-200 transition-all flex items-center justify-center"
          title="Mark Completed"
        >
          <span className="material-symbols-outlined text-lg">check_circle</span>
        </button>
        <button 
          onClick={onSkip}
          className="p-2 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-error hover:border-red-200 transition-all flex items-center justify-center"
          title="Skip"
        >
          <span className="material-symbols-outlined text-lg">block</span>
        </button>
      </div>
    </div>
  );
}
