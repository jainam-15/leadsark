"use client";

import React from 'react';
import { useLeads } from '@/hooks/useLeads';
import { useFollowups } from '@/hooks/useFollowups';

export default function Analytics() {
  const { leads, loading } = useLeads();
  const { followUps } = useFollowups();

  const totalLeads = leads.length;
  const engaged = leads.filter(l => l.status === 'Warm' || l.status === 'Hot').length;
  const qualified = leads.filter(l => l.status === 'Hot').length;
  const converted = leads.filter(l => l.status === 'Converted').length;

  const engagedPct = totalLeads ? Math.round((engaged / totalLeads) * 100) : 0;
  const qualifiedPct = totalLeads ? Math.round((qualified / totalLeads) * 100) : 0;
  const convertedPct = totalLeads ? ((converted / totalLeads) * 100).toFixed(1) : '0';

  const completedFollowups = followUps.filter(f => f.status === 'completed').length;
  const totalFollowups = followUps.length;
  const followupRate = totalFollowups ? Math.round((completedFollowups / totalFollowups) * 100) : 0;

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading analytics...</div>;
  }

  return (
    <div className="p-lg space-y-gutter flex-1 bg-[radial-gradient(at_0%_0%,rgba(0,104,95,0.05)_0px,transparent_50%),radial-gradient(at_100%_100%,rgba(84,79,192,0.05)_0px,transparent_50%)]">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="font-h2 text-h2 text-slate-900 tracking-tight">Sales Performance</h1>
          <p className="text-body-md text-slate-500 mt-1">High-level overview of your conversion funnel and WhatsApp activity.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-white rounded-lg p-1 shadow-sm border border-slate-200/50">
            <button className="px-4 py-1.5 rounded-md text-label-sm bg-primary text-white font-semibold">Weekly</button>
            <button className="px-4 py-1.5 rounded-md text-label-sm text-slate-500 hover:bg-slate-50">Monthly</button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 glass-panel rounded-lg text-label-sm font-semibold text-slate-700 hover:bg-white transition-all">
            <span className="material-symbols-outlined text-sm">file_download</span>
            Export
          </button>
        </div>
      </div>

      {/* Sales Funnel Visualization */}
      <div className="glass-panel rounded-xl p-md mb-gutter">
        <h3 className="font-label-sm uppercase tracking-widest text-slate-400 font-bold mb-6">Lead to Conversion Funnel</h3>
        <div className="flex items-stretch h-32 gap-1">
          <div className="flex-1 bg-wa-green/10 border-l-4 border-wa-green rounded-l-lg flex flex-col justify-center px-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-wa-green/5 to-transparent"></div>
            <span className="text-label-xs font-bold text-wa-green uppercase tracking-wider">Total Leads</span>
            <div className="flex items-baseline gap-2">
              <span className="text-h2 font-h2 text-slate-900">{totalLeads.toLocaleString()}</span>
              <span className="text-xs font-bold text-slate-500">100%</span>
            </div>
          </div>
          
          <div className="flex-1 bg-wa-green/20 flex flex-col justify-center px-6 border-l border-white/50 relative">
            <span className="text-label-xs font-bold text-wa-green uppercase tracking-wider">Engaged</span>
            <div className="flex items-baseline gap-2">
              <span className="text-h2 font-h2 text-slate-900">{engaged.toLocaleString()}</span>
              <span className="text-xs font-bold text-wa-green">{engagedPct}%</span>
            </div>
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-slate-300">
              <span className="material-symbols-outlined">chevron_right</span>
            </div>
          </div>
          
          <div className="flex-1 bg-blue-600/10 flex flex-col justify-center px-6 border-l border-white/50 relative">
            <span className="text-label-xs font-bold text-blue-600 uppercase tracking-wider">Qualified</span>
            <div className="flex items-baseline gap-2">
              <span className="text-h2 font-h2 text-slate-900">{qualified.toLocaleString()}</span>
              <span className="text-xs font-bold text-blue-600">{qualifiedPct}%</span>
            </div>
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-slate-300">
              <span className="material-symbols-outlined">chevron_right</span>
            </div>
          </div>
          
          <div className="flex-1 bg-blue-600/20 rounded-r-lg flex flex-col justify-center px-6 border-l border-white/50 relative">
            <span className="text-label-xs font-bold text-blue-600 uppercase tracking-wider">Converted</span>
            <div className="flex items-baseline gap-2">
              <span className="text-h2 font-h2 text-slate-900">{converted.toLocaleString()}</span>
              <span className="text-xs font-bold text-blue-600">{convertedPct}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        {/* WhatsApp Response Time Trends */}
        <div className="col-span-12 lg:col-span-7 glass-panel rounded-xl p-md flex flex-col h-[380px]">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="font-label-sm uppercase tracking-widest text-slate-400 font-bold">Avg. Response Time</h3>
              <p className="text-h3 font-h3 text-slate-900">4.2 min <span className="text-wa-green text-label-sm font-bold ml-2">↓ 1.5m</span></p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 text-label-xs font-bold text-slate-400">
                <span className="w-3 h-1.5 rounded-full bg-wa-green"></span> Target: &lt;5m
              </div>
            </div>
          </div>
          <div className="flex-1 flex items-end gap-3 px-2">
            {/* Minimal Graph Bars */}
            {[40, 55, 45, 35, 30].map((h, i) => (
              <div key={i} className={`flex-1 bg-slate-100 rounded-t-lg relative group h-[${h}%] transition-all hover:bg-wa-green/20`} style={{ height: `${h}%` }}>
                {i === 0 && <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100">8.2m</div>}
              </div>
            ))}
            <div className="flex-1 bg-wa-green/40 border-t-2 border-wa-green rounded-t-lg relative group h-[25%] transition-all">
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-wa-green text-white text-[10px] px-2 py-1 rounded">Today: 4.2m</div>
            </div>
          </div>
          <div className="flex justify-between mt-4 px-2 text-label-xs text-slate-400 font-bold">
            <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT/SUN</span>
          </div>
        </div>

        {/* WhatsApp Activity Heatmap (Simulated) */}
        <div className="col-span-12 lg:col-span-5 glass-panel rounded-xl p-md flex flex-col h-[380px]">
          <h3 className="font-label-sm uppercase tracking-widest text-slate-400 font-bold mb-6">Most Active Chat Times</h3>
          <div className="flex-1 grid grid-cols-6 grid-rows-4 gap-2">
            {/* Morning */}
            {['bg-wa-green/5', 'bg-wa-green/10', 'bg-wa-green/20', 'bg-wa-green/60', 'bg-wa-green/40', 'bg-wa-green/10'].map((bg, i) => <div key={`m-${i}`} className={`${bg} rounded hover:bg-wa-green/80 transition-colors`}></div>)}
            {/* Afternoon */}
            {['bg-wa-green/20', 'bg-wa-green/40', 'bg-wa-green/80', 'bg-wa-green/100', 'bg-wa-green/60', 'bg-wa-green/20'].map((bg, i) => <div key={`a-${i}`} className={`${bg} rounded hover:bg-wa-green/100 transition-colors`}></div>)}
            {/* Evening */}
            {['bg-wa-green/10', 'bg-wa-green/20', 'bg-wa-green/40', 'bg-wa-green/30', 'bg-wa-green/10', 'bg-wa-green/5'].map((bg, i) => <div key={`e-${i}`} className={`${bg} rounded hover:bg-wa-green/60 transition-colors`}></div>)}
            {/* Night */}
            {['bg-slate-50', 'bg-slate-50', 'bg-slate-50', 'bg-wa-green/5', 'bg-slate-50', 'bg-slate-50'].map((bg, i) => <div key={`n-${i}`} className={`${bg} rounded`}></div>)}
          </div>
          <div className="flex justify-between mt-6 text-label-xs text-slate-400 font-bold uppercase">
            <span>8:00 AM</span>
            <span>12:00 PM</span>
            <span>4:00 PM</span>
            <span>8:00 PM</span>
            <span>12:00 AM</span>
          </div>
        </div>

        {/* Conversion Sources Simplified */}
        <div className="col-span-12 lg:col-span-5 glass-panel rounded-xl p-md flex flex-col">
          <h3 className="font-label-sm uppercase tracking-widest text-slate-400 font-bold mb-6">Top Channels</h3>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-wa-green/10 flex items-center justify-center text-wa-green">
                <span className="material-symbols-outlined">chat</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1 text-label-sm">
                  <span className="font-bold text-slate-700">WhatsApp Business</span>
                  <span className="font-black text-wa-green">68%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-wa-green rounded-full" style={{ width: '68%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-600">
                <span className="material-symbols-outlined">language</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1 text-label-sm">
                  <span className="font-bold text-slate-700">Web Landing Pages</span>
                  <span className="font-black text-blue-600">22%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '22%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 opacity-50">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                <span className="material-symbols-outlined">mail</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1 text-label-sm">
                  <span className="font-bold text-slate-500">Email Marketing</span>
                  <span className="font-black text-slate-500">10%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-300 rounded-full" style={{ width: '10%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* High Performing Agents */}
        <div className="col-span-12 lg:col-span-7 glass-panel rounded-xl overflow-hidden flex flex-col">
          <div className="p-md border-b border-slate-100 bg-white/30 flex justify-between items-center">
            <h3 className="font-label-sm uppercase tracking-widest text-slate-400 font-bold">Top Closers</h3>
            <span className="text-label-xs text-wa-green font-bold">Live Stats</span>
          </div>
          <div className="flex-1">
            <table className="w-full text-left">
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-white transition-all cursor-pointer group">
                  <td className="py-4 px-md">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full border border-slate-200 bg-slate-200 flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-400 text-sm">person</span>
                      </div>
                      <div>
                        <p className="text-label-sm font-bold text-slate-900">Lisa Wong</p>
                        <p className="text-[11px] text-slate-500">92% conversion</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-md text-center">
                    <span className="px-2.5 py-1 rounded-full bg-wa-green/10 text-wa-green text-label-xs font-bold border border-wa-green/20">2.1m avg resp</span>
                  </td>
                  <td className="py-4 px-md text-right">
                    <span className="material-symbols-outlined text-wa-green">trending_up</span>
                  </td>
                </tr>
                <tr className="hover:bg-white transition-all cursor-pointer group">
                  <td className="py-4 px-md">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full border border-slate-200 bg-slate-200 flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-400 text-sm">person</span>
                      </div>
                      <div>
                        <p className="text-label-sm font-bold text-slate-900">Sarah Chen</p>
                        <p className="text-[11px] text-slate-500">88% conversion</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-md text-center">
                    <span className="px-2.5 py-1 rounded-full bg-wa-green/10 text-wa-green text-label-xs font-bold border border-wa-green/20">4.2m avg resp</span>
                  </td>
                  <td className="py-4 px-md text-right">
                    <span className="material-symbols-outlined text-wa-green">trending_up</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer Simple Stats */}
      <footer className="mt-8 px-lg py-md mb-8">
        <div className="glass-panel rounded-2xl p-6 flex flex-wrap gap-12 items-center justify-around border border-white/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-wa-green/10 flex items-center justify-center text-wa-green">
              <span className="material-symbols-outlined">bolt</span>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Automation Rate</p>
              <p className="text-body-md font-bold text-slate-900">{followupRate}% completion</p>
            </div>
          </div>
          
          <div className="w-px h-10 bg-slate-200/50 hidden md:block"></div>
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined">schedule</span>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Peak Engagement</p>
              <p className="text-body-md font-bold text-slate-900">11:00 AM - 2:00 PM</p>
            </div>
          </div>
          
          <div className="w-px h-10 bg-slate-200/50 hidden md:block"></div>
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">verified</span>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Data Accuracy</p>
              <p className="text-body-md font-bold text-slate-900">Verified Real-time</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
