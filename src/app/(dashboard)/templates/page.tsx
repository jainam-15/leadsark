"use client";

import React, { useState } from "react";
import { useTemplates, MessageTemplate } from "@/hooks/useTemplates";

export default function TemplatesPage() {
  const { templates, loading, createTemplate, updateTemplate, deleteTemplate } = useTemplates();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Partial<MessageTemplate> | null>(null);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      category: formData.get("category") as string,
      content: formData.get("content") as string,
      is_default: formData.get("is_default") === "on",
    };

    if (editingTemplate?.id) {
      await updateTemplate(editingTemplate.id, data);
    } else {
      await createTemplate(data);
    }
    setIsModalOpen(false);
    setEditingTemplate(null);
  };

  const openEdit = (tpl: MessageTemplate) => {
    setEditingTemplate(tpl);
    setIsModalOpen(true);
  };

  const openNew = () => {
    setEditingTemplate(null);
    setIsModalOpen(true);
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading templates...</div>;
  }

  return (
    <div className="p-lg max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-slate-100 pb-4">
        <div>
          <h1 className="font-h2 text-h2 text-slate-900 tracking-tight">Message Templates</h1>
          <p className="text-body-md text-slate-500 mt-1">Manage reusable messages for quick replies.</p>
        </div>
        <button 
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          New Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(tpl => (
          <div key={tpl.id} className="glass-panel p-6 rounded-2xl flex flex-col group hover:-translate-y-1 transition-all relative">
            {tpl.is_default && (
              <span className="absolute top-4 right-14 bg-teal-100 text-teal-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Default</span>
            )}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-slate-900">{tpl.name}</h3>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{tpl.category}</span>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(tpl)} className="p-1 text-slate-400 hover:text-teal-600"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                <button onClick={() => deleteTemplate(tpl.id)} className="p-1 text-slate-400 hover:text-red-600"><span className="material-symbols-outlined text-[18px]">delete</span></button>
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl mb-4 border border-slate-100 text-sm text-slate-700 flex-1 whitespace-pre-wrap">
              {tpl.content}
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500">
               <div className="flex gap-2">
                 <span className="bg-slate-100 px-2 py-1 rounded text-[10px] font-bold">{"{{lead_name}}"}</span>
                 <span className="bg-slate-100 px-2 py-1 rounded text-[10px] font-bold">{"{{phone}}"}</span>
               </div>
            </div>
          </div>
        ))}
        {templates.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-400">
            No templates created yet. Click "New Template" to start.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="font-bold text-slate-900">{editingTemplate ? 'Edit Template' : 'New Template'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Template Name</label>
                <input 
                  name="name"
                  defaultValue={editingTemplate?.name}
                  placeholder="e.g. Welcome Message"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Category</label>
                <select 
                  name="category"
                  defaultValue={editingTemplate?.category || "reply"}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="greeting">Greeting</option>
                  <option value="reply">Reply</option>
                  <option value="followup">Follow-up</option>
                  <option value="closing">Closing</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Message Content</label>
                <textarea 
                  name="content"
                  defaultValue={editingTemplate?.content}
                  rows={4}
                  placeholder="Hello {{lead_name}}..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 resize-none"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">Available variables: {"{{lead_name}}"}, {"{{business_name}}"}, {"{{phone}}"}</p>
              </div>
              <div className="flex items-center gap-2 px-1">
                <input 
                  type="checkbox" 
                  id="is_default" 
                  name="is_default" 
                  defaultChecked={editingTemplate?.is_default}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="is_default" className="text-xs font-bold text-slate-600 cursor-pointer">Set as default for this category</label>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
