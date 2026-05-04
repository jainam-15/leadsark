"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { isExpired, getDaysRemaining } from "@/lib/subscription-utils";

interface SubscriptionContextType {
  subscription: any;
  loading: boolean;
  isExpired: boolean;
  daysRemaining: number;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.businessId) {
      setLoading(false);
      return;
    }

    const fetchSub = async () => {
      const { data, error } = await supabase!
        .from('subscriptions')
        .select('*')
        .eq('business_id', user.businessId)
        .maybeSingle();

      if (!error && data) {
        setSubscription(data);
      }
      setLoading(false);
    };

    fetchSub();
  }, [user?.businessId]);

  const expired = isExpired(subscription?.end_date);
  const days = getDaysRemaining(subscription?.end_date);

  return (
    <SubscriptionContext.Provider value={{ 
      subscription, 
      loading, 
      isExpired: expired,
      daysRemaining: days
    }}>
      {children}
      {expired && !loading && (
        <div className="fixed bottom-0 left-64 right-0 bg-red-600 text-white p-3 z-[60] flex items-center justify-between px-8 animate-in slide-in-from-bottom duration-500">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined">warning</span>
            <span className="font-bold">Your subscription has expired. Some features are restricted.</span>
          </div>
          <button className="px-4 py-1.5 bg-white text-red-600 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">
            Renew Now
          </button>
        </div>
      )}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) throw new Error("useSubscription must be used within SubscriptionProvider");
  return context;
}
