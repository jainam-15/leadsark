
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
      console.log("[WhatsApp Webhook] Failed to parse payload");
      return NextResponse.json({ status: "parse_error" });
    }

    const { phoneNumberId, senderPhone, senderName, text, messageId, isStatusUpdate, metadata } = data;

    // Task 1: Safe logging as requested
    console.log(`[WhatsApp Webhook] Extracted phone_number_id: "${phoneNumberId}"`);
    console.log(`[WhatsApp Webhook] Full payload path used: body.entry[0].changes[0].value.metadata.phone_number_id`);
    console.log(`[WhatsApp Webhook] Available metadata:`, JSON.stringify(metadata || {}, null, 2));

    if (isStatusUpdate || !text) {
      if (isStatusUpdate) {
        console.log(`[WhatsApp Webhook] Received status update for message: ${body?.entry?.[0]?.changes?.[0]?.value?.statuses?.[0]?.id}`);
      } else {
        console.log("[WhatsApp Webhook] Ignored (no message body)");
      }
      return NextResponse.json({ status: "ignored" });
    }

    console.log(`[WhatsApp Webhook] Parsed Message: from=${senderPhone}, phoneId=${phoneNumberId}, text="${text.substring(0, 20)}"`);

    // 2. Map to Business
    const { data: connection, error: connError } = await supabaseAdmin
      .from('whatsapp_connections')
      .select('business_id')
      .eq('phone_number_id', phoneNumberId)
      .single();

    if (connError || !connection) {
      console.warn(`[WhatsApp Webhook] Connection NOT FOUND for phone_number_id: "${phoneNumberId}"`);
      
      // Task 5: Log existing phone_number_ids from whatsapp_connections
      const { data: allConnections } = await supabaseAdmin
        .from('whatsapp_connections')
        .select('phone_number_id, business_id');
      
      const existingIds = allConnections?.map(c => c.phone_number_id) || [];
      console.log(`[WhatsApp Webhook] Existing DB phone_number_ids:`, JSON.stringify(existingIds));
      console.log(`[WhatsApp Webhook] Comparison: "${phoneNumberId}" vs [${existingIds.join(', ')}]`);

      // Return 200 safely as requested by Meta to avoid retries
      return NextResponse.json({ 
        status: "business_not_found", 
        extracted_id: phoneNumberId,
        existing_ids: existingIds
      }, { status: 200 });
    }

    console.log(`[WhatsApp Webhook] Connection FOUND. Mapped to Business ID: ${connection.business_id}`);
    const businessId = connection.business_id;

    // 2.5 Check for duplicate message
    const { data: existingMsg } = await supabaseAdmin
      .from('messages')
      .select('id')
      .eq('whatsapp_message_id', messageId)
      .maybeSingle();

    if (existingMsg) {
      console.log(`[WhatsApp Webhook] Duplicate message ignored: ${messageId}`);
      return NextResponse.json({ success: true, duplicate: true });
    }

    // 3. Lead Handling (Upsert)
    const { data: existingLead, error: leadError } = await supabaseAdmin
      .from('leads')
      .select('id, last_message_at, status')
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
        .update({ 
          last_message_at: new Date().toISOString(),
          status: existingLead.status === 'Lost' ? 'Cold' : existingLead.status // Re-activate lost leads if they message back
        })
        .eq('id', leadId);

      // PART 5: If pending manual follow-up exists for that lead, mark it completed
      await supabaseAdmin
        .from('followups')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('lead_id', leadId)
        .eq('status', 'pending')
        .eq('send_mode', 'manual');
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

    // 5. Auto-reply (Enhanced with Templates)
    if (isNewLead) {
      const { data: settings } = await supabaseAdmin
        .from('settings')
        .select('auto_reply_enabled, greeting_message, greeting_template_id')
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
          let greeting = settings.greeting_message || `Hello! Thanks for reaching out to us. How can we help you today?`;
          let templateToUse = null;

          // 1. Check if a specific template is selected in settings
          if (settings.greeting_template_id) {
            const { data: selectedTemplate } = await supabaseAdmin
              .from('message_templates')
              .select('content')
              .eq('id', settings.greeting_template_id)
              .maybeSingle();
            templateToUse = selectedTemplate;
          }

          // 2. Fallback to default greeting template if no specific one selected
          if (!templateToUse) {
            const { data: defaultTemplate } = await supabaseAdmin
              .from('message_templates')
              .select('content')
              .eq('business_id', businessId)
              .eq('category', 'greeting')
              .eq('is_default', true)
              .eq('is_active', true)
              .maybeSingle();
            templateToUse = defaultTemplate;
          }
          
          if (templateToUse) {
            greeting = templateToUse.content.replace(/{{lead_name}}/g, senderName || "there");
          }

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
