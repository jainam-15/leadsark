import React, { useState } from 'react';
import { LeadType, LeadStatus } from '@/app/(dashboard)/leads/page';
import { useLeads } from '@/hooks/useLeads';
import { suggestStatus } from '@/lib/scoring';
import { useFollowups } from '@/hooks/useFollowups';
import { formatDateTime12Hour, formatTime12Hour } from '@/lib/date-utils';

interface LeadDetailPanelProps {
  lead: LeadType;
  onUpdateStatus: (status: LeadStatus) => void;
}

export default function LeadDetailPanel({ lead, onUpdateStatus }: LeadDetailPanelProps) {
  const { toggleLeadField, updateLeadStatus } = useLeads();
  const { scheduleFollowup, followUps } = useFollowups();
  const [followupDate, setFollowupDate] = useState("");
  
  const suggested = suggestStatus(lead.lead_score || 0);
  const showSuggestion = !lead.is_manual_status && lead.status !== suggested;

  // Find next pending followup
  const nextFollowup = followUps.find(f => f.lead_id === lead.id && f.status === 'pending');


  return (
    <section className="w-[25%] border-l border-slate-200/30 flex flex-col h-full bg-surface-container-low overflow-hidden">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        {/* Profile Header */}
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl mb-4 bg-slate-200 flex items-center justify-center overflow-hidden">
              {lead.is_personal ? (
                <span className="material-symbols-outlined text-4xl text-blue-500">contact_page</span>
              ) : (
                <span className="material-symbols-outlined text-4xl text-slate-400">person</span>
              )}
            </div>
            {lead.status === 'Converted' && (
              <span className="absolute bottom-5 right-2 bg-wa-green text-white p-1 rounded-full border-2 border-white shadow-lg">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </span>
            )}
          </div>
          <h2 className="font-h2 text-2xl font-black text-slate-900 leading-tight">{lead.name}</h2>
          <p className="text-sm font-bold text-wa-green uppercase tracking-wider">{lead.company}</p>
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-center gap-2 text-slate-600">
              <span className="material-symbols-outlined text-sm">call</span>
              <span className="text-sm font-medium">{lead.phone || 'No phone'}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-slate-500">
              <span className="material-symbols-outlined text-sm">share</span>
              <span className="text-xs uppercase font-bold tracking-tighter">Source: {lead.source || 'WhatsApp'}</span>
            </div>
            {lead.last_message_at && (
              <p className="text-[10px] text-slate-400 uppercase font-black">Last message: {formatDateTime12Hour(lead.last_message_at)}</p>
            )}
          </div>

          <div className="flex flex-col items-center gap-2 mt-6">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lead Score</span>
              <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${lead.lead_score! >= 70 ? 'bg-error' : lead.lead_score! >= 30 ? 'bg-amber-500' : 'bg-slate-400'}`}
                  style={{ width: `${lead.lead_score}%` }} 
                />
              </div>
              <span className="text-xs font-black text-slate-700">{lead.lead_score}</span>
            </div>

            {showSuggestion && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-500 w-full">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-amber-700 uppercase">AI Suggestion</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${suggested === 'Hot' ? 'bg-error text-white' : suggested === 'Warm' ? 'bg-amber-500 text-white' : 'bg-slate-500 text-white'}`}>
                      {suggested} {suggested === 'Hot' ? '🔥' : suggested === 'Warm' ? '⚡' : '❄️'}
                    </span>
                  </div>
                  <button 
                    onClick={() => updateLeadStatus(lead.id, suggested, false)}
                    className="w-full py-1.5 bg-amber-500 text-white text-[10px] font-black uppercase rounded-lg hover:bg-amber-600 transition-colors"
                  >
                    Accept Suggestion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Automation Controls */}
        <div className="space-y-3 bg-white/50 p-4 rounded-2xl border border-slate-100 shadow-sm">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">settings_suggest</span>
            Automation Controls
          </h4>
          
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 transition-colors">Manual Status</span>
              <span className="text-[10px] text-slate-500">Override AI suggestions</span>
            </div>
            <div 
              onClick={() => toggleLeadField(lead.id, 'is_manual_status', !lead.is_manual_status)}
              className={`w-10 h-5 rounded-full transition-all relative ${lead.is_manual_status ? 'bg-wa-green' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${lead.is_manual_status ? 'left-6' : 'left-1'}`} />
            </div>
          </label>

          <div className="h-px bg-slate-100 my-2" />

          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 transition-colors">Pause Automation</span>
              <span className="text-[10px] text-slate-500">Stop auto-replies</span>
            </div>
            <div 
              onClick={() => toggleLeadField(lead.id, 'automation_paused', !lead.automation_paused)}
              className={`w-10 h-5 rounded-full transition-all relative ${lead.automation_paused ? 'bg-amber-500' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${lead.automation_paused ? 'left-6' : 'left-1'}`} />
            </div>
          </label>
        </div>

        {/* Smart Follow-up Scheduling */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex justify-between items-center">
            <span>Follow-up</span>
            {nextFollowup && <button onClick={() => setFollowupDate("")} className="text-teal-600 hover:underline">Add New</button>}
          </h4>
          
          {nextFollowup ? (
            <div className="glass-panel p-4 rounded-xl border-wa-green/20 bg-wa-green/5">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-wa-green text-sm">event</span>
                <span className="text-[10px] font-black text-slate-500 uppercase">Next: {formatDateTime12Hour(nextFollowup.scheduled_at)}</span>
              </div>
              <h5 className="text-xs font-bold text-slate-900">{nextFollowup.title || "Scheduled Outreach"}</h5>
              <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 italic">"{nextFollowup.message}"</p>
              {nextFollowup.send_mode === 'automatic' && (
                <div className="mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px] text-teal-600">auto_mode</span>
                  <span className="text-[9px] font-black text-teal-600 uppercase tracking-tighter">AI Auto-send</span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white/50 p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Task Title</label>
                <input 
                  type="text"
                  placeholder="e.g. Check pricing interest"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-slate-900/10"
                  id="fu-title"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Date & Time</label>
                <input 
                  type="datetime-local" 
                  value={followupDate}
                  onChange={e => setFollowupDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                <div className="flex flex-wrap gap-1 mt-2">
                   {[
                     { label: 'Tmrw', val: () => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(10, 0, 0, 0); return d; }},
                     { label: '3 Days', val: () => { const d = new Date(); d.setDate(d.getDate() + 3); d.setHours(10, 0, 0, 0); return d; }},
                     { label: '1 Week', val: () => { const d = new Date(); d.setDate(d.getDate() + 7); d.setHours(10, 0, 0, 0); return d; }},
                   ].map(opt => (
                     <button 
                       key={opt.label}
                       onClick={() => setFollowupDate(opt.val().toISOString().slice(0, 16))}
                       className="text-[9px] font-black uppercase px-2 py-1 bg-slate-100 text-slate-500 rounded-md hover:bg-slate-200"
                     >
                       {opt.label}
                     </button>
                   ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Message</label>
                <textarea 
                  placeholder="Type follow-up message..."
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-slate-900/10 resize-none"
                  rows={2}
                  id="fu-message"
                />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="fu-auto" className="rounded text-slate-900" />
                <label htmlFor="fu-auto" className="text-[10px] font-bold text-slate-600">Send Automatically</label>
              </div>

              <button 
                onClick={async () => {
                  const title = (document.getElementById('fu-title') as HTMLInputElement).value;
                  const message = (document.getElementById('fu-message') as HTMLTextAreaElement).value;
                  const auto = (document.getElementById('fu-auto') as HTMLInputElement).checked;
                  
                  if (!followupDate) return;

                  const res = await scheduleFollowup({
                    lead_id: lead.id,
                    title: title || "Follow-up",
                    message: message || "Following up on our conversation.",
                    scheduled_at: new Date(followupDate).toISOString(),
                    send_mode: auto ? 'automatic' : 'manual'
                  });
                  
                  if (res.success) {
                    setFollowupDate("");
                    alert("Follow-up scheduled!");
                  }
                }}
                disabled={!followupDate}
                className="w-full py-2 bg-slate-900 text-white text-[10px] font-black uppercase rounded-xl disabled:opacity-50 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
              >
                Schedule Task
              </button>
            </div>
          )}
        </div>

        {/* Status Selection */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Set Priority</h4>
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => onUpdateStatus("Hot")}
              className={`py-2 text-[10px] font-black uppercase rounded-xl transition-all border-2 ${lead.status === 'Hot' ? 'bg-error border-error text-white shadow-lg shadow-error/20' : 'bg-white border-slate-100 text-slate-400 hover:border-error/30 hover:text-error'}`}
            >
              Hot
            </button>
            <button 
              onClick={() => onUpdateStatus("Warm")}
              className={`py-2 text-[10px] font-black uppercase rounded-xl transition-all border-2 ${lead.status === 'Warm' ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-white border-slate-100 text-slate-400 hover:border-amber-500/30 hover:text-amber-500'}`}
            >
              Warm
            </button>
            <button 
              onClick={() => onUpdateStatus("Cold")}
              className={`py-2 text-[10px] font-black uppercase rounded-xl transition-all border-2 ${lead.status === 'Cold' ? 'bg-slate-400 border-slate-400 text-white shadow-lg shadow-slate-400/20' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-500/30 hover:text-slate-500'}`}
            >
              Cold
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button 
              onClick={() => onUpdateStatus("Converted")}
              className={`py-2 text-[10px] font-black uppercase rounded-xl transition-all border-2 flex items-center justify-center gap-2 ${lead.status === 'Converted' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400'}`}
            >
              <span className="material-symbols-outlined text-sm">check_circle</span>
              Won
            </button>
            <button 
              onClick={() => onUpdateStatus("Lost")}
              className={`py-2 text-[10px] font-black uppercase rounded-xl transition-all border-2 flex items-center justify-center gap-2 ${lead.status === 'Lost' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-slate-100 text-slate-400'}`}
            >
              <span className="material-symbols-outlined text-sm">cancel</span>
              Lost
            </button>
          </div>
        </div>

        {/* Follow-up History */}
        <div className="space-y-3 pb-8">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Recent History</h4>
          <div className="space-y-2">
            {followUps
              .filter(f => f.lead_id === lead.id && f.status !== 'pending')
              .slice(0, 3)
              .map(f => (
                <div key={f.id} className="p-3 bg-slate-50/50 border border-slate-100 rounded-xl">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-slate-700">{f.title || "Follow-up"}</span>
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${f.status === 'sent' ? 'bg-teal-50 text-teal-600' : 'bg-slate-200 text-slate-500'}`}>{f.status}</span>
                  </div>
                  <p className="text-[9px] text-slate-400 mb-1">{formatDateTime12Hour(f.sent_at || f.updated_at)}</p>
                  <p className="text-[10px] text-slate-400 italic line-clamp-1">"{f.message}"</p>
                </div>
              ))}
            {followUps.filter(f => f.lead_id === lead.id && f.status !== 'pending').length === 0 && (
              <p className="text-[10px] text-slate-400 italic px-1">No previous follow-ups.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
