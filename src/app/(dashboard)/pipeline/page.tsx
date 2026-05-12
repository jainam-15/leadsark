"use client";

import { useState, useMemo } from "react";
import { useLeads } from "@/hooks/useLeads";
import { LeadType } from "@/app/(dashboard)/leads/page";
import { formatRelativeTime } from "@/lib/date-utils";

const STAGES = ["New", "Contacted", "Interested", "Qualified", "Proposal", "Won", "Lost"];

export default function PipelinePage() {
  const { leads, updatePipelineStage, loading } = useLeads();
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  const leadsByStage = useMemo(() => {
    const map: Record<string, LeadType[]> = {};
    STAGES.forEach(stage => map[stage] = []);
    leads.forEach(lead => {
      const stage = lead.pipeline_stage || "New";
      if (map[stage]) {
        map[stage].push(lead);
      } else {
        map["New"].push(lead);
      }
    });
    return map;
  }, [leads]);

  const onDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.setData("leadId", leadId);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onDrop = async (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("leadId") || draggedLeadId;
    if (leadId) {
      await updatePipelineStage(leadId, stage);
    }
    setDraggedLeadId(null);
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading pipeline...</div>;

  return (
    <div className="h-[calc(100vh-64px)] overflow-x-auto bg-slate-50/50 p-6">
      <div className="flex gap-6 h-full min-w-max">
        {STAGES.map((stage) => (
          <div 
            key={stage}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, stage)}
            className="flex flex-col w-72 h-full"
          >
            {/* Stage Header */}
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  stage === 'Won' ? 'bg-wa-green' : 
                  stage === 'Lost' ? 'bg-red-500' : 
                  stage === 'New' ? 'bg-primary' : 'bg-slate-400'
                }`} />
                <h3 className="font-black text-slate-700 text-xs uppercase tracking-widest">{stage}</h3>
              </div>
              <span className="bg-slate-200 text-slate-600 text-[10px] font-black px-2 py-0.5 rounded-full">
                {leadsByStage[stage]?.length || 0}
              </span>
            </div>

            {/* Leads Column */}
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar rounded-2xl bg-slate-100/50 p-2 border border-dashed border-slate-200">
              {leadsByStage[stage]?.map((lead) => (
                <div 
                  key={lead.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, lead.id)}
                  className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-grab active:cursor-grabbing group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                      lead.status === 'Hot' ? 'bg-error text-white' : 
                      lead.status === 'Warm' ? 'bg-amber-500 text-white' : 
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {lead.status}
                    </span>
                    <span className="text-[9px] text-slate-400">{formatRelativeTime(lead.pipeline_updated_at || lead.created_at || new Date().toISOString())}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{lead.name}</h4>
                  <p className="text-[10px] text-slate-500 font-medium mb-3">{lead.company}</p>
                  
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
                    <div className="flex items-center gap-1.5">
                       <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400">
                         {lead.name.charAt(0)}
                       </div>
                       <span className="text-[9px] text-slate-500 font-bold">
                         {lead.assigned_to ? 'Assigned' : 'Unassigned'}
                       </span>
                    </div>
                    <span className="material-symbols-outlined text-slate-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity">drag_indicator</span>
                  </div>
                </div>
              ))}
              {leadsByStage[stage]?.length === 0 && (
                <div className="h-20 flex items-center justify-center text-slate-300 text-[10px] uppercase font-bold">
                  Empty Stage
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
