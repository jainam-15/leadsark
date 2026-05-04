-- Phase 2: WhatsApp RLS Policies
-- Enables businesses to see their own connection status but keeps secrets hidden from client.

-- 1. WhatsApp Connections
DROP POLICY IF EXISTS "Connections SELECT" ON whatsapp_connections;
DROP POLICY IF EXISTS "Connections ALL" ON whatsapp_connections;

CREATE POLICY "Connections SELECT" ON whatsapp_connections 
FOR SELECT USING (business_id = get_user_business_id() OR is_admin());

-- 2. WhatsApp Secrets
-- Strictly denied to non-admin service roles. 
-- Even the business owner shouldn't see these via the client API.
ALTER TABLE whatsapp_secrets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Secrets DENY ALL" ON whatsapp_secrets;
CREATE POLICY "Secrets DENY ALL" ON whatsapp_secrets FOR ALL USING (false);
