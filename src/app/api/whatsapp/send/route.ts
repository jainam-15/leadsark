import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

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
      .select('business_id')
      .eq('id', user.id)
      .single();

    if (!profile?.business_id) {
      return NextResponse.json({ error: "No business linked to this account" }, { status: 400 });
    }

    const businessId = profile.business_id;

    // 2.5 Check subscription status
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('status')
      .eq('business_id', businessId)
      .single();

    if (subscription?.status === 'expired') {
      return NextResponse.json({ error: "Subscription expired. Please renew to send messages." }, { status: 403 });
    }

    // 3. Parse and Validate Input
    const { lead_id, message } = await req.json();
    if (!lead_id || !message) {
      return NextResponse.json({ error: "lead_id and message are required" }, { status: 400 });
    }

    // 4. Verify lead belongs to business
    const { data: lead, error: leadError } = await supabaseAdmin
      .from('leads')
      .select('id, whatsapp_phone')
      .eq('id', lead_id)
      .eq('business_id', businessId)
      .single();

    if (leadError || !lead) {
      return NextResponse.json({ error: "Lead not found or access denied" }, { status: 404 });
    }

    // 5. Get WhatsApp Connection & Secrets
    const { data: connection } = await supabaseAdmin
      .from('whatsapp_connections')
      .select('phone_number_id, status')
      .eq('business_id', businessId)
      .single();

    if (!connection || connection.status !== 'connected') {
      return NextResponse.json({ error: "WhatsApp not connected" }, { status: 400 });
    }

    const { data: secrets } = await supabaseAdmin
      .from('whatsapp_secrets')
      .select('access_token')
      .eq('business_id', businessId)
      .single();

    if (!secrets?.access_token) {
      return NextResponse.json({ error: "WhatsApp credentials missing" }, { status: 400 });
    }

    // 5.5 Sanitize Phone Number (Digits only, no +, no spaces)
    const sanitizedPhone = lead.whatsapp_phone!.replace(/\D/g, '');
    console.log(`[WhatsApp Send] Recipient: ${lead.whatsapp_phone} -> Sanitized: ${sanitizedPhone}`);

    // 6. Send WhatsApp message via Meta API
    const result = await sendWhatsAppMessage({
      accessToken: secrets.access_token,
      phoneNumberId: connection.phone_number_id!,
      to: sanitizedPhone,
      message: message
    });

    if (!result.success) {
      console.error(`[WhatsApp Send] Failed to send to ${sanitizedPhone}:`, result.error);
      return NextResponse.json({ error: result.error || "Failed to send message" }, { status: 500 });
    }

    // 7. Store Outgoing Message
    const { data: newMessage, error: msgError } = await supabaseAdmin
      .from('messages')
      .insert([{
        business_id: businessId,
        lead_id: lead.id,
        whatsapp_message_id: result.messageId,
        direction: 'outgoing',
        content: message,
        status: 'sent'
      }])
      .select()
      .single();

    if (msgError) throw msgError;

    // 8. Update lead's last_message_at
    await supabaseAdmin
      .from('leads')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', lead.id);

    return NextResponse.json({ success: true, message: newMessage });
  } catch (err: any) {
    console.error("[WhatsApp Send] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
