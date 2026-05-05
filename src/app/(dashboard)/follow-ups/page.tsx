"use client";

import { useFollowups } from "@/hooks/useFollowups";

export default function FollowUpsPage() {
  const { followUps, loading, toggleComplete, updateFollowupStatus } = useFollowups();

  const overdue = followUps.filter(f => f.isOverdue && f.status === 'pending');
  const upcoming = followUps.filter(f => !f.isOverdue && f.status === 'pending');
  const completed = followUps.filter(f => f.status === 'sent' || f.status === 'completed');

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading follow-ups...</div>;
  }

  return (
    <div className="p-lg space-y-gutter">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="font-h2 text-h2 text-slate-900 tracking-tight">Follow-ups</h1>
          <p className="text-body-md text-slate-500 mt-1">Manage your upcoming and overdue tasks.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Overdue Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-error">alarm</span>
            <h2 className="text-label-sm font-bold text-slate-900 uppercase tracking-widest">Overdue</h2>
            <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-[10px] font-bold">{overdue.length}</span>
          </div>
          {overdue.map(f => (
            <div key={f.id} className="glass-panel p-4 rounded-xl border-l-4 border-error relative group hover:-translate-y-1 transition-all">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-900">{f.lead?.name || 'Unknown Lead'}</h3>
                <span className="text-[10px] font-black text-error uppercase">
                  {new Date(f.scheduled_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-bold mb-3">{f.lead?.company || 'No Company'}</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => updateFollowupStatus(f.id, 'sent')} 
                  className="flex-1 py-1.5 bg-wa-green text-white rounded-lg text-xs font-bold shadow-sm hover:shadow-md transition-all flex justify-center items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">send</span> Send Now
                </button>
                <button 
                  onClick={() => updateFollowupStatus(f.id, 'skipped')}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-400 rounded-lg text-xs font-bold hover:text-red-500 hover:border-red-200 transition-all"
                >
                  Skip
                </button>
              </div>
            </div>
          ))}
          {overdue.length === 0 && (
            <div className="p-6 border border-dashed border-slate-300 rounded-xl text-center text-slate-500 text-sm">No overdue tasks!</div>
          )}
        </div>

        {/* Upcoming Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500">schedule</span>
            <h2 className="text-label-sm font-bold text-slate-900 uppercase tracking-widest">Upcoming</h2>
            <span className="bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full text-[10px] font-bold">{upcoming.length}</span>
          </div>
          {upcoming.map(f => (
            <div key={f.id} className="glass-panel p-4 rounded-xl border-l-4 border-amber-400 relative group hover:-translate-y-1 transition-all">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-900">{f.lead?.name}</h3>
                <span className="text-[10px] font-bold text-slate-500">
                  {new Date(f.scheduled_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-bold mb-3">{f.lead?.company}</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => updateFollowupStatus(f.id, 'sent')}
                  className="flex-1 py-1.5 bg-white border border-slate-200 text-wa-green rounded-lg text-xs font-bold hover:bg-wa-green hover:text-white transition-all flex justify-center items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">send</span> Send
                </button>
                <button 
                  onClick={() => updateFollowupStatus(f.id, 'skipped')}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-400 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all"
                >
                  Skip
                </button>
              </div>
            </div>
          ))}
          {upcoming.length === 0 && (
            <div className="p-6 border border-dashed border-slate-300 rounded-xl text-center text-slate-500 text-sm">No upcoming tasks.</div>
          )}
        </div>

        {/* Completed Section */}
        <div className="space-y-4 opacity-75">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400">task_alt</span>
            <h2 className="text-label-sm font-bold text-slate-500 uppercase tracking-widest">Sent</h2>
            <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-bold">{completed.length}</span>
          </div>
          {completed.map(f => (
            <div key={f.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 relative group">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-500 line-through">{f.lead?.name}</h3>
              </div>
              <p className="text-xs text-slate-400 italic">Sent on {f.sent_at || f.created_at ? new Date(f.sent_at || f.created_at as string).toLocaleString() : 'Unknown date'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
