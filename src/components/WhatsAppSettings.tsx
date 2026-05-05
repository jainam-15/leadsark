"use client";

import { useState, useEffect } from "react";
import { useWhatsApp } from "@/hooks/useWhatsApp";

export function WhatsAppSettings() {
  const { status, loading, error, connect, testConnection } = useWhatsApp();
  const [formData, setFormData] = useState({
    phone_number_id: "",
    whatsapp_business_account_id: "",
    connected_phone: "",
    access_token: "",
    verify_token: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const webhookUrl = "https://leadsark.vercel.app/api/whatsapp/webhook";

  useEffect(() => {
    if (status?.connection) {
      setFormData({
        phone_number_id: status.connection.phone_number_id || "",
        whatsapp_business_account_id: status.connection.whatsapp_business_account_id || "",
        connected_phone: status.connection.connected_phone || "",
        access_token: status.hasSecrets ? "••••••••••••••••" : "",
        verify_token: status.verifyToken || "",
      });
    }
  }, [status]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    // Don't send masked token
    const payload = { ...formData };
    if (payload.access_token === "••••••••••••••••") {
      delete (payload as any).access_token;
    }

    const res = await connect(payload);
    if (res.success) {
      setMessage({ type: 'success', text: "WhatsApp connection saved successfully!" });
    } else {
      setMessage({ type: 'error', text: res.error || "Failed to save connection" });
    }
    setIsSaving(false);
  };

  const handleTest = async () => {
    const res = await testConnection();
    if (res.success) {
      alert("✅ " + res.message);
    } else {
      alert("❌ " + res.error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  if (loading && !status) return <div className="p-8 text-center text-slate-500 font-bold">Loading WhatsApp Settings...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900">WhatsApp Integration</h2>
          <p className="text-sm text-slate-500">Connect your Meta Cloud API account</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${status?.connection?.status === 'connected' ? 'bg-wa-green animate-pulse' : 'bg-slate-300'}`}></div>
          <span className="text-xs font-black uppercase tracking-wider text-slate-500">
            {status?.connection?.status || 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Webhook Info */}
      <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined">webhook</span>
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Webhook Configuration</h3>
            <p className="text-xs text-slate-500">Configure this URL in your Meta Developer Portal</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <code className="flex-1 p-3 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-600 overflow-x-auto">
            {webhookUrl}
          </code>
          <button 
            onClick={() => copyToClipboard(webhookUrl)}
            className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-slate-900 rounded-xl transition-all"
            title="Copy URL"
          >
            <span className="material-symbols-outlined text-[20px]">content_copy</span>
          </button>
        </div>

        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-700">
          <span className="material-symbols-outlined text-[18px]">info</span>
          <p className="text-[10px] font-bold uppercase tracking-tight">Your Verify Token: <span className="text-slate-900 ml-1">{formData.verify_token || "Not set"}</span></p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {message && (
          <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-3 ${message.type === 'success' ? 'bg-wa-green/10 text-wa-green' : 'bg-red-50 text-red-600'}`}>
            <span className="material-symbols-outlined">{message.type === 'success' ? 'check_circle' : 'error'}</span>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Phone Number ID</label>
            <input 
              type="text" 
              name="phone_number_id"
              value={formData.phone_number_id}
              onChange={handleChange}
              placeholder="e.g. 1065874251..."
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-wa-green/10 focus:border-wa-green outline-none transition-all text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Business Account ID</label>
            <input 
              type="text" 
              name="whatsapp_business_account_id"
              value={formData.whatsapp_business_account_id}
              onChange={handleChange}
              placeholder="e.g. 254874..."
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-wa-green/10 focus:border-wa-green outline-none transition-all text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Connected Phone Number</label>
            <input 
              type="text" 
              name="connected_phone"
              value={formData.connected_phone}
              onChange={handleChange}
              placeholder="e.g. +919876543210"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-wa-green/10 focus:border-wa-green outline-none transition-all text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Verify Token</label>
            <input 
              type="text" 
              name="verify_token"
              value={formData.verify_token}
              onChange={handleChange}
              placeholder="Choose a unique string..."
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-wa-green/10 focus:border-wa-green outline-none transition-all text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Access Token</label>
          <div className="relative">
            <input 
              type={formData.access_token === "••••••••••••••••" ? "password" : "text"}
              name="access_token"
              value={formData.access_token}
              onChange={handleChange}
              placeholder="Meta System User Access Token"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-wa-green/10 focus:border-wa-green outline-none transition-all text-sm"
            />
            {formData.access_token === "••••••••••••••••" && (
              <button 
                type="button"
                onClick={() => setFormData({...formData, access_token: ""})}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-wa-green hover:underline"
              >
                Change Token
              </button>
            )}
          </div>
        </div>

        <div className="pt-4 flex flex-col md:flex-row gap-4">
          <button 
            type="submit" 
            disabled={isSaving}
            className="flex-1 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-slate-900/10 hover:shadow-2xl hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="material-symbols-outlined">save</span>
                Save Connection
              </>
            )}
          </button>
          
          {status?.connection?.status === 'connected' && (
            <button 
              type="button"
              onClick={handleTest}
              className="px-8 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">test_automation</span>
              Test Connection
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
