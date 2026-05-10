"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { ensureUserBusinessSetup } from '@/lib/auth-helpers';

interface AuthProfile {
  id: string;
  email: string;
  full_name?: string;
  business_id?: string;
  business_name?: string;
  role: 'admin' | 'user';
  email_confirmed: boolean;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: AuthProfile | null;
  role: 'admin' | 'user' | null;
  loading: boolean;
  error: string | null;
  isSupabaseConfigured: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: any; role?: string }>;
  register: (email: string, password: string, metadata: any) => Promise<{ success: boolean; error?: any }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [role, setRole] = useState<'admin' | 'user' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();

  // Debug Logs
  useEffect(() => {
    console.log("---------------- AUTH DEBUG ----------------");
    console.log("USER:", user?.id || 'null');
    console.log("PROFILE:", profile ? 'loaded' : 'null');
    console.log("ROLE:", role || 'null');
    console.log("LOADING:", loading);
    console.log("--------------------------------------------");
  }, [user, profile, role, loading]);

  const updateCookie = (token: string) => {
    document.cookie = `sb-auth-token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  };

  const clearCookie = () => {
    document.cookie = 'sb-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  };

  const fetchProfile = async (u: User) => {
    if (!supabase) return;
    
    try {
      console.log(`[Auth] Fetching profile for: ${u.id}`);
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*, businesses(name)')
        .eq('id', u.id)
        .maybeSingle();
      
      if (profileError) {
        console.error("[Auth] Profile fetch error:", profileError);
        throw profileError;
      }

      if (data) {
        const authProfile: AuthProfile = {
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          business_id: data.business_id,
          business_name: (data.businesses as any)?.name || '',
          role: data.role || 'user',
          email_confirmed: !!u.email_confirmed_at
        };
        setProfile(authProfile);
        setRole(authProfile.role);
      } else {
        console.warn("[Auth] No profile found, triggering idempotent setup...");
        const setupResult = await ensureUserBusinessSetup(
          u.id,
          u.email || '',
          u.user_metadata?.business_name || 'My Business',
          u.user_metadata?.full_name || u.email?.split('@')[0]
        );
        
        if (setupResult.success) {
          console.log("[Auth] Setup successful, refetching...");
          // Refetch without recursion (call the same logic or just fetch again)
          const { data: newData } = await supabase
            .from('profiles')
            .select('*, businesses(name)')
            .eq('id', u.id)
            .single();
          
          if (newData) {
            const authProfile: AuthProfile = {
              id: newData.id,
              email: newData.email,
              full_name: newData.full_name,
              business_id: newData.business_id,
              business_name: (newData.businesses as any)?.name || '',
              role: newData.role || 'user',
              email_confirmed: !!u.email_confirmed_at
            };
            setProfile(authProfile);
            setRole(authProfile.role);
          }
        } else {
          console.error("[Auth] Setup failed:", setupResult.error);
          setProfile(null);
          setRole(null);
        }
      }
    } catch (err: any) {
      console.error("[Auth] Profile fetch exception:", JSON.stringify(err, null, 2));
      setError(err.message || "An unexpected error occurred during profile fetch.");
    } finally {
      setLoading(false);
    }
  };

  // 1. Initial Session Load
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        if (!isSupabaseConfigured || !supabase) {
          setLoading(false);
          return;
        }

        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user || null);

        if (!initialSession) {
          setLoading(false);
        }
      } catch (err) {
        console.error("[Auth] Init error:", err);
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase!.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user || null);
      
      if (currentSession?.access_token) {
        updateCookie(currentSession.access_token);
      } else {
        clearCookie();
        if (event === 'SIGNED_OUT') {
          setProfile(null);
          setRole(null);
          router.replace('/login');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Profile Fetch Trigger
  useEffect(() => {
    if (user) {
      fetchProfile(user);
    }
  }, [user?.id]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error: loginError } = await supabase!.auth.signInWithPassword({ email, password });
      if (loginError) throw loginError;
      return { success: true, role: 'user' }; // Role will be loaded by effect
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err };
    }
  };

  const register = async (email: string, password: string, metadata: any) => {
    try {
      setLoading(true);
      const { data, error: regError } = await supabase!.auth.signUp({ 
        email, 
        password,
        options: {
          data: { full_name: metadata.name, business_name: metadata.business_name },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (regError) throw regError;
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err };
    }
  };

  const logout = async () => {
    await supabase!.auth.signOut();
    clearCookie();
    setSession(null);
    setUser(null);
    setProfile(null);
    setRole(null);
    router.replace('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      session, user, profile, role, loading, error, isSupabaseConfigured, 
      login, register, logout,
      refreshProfile: async () => { if (user) await fetchProfile(user); }
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
