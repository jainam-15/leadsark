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
      return NextResponse.json({ error: "Subscription expired." }, { status: 403 });
    }

    // 3. Parse and Validate Input
    const { followup_id } = await req.json();
    if (!followup_id) {
      return NextResponse.json({ error: "followup_id is required" }, { status: 400 });
    }

    // 4. Fetch followup + lead + connection + secrets
    const { data: followup, error: followupError } = await supabaseAdmin
      .from('followups')
      .select(`
        *,
        leads (id, name, whatsapp_phone, business_id)
      `)
      .eq('id', followup_id)
      .eq('business_id', businessId)
      .single();

    if (followupError || !followup) {
      return NextResponse.json({ error: "Follow-up not found or access denied" }, { status: 404 });
    }

    const lead = followup.leads;
    if (!lead || lead.business_id !== businessId) {
      return NextResponse.json({ error: "Lead mismatch" }, { status: 403 });
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

    const messageToSend = followup.message || "Follow-up message";

    // 6. Send WhatsApp message
    const result = await sendWhatsAppMessage({
      accessToken: secrets.access_token,
      phoneNumberId: connection.phone_number_id!,
      to: lead.whatsapp_phone!,
      message: messageToSend
    });

    if (!result.success) {
      // Update followup status to failed
      await supabaseAdmin
        .from('followups')
        .update({ 
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', followup_id);

      return NextResponse.json({ error: result.error || "Failed to send message" }, { status: 500 });
    }

    // 7. Store Outgoing Message
    const { data: newMessage } = await supabaseAdmin
      .from('messages')
      .insert([{
        business_id: businessId,
        lead_id: lead.id,
        whatsapp_message_id: result.messageId,
        direction: 'outgoing',
        content: messageToSend,
        status: 'sent'
      }])
      .select()
      .single();

    // 8. Update followup status
    await supabaseAdmin
      .from('followups')
      .update({ 
        status: 'sent',
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', followup_id);

    // 9. Update lead's last_message_at
    await supabaseAdmin
      .from('leads')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', lead.id);

    return NextResponse.json({ success: true, message: newMessage });
  } catch (err: any) {
    console.error("[Follow-up Send Now] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
