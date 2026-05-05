import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface AdminStats {
  totalBusinesses: number;
  activeSubscriptions: number;
  activePaidUsers: number;
  trialUsers: number;
  expiredSubscriptions: number;
  expiringSoon: number;
  revenueEstimate: number;
}

export interface AdminBusiness {
  id: string;
  name: string;
  owner_id: string;
  owner_name?: string;
  owner_email?: string;
  status: string;
  created_at: string;
  subscription?: {
    id: string;
    plan: string;
    status: string;
    start_date: string;
    end_date: string;
    updated_at?: string;
  };
  whatsapp?: {
    status: string;
    connected_phone?: string;
  };
}

export function useAdmin() {
  const { role, loading: authLoading } = useAuth();
  const [businesses, setBusinesses] = useState<AdminBusiness[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    if (role !== 'admin') return;
    setLoading(true);

    try {
      // Fetch from internal API routes (Secure Service Role access)
      const [statsRes, bizRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/businesses')
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (bizRes.ok) setBusinesses(await bizRes.json());

    } catch (err) {
      console.error("[Admin] Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (role === 'admin') {
      fetchAdminData();
    } else {
      // If auth is done and not admin, stop loading immediately
      setLoading(false);
    }
  }, [role, authLoading]);

  const updateSubscription = async (businessId: string, planId: string, durationDays: number, status: string = 'active') => {
    try {
      const res = await fetch('/api/admin/subscriptions/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, planId, durationDays, status })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      await fetchAdminData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const setBusinessStatus = async (businessId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/businesses/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, status })
      });
      
      if (!res.ok) throw new Error("Status update failed");
      
      await fetchAdminData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return { 
    businesses, 
    stats, 
    loading, 
    updateSubscription, 
    setBusinessStatus, 
    fetchAdminData 
  };
}
