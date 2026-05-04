-- Migration v5: Smart Follow-up System

-- 1. Followup Mode Type
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'followup_mode') THEN
        CREATE TYPE followup_mode AS ENUM ('manual', 'suggest_with_approval', 'automatic');
    END IF;
END $$;

-- 2. Update Settings Table
ALTER TABLE settings
ADD COLUMN IF NOT EXISTS followup_mode followup_mode DEFAULT 'suggest_with_approval';

-- 3. Followups Table
CREATE TABLE IF NOT EXISTS followups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'skipped')),
  message_template_id UUID REFERENCES message_templates(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

-- 4. RLS Policies
ALTER TABLE followups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view followups" ON followups FOR SELECT USING (business_id = get_user_business_id());
CREATE POLICY "Users can insert followups" ON followups FOR INSERT WITH CHECK (business_id = get_user_business_id());
CREATE POLICY "Users can update followups" ON followups FOR UPDATE USING (business_id = get_user_business_id());
CREATE POLICY "Users can delete followups" ON followups FOR DELETE USING (business_id = get_user_business_id());

-- 5. Add last_replied_at to leads for inactivity tracking
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS last_replied_at TIMESTAMPTZ DEFAULT NOW();
