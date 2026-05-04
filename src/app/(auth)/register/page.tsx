"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { ensureUserBusinessSetup } from "@/lib/auth-helpers";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isSupabaseConfigured } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    businessName: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.businessName || !formData.password) {
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
    setStatus("Creating your account...");

    try {
      // 1. Sign up user
      const { data: authData, error: authError } = await register(
        formData.email,
        formData.password,
        { name: formData.name, business_name: formData.businessName }
      );

      if (authError) throw authError;

      // If session exists (confirmation OFF), we can try to setup business now
      if (authData?.session) {
        setStatus("Setting up your workspace...");
        const { ensureUserBusinessSetupAction } = await import('@/app/actions/auth');
        const result = await ensureUserBusinessSetupAction(
          authData.user!.id,
          formData.email,
          formData.businessName, // Use real input
          formData.name
        );
        
        if (result.success) {
          setSuccess(true);
          setStatus("Setup complete! Redirecting...");
          router.replace("/dashboard");
        } else {
          setError(result.error || "Account created but business setup failed. Please try logging in.");
          setLoading(false);
        }
      } else {
        // Confirmation is ON
        setSuccess(true);
        setStatus("Check your email to verify your account.");
        setLoading(false);
      }
    } catch (err: any) {
      if (err.message === "User already registered") {
        setError("An account with this email already exists. Please sign in instead.");
      } else if (err.message?.includes("rate limit")) {
        setError("Too many attempts. Please wait a few minutes before trying again.");
      } else {
        console.error("Registration error:", err);
        setError(err.message || "An error occurred during registration.");
      }
      setLoading(false);
    }
  };

  if (success && !status.includes("Redirecting")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
        <div className="glass-panel w-full max-w-[448px] p-8 rounded-2xl text-center">
          <div className="w-16 h-16 bg-wa-green/10 text-wa-green rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-3xl">mail</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Verify your email</h2>
          <p className="text-slate-600 mb-8">{status}</p>
          <div className="space-y-4">
            <Link href="/login" className="block w-full py-3 bg-slate-900 text-white rounded-xl shadow-lg font-black text-sm uppercase tracking-widest">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-3xl"></div>

      <div className="glass-panel w-full max-w-[448px] p-8 rounded-2xl z-10 my-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
            <span className="material-symbols-outlined">rocket_launch</span>
          </div>
          <h1 className="text-2xl font-h2 font-black text-slate-900">Create an Account</h1>
          <p className="text-sm text-slate-500 mt-2">Start automating your leads today</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-sm"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-sm"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Business Name</label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-sm"
              placeholder="Acme Corp"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-sm pr-12"
                placeholder="••••••••"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-slate-900 text-white rounded-xl shadow-lg hover:shadow-slate-500/30 transition-all font-black text-sm uppercase tracking-widest mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {status || "Loading..."}
              </div>
            ) : "Sign Up"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-teal-600 hover:text-teal-700 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
