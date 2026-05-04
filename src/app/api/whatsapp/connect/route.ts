
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const cookieStore = await cookies();
    const token = cookieStore.get('sb-auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    // 2. Get business ID for this user
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('business_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.business_id) {
      return NextResponse.json({ error: "No business linked to this account" }, { status: 400 });
    }

    const businessId = profile.business_id;

    // 3. Parse and Validate Input
    const { 
      phone_number_id, 
      whatsapp_business_account_id, 
      connected_phone, 
      access_token, 
      verify_token 
    } = await req.json();

    if (!phone_number_id || !access_token || !verify_token) {
      return NextResponse.json({ error: "phone_number_id, access_token, and verify_token are required" }, { status: 400 });
    }

    // 4. Update/Insert Connection Info
    const { error: connError } = await supabaseAdmin
      .from('whatsapp_connections')
      .upsert({
        business_id: businessId,
        phone_number_id,
        whatsapp_business_account_id,
        connected_phone,
        status: 'connected',
        updated_at: new Date().toISOString()
      }, { onConflict: 'business_id' });

    if (connError) throw connError;

    // 5. Store Secrets Securely
    const { error: secretError } = await supabaseAdmin
      .from('whatsapp_secrets')
      .upsert({
        business_id: businessId,
        access_token,
        verify_token,
        updated_at: new Date().toISOString()
      }, { onConflict: 'business_id' });

    if (secretError) throw secretError;

    // 6. Audit Log
    await supabaseAdmin.from('audit_logs').insert([{
      business_id: businessId,
      actor_id: user.id,
      action: 'whatsapp_connect',
      entity_type: 'whatsapp_connection',
      entity_id: businessId,
      metadata: { phone_number_id }
    }]);

    return NextResponse.json({ success: true, message: "WhatsApp connected successfully" });
  } catch (err: any) {
    console.error("[WhatsApp Connect] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
