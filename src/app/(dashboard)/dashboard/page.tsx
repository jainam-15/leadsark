"use client";

import KpiCard from "@/components/KpiCard";
import LeadTable from "@/components/LeadTable";
import { useLeads } from "@/hooks/useLeads";
import { useFollowups } from "@/hooks/useFollowups";

export default function Dashboard() {
  const { leads, loading: leadsLoading } = useLeads();
  const { followUps } = useFollowups();

  // Calculations
  const totalLeads = leads.length;
  const newToday = leads.filter(l => {
    const d = new Date(l.time); // Note: time is a string like "5/3/2026", better to use real dates
    return d.toDateString() === new Date().toDateString();
  }).length;
  
  const pending = followUps.filter(f => f.status !== 'completed' && !f.isOverdue).length;
  const overdue = followUps.filter(f => f.status !== 'completed' && f.isOverdue);
  const missed = overdue.length;
  
  const converted = leads.filter(l => l.status === 'Converted').length;
  const convRate = totalLeads ? ((converted / totalLeads) * 100).toFixed(1) + '%' : '0%';

  return (
    <div className="p-lg">
      {/* High Priority Alerts */}
      <div className="mb-lg space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-error">error</span>
          <h2 className="text-label-sm font-bold text-slate-900 uppercase tracking-widest">High Priority Alerts</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <span className="material-symbols-outlined">notification_important</span>
              </div>
              <div>
                <p className="text-sm font-bold text-red-900">{overdue.length} Overdue Follow-ups</p>
                <p className="text-xs text-red-700">Immediate action required to prevent lead loss</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors">Resolve Now</button>
          </div>
          <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-100 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                <span className="material-symbols-outlined">local_fire_department</span>
              </div>
              <div>
                <p className="text-sm font-bold text-amber-900">{leads.filter(l => l.status === 'Hot').length} Hot Leads waiting</p>
                <p className="text-xs text-amber-700">Recent high-intent activity detected</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition-colors">View Leads</button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-lg">
        <KpiCard title="Total Leads" value={totalLeads.toString()} icon="groups" change="+12%" color="teal" />
        <KpiCard title="New Today" value={newToday.toString()} icon="person_add" change="+5%" color="indigo" />
        <KpiCard title="Pending" value={pending.toString()} icon="pending_actions" color="amber" />
        <KpiCard title="Missed Leads" value={missed.toString()} icon="heart_broken" change="+8%" color="red" trend="down" />
        <KpiCard title="Avg. Response" value="4m 20s" icon="schedule" color="blue" />
        <KpiCard title="Conv. Rate" value={convRate} icon="leaderboard" color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Recent Leads Table (2/3) */}
        <div className="lg:col-span-2 space-y-gutter">
          <LeadTable />
        </div>

        {/* Right-hand Column (1/3) */}
        <div className="space-y-gutter">
          {/* Quick Actions */}
          <div className="glass-panel p-md rounded-xl">
            <h3 className="text-label-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center justify-center p-4 bg-white/40 border border-slate-200/50 rounded-xl hover:bg-teal-50 hover:border-teal-200 transition-all group">
                <span className="material-symbols-outlined text-teal-600 mb-2 group-hover:scale-110 transition-transform">person_add</span>
                <span className="text-xs font-semibold text-slate-700">Add Lead</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-white/40 border border-slate-200/50 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-all group">
                <span className="material-symbols-outlined text-indigo-600 mb-2 group-hover:scale-110 transition-transform">campaign</span>
                <span className="text-xs font-semibold text-slate-700">Broadcast</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-white/40 border border-slate-200/50 rounded-xl hover:bg-amber-50 hover:border-amber-200 transition-all group">
                <span className="material-symbols-outlined text-amber-600 mb-2 group-hover:scale-110 transition-transform">schedule</span>
                <span className="text-xs font-semibold text-slate-700">Reminders</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-white/40 border border-slate-200/50 rounded-xl hover:bg-slate-50 hover:border-slate-200 transition-all group">
                <span className="material-symbols-outlined text-slate-600 mb-2 group-hover:scale-110 transition-transform">file_download</span>
                <span className="text-xs font-semibold text-slate-700">Export</span>
              </button>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="glass-panel rounded-xl flex flex-col h-[400px]">
            <div className="p-md border-b border-slate-100 bg-white/30 flex items-center justify-between">
              <h3 className="text-label-sm font-bold text-slate-400 uppercase tracking-widest">Action History</h3>
              <span className="material-symbols-outlined text-teal-500 text-sm">bolt</span>
            </div>
            <div className="p-md flex-1 overflow-y-auto space-y-6">
              {/* Feed Item 1 */}
              <div className="flex gap-4 relative">
                <div className="absolute top-8 bottom-[-24px] left-[11px] w-[2px] bg-slate-100"></div>
                <div className="h-6 w-6 rounded-full bg-teal-500 flex items-center justify-center z-10">
                  <span className="material-symbols-outlined text-[14px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_cart</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900 leading-tight">Sarah Jenkins <span className="font-normal text-slate-500">requested pricing</span></p>
                  <p className="text-[10px] text-slate-400 mt-1">12 mins ago • WhatsApp</p>
                </div>
              </div>

              {/* Feed Item 2 */}
              <div className="flex gap-4 relative">
                <div className="absolute top-8 bottom-[-24px] left-[11px] w-[2px] bg-slate-100"></div>
                <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center z-10">
                  <span className="material-symbols-outlined text-[14px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>public</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900 leading-tight">New lead <span className="font-normal text-slate-500">from Facebook</span></p>
                  <p className="text-[10px] text-slate-400 mt-1">45 mins ago • Social Media</p>
                </div>
              </div>

              {/* Feed Item 3 */}
              <div className="flex gap-4 relative">
                <div className="absolute top-8 bottom-[-24px] left-[11px] w-[2px] bg-slate-100"></div>
                <div className="h-6 w-6 rounded-full bg-amber-500 flex items-center justify-center z-10">
                  <span className="material-symbols-outlined text-[14px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>phone_callback</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900 leading-tight">Marcus Knight <span className="font-normal text-slate-500">missed follow-up</span></p>
                  <p className="text-[10px] text-slate-400 mt-1">2 hours ago • System</p>
                </div>
              </div>

              {/* Feed Item 4 */}
              <div className="flex gap-4">
                <div className="h-6 w-6 rounded-full bg-indigo-500 flex items-center justify-center z-10">
                  <span className="material-symbols-outlined text-[14px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900 leading-tight">Campaign <span className="font-normal text-slate-500">"Winter Promo" launched</span></p>
                  <p className="text-[10px] text-slate-400 mt-1">5 hours ago • Email</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Contextual Action */}
      <div className="fixed bottom-lg right-lg z-50">
        <button className="h-14 w-14 rounded-full bg-gradient-to-tr from-teal-500 to-indigo-600 text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-200">
          <span className="material-symbols-outlined text-2xl">chat</span>
        </button>
      </div>
    </div>
  );
}
