"use client";

import React, { useState } from 'react';
import { useMessages } from '@/hooks/useMessages';

export default function ChatUI({ leadName = "Sarah Jenkins", leadId }: { leadName?: string; leadId?: string }) {
  const { messages, loading, sendMessage } = useMessages(leadId || 'mock-1');
  const [inputText, setInputText] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText("");
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
      
      {/* Chat Messages */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-4 z-10">
        {messages.map((msg, idx) => (
          <React.Fragment key={msg.id}>
            {msg.dateStr && (
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

        {/* Typing Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1 p-2.5 bg-white rounded-2xl shadow-sm">
            <div className="w-1.5 h-1.5 bg-wa-green/60 rounded-full animate-bounce"></div>
            <div className="w-1.5 h-1.5 bg-wa-green/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1.5 h-1.5 bg-wa-green/60 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <span className="text-[11px] text-slate-500 font-bold italic">Sarah is typing...</span>
        </div>
      </div>
      
      {/* Chat Input */}
      <form onSubmit={handleSend} className="p-4 bg-[#F0F2F5] z-10 flex items-center gap-2">
        <button type="button" className="p-2 text-slate-500 hover:text-wa-green transition-colors">
          <span className="material-symbols-outlined">mood</span>
        </button>
        <button type="button" className="p-2 text-slate-500 hover:text-wa-green transition-colors">
          <span className="material-symbols-outlined">attach_file</span>
        </button>
        <div className="flex-1">
          <input 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full bg-white border-none rounded-xl focus:ring-0 text-sm px-4 py-3 text-slate-800 placeholder:text-slate-400 shadow-sm outline-none" 
            placeholder="Type a message..." 
            type="text"
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={!inputText.trim() || loading} className="bg-wa-green text-white p-3.5 rounded-full shadow-lg hover:bg-[#1ebe57] disabled:opacity-50 transition-all flex items-center justify-center">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
        </button>
      </form>
    </section>
  );
}
