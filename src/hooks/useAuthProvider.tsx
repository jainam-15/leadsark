"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthProfile {
  id: string;
  email: string;
  full_name?: string;
  business_id?: string;
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
  const pathname = usePathname();

  const updateCookie = (token: string) => {
    document.cookie = `sb-auth-token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  };

  const clearCookie = () => {
    document.cookie = 'sb-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  };

  const loadUserProfile = async (supabaseUser: User) => {
    if (!supabase) return null;
    
    try {
      console.log(`[Auth] Fetching profile for user: ${supabaseUser.id}`);
      const { data: profileData, error: profileError } = await supabase!
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();
      
      if (profileError) throw profileError;

      let data = profileData;

      // Auto-provision if missing and email confirmed
      if (!data && supabaseUser.email_confirmed_at) {
        console.log(`[Auth] Profile missing for verified user. Auto-provisioning...`);
        const { ensureUserBusinessSetupAction } = await import('@/app/actions/auth');
        const metadata = supabaseUser.user_metadata || {};
        const result = await ensureUserBusinessSetupAction(
          supabaseUser.id,
          supabaseUser.email!,
          metadata.business_name || `${metadata.full_name || 'My'}'s Business`,
          metadata.full_name
        );
        
        if (result.success) {
          const { data: refreshed } = await supabase!
            .from('profiles')
            .select('*')
            .eq('id', supabaseUser.id)
            .single();
          data = refreshed;
          console.log(`[Auth] Auto-provisioning successful`);
        } else {
          console.error(`[Auth] Auto-provisioning failed:`, result.error);
        }
      }
      
      if (data) {
        const authProfile: AuthProfile = {
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          business_id: data.business_id,
          role: data.role || 'user',
          email_confirmed: !!supabaseUser.email_confirmed_at
        };
        
        setProfile(authProfile);
        setRole(authProfile.role);
        console.log(`[Auth] Profile loaded. Role: ${authProfile.role}`);
        return authProfile;
      } else {
        console.warn(`[Auth] No profile found for user`);
        setProfile(null);
        setRole(null);
        return null;
      }
    } catch (err) {
      console.error("[Auth] Profile load failed:", err);
      setProfile(null);
      setRole(null);
      return null;
    }
  };

  const handleAuthEvent = async (event: string, newSession: Session | null) => {
    console.log(`[Auth] Event: ${event} | Session exists: ${!!newSession}`);
    setSession(newSession);
    setUser(newSession?.user || null);

    if (newSession?.user) {
      updateCookie(newSession.access_token);
      await loadUserProfile(newSession.user);
    } else {
      clearCookie();
      setProfile(null);
      setRole(null);
      if (event === 'SIGNED_OUT') {
        router.replace('/login');
        router.refresh();
      }
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      console.warn("[Auth] Supabase not configured");
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 1. Get initial session
        const { data: { session: initialSession }, error: sessionError } = await supabase!.auth.getSession();
        
        if (sessionError) {
          console.error("[Auth] Initial session error:", sessionError);
          throw sessionError;
        }

        if (initialSession) {
          // 2. Validate session with getUser (more secure)
          const { data: { user: validatedUser }, error: userError } = await supabase!.auth.getUser();
          
          if (userError || !validatedUser) {
            console.warn("[Auth] Session invalid or user not found. Clearing.");
            await supabase!.auth.signOut();
            await handleAuthEvent('SIGNED_OUT', null);
          } else {
            console.log("[Auth] Session validated");
            await handleAuthEvent('INITIAL_SESSION', initialSession);
          }
        } else {
          console.log("[Auth] No initial session");
          setLoading(false);
        }
      } catch (err: any) {
        console.error("[Auth] Initialization error:", err);
        setError(err.message);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase!.auth.onAuthStateChange(async (event, currentSession) => {
      // Avoid redundant loading if it's just a regular token refresh
      if (event === 'TOKEN_REFRESHED') {
        setSession(currentSession);
        return;
      }
      
      await handleAuthEvent(event, currentSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    if (!supabase) return { success: false, error: 'Supabase not configured' };
    
    try {
      setLoading(true);
      setError(null);
      console.log(`[Auth] Attempting login for ${email}`);
      
      const { data, error: loginError } = await supabase!.auth.signInWithPassword({ email, password });
      
      if (loginError) throw loginError;

      if (data.session) {
        updateCookie(data.session.access_token);
        const userProfile = await loadUserProfile(data.user!);
        const userRole = userProfile?.role || 'user';
        
        console.log(`[Auth] Login success. Redirect target: ${userRole === 'admin' ? '/admin' : '/dashboard'}`);
        
        return { 
          success: true, 
          role: userRole 
        };
      }
      
      return { success: false, error: 'No session created' };
    } catch (err: any) {
      console.error("[Auth] Login error:", err);
      setError(err.message);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, metadata: any) => {
    if (!supabase) return { success: false, error: 'Supabase not configured' };
    
    try {
      setLoading(true);
      setError(null);
      console.log(`[Auth] Attempting register for ${email}`);
      
      const { data, error: regError } = await supabase!.auth.signUp({ 
        email, 
        password,
        options: {
          data: { 
            full_name: metadata.name, 
            business_name: metadata.business_name 
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (regError) throw regError;

      if (data.session) {
        updateCookie(data.session.access_token);
        await loadUserProfile(data.user!);
        return { success: true };
      }
      
      // If email confirmation is required, session might be null
      console.log("[Auth] Registration successful, confirmation may be required");
      return { success: true };
    } catch (err: any) {
      console.error("[Auth] Registration error:", err);
      setError(err.message);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    console.log("[Auth] Logging out...");
    try {
      setLoading(true);
      if (supabase) {
        await supabase!.auth.signOut();
      }
    } catch (err) {
      console.warn("[Auth] signOut error (clearing local state anyway):", err);
    } finally {
      clearCookie();
      setSession(null);
      setUser(null);
      setProfile(null);
      setRole(null);
      setLoading(false);
      router.replace('/login');
      router.refresh();
      console.log("[Auth] Logout complete");
    }
  };

  return (
    <AuthContext.Provider value={{ 
      session,
      user, 
      profile,
      role,
      loading, 
      error,
      isSupabaseConfigured, 
      login, 
      register, 
      logout,
      refreshProfile: async () => {
        if (!supabase || !user) return;
        await loadUserProfile(user!);
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
