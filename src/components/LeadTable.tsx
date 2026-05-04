import React from 'react';
import Badge from './Badge';

export interface Lead {
  id: string;
  name: string;
  email: string;
  initials: string;
  status: 'Hot' | 'Warm' | 'Cold';
  lastActivity: string;
  color: 'teal' | 'amber' | 'slate' | 'red';
}

const leads: Lead[] = [
  { id: '1', name: 'Sarah Jenkins', email: 'sarah.j@example.com', initials: 'SJ', status: 'Hot', lastActivity: '24 mins ago', color: 'teal' },
  { id: '2', name: 'Marcus Knight', email: 'm.knight@web.com', initials: 'MK', status: 'Warm', lastActivity: '2 hours ago', color: 'amber' },
  { id: '3', name: 'Elena Loft', email: 'e.loft@corp.io', initials: 'EL', status: 'Cold', lastActivity: '5 hours ago', color: 'slate' },
  { id: '4', name: 'David Ross', email: 'david@ross.me', initials: 'DR', status: 'Hot', lastActivity: 'Yesterday', color: 'red' },
];

const colorMap = {
  teal: 'bg-teal-100 text-teal-700',
  amber: 'bg-amber-100 text-amber-700',
  slate: 'bg-slate-100 text-slate-700',
  red: 'bg-red-100 text-red-700',
};

export default function LeadTable() {
  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      <div className="px-md py-sm border-b border-slate-100 flex justify-between items-center bg-white/30">
        <h3 className="text-h3 font-h3 text-slate-900">Recent Leads</h3>
        <button className="text-teal-600 font-semibold text-sm hover:underline">View All Leads</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-md py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Lead Details</th>
              <th className="px-md py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Visual Status</th>
              <th className="px-md py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Last Activity</th>
              <th className="px-md py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Quick Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/50">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-teal-50/20 transition-all group">
                <td className="px-md py-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full ${colorMap[lead.color]} flex items-center justify-center text-sm font-bold`}>
                      {lead.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{lead.name}</p>
                      <p className="text-[10px] text-slate-400">{lead.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-md py-4">
                  <Badge 
                    label={`${lead.status} Lead`} 
                    color={lead.status === 'Hot' ? 'red' : lead.status === 'Warm' ? 'amber' : 'slate'} 
                    pulse={lead.status === 'Hot'} 
                  />
                </td>
                <td className="px-md py-4 text-sm text-slate-500">{lead.lastActivity}</td>
                <td className="px-md py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="h-8 w-8 rounded-lg bg-teal-500 text-white flex items-center justify-center hover:bg-teal-600 transition-colors" title="Call">
                      <span className="material-symbols-outlined text-lg">call</span>
                    </button>
                    <button className="h-8 w-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-600 transition-colors" title="Message">
                      <span className="material-symbols-outlined text-lg">chat</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
