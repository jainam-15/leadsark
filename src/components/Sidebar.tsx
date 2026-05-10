"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/leads", label: "Leads", icon: "person_search" },
  { href: "/conversations", label: "Conversations", icon: "chat_bubble" },
  { href: "/follow-ups", label: "Follow-ups", icon: "event_repeat" },
  { href: "/templates", label: "Templates", icon: "description" },
  { href: "/analytics", label: "Analytics", icon: "analytics" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setShowLogoutConfirm(false);
    } catch (error) {
      console.error("Sidebar logout error:", error);
      alert("Failed to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <aside className="h-screen w-64 fixed left-0 top-0 border-r border-slate-200/30 bg-white flex flex-col py-6 px-4 gap-2 z-50 shadow-xl">
        <div className="mb-8 px-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white shadow-lg overflow-hidden">
            <span className="material-symbols-outlined text-white">rocket_launch</span>
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 leading-none">LeadsArk</h2>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">Enterprise CRM</p>
          </div>
        </div>
        
        <nav className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`) || (item.href === "/dashboard" && pathname === "/");
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-white/50 text-wa-green border-l-4 border-wa-green shadow-sm font-semibold"
                    : "text-slate-600 hover:bg-slate-100/50 hover:text-primary"
                }`}
              >
                <span 
                  className="material-symbols-outlined text-xl" 
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                <span className="font-label-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="mt-auto pt-6 border-t border-slate-100">
          <button className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-wa-green to-teal-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-label-sm mb-4">
            <span className="material-symbols-outlined">add_circle</span>
            Add New Lead
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100/50 transition-all cursor-pointer text-left"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-[360px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] animate-in zoom-in-95 fade-in duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <span className="material-symbols-outlined text-3xl">logout</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3 text-center">Are you sure?</h3>
            <p className="text-slate-500 mb-8 text-sm text-center leading-relaxed">
              You will be logged out of your session and need to sign in again to access your dashboard.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={confirmLogout}
                disabled={isLoggingOut}
                className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-700 hover:shadow-lg hover:shadow-red-200 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Logging out...
                  </div>
                ) : "Yes, Logout"}
              </button>
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                disabled={isLoggingOut}
                className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
