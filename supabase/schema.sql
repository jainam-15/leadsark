-- LeadsArk Hardened Production Schema
-- Multi-tenant WhatsApp CRM SaaS

-- ==========================================
-- 0. EXTENSIONS & SETUP
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. UTILITY FUNCTIONS
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ==========================================
-- 2. TABLES
-- ==========================================

-- Businesses
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID, -- References profiles(id)
  name TEXT NOT NULL,
  industry TEXT,
  phone TEXT,
  email TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  full_name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fix Business FK
ALTER TABLE businesses DROP CONSTRAINT IF EXISTS businesses_owner_id_fkey;
ALTER TABLE businesses ADD CONSTRAINT businesses_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Business Members
CREATE TABLE IF NOT EXISTS business_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'staff' CHECK (role IN ('owner', 'manager', 'staff')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, user_id)
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'growth', 'pro')),
  status TEXT DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'expired', 'cancelled', 'suspended')),
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  grace_until TIMESTAMPTZ,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- WhatsApp Connections
CREATE TABLE IF NOT EXISTS whatsapp_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
  provider TEXT DEFAULT 'meta_cloud_api',
  phone_number_id TEXT,
  whatsapp_business_account_id TEXT,
  connected_phone TEXT,
  webhook_status TEXT,
  status TEXT DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- WhatsApp Secrets
CREATE TABLE IF NOT EXISTS whatsapp_secrets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
  access_token TEXT,
  verify_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  whatsapp_phone TEXT,
  email TEXT,
  company TEXT,
  requirement TEXT,
  budget TEXT,
  urgency TEXT,
  status TEXT DEFAULT 'Cold' CHECK (status IN ('Hot', 'Warm', 'Cold', 'Converted', 'Lost')),
  lead_score INTEGER DEFAULT 0,
  conversation_state TEXT DEFAULT 'new',
  automation_paused BOOLEAN DEFAULT false,
  is_blocked BOOLEAN DEFAULT false,
  is_personal BOOLEAN DEFAULT false,
  source TEXT DEFAULT 'WhatsApp',
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  whatsapp_message_id TEXT UNIQUE,
  direction TEXT CHECK (direction IN ('incoming', 'outgoing')),
  message_type TEXT DEFAULT 'text',
  content TEXT,
  status TEXT DEFAULT 'sent',
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notes
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message Templates
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('greeting', 'reply', 'followup', 'closing')),
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Follow-ups
CREATE TABLE IF NOT EXISTS followups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'skipped', 'completed')),
  message_template_id UUID REFERENCES message_templates(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
  auto_reply_enabled BOOLEAN DEFAULT true,
  auto_reply_mode TEXT DEFAULT 'new_leads_only' CHECK (auto_reply_mode IN ('new_leads_only', 'all_messages', 'disabled')),
  followup_mode TEXT DEFAULT 'suggest_with_approval' CHECK (followup_mode IN ('manual', 'suggest_with_approval', 'automatic')),
  working_hours_start TEXT DEFAULT '09:00',
  working_hours_end TEXT DEFAULT '18:00',
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. SECURE HELPER FUNCTIONS
-- ==========================================

CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN AS $$
  SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION get_user_business_id() 
RETURNS UUID AS $$
  SELECT business_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- ==========================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS for all tables
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('profiles', 'businesses', 'business_members', 'subscriptions', 'whatsapp_connections', 'whatsapp_secrets', 'leads', 'messages', 'notes', 'message_templates', 'followups', 'settings', 'audit_logs')
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    END LOOP;
END $$;

-- 4a. Profiles (NON-RECURSIVE)
DO $$ BEGIN
    DROP POLICY IF EXISTS "Profiles SELECT" ON profiles;
    DROP POLICY IF EXISTS "Profiles SELECT SELF" ON profiles;
    DROP POLICY IF EXISTS "Profiles INSERT SELF" ON profiles;
    DROP POLICY IF EXISTS "Profiles UPDATE SELF" ON profiles;
END $$;

CREATE POLICY "Profiles SELECT SELF" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Profiles INSERT SELF" ON profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "Profiles UPDATE SELF" ON profiles FOR UPDATE USING (id = auth.uid());

-- 4b. Businesses
DO $$ BEGIN
    DROP POLICY IF EXISTS "Businesses SELECT" ON businesses;
    DROP POLICY IF EXISTS "Businesses INSERT" ON businesses;
    DROP POLICY IF EXISTS "Businesses UPDATE" ON businesses;
END $$;
CREATE POLICY "Businesses SELECT" ON businesses FOR SELECT USING (id = get_user_business_id() OR owner_id = auth.uid() OR is_admin());
CREATE POLICY "Businesses INSERT" ON businesses FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Businesses UPDATE" ON businesses FOR UPDATE USING (owner_id = auth.uid() OR is_admin());

-- Multi-tenant safety
CREATE POLICY "Leads SELECT" ON leads FOR SELECT USING (business_id = get_user_business_id() OR is_admin());
CREATE POLICY "Leads ALL" ON leads FOR ALL USING (business_id = get_user_business_id() OR is_admin());

CREATE POLICY "Messages SELECT" ON messages FOR SELECT USING (business_id = get_user_business_id() OR is_admin());
CREATE POLICY "Messages INSERT" ON messages FOR INSERT WITH CHECK (business_id = get_user_business_id() OR is_admin());

CREATE POLICY "Settings SELECT" ON settings FOR SELECT USING (business_id = get_user_business_id() OR is_admin());
CREATE POLICY "Settings ALL" ON settings FOR ALL USING (business_id = get_user_business_id() OR is_admin());

-- ==========================================
-- 5. TRIGGERS
-- ==========================================
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('profiles', 'businesses', 'subscriptions', 'whatsapp_connections', 'whatsapp_secrets', 'leads', 'followups', 'message_templates', 'settings')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS tr_update_%I_modtime ON %I', t, t);
        EXECUTE format('CREATE TRIGGER tr_update_%I_modtime BEFORE UPDATE ON %I FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column()', t, t);
    END LOOP;
END $$;
