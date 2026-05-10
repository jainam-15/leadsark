import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(req: Request) {
  const authHeader = req.headers.get('x-cron-secret');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date().toISOString();

    // 1. Find pending automatic followups where scheduled_at <= now
    const { data: dueFollowups, error: fetchError } = await supabaseAdmin
      .from('followups')
      .select(`
        *,
        leads (id, name, whatsapp_phone, business_id)
      `)
      .eq('status', 'pending')
      .eq('send_mode', 'automatic')
      .lte('scheduled_at', now);

    if (fetchError) throw fetchError;
    if (!dueFollowups || dueFollowups.length === 0) {
      return NextResponse.json({ message: "No due follow-ups found" });
    }

    const results = [];

    for (const followup of dueFollowups) {
      const businessId = followup.business_id;
      const lead = followup.leads;

      if (!lead) {
        results.push({ id: followup.id, status: 'failed', error: 'Lead not found' });
        continue;
      }

      // Get Connection & Secrets for this business
      const { data: connection } = await supabaseAdmin
        .from('whatsapp_connections')
        .select('phone_number_id, status')
        .eq('business_id', businessId)
        .single();

      const { data: secrets } = await supabaseAdmin
        .from('whatsapp_secrets')
        .select('access_token')
        .eq('business_id', businessId)
        .single();

      if (!connection || connection.status !== 'connected' || !secrets?.access_token) {
        results.push({ id: followup.id, status: 'failed', error: 'WhatsApp not connected' });
        continue;
      }

      const messageToSend = followup.message || "Follow-up message";

      // Send Message
      const sendResult = await sendWhatsAppMessage({
        accessToken: secrets.access_token,
        phoneNumberId: connection.phone_number_id!,
        to: lead.whatsapp_phone!,
        message: messageToSend
      });

      if (sendResult.success) {
        // Store Message
        await supabaseAdmin.from('messages').insert([{
          business_id: businessId,
          lead_id: lead.id,
          whatsapp_message_id: sendResult.messageId,
          direction: 'outgoing',
          content: messageToSend,
          status: 'sent'
        }]);

        // Update Followup
        await supabaseAdmin
          .from('followups')
          .update({ 
            status: 'sent',
            sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', followup.id);

        // Update lead's last_message_at
        await supabaseAdmin
          .from('leads')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', lead.id);

        results.push({ id: followup.id, status: 'sent' });
      } else {
        await supabaseAdmin
          .from('followups')
          .update({ 
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', followup.id);
          
        results.push({ id: followup.id, status: 'failed', error: sendResult.error });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    console.error("[Process Due Follow-ups] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
