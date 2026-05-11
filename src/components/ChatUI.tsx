"use client";

import React, { useState } from 'react';
import { useMessages } from '@/hooks/useMessages';
import TemplatePicker from './TemplatePicker';
import { canSendFreeformMessage } from '@/lib/whatsapp';
import { useLeads } from '@/hooks/useLeads';
import { formatTime12Hour } from '@/lib/date-utils';

export default function ChatUI({ leadName = "Sarah Jenkins", leadId }: { leadName?: string; leadId?: string }) {
  const { messages, loading, sending, sendMessage } = useMessages(leadId);
  const [inputText, setInputText] = useState("");
  const [showWindowError, setShowWindowError] = useState(false);
  const { leads } = useLeads();
  const currentLead = leads.find(l => l.id === leadId);
  const isOutsideWindow = currentLead && !canSendFreeformMessage(currentLead.last_incoming_at);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;
    const textToSend = inputText.trim();
    
    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId, message: textToSend })
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.code === 131047) {
          setShowWindowError(true);
          // Trigger TemplatePicker if needed - normally it's already there
        }
        throw new Error(result.error || "Failed to send message");
      }
      
      setInputText("");
      setShowWindowError(false);
    } catch (err: any) {
      console.error("[ChatUI] Send failed:", err);
      // alert(err.message); // Already handled in useMessages if we use it, 
      // but here we are doing manual fetch for better error control
    }
  };

  return (
    <section className="flex-1 flex flex-col h-full bg-[#E5DDD5] relative overflow-hidden">
      <div className="wa-bg"></div>
      
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-slate-200/50 flex items-center justify-between bg-white/95 backdrop-blur-sm z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-full border-2 border-wa-green/20 bg-slate-200 flex items-center justify-center">
               <span className="material-symbols-outlined text-slate-400">person</span>
            </div>
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-wa-green border-2 border-white rounded-full"></span>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 leading-none">{leadName}</h3>
            <p className="text-xs text-wa-green font-bold mt-1">online</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
            <span className="material-symbols-outlined">videocam</span>
          </button>
          <button className="p-2.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
            <span className="material-symbols-outlined">call</span>
          </button>
          <button className="p-2.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>
      </div>
      
      {/* Window Warning */}
      {isOutsideWindow && (
        <div className="bg-amber-50 border-b border-amber-100 px-6 py-3 flex items-center justify-between z-10 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3 text-amber-800">
            <span className="material-symbols-outlined text-amber-500">history</span>
            <div className="text-xs font-medium">
              24h Window Expired. You must use a <span className="font-bold">Template Message</span> to re-engage.
            </div>
          </div>
          <button 
            type="button"
            onClick={() => {
              // The TemplatePicker is already visible below, but we could highlight it
              const picker = document.querySelector('[title="Use Template"]');
              if (picker instanceof HTMLElement) picker.click();
            }}
            className="px-3 py-1.5 bg-amber-200/50 hover:bg-amber-200 text-amber-900 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
          >
            Select Template
          </button>
        </div>
      )}

      {showWindowError && !isOutsideWindow && (
        <div className="bg-red-50 border-b border-red-100 px-6 py-3 flex items-center gap-3 text-red-800 z-10">
          <span className="material-symbols-outlined text-red-500 text-sm">error</span>
          <div className="text-xs font-medium">
            Meta Error: Outside 24h window. Use a template message.
          </div>
        </div>
      )}
      
      {/* Chat Messages */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-4 z-10">
        {messages.length === 0 && !loading && (
          <div className="flex justify-center items-center h-full text-slate-500 font-medium bg-white/30 backdrop-blur-sm rounded-2xl mx-4">
            No messages yet. Start the conversation!
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <React.Fragment key={msg.id}>
            {msg.dateStr && (idx === 0 || messages[idx-1].dateStr !== msg.dateStr) && (
              <div className="flex justify-center my-4">
                <span className="bg-[#D1E4EF]/80 px-4 py-1 rounded-lg text-[11px] font-bold text-slate-600 uppercase tracking-widest shadow-sm">
                  {msg.dateStr}
                </span>
              </div>
            )}
            
            <div className={`flex items-end gap-2 max-w-[85%] ${msg.isSent ? 'flex-row-reverse ml-auto' : ''}`}>
              <div className={`p-3 rounded-2xl shadow-sm relative ${msg.isSent ? 'bg-wa-light rounded-br-none' : 'bg-white rounded-bl-none'}`}>
                <p className={`text-sm text-slate-800 leading-relaxed ${msg.isSent ? 'pr-12' : 'pr-8'}`}>
                  {msg.text}
                </p>
                <div className="absolute bottom-1 right-2 flex items-center gap-0.5">
                  <span className={`text-[10px] ${msg.isSent ? 'text-slate-500' : 'text-slate-400'}`}>{msg.time}</span>
                  {msg.isSent && (
                    <span className="material-symbols-outlined text-[16px] text-blue-500" style={{ fontVariationSettings: "'FILL' 1" }}>done_all</span>
                  )}
                </div>
              </div>
            </div>
          </React.Fragment>
        ))}

        {loading && (
          <div className="flex justify-center">
            <div className="animate-pulse text-slate-500 text-xs">Loading messages...</div>
          </div>
        )}
      </div>
      
      {/* Chat Input */}
      <form onSubmit={handleSend} className="p-4 bg-[#F0F2F5] z-10 flex items-center gap-2">
        <button type="button" className="p-2 text-slate-500 hover:text-wa-green transition-colors">
          <span className="material-symbols-outlined">mood</span>
        </button>
        <TemplatePicker 
          lead={{ id: leadId, name: leadName }} 
          onSelect={(content) => setInputText(content)} 
        />
        <div className="flex-1">
          <input 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full bg-white border-none rounded-xl focus:ring-0 text-sm px-4 py-3 text-slate-800 placeholder:text-slate-400 shadow-sm outline-none disabled:bg-slate-100 disabled:cursor-not-allowed" 
            placeholder={isOutsideWindow ? "Window expired. Use a template..." : "Type a message..."}
            type="text"
            disabled={sending || isOutsideWindow}
          />
        </div>
        <button 
          type="submit" 
          disabled={!inputText.trim() || sending || isOutsideWindow} 
          className="bg-wa-green text-white p-3.5 rounded-full shadow-lg hover:bg-[#1ebe57] disabled:opacity-50 transition-all flex items-center justify-center min-w-[50px]"
        >
          {sending ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
          )}
        </button>
      </form>
    </section>
  );
}
