import { supabase } from './supabase';
import { checkSubscription } from './subscriptions';

export interface AutoReplyConfig {
  enabled: boolean;
  mode: 'new_leads_only' | 'all_messages' | 'disabled';
  workingHoursStart: string; // "HH:MM"
  workingHoursEnd: string;   // "HH:MM"
}

export interface LeadAutomationState {
  isBlocked: boolean;
  isPersonal: boolean;
  automationPaused: boolean;
  conversationState: string;
}

/**
 * Replaces dynamic variables in message content
 */
function replaceVariables(content: string, leadName: string, businessName: string): string {
  return content
    .replace(/{{name}}/g, leadName)
    .replace(/{{business_name}}/g, businessName);
}

/**
 * Safe Auto-reply Engine (v2 - Flexible Templates)
 */
export async function shouldTriggerAutoReply(
  businessId: string,
  phoneNumber: string,
  messageText: string
): Promise<{ shouldReply: boolean; reason: string; replyText?: string }> {
  
  // 0. Check Subscription
  const sub = await checkSubscription(businessId);
  if (!sub.isActive) {
    return { shouldReply: false, reason: 'Subscription inactive' };
  }

  if (!supabase) return { shouldReply: false, reason: 'Supabase not configured' };

  // 1. Fetch Business Settings & Business Name
  const { data: bizData, error: bError } = await supabase!
    .from('businesses')
    .select('name, settings!inner(*)')
    .eq('id', businessId)
    .single();

  if (bError || !bizData) return { shouldReply: false, reason: 'Business or Settings not found' };
  
  const settings = bizData.settings as any;
  const businessName = bizData.name;

  const config: AutoReplyConfig = {
    enabled: settings.auto_reply,
    mode: settings.auto_reply_mode || 'new_leads_only',
    workingHoursStart: settings.working_hours_start || '09:00',
    workingHoursEnd: settings.working_hours_end || '18:00'
  };

  if (!config.enabled || config.mode === 'disabled') {
    return { shouldReply: false, reason: 'Auto-reply disabled in settings' };
  }

  // 2. Check Working Hours
  const now = new Date();
  const currentLocalTime = now.getHours() * 60 + now.getMinutes();
  const [startH, startM] = config.workingHoursStart.split(':').map(Number);
  const [endH, endM] = config.workingHoursEnd.split(':').map(Number);
  const isOutsideWorkingHours = currentLocalTime < (startH * 60 + startM) || currentLocalTime > (endH * 60 + endM);

  // 3. Find or Create Lead
  let { data: lead } = await supabase!
    .from('leads')
    .select('id, name, is_blocked, is_personal, automation_paused, conversation_state')
    .eq('business_id', businessId)
    .eq('phone', phoneNumber)
    .single();

  if (!lead) {
    // New lead logic...
    // In a real scenario, the lead would be created here.
    return { shouldReply: false, reason: 'Lead not found (expected to be created by webhook)' };
  }

  // 4. Privacy & Manual Overrides
  if (lead.is_blocked) return { shouldReply: false, reason: 'Lead is blocked' };
  if (lead.is_personal) return { shouldReply: false, reason: 'Lead is personal' };
  if (lead.automation_paused) return { shouldReply: false, reason: 'Automation paused' };

  // 5. Pick Template
  let templateId = settings.greeting_template_id;
  
  // If not a new lead, try to find a flow-based template
  if (lead.conversation_state !== 'new') {
    if (config.mode === 'new_leads_only') {
      return { shouldReply: false, reason: 'Mode is new_leads_only' };
    }

    const { data: flowStep } = await supabase!
      .from('automation_flows')
      .select('reply_template_id, next_step')
      .eq('business_id', businessId)
      .eq('step_name', lead.conversation_state)
      .single();

    if (flowStep?.reply_template_id) {
      templateId = flowStep.reply_template_id;
    } else {
      // Fallback: check if message matches a specific flow trigger
      const { data: triggeredFlow } = await supabase!
        .from('automation_flows')
        .select('reply_template_id, next_step')
        .eq('business_id', businessId)
        .eq('trigger_condition', messageText.toLowerCase())
        .single();
      
      if (triggeredFlow) {
        templateId = triggeredFlow.reply_template_id;
      } else {
        return { shouldReply: false, reason: 'No matching flow step or greeting found' };
      }
    }
  }

  if (!templateId) {
    return { shouldReply: false, reason: 'No template ID configured for this state' };
  }

  // 6. Fetch Template Content
  const { data: template } = await supabase!
    .from('message_templates')
    .select('content')
    .eq('id', templateId)
    .single();

  if (!template) return { shouldReply: false, reason: 'Template not found' };

  // 7. Handle Working Hours Fallback
  if (isOutsideWorkingHours) {
    return { 
      shouldReply: true, 
      reason: 'Outside working hours', 
      replyText: 'Thanks for reaching out. We will respond during business hours.' 
    };
  }

  // 8. Final Reply with Variables
  const finalMessage = replaceVariables(template.content, lead.name, businessName);

  return { 
    shouldReply: true, 
    reason: 'Success', 
    replyText: finalMessage 
  };
}

/**
 * Updates lead conversation state after a reply is sent
 */
export async function markLeadAsReplied(leadId: string) {
  if (!supabase) return;
  await supabase!
    .from('leads')
    .update({ conversation_state: 'replied', updated_at: new Date().toISOString() })
    .eq('id', leadId);
}
