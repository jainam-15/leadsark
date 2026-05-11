import React from "react";

export default function ActivityLogsPage() {
  const logs = [
    { id: 1, action: "Logged in", user: "Alex Rivera", time: "Today • 2:30 PM", ip: "192.168.1.1" },
    { id: 2, action: "Exported Leads", user: "Alex Rivera", time: "Today • 11:45 AM", ip: "192.168.1.1" },
    { id: 3, action: "Updated Settings", user: "Lisa Wong", time: "Yesterday • 4:15 PM", ip: "10.0.0.5" },
    { id: 4, action: "Deleted Contact", user: "Alex Rivera", time: "Yesterday • 9:00 AM", ip: "192.168.1.1" },
    { id: 5, action: "Created API Key", user: "System", time: "May 10 • 10:00 AM", ip: "Internal" },
  ];

  return (
    <div className="p-lg max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-slate-100 pb-4">
        <div>
          <h1 className="font-h2 text-h2 text-slate-900 tracking-tight">Activity Logs</h1>
          <p className="text-body-md text-slate-500 mt-1">Audit trail of system events.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all">
          <span className="material-symbols-outlined text-sm">download</span>
          Export CSV
        </button>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Event</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">User</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Time</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/50 bg-white/50">
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-slate-50/50 transition-all">
                <td className="px-6 py-4 text-sm font-semibold text-slate-800">{log.action}</td>
                <td className="px-6 py-4 text-sm text-slate-600 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[12px] text-slate-500">person</span>
                  </div>
                  {log.user}
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{log.time}</td>
                <td className="px-6 py-4 text-sm text-slate-400 font-mono text-xs">{log.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
