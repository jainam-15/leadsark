
/**
 * WhatsApp Cloud API Helper for LeadsArk
 * Handles communication with Meta Graph API
 */

interface SendMessageOptions {
  accessToken: string;
  phoneNumberId: string;
  to: string;
  message: string;
}

export async function sendWhatsAppMessage({
  accessToken,
  phoneNumberId,
  to,
  message
}: SendMessageOptions) {
  const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'text',
        text: { body: message }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[WhatsApp SDK] Send failed:", data);
      return { success: false, error: data.error?.message || "Failed to send message" };
    }

    return { success: true, messageId: data.messages?.[0]?.id };
  } catch (error: any) {
    console.error("[WhatsApp SDK] Critical error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Parses the complex Meta Webhook payload to extract key information
 */
export function parseWhatsAppPayload(body: any) {
  try {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];
    const contact = value?.contacts?.[0];

    if (!message) return null;

    return {
      phoneNumberId: value.metadata?.phone_number_id,
      displayPhoneNumber: value.metadata?.display_phone_number,
      senderName: contact?.profile?.name || "Unknown",
      senderPhone: message.from,
      messageId: message.id,
      timestamp: message.timestamp,
      type: message.type,
      text: message.text?.body || "",
      raw: body
    };
  } catch (err) {
    console.error("[WhatsApp SDK] Parse error:", err);
    return null;
  }
}
