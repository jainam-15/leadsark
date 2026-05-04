
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { parseWhatsAppPayload, sendWhatsAppMessage } from "@/lib/whatsapp";

/**
 * GET: Webhook Verification
 * Used by Meta to verify the endpoint ownership.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token) {
    // Note: In a multi-tenant setup, Meta sends a single webhook for all businesses.
    // We should ideally verify against a global webhook token or check if any business has this token.
    // For simplicity and security, we'll check if at least one business has this verify_token.
    const { data: secrets, error } = await supabaseAdmin
      .from('whatsapp_secrets')
      .select('verify_token')
      .eq('verify_token', token)
      .limit(1);

    if (!error && secrets && secrets.length > 0) {
      console.log("[WhatsApp Webhook] Verification successful");
      return new Response(challenge, { status: 200 });
    }
  }

  console.error("[WhatsApp Webhook] Verification failed");
  return new Response("Forbidden", { status: 403 });
}

/**
 * POST: Incoming Message Handler
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Parse Payload
    const data = parseWhatsAppPayload(body);
    if (!data) {
      // It might be a status update (delivered, read), which we'll ignore for now
      return NextResponse.json({ status: "ignored" });
    }

    const { phoneNumberId, senderPhone, senderName, text, messageId } = data;

    // 2. Map to Business
    const { data: connection, error: connError } = await supabaseAdmin
      .from('whatsapp_connections')
      .select('business_id')
      .eq('phone_number_id', phoneNumberId)
      .single();

    if (connError || !connection) {
      console.warn("[WhatsApp Webhook] Received message for unknown phone_number_id:", phoneNumberId);
      return NextResponse.json({ status: "business_not_found" });
    }

    const businessId = connection.business_id;

    // 3. Lead Handling (Upsert)
    const { data: existingLead, error: leadError } = await supabaseAdmin
      .from('leads')
      .select('id, last_message_at')
      .eq('business_id', businessId)
      .eq('whatsapp_phone', senderPhone)
      .maybeSingle();

    let leadId;
    let isNewLead = false;

    if (!existingLead) {
      // Create new lead
      const { data: newLead, error: createError } = await supabaseAdmin
        .from('leads')
        .insert([{
          business_id: businessId,
          name: senderName || "Unknown",
          whatsapp_phone: senderPhone,
          phone: senderPhone,
          source: 'WhatsApp',
          status: 'Cold',
          last_message_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (createError) throw createError;
      leadId = newLead.id;
      isNewLead = true;
    } else {
      // Update existing lead
      leadId = existingLead.id;
      await supabaseAdmin
        .from('leads')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', leadId);
    }

    // 4. Store Message
    await supabaseAdmin.from('messages').insert([{
      business_id: businessId,
      lead_id: leadId,
      whatsapp_message_id: messageId,
      direction: 'incoming',
      content: text,
      raw_payload: body
    }]);

    // 5. Auto-reply (Basic MVP)
    if (isNewLead) {
      const { data: settings } = await supabaseAdmin
        .from('settings')
        .select('auto_reply_enabled')
        .eq('business_id', businessId)
        .single();

      if (settings?.auto_reply_enabled) {
        // Fetch secrets to send message
        const { data: secrets } = await supabaseAdmin
          .from('whatsapp_secrets')
          .select('access_token')
          .eq('business_id', businessId)
          .single();

        if (secrets?.access_token) {
          const greeting = `Hello! Thanks for reaching out to us. How can we help you today?`;
          
          const result = await sendWhatsAppMessage({
            accessToken: secrets.access_token,
            phoneNumberId: phoneNumberId,
            to: senderPhone,
            message: greeting
          });

          if (result.success) {
            // Log outgoing message
            await supabaseAdmin.from('messages').insert([{
              business_id: businessId,
              lead_id: leadId,
              direction: 'outgoing',
              content: greeting,
              whatsapp_message_id: result.messageId
            }]);
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[WhatsApp Webhook] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
