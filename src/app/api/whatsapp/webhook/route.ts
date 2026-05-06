
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

  // Logging for debugging (Safe: doesn't log challenge, only token for verification)
  console.log(`[WhatsApp Webhook] Incoming GET request. Mode: ${mode}, Token: ${token}`);

  if (mode === "subscribe" && token) {
    // 1. Primary Check: Global Token from Environment Variable
    const globalToken = process.env.WHATSAPP_VERIFY_TOKEN || "leadsark_secure_token";
    
    if (token === globalToken && challenge) {
      console.log("[WhatsApp Webhook] Verification successful (Global Token)");
      return new Response(challenge, { status: 200 });
    }

    // 2. Fallback Check: Multi-tenant Database Lookup
    // Check if at least one business has this specific verify_token configured.
    const { data: secrets, error } = await supabaseAdmin
      .from('whatsapp_secrets')
      .select('verify_token')
      .eq('verify_token', token)
      .limit(1);

    if (!error && secrets && secrets.length > 0 && challenge) {
      console.log("[WhatsApp Webhook] Verification successful (DB Lookup)");
      return new Response(challenge, { status: 200 });
    }
  }

  console.error(`[WhatsApp Webhook] Verification failed. Received Token: "${token}", Mode: "${mode}"`);
  return new Response("Forbidden", { status: 403 });
}

/**
 * POST: Incoming Message Handler
 */
export async function POST(req: Request) {
  console.log("[WhatsApp Webhook] [POST HIT] Received request");
  
  try {
    const body = await req.json();
    console.log("[WhatsApp Webhook] Payload received:", JSON.stringify(body, null, 2).substring(0, 500));
    
    // 1. Parse Payload
    const data = parseWhatsAppPayload(body);
    if (!data) {
      console.log("[WhatsApp Webhook] No message data in payload (possibly status update)");
      return NextResponse.json({ status: "ignored" });
    }

    const { phoneNumberId, senderPhone, senderName, text, messageId } = data;
    console.log(`[WhatsApp Webhook] Parsed Message: from=${senderPhone}, phoneId=${phoneNumberId}, text="${text.substring(0, 20)}"`);

    // 2. Map to Business
    const { data: connection, error: connError } = await supabaseAdmin
      .from('whatsapp_connections')
      .select('business_id')
      .eq('phone_number_id', phoneNumberId)
      .single();

    if (connError || !connection) {
      console.warn("[WhatsApp Webhook] Connection not found for phone_number_id:", phoneNumberId);
      return NextResponse.json({ status: "business_not_found" });
    }

    const businessId = connection.business_id;
    console.log(`[WhatsApp Webhook] Mapped to Business ID: ${businessId}`);

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
