export type PlanId = 'trial' | 'starter' | 'growth' | 'pro';

export interface Plan {
  id: PlanId;
  name: string;
  price: number;
  durationDays: number;
  features: {
    maxLeads: number | 'unlimited';
    autoReply: boolean;
    followups: 'none' | 'manual' | 'suggest_with_approval' | 'automatic';
    whatsappConnection: boolean;
    teamMembers: number;
  };
}

export const PLANS: Record<PlanId, Plan> = {
  trial: {
    id: 'trial',
    name: 'Trial',
    price: 0,
    durationDays: 5,
    features: {
      maxLeads: 50,
      autoReply: true,
      followups: 'none',
      whatsappConnection: true,
      teamMembers: 1,
    },
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 999,
    durationDays: 30,
    features: {
      maxLeads: 500,
      autoReply: true,
      followups: 'manual',
      whatsappConnection: true,
      teamMembers: 1,
    },
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    price: 1999,
    durationDays: 30,
    features: {
      maxLeads: 2000,
      autoReply: true,
      followups: 'suggest_with_approval',
      whatsappConnection: true,
      teamMembers: 3,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 3999,
    durationDays: 30,
    features: {
      maxLeads: 'unlimited',
      autoReply: true,
      followups: 'automatic',
      whatsappConnection: true,
      teamMembers: 10,
    },
  },
};
