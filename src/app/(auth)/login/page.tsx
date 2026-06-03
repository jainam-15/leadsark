"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { motion } from "framer-motion";
import { Eye, EyeOff, Zap } from "lucide-react";

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
        if (res.error.message === "Email not confirmed") {
          router.replace("/verify-email");
          return;
        }
        throw res.error;
      }
      
      if (res.success) {
        setSuccess(true);
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
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-4 right-4 z-50">
        <ThemeSwitcher />
      </div>

      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-lighten pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-lighten pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="glass-panel w-full max-w-[448px] p-8 rounded-3xl z-10"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-teal-500/30">
            <Zap size={24} fill="currentColor" />
          </div>
          <h1 className="text-2xl font-black text-foreground">Welcome to LeadsArk</h1>
          <p className="text-sm text-foreground/60 mt-2">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-sm rounded-xl flex items-center gap-2 font-bold">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            Login successful! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wide mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-surface border border-border text-foreground rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-sm"
              placeholder="you@company.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wide mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-surface border border-border text-foreground rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-sm pr-12"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <label className="flex items-center gap-2 text-sm text-foreground/70 cursor-pointer">
              <input type="checkbox" className="rounded text-teal-500 focus:ring-teal-500 bg-surface border-border" />
              <span>Remember me</span>
            </label>
            <Link href="#" className="text-sm font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-500 transition-colors">Forgot password?</Link>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3.5 bg-foreground text-background rounded-xl shadow-lg shadow-foreground/10 hover:shadow-foreground/20 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold text-sm uppercase tracking-widest mt-8 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin"></div>
                Signing in...
              </div>
            ) : success ? "Redirecting..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-background text-foreground/50 rounded-full font-medium">Or continue with</span>
            </div>
          </div>
          
          <button
            onClick={handleDemoLogin}
            className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-surface text-foreground rounded-xl border border-border hover:bg-surface-hover transition-all font-bold text-sm uppercase tracking-wider"
          >
            <Zap size={16} className="text-teal-500" />
            Demo Login
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-foreground/60">
          Don't have an account?{' '}
          <Link href="/register" className="font-bold text-teal-600 dark:text-teal-400 hover:text-teal-500 transition-colors">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
