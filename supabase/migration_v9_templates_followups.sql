-- Migration: Complete Phase 2C - Custom Templates + Follow-up System

-- 1. Update message_templates table
ALTER TABLE message_templates 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS variables JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing rows if any to have a category if missing
UPDATE message_templates SET category = type WHERE category IS NULL;

-- 2. Update followups table
ALTER TABLE followups ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE followups ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE followups ADD COLUMN IF NOT EXISTS send_mode TEXT DEFAULT 'manual' CHECK (send_mode IN ('manual', 'automatic'));
ALTER TABLE followups ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;

-- Safely rename column if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='followups' AND column_name='message_template_id') THEN
    ALTER TABLE followups RENAME COLUMN message_template_id TO template_id;
  END IF;
END $$;

-- Update status check constraint for followups
ALTER TABLE followups DROP CONSTRAINT IF EXISTS followups_status_check;
ALTER TABLE followups ADD CONSTRAINT followups_status_check CHECK (status IN ('pending', 'completed', 'skipped', 'sent', 'failed'));

-- 3. Update leads table (ensure last_message_at is there, though it should be)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ;

-- 4. Update settings table
ALTER TABLE settings ADD COLUMN IF NOT EXISTS greeting_message TEXT;

-- 5. RLS Policies for the updated fields (should be covered by existing policies but good to verify)
-- Existing policies use business_id = get_user_business_id() which is correct for multi-tenancy.

-- Ensure only one default template per business per category if needed, 
-- but for now let's just keep it simple as per requirements.
