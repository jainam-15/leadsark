"use client";

import { useAdmin } from "@/hooks/useAdmin";
import Link from "next/link";
import { getDaysRemaining, getSubscriptionStatusLabel } from "@/lib/subscription-utils";
import { formatDateTime12Hour } from "@/lib/date-utils";

export default function AdminSubscriptionsPage() {
  const { businesses, loading } = useAdmin();

  if (loading) return <div className="p-8 font-bold text-slate-400">Loading Subscriptions...</div>;

  // Filter only those that have a business and subscription record
  const subscriptions = businesses
    .filter(b => b.subscription)
    .sort((a, b) => new Date(b.subscription!.updated_at || 0).getTime() - new Date(a.subscription!.updated_at || 0).getTime());

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Subscription History</h1>
        <p className="text-slate-500">Track all active and past subscription plans</p>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Business</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Plan</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Start Date</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">End Date</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Remaining</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {subscriptions.map((biz) => {
              const sub = biz.subscription!;
              const status = getSubscriptionStatusLabel(sub);
              const days = getDaysRemaining(sub.end_date);

              return (
                <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{biz.name}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-[10px] font-black uppercase tracking-wider">
                      {sub.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${status.bg} ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {formatDateTime12Hour(sub.start_date)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {formatDateTime12Hour(sub.end_date)}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-700">
                    {days} Days
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/users/${biz.id}`} className="text-sm font-bold text-slate-900 hover:underline">Manage</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {subscriptions.length === 0 && (
          <div className="p-12 text-center text-slate-400 font-bold">No subscriptions found.</div>
        )}
      </div>
    </div>
  );
}
