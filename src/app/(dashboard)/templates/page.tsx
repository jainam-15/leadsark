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

    let result;
    if (editingTemplate?.id) {
      result = await updateTemplate(editingTemplate.id, data);
    } else {
      result = await createTemplate(data);
    }

    if (result.success) {
      setIsModalOpen(false);
      setEditingTemplate(null);
    } else {
      alert("Error saving template: " + result.error);
    }
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
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
            onClick={() => setIsModalOpen(false)}
          ></div>
          
          <div 
            className="relative bg-white rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] w-full max-w-[500px] min-h-[400px] flex flex-col overflow-hidden"
            style={{ minWidth: '300px' }}
          >
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <h2 className="text-xl font-black text-slate-900">{editingTemplate ? 'Edit Template' : 'New Template'}</h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Template Name</label>
                <input 
                  name="name"
                  defaultValue={editingTemplate?.name}
                  placeholder="e.g. Welcome Message"
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Category</label>
                <select 
                  name="category"
                  defaultValue={editingTemplate?.category || "reply"}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium"
                >
                  <option value="greeting">Greeting</option>
                  <option value="reply">Reply</option>
                  <option value="followup">Follow-up</option>
                  <option value="closing">Closing</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Message Content</label>
                <textarea 
                  name="content"
                  defaultValue={editingTemplate?.content}
                  rows={5}
                  placeholder="Hello {{lead_name}}..."
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium resize-none"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-2 px-1 leading-relaxed">
                  Available variables: <code className="bg-slate-100 px-1 rounded">{"{{lead_name}}"}</code>, <code className="bg-slate-100 px-1 rounded">{"{{business_name}}"}</code>, <code className="bg-slate-100 px-1 rounded">{"{{phone}}"}</code>
                </p>
              </div>
              
              <div className="flex items-center gap-3 px-1 py-2">
                <div className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    id="is_default" 
                    name="is_default" 
                    defaultChecked={editingTemplate?.is_default}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-wa-green"></div>
                </div>
                <label htmlFor="is_default" className="text-xs font-bold text-slate-600 cursor-pointer">Set as default for this category</label>
              </div>
              
              <div className="pt-6 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95"
                >
                  {editingTemplate ? 'Update' : 'Create'} Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
