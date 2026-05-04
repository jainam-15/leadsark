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
        
        {unreadCount && unreadCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="bg-wa-green text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{unreadCount}</span>
            <span className="material-symbols-outlined text-wa-green text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
          </div>
        )}
      </div>
    </div>
  );
}
