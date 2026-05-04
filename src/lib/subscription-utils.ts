import { PLANS, PlanId } from "@/config/plans";

export function getDaysRemaining(endDate: string | Date | null): number {
  if (!endDate) return 0;
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function isExpired(endDate: string | Date | null): boolean {
  if (!endDate) return true;
  const end = new Date(endDate);
  const now = new Date();
  return now > end;
}

export function isExpiringSoon(endDate: string | Date | null, withinDays = 3): boolean {
  const remaining = getDaysRemaining(endDate);
  return remaining > 0 && remaining <= withinDays;
}

export function getSubscriptionStatusLabel(sub: any) {
  if (!sub) return { label: 'No Plan', color: 'text-slate-400', bg: 'bg-slate-100' };
  
  const expired = isExpired(sub.end_date);
  
  if (sub.status === 'suspended') return { label: 'Suspended', color: 'text-red-600', bg: 'bg-red-50' };
  if (expired) return { label: 'Expired', color: 'text-red-500', bg: 'bg-red-50' };
  if (sub.status === 'trial') return { label: 'Trial', color: 'text-blue-600', bg: 'bg-blue-50' };
  
  return { label: 'Active', color: 'text-wa-green', bg: 'bg-wa-green/10' };
}

export function getPlanDetails(planId: string | null) {
  const id = (planId?.toLowerCase() || 'trial') as PlanId;
  return PLANS[id] || PLANS.trial;
}
