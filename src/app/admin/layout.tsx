"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/dashboard');
    }
  }, [user, loading]);

  if (loading || !user || user.role !== 'admin') {
    return <div className="h-screen w-screen flex items-center justify-center bg-slate-50 font-bold text-slate-400">Verifying Admin Access...</div>;
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-8 border-b border-slate-800">
          <h1 className="text-xl font-black tracking-tighter">LeadsArk <span className="text-wa-green text-xs uppercase ml-1 bg-wa-green/10 px-1.5 py-0.5 rounded">Admin</span></h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-all font-bold text-sm">
            <span className="material-symbols-outlined">dashboard</span> Overview
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-all font-bold text-sm">
            <span className="material-symbols-outlined">group</span> Users
          </Link>
          <Link href="/admin/subscriptions" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-all font-bold text-sm">
            <span className="material-symbols-outlined">payments</span> Subscriptions
          </Link>
          <Link href="/admin/plans" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-all font-bold text-sm">
            <span className="material-symbols-outlined">layers</span> Plans
          </Link>
          <Link href="/admin/audit-logs" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-all font-bold text-sm">
            <span className="material-symbols-outlined">receipt_long</span> Audit Logs
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white transition-all font-bold text-sm">
            <span className="material-symbols-outlined">arrow_back</span> Back to App
          </Link>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all font-bold text-sm"
          >
            <span className="material-symbols-outlined">logout</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
