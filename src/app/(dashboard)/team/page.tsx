"use client";

import { useState } from "react";
import { useTeam, TeamMember, Invitation } from "@/hooks/useTeam";
import { useAuth } from "@/hooks/useAuth";

export default function TeamPage() {
  const { profile } = useAuth();
  const { members, invitations, loading, inviteMember, removeMember, updateRole, cancelInvitation } = useTeam();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<'admin' | 'agent'>("agent");
  const [isInviting, setIsInviting] = useState(false);

  const canManage = profile?.role === 'admin' || members.find(m => m.user_id === profile?.id)?.role !== 'agent';

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    const result = await inviteMember(inviteEmail, inviteRole);
    setIsInviting(false);
    if (result.success) {
      setInviteEmail("");
      setIsInviteModalOpen(false);
    } else {
      alert(result.error || "Failed to invite member");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading team...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Team Management</h1>
          <p className="text-slate-500 mt-1">Manage your business team members and roles.</p>
        </div>
        {canManage && (
          <button 
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-bold"
          >
            <span className="material-symbols-outlined">person_add</span>
            Invite Member
          </button>
        )}
      </div>

      <div className="grid gap-8">
        {/* Members List */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200/50 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">group</span>
              Active Members ({members.length})
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {members.map((member) => (
              <div key={member.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xl uppercase">
                    {member.display_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{member.display_name} {member.user_id === profile?.id && "(You)"}</h3>
                    <p className="text-sm text-slate-500">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    member.role === 'owner' ? 'bg-amber-100 text-amber-700' :
                    member.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {member.role}
                  </span>
                  
                  {canManage && member.role !== 'owner' && member.user_id !== profile?.id && (
                    <div className="flex items-center gap-2">
                      <select 
                        value={member.role}
                        onChange={(e) => updateRole(member.id, e.target.value as any)}
                        className="bg-slate-100 border-none rounded-lg px-2 py-1 text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="admin">Admin</option>
                        <option value="agent">Agent</option>
                      </select>
                      <button 
                        onClick={() => {
                          if (confirm("Are you sure you want to remove this member?")) {
                            removeMember(member.id);
                          }
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove Member"
                      >
                        <span className="material-symbols-outlined text-sm">person_remove</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pending Invitations */}
        {invitations.length > 0 && (
          <section className="bg-white rounded-3xl shadow-sm border border-slate-200/50 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-500">mail</span>
                Pending Invitations ({invitations.length})
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              {invitations.map((invite) => (
                <div key={invite.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <h3 className="font-bold text-slate-900">{invite.email}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Role: <span className="uppercase font-bold text-slate-600">{invite.role}</span> • 
                      Expires: {new Date(invite.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-2 py-1 rounded">Pending</span>
                    {canManage && (
                      <button 
                        onClick={() => cancelInvitation(invite.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Cancel Invitation"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-[480px] max-w-[95vw] shadow-[0_20px_50px_rgba(0,0,0,0.2)] animate-in zoom-in-95 duration-200 relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-900">Invite Team Member</h3>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleInvite} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@business.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Role</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => setInviteRole('agent')}
                    className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-1 ${
                      inviteRole === 'agent' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'
                    }`}
                  >
                    <span className="material-symbols-outlined text-primary">person</span>
                    <div>
                      <div className="font-bold text-slate-900 leading-tight">Agent</div>
                      <div className="text-[10px] text-slate-500 leading-tight">Only assigned leads</div>
                    </div>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setInviteRole('admin')}
                    className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-1 ${
                      inviteRole === 'admin' 
                        ? 'border-blue-600 bg-blue-50' 
                        : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'
                    }`}
                  >
                    <span className="material-symbols-outlined text-blue-600">admin_panel_settings</span>
                    <div>
                      <div className="font-bold text-slate-900 leading-tight">Admin</div>
                      <div className="text-[10px] text-slate-500 leading-tight">Full business access</div>
                    </div>
                  </button>
                </div>
              </div>
              <button 
                type="submit"
                disabled={isInviting}
                className="w-full py-4 bg-gradient-to-r from-primary to-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {isInviting ? "Sending..." : "Send Invitation"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
