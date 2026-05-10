"use client";

import { useAuth } from "@/hooks/useAuth";

export default function Topbar() {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-white border-b border-slate-200/20 z-40 flex justify-between items-center px-6 shadow-[0_10px_30px_-5px_rgba(55,48,163,0.08)]">
      <div className="flex items-center gap-4 bg-surface-container-low px-4 py-2 rounded-full w-96 border border-slate-200/50">
        <span className="material-symbols-outlined text-slate-400">search</span>
        <input 
          className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-400 outline-none" 
          placeholder="Search leads, chats, or tasks..." 
          type="text" 
        />
      </div>
      
      <div className="flex items-center gap-6">
        <button className="relative text-slate-500 hover:text-wa-green transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-error rounded-full"></span>
        </button>
        <button className="text-slate-500 hover:text-wa-green transition-colors">
          <span className="material-symbols-outlined">mail</span>
        </button>
        
        <div className="h-8 w-[1px] bg-slate-200"></div>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900 leading-tight">
              {user?.email?.split('@')[0] || "User"}
            </p>
            <p className="text-[10px] text-slate-500 font-label-xs uppercase tracking-wider">
              {user?.role || "Account Manager"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-slate-200 flex items-center justify-center">
             <span className="material-symbols-outlined text-slate-400">person</span>
          </div>
        </div>
      </div>
    </header>
  );
}
