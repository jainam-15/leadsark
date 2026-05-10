"use client";

import React, { useState } from 'react';
import { useTemplates, MessageTemplate } from '@/hooks/useTemplates';

interface TemplatePickerProps {
  onSelect: (content: string) => void;
  lead: any;
}

export default function TemplatePicker({ onSelect, lead }: TemplatePickerProps) {
  const { templates, loading, resolveTemplate } = useTemplates();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = templates.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-500 hover:text-teal-600 transition-colors flex items-center gap-1"
        title="Use Template"
      >
        <span className="material-symbols-outlined">description</span>
        <span className="text-[10px] font-black uppercase">Templates</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
          <div className="p-3 border-b border-slate-50 bg-slate-50/50 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-slate-400">search</span>
            <input 
              type="text" 
              placeholder="Search templates..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none text-xs w-full focus:ring-0 p-0"
              autoFocus
            />
          </div>
          <div className="max-h-64 overflow-y-auto custom-scrollbar p-2">
            {loading ? (
              <div className="p-4 text-center text-[10px] text-slate-400 font-bold uppercase">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="p-4 text-center text-[10px] text-slate-400 font-bold uppercase">No templates found</div>
            ) : (
              <div className="grid grid-cols-1 gap-1">
                {filtered.map(tpl => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => {
                      const resolved = resolveTemplate(tpl.content, lead);
                      onSelect(resolved);
                      setIsOpen(false);
                    }}
                    className="text-left p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-slate-900">{tpl.name}</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase">{tpl.category}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-2 italic">"{tpl.content}"</p>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="p-2 bg-slate-50 border-t border-slate-100 flex justify-center">
             <button 
               type="button"
               onClick={() => window.open('/templates', '_blank')}
               className="text-[9px] font-black text-teal-600 uppercase hover:underline"
             >
               Manage Templates
             </button>
          </div>
        </div>
      )}

      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>}
    </div>
  );
}
