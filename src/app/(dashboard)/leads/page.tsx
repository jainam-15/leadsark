"use client";

import { useState } from "react";
import LeadListItem from "@/components/LeadListItem";
import ChatUI from "@/components/ChatUI";
import LeadDetailPanel from "@/components/LeadDetailPanel";
import { useLeads } from "@/hooks/useLeads";

export type LeadStatus = "Hot" | "Warm" | "Cold" | "Converted" | "Lost";

export interface LeadType {
  id: string;
  name: string;
  company: string;
  status: LeadStatus;
  snippet: string;
  time: string;
  phone?: string;
  source?: string;
  last_message_at?: string;
  unreadCount?: number;
  active?: boolean;
  overdue?: boolean;
  is_blocked?: boolean;
  is_personal?: boolean;
  automation_paused?: boolean;
  conversation_state?: string;
  lead_score?: number;
  is_manual_status?: boolean;
}

export default function Leads() {
  const { leads, loading, updateLeadStatus } = useLeads();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const filteredLeads = leads.filter(
    lead => {
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lead.phone || '').includes(searchQuery);
      
      const matchesStatus = statusFilter === "All" || lead.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    }
  );

  // Default to first lead if none selected
  const selectedLead = leads.find(l => l.id === selectedLeadId) || leads[0];

  const handleUpdateStatus = (status: LeadStatus) => {
    if (selectedLead) {
      updateLeadStatus(selectedLead.id, status);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading leads...</div>;
  }

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden">
      {/* Column 1: Lead List (30%) */}
      <section className="w-[30%] border-r border-slate-200/30 flex flex-col h-full bg-surface-container-lowest/50">
        <div className="p-4 border-b border-slate-100 flex flex-col gap-3 bg-white/50">
          <div className="flex justify-between items-center">
            <h2 className="font-h3 text-lg font-bold text-slate-800">Recent Leads</h2>
            <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
              <span className="material-symbols-outlined">filter_list</span>
            </button>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
              <input 
                type="text" 
                placeholder="Search leads..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 border-none rounded-lg pl-8 pr-3 py-1.5 text-sm focus:ring-2 focus:ring-wa-green/20 outline-none"
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-100 border-none rounded-lg px-2 py-1.5 text-[10px] font-bold text-slate-600 outline-none focus:ring-2 focus:ring-wa-green/20"
            >
              <option value="All">All Status</option>
              <option value="Hot">Hot</option>
              <option value="Warm">Warm</option>
              <option value="Cold">Cold</option>
            </select>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredLeads.map((lead) => (
            <div key={lead.id} onClick={() => setSelectedLeadId(lead.id)}>
              <LeadListItem 
                {...lead} 
                active={lead.id === selectedLeadId} 
                status={lead.status === 'Converted' || lead.status === 'Lost' ? 'Cold' : lead.status} // Simplified display
              />
            </div>
          ))}
          {filteredLeads.length === 0 && (
            <div className="p-6 text-center text-slate-500 text-sm">No leads found.</div>
          )}
        </div>
      </section>

      {/* Column 2: Chat Interface (45%) */}
      {selectedLead ? (
        <ChatUI leadName={selectedLead.name} leadId={selectedLead.id} />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-400 gap-4">
          <span className="material-symbols-outlined text-6xl">chat_bubble</span>
          <p>Select a lead to start chatting</p>
        </div>
      )}

      {/* Column 3: Lead Details (25%) */}
      {selectedLead ? (
        <LeadDetailPanel 
          lead={selectedLead} 
          onUpdateStatus={handleUpdateStatus} 
        />
      ) : (
        <div className="w-[25%] border-l border-slate-200/30 flex items-center justify-center bg-surface-container-low text-slate-400">
          No lead details
        </div>
      )}
    </div>
  );
}
