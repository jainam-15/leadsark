-- Migration: Add greeting_template_id to settings table
ALTER TABLE settings ADD COLUMN IF NOT EXISTS greeting_template_id UUID REFERENCES message_templates(id) ON DELETE SET NULL;
