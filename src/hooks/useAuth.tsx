"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthProfile {
  id: string;
  email: string;
  emailConfirmed: boolean;
  businessId?: string;
  role?: string;
}

interface AuthContextType {
  user: AuthProfile | null;
  loading: boolean;
  isSupabaseConfigured: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (email: string, password: string, metadata: any) => Promise<any>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const updateCookie = (token: string) => {
    document.cookie = `sb-auth-token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  };

  const clearCookie = () => {
    document.cookie = 'sb-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  };

  const loadUserProfile = async (supabaseUser: any) => {
    if (!supabase) return null;
    
    try {
      // 1. Fetch CURRENT USER profile only (Safe/Non-recursive)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('business_id, role')
        .eq('id', supabaseUser.id)
        .maybeSingle();
      
      if (profileError) throw profileError;

      let data = profileData;

      // 2. Auto-provision if missing
      if (!data && supabaseUser.email_confirmed_at) {
        const { ensureUserBusinessSetupAction } = await import('@/app/actions/auth');
        const metadata = supabaseUser.user_metadata || {};
        const result = await ensureUserBusinessSetupAction(
          supabaseUser.id,
          supabaseUser.email!,
          metadata.business_name || `${metadata.full_name || 'My'}'s Business`,
          metadata.full_name
        );
        
        if (result.success) {
          const { data: refreshed } = await supabase
            .from('profiles')
            .select('business_id, role')
            .eq('id', supabaseUser.id)
            .single();
          data = refreshed;
        }
      }
      
      const profile = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        emailConfirmed: !!supabaseUser.email_confirmed_at,
        businessId: data?.business_id,
        role: data?.role || 'user'
      };
      
      setUser(profile);
      return profile;
    } catch (err) {
      console.error("[Auth] Profile load failed:", err);
      const basic = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        emailConfirmed: !!supabaseUser.email_confirmed_at
      };
      setUser(basic);
      return basic;
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      // Safety timeout to ensure loading always clears
      const timeout = setTimeout(() => setLoading(false), 10000);
      
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          if (sessionError.message.includes('Refresh Token Not Found') || sessionError.message.includes('invalid_refresh_token')) {
            console.warn("Auth: Session expired or invalid refresh token. Clearing session.");
            await supabase.auth.signOut();
            clearCookie();
            setUser(null);
          } else {
            throw sessionError;
          }
        }

        if (session) {
          updateCookie(session.access_token);
          await loadUserProfile(session.user);
        }
      } catch (error: any) {
        console.error("Auth init error:", error);
        if (error?.message?.includes('Refresh Token Not Found')) {
          clearCookie();
          setUser(null);
        }
      } finally {
        clearTimeout(timeout);
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (session) {
          updateCookie(session.access_token);
          await loadUserProfile(session.user);
        } else {
          clearCookie();
          setUser(null);
          if (event === 'SIGNED_OUT') router.replace('/login');
        }
      } catch (err: any) {
        console.error("Auth state change error:", err);
        if (err?.message?.includes('Refresh Token Not Found')) {
          clearCookie();
          setUser(null);
          router.replace('/login');
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    if (!supabase) return { error: 'Supabase not configured' };
    const res = await supabase.auth.signInWithPassword({ email, password });
    if (res.data.session) {
      updateCookie(res.data.session.access_token);
      const profile = await loadUserProfile(res.data.user);
      return { ...res, profile };
    }
    return res;
  };

  const register = async (email: string, password: string, metadata: any) => {
    if (!supabase) return { error: 'Supabase not configured' };
    const res = await supabase.auth.signUp({ 
      email, password,
      options: {
        data: { full_name: metadata.name, business_name: metadata.business_name },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (res.data.session) {
      updateCookie(res.data.session.access_token);
      const profile = await loadUserProfile(res.data.user);
      return { ...res, profile };
    }
    return res;
  };

  const logout = async () => {
    // 1. Immediately clear local state for instant UI feedback
    clearCookie();
    setUser(null);
    router.replace('/login');

    // 2. Perform network logout in the background
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn("Auth: signOut error (safe to ignore):", err);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isSupabaseConfigured, 
      login, 
      register, 
      logout,
      refreshProfile: async () => {
        try {
          const { data: { user: sbUser } } = await supabase!.auth.getUser();
          if (sbUser) await loadUserProfile(sbUser);
        } catch (err) {
          console.error("Auth: refreshProfile failed:", err);
        }
      }
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
