import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyAdmin } from "@/lib/admin-api-helpers";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await verifyAdmin();
  if ('error' in adminCheck) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const { id } = await params;

  try {
    const [
      { data: business, error: bError },
      { data: profile, error: pError },
      { data: subscription },
      { data: whatsapp },
      { count: leadsCount },
      { count: messagesCount },
      { count: followupsCount }
    ] = await Promise.all([
      supabaseAdmin.from('businesses').select('*').eq('id', id).single(),
      supabaseAdmin.from('profiles').select('*').eq('business_id', id).limit(1).maybeSingle(),
      supabaseAdmin.from('subscriptions').select('*').eq('business_id', id).maybeSingle(),
      supabaseAdmin.from('whatsapp_connections').select('*').eq('business_id', id).maybeSingle(),
      supabaseAdmin.from('leads').select('*', { count: 'exact', head: true }).eq('business_id', id),
      supabaseAdmin.from('messages').select('*', { count: 'exact', head: true }).eq('business_id', id),
      supabaseAdmin.from('followups').select('*', { count: 'exact', head: true }).eq('business_id', id)
    ]);

    if (bError) throw bError;

    return NextResponse.json({
      business,
      profile,
      subscription,
      whatsapp,
      stats: {
        leads_count: leadsCount || 0,
        messages_count: messagesCount || 0,
        followups_count: followupsCount || 0
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
