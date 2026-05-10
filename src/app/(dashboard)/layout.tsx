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
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
        <p className="font-bold text-slate-400 animate-pulse">Loading Workspace...</p>
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
