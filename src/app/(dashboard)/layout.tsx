"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { SubscriptionProvider } from "@/hooks/useSubscription";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log("[DashboardLayout] No user, redirecting to login");
        router.replace('/login');
      } else if (role === 'admin') {
        console.log("[DashboardLayout] Admin user in dashboard, redirecting to admin panel");
        router.replace('/admin');
      }
    }
  }, [user, role, loading, router]);

  if (loading || !user || role === 'admin') {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[9999] gap-4">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold text-slate-900 text-sm tracking-tight">Loading Workspace...</p>
      </div>
    );
  }

  return (
    <SubscriptionProvider>
      <Sidebar />
      <Topbar />
      <main className="ml-64 pt-16 min-h-screen relative">
        {children}
      </main>
    </SubscriptionProvider>
  );
}
