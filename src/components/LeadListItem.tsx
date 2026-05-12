import React from 'react';

interface LeadListItemProps {
  name: string;
  company: string;
  status: 'Hot' | 'Warm' | 'Cold';
  snippet: string;
  time: string;
  unreadCount?: number;
  active?: boolean;
  overdue?: boolean;
  assigned_to?: string;
  pipeline_stage?: string;
}

export default function LeadListItem({
  name,
  company,
  status,
  snippet,
  time,
  unreadCount,
  active,
  overdue,
  assigned_to,
  pipeline_stage,
}: LeadListItemProps) {
  return (
    <div className={`relative p-5 border-b border-slate-100 shadow-sm hover:px-6 transition-all duration-300 group cursor-pointer ${
      active ? 'bg-white' : overdue ? 'bg-red-50/20 hover:bg-white/80' : 'hover:bg-white/80'
    }`}>
      {active && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-wa-green"></div>}
      
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-slate-900 text-base">{name}</h3>
        {status === 'Hot' && (
          <span className="bg-red-500 text-white px-2 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 shadow-sm">
            <span className="material-symbols-outlined text-[12px]">local_fire_department</span> Hot
          </span>
        )}
        {status === 'Warm' && (
          <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">priority_high</span> Warm
          </span>
        )}
        {status === 'Cold' && (
          <span className="bg-slate-200 text-slate-600 px-2 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">ac_unit</span> Cold
          </span>
        )}
      </div>
      
      <p className="text-xs text-slate-500 font-bold mb-2">{company}</p>
      
      {overdue && (
        <span className="inline-flex items-center gap-1 bg-error text-white px-2 py-0.5 rounded-full text-[9px] font-black uppercase mb-2">
          <span className="material-symbols-outlined text-[11px]">alarm</span> Needs Attention
        </span>
      )}
      
      <p className={`text-sm text-slate-600 line-clamp-1 ${unreadCount ? 'italic' : ''}`}>
        {snippet}
      </p>
      
      <div className="mt-3 flex justify-between items-center">
        {overdue ? (
          <span className="text-[10px] text-error font-black uppercase">Overdue: {time}</span>
        ) : (
          <span className="text-[10px] text-slate-400 font-semibold">{time}</span>
        )}

        <div className="flex items-center gap-2">
          {pipeline_stage && (
            <span className="text-[8px] font-black uppercase px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">
              {pipeline_stage}
            </span>
          )}
          {assigned_to && (
            <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[8px] font-black text-slate-400" title="Assigned">
              <span className="material-symbols-outlined text-[10px]">person</span>
            </div>
          )}
          {unreadCount && unreadCount > 0 && (
            <div className="flex items-center gap-1 bg-wa-green/10 px-1.5 py-0.5 rounded-full">
              <span className="text-wa-green text-[10px] font-bold">{unreadCount}</span>
              <span className="material-symbols-outlined text-wa-green text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
