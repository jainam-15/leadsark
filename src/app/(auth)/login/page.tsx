"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { login, user, role, loading: authLoading, isSupabaseConfigured } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      if (role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [user, role, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (!isSupabaseConfigured) {
      setError("Supabase is not configured. Please check your environment variables.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await login(email, password);

      if (res.error) {
        // Special handling for email confirmation
        if (res.error.message === "Email not confirmed") {
          router.replace("/verify-email");
          return;
        }
        throw res.error;
      }
      
      if (res.success) {
        setSuccess(true);
        // Role-based redirection is handled here based on the result from the provider
        if (res.role === 'admin') {
          router.replace("/admin");
        } else {
          router.replace("/dashboard");
        }
      }
    } catch (err: any) {
      console.error("[Login] Submit error:", err);
      setError(err.message || "Invalid login credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    if (!isSupabaseConfigured) {
      router.push("/dashboard");
      return;
    }
    
    setEmail("demo@leadsark.com");
    setPassword("demo123");
    
    // We don't automatically submit to let the user see the credentials
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-3xl"></div>

      <div className="glass-panel w-full max-w-[448px] p-8 rounded-2xl z-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
            <span className="material-symbols-outlined">rocket_launch</span>
          </div>
          <h1 className="text-2xl font-h2 font-black text-slate-900">Welcome to LeadsArk</h1>
          <p className="text-sm text-slate-500 mt-2">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-wa-green/10 border border-wa-green/20 text-wa-green text-sm rounded-lg flex items-center gap-2 font-bold">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            Login successful! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-sm"
              placeholder="you@company.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-sm pr-12"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input type="checkbox" className="rounded text-teal-600 focus:ring-teal-500" />
              <span>Remember me</span>
            </label>
            <Link href="#" className="text-sm font-semibold text-teal-600 hover:text-teal-700">Forgot password?</Link>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3 bg-slate-900 text-white rounded-xl shadow-lg hover:shadow-slate-500/30 transition-all font-black text-sm uppercase tracking-widest mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Signing in...
              </div>
            ) : success ? "Redirecting..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500 rounded-full">Or continue with</span>
            </div>
          </div>
          
          <button
            onClick={handleDemoLogin}
            className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-wa-green/10 text-wa-green rounded-xl border border-wa-green/20 hover:bg-wa-green/20 transition-all font-bold text-sm uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-[18px]">bolt</span>
            Demo Login
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link href="/register" className="font-bold text-teal-600 hover:text-teal-700 transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
