import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { SubscriptionProvider } from "@/hooks/useSubscription";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
