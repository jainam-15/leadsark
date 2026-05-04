-- Migration: Improve WhatsApp Auto-Reply System

-- 1. Update Leads Table
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_personal BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS automation_paused BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS conversation_state TEXT DEFAULT 'new';

-- 2. Update Settings Table
-- First, define the auto_reply_mode enum-like behavior using text check constraint
ALTER TABLE settings
ADD COLUMN IF NOT EXISTS auto_reply_mode TEXT DEFAULT 'new_leads_only' 
CHECK (auto_reply_mode IN ('new_leads_only', 'all_messages', 'disabled')),
ADD COLUMN IF NOT EXISTS working_hours_start TIME DEFAULT '09:00',
ADD COLUMN IF NOT EXISTS working_hours_end TIME DEFAULT '18:00';

-- 3. Update existing data if necessary (optional)
UPDATE settings SET auto_reply_mode = 'all_messages' WHERE auto_reply = true AND auto_reply_mode IS NULL;
UPDATE settings SET auto_reply_mode = 'disabled' WHERE auto_reply = false AND auto_reply_mode IS NULL;
