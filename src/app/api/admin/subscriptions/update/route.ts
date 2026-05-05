import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyAdmin } from "@/lib/admin-api-helpers";
import { PLANS, PlanId } from "@/config/plans";

export async function POST(req: Request) {
  const adminCheck = await verifyAdmin();
  if ('error' in adminCheck) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Admin client not initialized" }, { status: 500 });
  }

  try {
    const { businessId, planId, durationDays, status, notes } = await req.json();

    if (!businessId || !planId) {
      return NextResponse.json({ error: "Business ID and Plan ID are required" }, { status: 400 });
    }

    const plan = PLANS[planId as PlanId];
    if (!plan && planId !== 'suspended') {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + (durationDays || plan?.durationDays || 30));

    // Update subscription
    const { error: subError } = await supabaseAdmin
      .from('subscriptions')
      .upsert({
        business_id: businessId,
        plan: planId,
        status: status || (planId === 'trial' ? 'trial' : 'active'),
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        grace_until: endDate.toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'business_id' });

    if (subError) throw subError;

    // Log the action
    await supabaseAdmin.from('audit_logs').insert([{
      business_id: businessId,
      actor_id: adminCheck.user.id,
      action: 'subscription_update',
      entity_type: 'subscription',
      entity_id: businessId, // Subscription is linked 1:1 with business_id
      metadata: {
        plan: planId,
        duration: durationDays,
        status,
        notes
      }
    }]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[Admin API] Subscription update error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
