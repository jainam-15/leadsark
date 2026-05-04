import React from "react";

export default function NotificationsPage() {
  const notifications = [
    { id: 1, title: "New Lead Assigned", message: "Sarah Jenkins from CloudScale Systems was assigned to you.", time: "10 mins ago", read: false, icon: "person_add", color: "text-teal-600 bg-teal-50" },
    { id: 2, title: "WhatsApp Sync Completed", message: "Successfully synced 42 new messages.", time: "1 hour ago", read: false, icon: "sync", color: "text-blue-600 bg-blue-50" },
    { id: 3, title: "Overdue Follow-up", message: "Marcus Thorne is overdue for a follow-up.", time: "2 hours ago", read: true, icon: "alarm", color: "text-red-600 bg-red-50" },
    { id: 4, title: "Payment Received", message: "Subscription renewed successfully.", time: "Yesterday", read: true, icon: "payments", color: "text-emerald-600 bg-emerald-50" },
  ];

  return (
    <div className="p-lg max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-slate-100 pb-4">
        <div>
          <h1 className="font-h2 text-h2 text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-body-md text-slate-500 mt-1">Stay updated on your CRM activity.</p>
        </div>
        <button className="text-sm font-bold text-teal-600 hover:text-teal-700">Mark all as read</button>
      </div>

      <div className="space-y-4">
        {notifications.map(n => (
          <div key={n.id} className={`p-4 rounded-xl flex gap-4 ${n.read ? 'bg-white border border-slate-100 opacity-75' : 'bg-white shadow-sm border border-teal-100'}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${n.color}`}>
              <span className="material-symbols-outlined">{n.icon}</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className={`font-bold ${n.read ? 'text-slate-700' : 'text-slate-900'}`}>{n.title}</h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{n.time}</span>
              </div>
              <p className="text-sm text-slate-600 mt-1">{n.message}</p>
            </div>
            {!n.read && (
              <div className="flex items-center">
                <span className="w-2.5 h-2.5 bg-teal-500 rounded-full"></span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
