"use client";

import { useEffect, useState } from "react";
import { PLANS } from "@/config/plans";

export default function AdminPlansPage() {
  const plans = Object.values(PLANS);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Subscription Plans</h1>
        <p className="text-slate-500">Global plan configuration and features</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {plans.map((plan) => (
          <div key={plan.id} className="glass-panel p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full bg-white">
            <div className="mb-6">
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">
                {plan.id}
              </span>
              <h3 className="text-2xl font-black text-slate-900">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-black text-slate-900">₹{plan.price}</span>
                <span className="text-sm text-slate-500 font-bold">/ {plan.durationDays} days</span>
              </div>
            </div>

            <div className="space-y-4 flex-1 border-t border-slate-100 pt-6">
              <div className="flex items-center gap-2 text-sm text-slate-600 font-bold">
                <span className="material-symbols-outlined text-wa-green text-[18px]">check_circle</span>
                {plan.features.maxLeads === 'unlimited' ? 'Unlimited' : `${plan.features.maxLeads}`} Leads
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 font-bold">
                <span className="material-symbols-outlined text-wa-green text-[18px]">check_circle</span>
                {plan.features.autoReply ? 'Auto Replies ON' : 'Auto Replies OFF'}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 font-bold">
                <span className={`material-symbols-outlined ${plan.features.followups !== 'none' ? 'text-wa-green' : 'text-slate-300'} text-[18px]`}>
                  {plan.features.followups !== 'none' ? 'check_circle' : 'cancel'}
                </span>
                <span className={plan.features.followups === 'none' ? 'text-slate-400' : ''}>
                   {plan.features.followups === 'automatic' ? 'Automatic AI Follow-ups' : 
                    plan.features.followups === 'suggest_with_approval' ? 'AI Suggest Follow-ups' :
                    plan.features.followups === 'manual' ? 'Manual Follow-ups' : 'No AI Follow-ups'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 font-bold">
                <span className="material-symbols-outlined text-wa-green text-[18px]">check_circle</span>
                {plan.features.teamMembers} Team Member{plan.features.teamMembers > 1 ? 's' : ''}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Internal Reference</div>
              <code className="text-xs font-mono text-slate-500 bg-slate-50 p-1 rounded">{plan.id}</code>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
