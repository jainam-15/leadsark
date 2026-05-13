"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<any>(null);

  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      verifyInvitation();
    } else {
      setError("No invitation token found.");
      setLoading(false);
    }
  }, [token]);

  const verifyInvitation = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    
    try {
      const { data, error: vError } = await supabase
        .from('invitations')
        .select('*, businesses(name)')
        .eq('token', token)
        .is('accepted_at', null)
        .single();

      if (vError || !data) {
        setError("Invalid or expired invitation.");
      } else {
        const expiresAt = new Date(data.expires_at);
        if (expiresAt < new Date()) {
          setError("This invitation has expired.");
        } else {
          setInvitation(data);
        }
      }
    } catch (err) {
      setError("Failed to verify invitation.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!user || !invitation || !supabase) return;
    
    setLoading(true);
    try {
      // 1. Check if already a member
      const { data: existingMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('business_id', invitation.business_id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!existingMember) {
        // Create team member
        const { error: tmError } = await supabase
          .from('team_members')
          .insert([{
            business_id: invitation.business_id,
            user_id: user.id,
            role: invitation.role,
            display_name: profile?.full_name || user.email?.split('@')[0]
          }]);

        if (tmError) throw tmError;
      }

      // 2. Mark invitation as accepted
      await supabase
        .from('invitations')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', invitation.id);

      // 3. Update user profile business_id
      await supabase
        .from('profiles')
        .update({ business_id: invitation.business_id })
        .eq('id', user.id);

      router.replace('/dashboard');
    } catch (err: any) {
      setError(err.message || "Failed to accept invitation.");
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Verifying invitation...</div>;

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-full max-w-[400px] min-w-[320px] text-center">
          <span className="material-symbols-outlined text-red-500 text-5xl mb-4">error</span>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Oops!</h1>
          <p className="text-slate-500 mb-6">{error}</p>
          <button onClick={() => router.replace('/')} className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold">Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
      <div className="bg-white p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-full max-w-[400px] min-w-[320px] text-center animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 mx-auto">
          <span className="material-symbols-outlined text-4xl">group_add</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Team Invitation</h1>
        <p className="text-slate-500 mb-8">
          You've been invited to join <span className="font-black text-slate-900">{invitation.businesses?.name}</span> as an <span className="font-black text-slate-900 uppercase">{invitation.role}</span>.
        </p>

        {!user ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-400 italic">Please sign in or create an account to accept this invitation.</p>
            <button 
              onClick={() => router.push(`/login?redirect=/accept-invite?token=${token}`)} 
              className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest hover:shadow-lg transition-all"
            >
              Sign In to Accept
            </button>
          </div>
        ) : (
          <button 
            onClick={handleAccept}
            className="w-full py-4 bg-gradient-to-r from-primary to-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:shadow-lg transition-all"
          >
            Accept & Join Team
          </button>
        )}
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AcceptInviteContent />
    </Suspense>
  );
}
