-- Migration V8: Database Integrity and Settings
-- 1. Add unique constraint to leads to prevent duplicates for same business + phone
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_business_id_whatsapp_phone_key;
ALTER TABLE leads ADD CONSTRAINT leads_business_id_whatsapp_phone_key UNIQUE (business_id, whatsapp_phone);

-- 2. Add greeting_message to settings
ALTER TABLE settings ADD COLUMN IF NOT EXISTS greeting_message TEXT DEFAULT 'Hello! Thanks for reaching out to us. How can we help you today?';

-- 3. Ensure messages whatsapp_message_id is unique (already is in schema, but being safe)
-- ALTER TABLE messages ADD CONSTRAINT messages_whatsapp_message_id_key UNIQUE (whatsapp_message_id);
