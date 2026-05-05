"use client";

import { useState, useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";
import { useAutomation, Template, FlowStep } from "@/hooks/useAutomation";
import { WhatsAppSettings } from "@/components/WhatsAppSettings";

type Tab = "profile" | "whatsapp" | "automation" | "team" | "billing";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const { profile, settings, loading, updateProfile, updateSettings } = useSettings();
  const { templates, flows, saveTemplate, deleteTemplate, saveFlowStep, deleteFlowStep } = useAutomation();

  // Local state for forms
  const [localProfile, setLocalProfile] = useState(profile);
  const [localSettings, setLocalSettings] = useState(settings);
  const [editingTemplate, setEditingTemplate] = useState<Partial<Template> | null>(null);
  const [editingFlow, setEditingFlow] = useState<Partial<FlowStep> | null>(null);

  // Sync when loaded
  useEffect(() => {
    setLocalProfile(profile);
    setLocalSettings(settings);
  }, [profile, settings]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalProfile({ ...localProfile, [e.target.name]: e.target.value });
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateProfile(localProfile);
    if (res.success) alert("Profile saved successfully!");
    else alert("Error saving profile: " + res.error);
  };

  const toggleAutoReply = () => {
    const newVal = !localSettings.autoReply;
    const updated = { ...localSettings, autoReply: newVal };
    setLocalSettings(updated);
    updateSettings(updated);
  };

  const toggleAutoFollowUp = () => {
    const newVal = !localSettings.autoFollowUp;
    const updated = { ...localSettings, autoFollowUp: newVal };
    setLocalSettings(updated);
    updateSettings(updated);
  };

  const handleTimingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVal = e.target.value;
    const updated = { ...localSettings, followUpTiming: newVal };
    setLocalSettings(updated);
    updateSettings(updated);
  };

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVal = e.target.value;
    const updated = { ...localSettings, autoReplyMode: newVal };
    setLocalSettings(updated);
    updateSettings(updated);
  };

  const handleTemplateSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updated = { ...localSettings, [name]: value };
    setLocalSettings(updated);
    updateSettings(updated);
  };

  const handleWorkingHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updated = { ...localSettings, [name]: value };
    setLocalSettings(updated);
    updateSettings(updated);
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading settings...</div>;
  }

  return (
    <div className="p-lg max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-h2 text-h2 text-slate-900 tracking-tight">Settings</h1>
        <p className="text-body-md text-slate-500 mt-1">Manage your account and platform preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Navigation */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-1">
          <button 
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-label-sm ${activeTab === 'profile' ? 'bg-white shadow-sm text-wa-green font-bold border-l-4 border-wa-green' : 'text-slate-600 hover:bg-slate-100/50'}`}
          >
            <span className="material-symbols-outlined">person</span> Business Profile
          </button>
          <button 
            onClick={() => setActiveTab("whatsapp")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-label-sm ${activeTab === 'whatsapp' ? 'bg-white shadow-sm text-wa-green font-bold border-l-4 border-wa-green' : 'text-slate-600 hover:bg-slate-100/50'}`}
          >
            <span className="material-symbols-outlined">chat</span> WhatsApp Connection
          </button>
          <button 
            onClick={() => setActiveTab("automation")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-label-sm ${activeTab === 'automation' ? 'bg-white shadow-sm text-wa-green font-bold border-l-4 border-wa-green' : 'text-slate-600 hover:bg-slate-100/50'}`}
          >
            <span className="material-symbols-outlined">smart_toy</span> Automation
          </button>
          <button 
            onClick={() => setActiveTab("team")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-label-sm ${activeTab === 'team' ? 'bg-white shadow-sm text-wa-green font-bold border-l-4 border-wa-green' : 'text-slate-600 hover:bg-slate-100/50'}`}
          >
            <span className="material-symbols-outlined">group</span> Team Members
          </button>
          <button 
            onClick={() => setActiveTab("billing")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-label-sm ${activeTab === 'billing' ? 'bg-white shadow-sm text-wa-green font-bold border-l-4 border-wa-green' : 'text-slate-600 hover:bg-slate-100/50'}`}
          >
            <span className="material-symbols-outlined">credit_card</span> Billing
          </button>
        </div>

        {/* Settings Content */}
        <div className="flex-1 glass-panel rounded-2xl p-8 h-full overflow-y-auto custom-scrollbar">
          
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Business Profile</h2>
              <form onSubmit={saveProfile} className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Full Name</label>
                    <input type="text" name="name" value={localProfile.name} onChange={handleProfileChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-wa-green/20 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Email Address</label>
                    <input type="email" name="email" value={localProfile.email} onChange={handleProfileChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-wa-green/20 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Business Name</label>
                    <input type="text" name="businessName" value={localProfile.businessName} onChange={handleProfileChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-wa-green/20 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Phone Number</label>
                    <input type="text" name="phone" value={localProfile.phone} onChange={handleProfileChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-wa-green/20 outline-none text-sm" />
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <button type="submit" className="px-6 py-2.5 bg-slate-900 text-white rounded-xl shadow-md hover:shadow-lg transition-all font-bold text-sm">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* WhatsApp Tab */}
          {activeTab === "whatsapp" && (
            <WhatsAppSettings />
          )}

          {/* Automation Tab */}
          {activeTab === "automation" && (
            <div className="space-y-12">
              {/* 1. Global Settings */}
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Automation Rules</h2>
                <div className="space-y-6">
                  <div className="p-5 border border-slate-100 rounded-2xl bg-white/50">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-slate-900">Auto-Reply System</h3>
                        <p className="text-sm text-slate-500 mt-1">Configure how the system responds to incoming WhatsApp messages.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={localSettings.autoReply} onChange={toggleAutoReply} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-wa-green"></div>
                      </label>
                    </div>

                    {localSettings.autoReply && (
                      <div className="space-y-6 pt-4 border-t border-slate-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Greeting Template</label>
                            <select 
                              name="greetingTemplateId"
                              value={localSettings.greetingTemplateId} 
                              onChange={handleTemplateSelectChange}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium"
                            >
                              <option value="">Select a template...</option>
                              {templates.filter(t => t.type === 'greeting').map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Auto-Reply Mode</label>
                            <select 
                              value={localSettings.autoReplyMode} 
                              onChange={handleModeChange}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium"
                            >
                              <option value="new_leads_only">New Leads Only</option>
                              <option value="all_messages">All Messages</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Follow-up Mode</label>
                            <select 
                              name="followupMode"
                              value={localSettings.followupMode} 
                              onChange={handleTemplateSelectChange}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium"
                            >
                              <option value="manual">Manual (No suggestions)</option>
                              <option value="suggest_with_approval">Suggest with Approval (Recommended)</option>
                              <option value="automatic">Fully Automatic (AI triggers)</option>
                            </select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Start</label>
                              <input type="time" name="workingHoursStart" value={localSettings.workingHoursStart} onChange={handleWorkingHoursChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">End</label>
                              <input type="time" name="workingHoursEnd" value={localSettings.workingHoursEnd} onChange={handleWorkingHoursChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* 2. Template Manager */}
              <section>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-900">Message Templates</h2>
                  <button 
                    onClick={() => setEditingTemplate({ name: '', type: 'greeting', content: '' })}
                    className="px-4 py-2 bg-wa-green text-white rounded-lg text-xs font-bold shadow-md flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span> New Template
                  </button>
                </div>

                {editingTemplate && (
                  <div className="mb-8 p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        placeholder="Template Name (e.g. Default Greeting)"
                        value={editingTemplate.name}
                        onChange={e => setEditingTemplate({...editingTemplate, name: e.target.value})}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none text-sm"
                      />
                      <select 
                        value={editingTemplate.type}
                        onChange={e => setEditingTemplate({...editingTemplate, type: e.target.value as any})}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none text-sm"
                      >
                        <option value="greeting">Greeting</option>
                        <option value="reply">Auto Reply</option>
                        <option value="followup">Followup</option>
                        <option value="closing">Closing</option>
                      </select>
                    </div>
                    <textarea 
                      placeholder="Message content... Use {{name}} and {{business_name}} as variables."
                      value={editingTemplate.content}
                      onChange={e => setEditingTemplate({...editingTemplate, content: e.target.value})}
                      className="w-full h-32 px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none text-sm resize-none"
                    />
                    <div className="flex justify-end gap-3">
                      <button onClick={() => setEditingTemplate(null)} className="px-4 py-2 text-slate-500 font-bold text-sm">Cancel</button>
                      <button 
                        onClick={async () => {
                          const res = await saveTemplate(editingTemplate);
                          if (res.success) setEditingTemplate(null);
                        }}
                        className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm"
                      >
                        Save Template
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map(t => (
                    <div key={t.id} className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-black uppercase rounded tracking-widest">{t.type}</span>
                          <h4 className="font-bold text-slate-900 mt-1">{t.name}</h4>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditingTemplate(t)} className="p-1 text-slate-400 hover:text-wa-green"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                          <button onClick={() => deleteTemplate(t.id)} className="p-1 text-slate-400 hover:text-red-500"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-3 italic">"{t.content}"</p>
                    </div>
                  ))}
                  {templates.length === 0 && !editingTemplate && (
                    <div className="col-span-2 p-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 text-slate-400">
                      No templates created yet. Create one to start automating!
                    </div>
                  )}
                </div>
              </section>

              {/* 3. Flow Builder (Simplified) */}
              <section>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Automation Flows</h2>
                    <p className="text-sm text-slate-500">Define the steps and conditions for your bot.</p>
                  </div>
                  <button 
                    onClick={() => setEditingFlow({ step_name: '', trigger_condition: '', reply_template_id: '', next_step: '' })}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold shadow-md flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span> Add Step
                  </button>
                </div>

                {editingFlow && (
                  <div className="mb-8 p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Step Name</label>
                        <input type="text" placeholder="e.g. ask_budget" value={editingFlow.step_name} onChange={e => setEditingFlow({...editingFlow, step_name: e.target.value})} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none text-sm" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Trigger (Keyword or State)</label>
                        <input type="text" placeholder="e.g. price" value={editingFlow.trigger_condition} onChange={e => setEditingFlow({...editingFlow, trigger_condition: e.target.value})} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none text-sm" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Reply Template</label>
                        <select value={editingFlow.reply_template_id} onChange={e => setEditingFlow({...editingFlow, reply_template_id: e.target.value})} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none text-sm">
                          <option value="">Select Template...</option>
                          {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Next Step</label>
                        <input type="text" placeholder="e.g. closing" value={editingFlow.next_step} onChange={e => setEditingFlow({...editingFlow, next_step: e.target.value})} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none text-sm" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <button onClick={() => setEditingFlow(null)} className="px-4 py-2 text-slate-500 font-bold text-sm">Cancel</button>
                      <button 
                        onClick={async () => {
                          const res = await saveFlowStep(editingFlow);
                          if (res.success) setEditingFlow(null);
                        }}
                        className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm"
                      >
                        Save Step
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {flows.map((f, idx) => (
                    <div key={f.id} className="flex items-center gap-4">
                      <div className="flex-1 p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between group shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">{idx + 1}</div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{f.step_name}</h4>
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Trigger: {f.trigger_condition || 'Auto'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Reply With</p>
                            <p className="text-xs font-bold text-wa-green">{templates.find(t => t.id === f.reply_template_id)?.name || 'None'}</p>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity border-l pl-4">
                            <button onClick={() => setEditingFlow(f)} className="p-1 text-slate-400 hover:text-wa-green"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                            <button onClick={() => deleteFlowStep(f.id)} className="p-1 text-slate-400 hover:text-red-500"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                          </div>
                        </div>
                      </div>
                      {f.next_step && <span className="material-symbols-outlined text-slate-300">arrow_downward</span>}
                    </div>
                  ))}
                  {flows.length === 0 && !editingFlow && (
                    <div className="p-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 text-slate-400">
                      No flow steps defined. Add steps to create a conversation funnel.
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {/* Team Members Tab */}
          {activeTab === "team" && (
            <div>
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-900">Team Members</h2>
                <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">add</span> Invite User
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-white/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                      <span className="material-symbols-outlined text-slate-400">person</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Alex Rivera <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded ml-2">You</span></h3>
                      <p className="text-xs text-slate-500">alex@cloudscale.com</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Admin</span>
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-white/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-bold text-sm">
                      LW
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Lisa Wong</h3>
                      <p className="text-xs text-slate-500">lisa@cloudscale.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-400 uppercase">Agent</span>
                    <button className="text-slate-400 hover:text-error transition-colors"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === "billing" && (
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Billing & Plan</h2>
              
              <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-white relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-10">
                  <span className="material-symbols-outlined text-[150px]">workspace_premium</span>
                </div>
                <div className="relative z-10">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold tracking-widest uppercase mb-4 inline-block border border-white/10">Current Plan</span>
                  <h3 className="text-3xl font-black mb-2">Professional</h3>
                  <p className="text-slate-300 text-sm max-w-[448px] mb-8">Unlimited leads, 5 team members, and full API access for WhatsApp automation.</p>
                  
                  <div className="flex items-center gap-4">
                    <button className="px-6 py-2.5 bg-wa-green text-white rounded-xl font-bold text-sm shadow-lg hover:bg-[#1ebe57] transition-all">
                      Upgrade to Enterprise
                    </button>
                    <button className="px-6 py-2.5 bg-white/10 border border-white/20 text-white rounded-xl font-bold text-sm hover:bg-white/20 transition-all">
                      Manage Subscription
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4">Payment Methods</h3>
                <div className="flex justify-between items-center p-4 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-400">credit_card</span>
                    <span className="text-sm font-semibold text-slate-700">Visa ending in 4242</span>
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Default</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
