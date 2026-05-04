"use client";

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const { logout, user } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
      <div className="glass-panel w-full max-w-[448px] p-8 rounded-2xl text-center">
        <div className="w-16 h-16 bg-wa-green/10 text-wa-green rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-3xl">mail</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Check your email</h2>
        <p className="text-slate-600 mb-6">
          We've sent a verification link to <span className="font-bold text-slate-900">{user?.email || "your email"}</span>. 
          Please click the link to verify your account.
        </p>
        
        <div className="space-y-4">
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-slate-900 text-white rounded-xl shadow-lg hover:shadow-slate-500/30 transition-all font-black text-sm uppercase tracking-widest"
          >
            I've verified my email
          </button>
          
          <div className="text-sm text-slate-500">
            Didn't receive the email? Check your spam folder or try again.
          </div>
          
          <div className="pt-6 border-t border-slate-100 flex flex-col gap-3">
             <button 
              onClick={() => logout()}
              className="text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
            >
              Log out and use different email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
