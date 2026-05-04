"use client";

import { useState } from "react";
import ChatUI from "@/components/ChatUI";
import { useLeads } from "@/hooks/useLeads";

export default function ConversationsPage() {
  const { leads, loading } = useLeads();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const filteredConversations = leads.filter(
    chat => chat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (chat.snippet || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedChat = leads.find(c => c.id === selectedChatId) || leads[0];

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading conversations...</div>;
  }

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden">
      {/* Column 1: Chat List */}
      <section className="w-[35%] border-r border-slate-200/30 flex flex-col h-full bg-white">
        <div className="p-4 border-b border-slate-100 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h2 className="font-h3 text-lg font-bold text-slate-800">Messages</h2>
            <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
              <span className="material-symbols-outlined">edit_square</span>
            </button>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
            <input 
              type="text" 
              placeholder="Search conversations..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border-none rounded-xl pl-10 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-wa-green/20 outline-none"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredConversations.map((chat) => (
            <div 
              key={chat.id} 
              onClick={() => setSelectedChatId(chat.id)}
              className={`p-4 border-b border-slate-50 flex gap-3 cursor-pointer transition-all ${
                selectedChatId === chat.id ? 'bg-slate-50' : 'hover:bg-slate-50'
              }`}
            >
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center">
                   <span className="material-symbols-outlined text-slate-400">person</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-slate-900 truncate">{chat.name}</h3>
                  <span className={`text-[10px] flex-shrink-0 ${chat.unreadCount && chat.unreadCount > 0 ? 'text-wa-green font-bold' : 'text-slate-400'}`}>
                    {chat.time}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <p className={`text-sm truncate ${chat.unreadCount && chat.unreadCount > 0 ? 'text-slate-800 font-semibold' : 'text-slate-500'}`}>
                    {chat.snippet}
                  </p>
                  {chat.unreadCount && chat.unreadCount > 0 && (
                    <span className="bg-wa-green text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold flex-shrink-0">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filteredConversations.length === 0 && (
            <div className="p-8 text-center text-slate-500">No conversations found.</div>
          )}
        </div>
      </section>

      {/* Column 2: Chat UI */}
      <div className="flex-1">
        {selectedChat ? (
          <ChatUI leadName={selectedChat.name} leadId={selectedChat.id} />
        ) : (
          <div className="h-full flex items-center justify-center bg-[#E5DDD5] text-slate-500">Select a conversation</div>
        )}
      </div>
    </div>
  );
}
