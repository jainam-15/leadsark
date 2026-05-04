-- Migration v3: Flexible Message Templates and Automation Flows

-- 1. Message Templates Table
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('greeting', 'reply', 'followup', 'closing')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Automation Flows Table
CREATE TABLE IF NOT EXISTS automation_flows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  step_name TEXT NOT NULL,
  trigger_condition TEXT, -- keyword or state
  reply_template_id UUID REFERENCES message_templates(id) ON DELETE SET NULL,
  next_step TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Update Settings Table
ALTER TABLE settings
ADD COLUMN IF NOT EXISTS greeting_template_id UUID REFERENCES message_templates(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS followup_template_id UUID REFERENCES message_templates(id) ON DELETE SET NULL;

-- 4. RLS Policies
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_flows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view templates" ON message_templates FOR SELECT USING (business_id = get_user_business_id());
CREATE POLICY "Users can insert templates" ON message_templates FOR INSERT WITH CHECK (business_id = get_user_business_id());
CREATE POLICY "Users can update templates" ON message_templates FOR UPDATE USING (business_id = get_user_business_id());
CREATE POLICY "Users can delete templates" ON message_templates FOR DELETE USING (business_id = get_user_business_id());

CREATE POLICY "Users can view flows" ON automation_flows FOR SELECT USING (business_id = get_user_business_id());
CREATE POLICY "Users can insert flows" ON automation_flows FOR INSERT WITH CHECK (business_id = get_user_business_id());
CREATE POLICY "Users can update flows" ON automation_flows FOR UPDATE USING (business_id = get_user_business_id());
CREATE POLICY "Users can delete flows" ON automation_flows FOR DELETE USING (business_id = get_user_business_id());
