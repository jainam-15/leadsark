import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyAdmin } from "@/lib/admin-api-helpers";

export async function GET() {
  const adminCheck = await verifyAdmin();
  if ('error' in adminCheck) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  try {
    const now = new Date().toISOString();

    const [
      { count: totalBusinesses },
      { count: trialUsers },
      { count: activePaidUsers },
      { count: expiredUsers },
      { count: expiringSoonUsers },
      { data: recentRevenue }
    ] = await Promise.all([
      supabaseAdmin.from('businesses').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'trial').gt('end_date', now),
      supabaseAdmin.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active').gt('end_date', now),
      supabaseAdmin.from('subscriptions').select('*', { count: 'exact', head: true }).lt('end_date', now),
      supabaseAdmin.from('subscriptions').select('*', { count: 'exact', head: true }).gt('end_date', now).lt('end_date', new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()),
      supabaseAdmin.from('subscriptions').select('plan').eq('status', 'active')
    ]);

    // Mock revenue estimate based on active plans
    // (In a real app, this would query a transactions table)
    const revenueEstimate = (recentRevenue || []).reduce((acc, sub) => {
      if (sub.plan === 'starter') return acc + 999;
      if (sub.plan === 'growth') return acc + 1999;
      if (sub.plan === 'pro') return acc + 3999;
      return acc;
    }, 0);

    return NextResponse.json({
      totalBusinesses: totalBusinesses || 0,
      trialUsers: trialUsers || 0,
      activePaidUsers: activePaidUsers || 0,
      expiredSubscriptions: expiredUsers || 0,
      expiringSoon: expiringSoonUsers || 0,
      revenueEstimate
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
