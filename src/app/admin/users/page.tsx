"use client";

import { useAdmin } from "@/hooks/useAdmin";
import Link from "next/link";
import { useState } from "react";
import { getDaysRemaining, getSubscriptionStatusLabel, isExpired } from "@/lib/subscription-utils";

export default function AdminUsersPage() {
  const { businesses, loading, updateSubscription } = useAdmin();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  if (loading) return <div className="p-8 font-bold text-slate-400">Loading Users...</div>;

  const filtered = businesses.filter(b => {
    const matchesSearch = 
      b.name.toLowerCase().includes(search.toLowerCase()) || 
      b.owner_email?.toLowerCase().includes(search.toLowerCase());
    
    if (filter === "all") return matchesSearch;
    if (filter === "trial") return matchesSearch && b.subscription?.status === 'trial';
    if (filter === "active") return matchesSearch && b.subscription?.status === 'active';
    if (filter === "expired") return matchesSearch && isExpired(b.subscription?.end_date);
    
    return matchesSearch;
  });

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">System Users</h1>
          <p className="text-slate-500">Manage all registered businesses and owners</p>
        </div>
        
        <div className="flex items-center gap-4">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-xl bg-white text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="all">All Status</option>
            <option value="trial">Trial</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select>
          
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
            <input 
              type="text" 
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none w-full md:w-80 text-sm transition-all"
            />
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Business & Owner</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Plan</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">WhatsApp</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Days Left</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((biz) => {
              const status = getSubscriptionStatusLabel(biz.subscription);
              const days = getDaysRemaining(biz.subscription?.end_date);
              
              return (
                <tr key={biz.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{biz.name}</div>
                    <div className="text-xs text-slate-500">{biz.owner_email || 'No Email'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-700 capitalize">{biz.subscription?.plan || 'no plan'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${status.bg} ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {biz.whatsapp?.status === 'connected' ? (
                      <span className="px-2 py-0.5 bg-wa-green/10 text-wa-green rounded-full text-[10px] font-black uppercase tracking-tighter">Connected</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-tighter">Disconnected</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-700">{days}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link 
                        href={`/admin/users/${biz.id}`}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-all"
                        title="View Details"
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </Link>
                      <button 
                        onClick={() => updateSubscription(biz.id, 'starter', 30, 'active')}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-wa-green transition-all"
                        title="Activate Starter"
                      >
                        <span className="material-symbols-outlined text-[18px]">play_circle</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-slate-400 font-bold">No users found matching your search.</div>
        )}
      </div>
    </div>
  );
}
