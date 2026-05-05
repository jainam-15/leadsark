"use server";

import { ensureUserBusinessSetup } from "@/lib/auth-helpers";

/**
 * Server Action to ensure a user has a profile, business, and subscription.
 * Strictly Idempotent: 1 User = 1 Business.
 */
export async function ensureUserBusinessSetupAction(
  userId: string, 
  email: string, 
  businessName: string, 
  fullName?: string
) {
  return await ensureUserBusinessSetup(userId, email, businessName, fullName);
}
