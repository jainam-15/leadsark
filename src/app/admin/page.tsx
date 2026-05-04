"use client";

import { useAdmin } from "@/hooks/useAdmin";
import Link from "next/link";
import { getDaysRemaining, getSubscriptionStatusLabel } from "@/lib/subscription-utils";

export default function AdminDashboard() {
  const { stats, businesses, loading } = useAdmin();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold">Loading Admin Stats...</p>
        </div>
      </div>
    );
  }

  const cards = [
    { label: "Total Businesses", value: stats?.totalBusinesses || 0, icon: "store", color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active Subscriptions", value: stats?.activePaidUsers || 0, icon: "verified", color: "text-wa-green", bg: "bg-wa-green/10" },
    { label: "Trial Users", value: stats?.trialUsers || 0, icon: "schedule", color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Expired", value: stats?.expiredSubscriptions || 0, icon: "error", color: "text-red-600", bg: "bg-red-50" },
    { label: "Revenue Estimate", value: `₹${(stats?.revenueEstimate || 0).toLocaleString()}`, icon: "payments", color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Admin Overview</h1>
        <p className="text-slate-500">Real-time system health and revenue</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="glass-panel p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className={`w-10 h-10 ${card.bg} ${card.color} rounded-xl flex items-center justify-center mb-4`}>
              <span className="material-symbols-outlined">{card.icon}</span>
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">{card.value}</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Businesses */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900">Recent Onboarding</h2>
          <Link href="/admin/users" className="text-sm font-bold text-slate-900 hover:underline">View All Users</Link>
        </div>
        
        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Business</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Owner Email</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Days Left</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {businesses.slice(0, 5).map((biz) => {
                const status = getSubscriptionStatusLabel(biz.subscription);
                const days = getDaysRemaining(biz.subscription?.end_date);
                
                return (
                  <tr key={biz.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{biz.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{biz.owner_email || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-black uppercase tracking-wider">
                        {biz.subscription?.plan || 'no plan'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${status.bg} ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-700">{days}</td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/users/${biz.id}`} className="text-sm font-bold text-slate-900 hover:underline">Details</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {businesses.length === 0 && (
            <div className="p-12 text-center text-slate-400 font-bold">No businesses found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
