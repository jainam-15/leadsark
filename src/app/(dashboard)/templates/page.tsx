"use client";

import React, { useState } from "react";

export default function TemplatesPage() {
  const [templates] = useState([
    { id: 1, name: "Initial Outreach", text: "Hi {{name}}, I noticed your interest in our services. Are you available for a quick chat?", uses: 124 },
    { id: 2, name: "Pricing Follow-up", text: "Hello {{name}}, following up on the pricing proposal sent on {{date}}. Let me know if you have questions.", uses: 89 },
    { id: 3, name: "Meeting Reminder", text: "Hi {{name}}, just a quick reminder for our meeting in 15 minutes.", uses: 312 },
  ]);

  return (
    <div className="p-lg max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-slate-100 pb-4">
        <div>
          <h1 className="font-h2 text-h2 text-slate-900 tracking-tight">Message Templates</h1>
          <p className="text-body-md text-slate-500 mt-1">Manage reusable messages for quick replies.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all">
          <span className="material-symbols-outlined text-sm">add</span>
          New Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(tpl => (
          <div key={tpl.id} className="glass-panel p-6 rounded-2xl flex flex-col group hover:-translate-y-1 transition-all">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-slate-900">{tpl.name}</h3>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1 text-slate-400 hover:text-teal-600"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                <button className="p-1 text-slate-400 hover:text-red-600"><span className="material-symbols-outlined text-[18px]">delete</span></button>
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl mb-4 border border-slate-100 text-sm text-slate-700 italic flex-1">
              "{tpl.text}"
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span className="font-bold flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">send</span> {tpl.uses} sent</span>
              <button className="font-bold text-teal-600 hover:text-teal-700">Use Template</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
