import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyAdmin } from "@/lib/admin-api-helpers";

export async function POST(req: Request) {
  const adminCheck = await verifyAdmin();
  if ('error' in adminCheck) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Admin client not initialized" }, { status: 500 });
  }

  try {
    const { businessId, status } = await req.json();

    const { error: bError } = await supabaseAdmin
      .from('businesses')
      .update({ status })
      .eq('id', businessId);

    if (bError) throw bError;

    // Log the action
    await supabaseAdmin.from('audit_logs').insert([{
      business_id: businessId,
      actor_id: adminCheck.user.id,
      action: 'update_business_status',
      entity_type: 'business',
      metadata: { status }
    }]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
