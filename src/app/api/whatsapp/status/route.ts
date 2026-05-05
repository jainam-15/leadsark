import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
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

    // Get profile for business_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('business_id')
      .single();

    if (!profile?.business_id) {
      return NextResponse.json({ error: "No business linked" }, { status: 404 });
    }

    // Get WhatsApp Connection Status
    const { data: connection, error: connError } = await supabase
      .from('whatsapp_connections')
      .select('*')
      .eq('business_id', profile.business_id)
      .maybeSingle();

    if (connError) throw connError;

    // Check if secrets exist (to know if we have a token stored)
    const { data: secrets } = await supabaseAdmin
      .from('whatsapp_secrets')
      .select('id, verify_token')
      .eq('business_id', profile.business_id)
      .maybeSingle();

    return NextResponse.json({
      connection,
      hasSecrets: !!secrets,
      verifyToken: secrets?.verify_token || null
    });
  } catch (err: any) {
    console.error("[WhatsApp Status] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
