"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getDaysRemaining, getSubscriptionStatusLabel, getPlanDetails } from "@/lib/subscription-utils";

export default function UserDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { updateSubscription } = useAdmin();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/businesses/${id}`);
      if (!res.ok) throw new Error("Failed to fetch");
      setData(await res.json());
    } catch (err) {
      console.error(err);
      router.push('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const handleAction = async (plan: string, days: number, status: string = 'active') => {
    setUpdating(true);
    const res = await updateSubscription(id as string, plan, days, status);
    if (res.success) await fetchData();
    setUpdating(false);
  };

  if (loading) return <div className="p-8 font-bold text-slate-400">Loading Details...</div>;
  if (!data) return <div className="p-8 text-red-500">Business not found.</div>;

  const { business, profile, subscription, whatsapp, stats } = data;
  const subStatus = getSubscriptionStatusLabel(subscription);
  const daysLeft = getDaysRemaining(subscription?.end_date);
  const plan = getPlanDetails(subscription?.plan);

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/users" className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900">{business.name}</h1>
          <p className="text-sm text-slate-500">Business ID: {id}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
           <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${subStatus.bg} ${subStatus.color}`}>
             {subStatus.label}
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Info Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-panel p-6 rounded-2xl border border-slate-200">
              <div className="text-2xl font-black text-slate-900">{stats.leads_count}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Leads</div>
            </div>
            <div className="glass-panel p-6 rounded-2xl border border-slate-200">
              <div className="text-2xl font-black text-slate-900">{stats.messages_count}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Messages</div>
            </div>
            <div className="glass-panel p-6 rounded-2xl border border-slate-200">
              <div className="text-2xl font-black text-slate-900">{stats.followups_count}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Follow-ups</div>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-slate-200 space-y-6">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs border-b border-slate-100 pb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Owner</label>
                  <div className="font-bold text-slate-900">{profile?.full_name || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Email</label>
                  <div className="font-bold text-slate-900">{profile?.email || business.email || 'N/A'}</div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">WhatsApp</label>
                  <div className={`font-bold capitalize ${whatsapp?.status === 'connected' ? 'text-wa-green' : 'text-slate-400'}`}>
                    {whatsapp?.status || 'disconnected'}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Joined</label>
                  <div className="font-bold text-slate-900">{new Date(business.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Column */}
        <div className="space-y-8">
          {/* Subscription Card */}
          <div className="glass-panel p-8 rounded-2xl border border-slate-200 bg-slate-900 text-white">
            <h3 className="font-bold uppercase tracking-widest text-[10px] text-slate-400 mb-6">Subscription Plan</h3>
            <div className="mb-8">
              <div className="text-3xl font-black capitalize mb-1">{subscription?.plan || 'trial'}</div>
              <div className="text-sm text-slate-400">
                Expires: <span className="text-wa-green font-bold">{daysLeft} days left</span>
              </div>
            </div>
            
            <div className="space-y-4 pt-6 border-t border-slate-800">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-bold uppercase">End Date</span>
                <span className="font-black">
                  {subscription?.end_date ? new Date(subscription.end_date).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-panel p-8 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-4">Admin Actions</h3>
            <button 
              disabled={updating}
              onClick={() => handleAction('starter', 30)}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl transition-all font-bold text-sm disabled:opacity-50"
            >
              Activate Starter (30 Days)
            </button>
            <button 
              disabled={updating}
              onClick={() => handleAction('growth', 30)}
              className="w-full py-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl transition-all font-bold text-sm disabled:opacity-50"
            >
              Activate Growth (30 Days)
            </button>
            <button 
              disabled={updating}
              onClick={() => handleAction('pro', 30)}
              className="w-full py-3 bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-all font-bold text-sm disabled:opacity-50"
            >
              Activate Pro (30 Days)
            </button>
            <div className="pt-4 border-t border-slate-100">
              <button 
                disabled={updating}
                onClick={() => handleAction(subscription?.plan || 'trial', 0, subStatus.label === 'Suspended' ? 'active' : 'suspended')}
                className={`w-full py-3 rounded-xl transition-all font-bold text-sm ${
                  subStatus.label === 'Suspended' 
                  ? 'bg-wa-green text-white shadow-lg' 
                  : 'text-red-600 border border-red-100 hover:bg-red-50'
                }`}
              >
                {subStatus.label === 'Suspended' ? 'Reactivate Account' : 'Suspend Account'}
              </button>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button 
                  disabled={updating}
                  onClick={() => handleAction(subscription?.plan || 'trial', 7, subscription?.status || 'active')}
                  className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all font-bold text-xs"
                >
                  +7 Days
                </button>
                <button 
                  disabled={updating}
                  onClick={() => handleAction(subscription?.plan || 'trial', -1, 'expired')}
                  className="py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all font-bold text-xs"
                >
                  Mark Expired
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
