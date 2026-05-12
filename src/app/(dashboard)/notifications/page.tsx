"use client";

import React from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { formatRelativeTime } from "@/lib/date-utils";

export default function NotificationsPage() {
  const { notifications, loading, markAsRead, markAllAsRead } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'lead_assigned': return { icon: 'person_add', color: 'text-teal-600 bg-teal-50' };
      case 'followup_due': return { icon: 'alarm', color: 'text-red-600 bg-red-50' };
      case 'new_message': return { icon: 'chat_bubble', color: 'text-blue-600 bg-blue-50' };
      default: return { icon: 'notifications', color: 'text-slate-600 bg-slate-50' };
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading notifications...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-slate-500 mt-1">Stay updated on your CRM activity.</p>
        </div>
        <button 
          onClick={markAllAsRead}
          className="text-sm font-bold text-primary hover:text-primary/80 transition-colors"
        >
          Mark all as read
        </button>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">notifications_off</span>
            <p className="text-slate-400 font-bold">No notifications yet</p>
          </div>
        ) : (
          notifications.map(n => {
            const { icon, color } = getIcon(n.type);
            return (
              <div 
                key={n.id} 
                onClick={() => !n.is_read && markAsRead(n.id)}
                className={`p-5 rounded-2xl flex gap-4 transition-all cursor-pointer ${
                  n.is_read 
                    ? 'bg-white border border-slate-100 opacity-80' 
                    : 'bg-white shadow-md border-l-4 border-l-primary border-slate-100 hover:shadow-lg'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
                  <span className="material-symbols-outlined">{icon}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`font-black ${n.is_read ? 'text-slate-700' : 'text-slate-900'}`}>{n.title}</h3>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatRelativeTime(n.created_at)}</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{n.message}</p>
                </div>
                {!n.is_read && (
                  <div className="flex items-center">
                    <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]"></span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
