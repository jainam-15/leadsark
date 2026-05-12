-- Phase 3A: Multi-Agent CRM + Sales Pipeline

-- ==========================================
-- 1. TEAM MANAGEMENT
-- ==========================================

-- Team Members
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'agent' CHECK (role IN ('owner', 'admin', 'agent')),
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, user_id)
);

-- Sync existing owners to team_members
INSERT INTO team_members (business_id, user_id, role, display_name)
SELECT 
    b.id as business_id, 
    b.owner_id as user_id, 
    'owner' as role, 
    COALESCE(p.full_name, 'Owner') as display_name
FROM businesses b
JOIN profiles p ON b.owner_id = p.id
ON CONFLICT (business_id, user_id) DO NOTHING;

-- Invitations
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'agent' CHECK (role IN ('admin', 'agent')),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 2. LEAD ASSIGNMENT & PIPELINE
-- ==========================================

-- Enhance Leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS pipeline_stage TEXT DEFAULT 'New' CHECK (pipeline_stage IN ('New', 'Contacted', 'Interested', 'Qualified', 'Proposal', 'Won', 'Lost'));
ALTER TABLE leads ADD COLUMN IF NOT EXISTS pipeline_updated_at TIMESTAMPTZ DEFAULT NOW();

-- ==========================================
-- 3. TIMELINE & NOTES
-- ==========================================

-- Lead Notes
CREATE TABLE IF NOT EXISTS lead_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lead Activities
CREATE TABLE IF NOT EXISTS lead_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 4. NOTIFICATIONS
-- ==========================================

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 5. RLS POLICIES
-- ==========================================

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper function for role
CREATE OR REPLACE FUNCTION get_user_role() 
RETURNS TEXT AS $$
DECLARE
  v_role TEXT;
BEGIN
  -- 1. Check team_members
  SELECT role INTO v_role FROM public.team_members WHERE user_id = auth.uid() LIMIT 1;
  
  -- 2. Fallback to business owner check
  IF v_role IS NULL THEN
    IF EXISTS (SELECT 1 FROM public.businesses WHERE owner_id = auth.uid()) THEN
      v_role := 'owner';
    END IF;
  END IF;
  
  RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Team Members Policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Team Members SELECT" ON team_members;
    DROP POLICY IF EXISTS "Team Members ALL (Admin/Owner)" ON team_members;
END $$;

CREATE POLICY "Team Members SELECT" ON team_members FOR SELECT USING (
    business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Team Members ALL (Admin/Owner)" ON team_members FOR ALL USING (
    business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid())
    AND (
        EXISTS (SELECT 1 FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
        OR EXISTS (SELECT 1 FROM businesses WHERE id = team_members.business_id AND owner_id = auth.uid())
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
);

-- Invitations Policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Invitations SELECT" ON invitations;
    DROP POLICY IF EXISTS "Invitations ALL (Admin/Owner)" ON invitations;
END $$;

CREATE POLICY "Invitations SELECT" ON invitations FOR SELECT USING (
    business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Invitations ALL (Admin/Owner)" ON invitations FOR ALL USING (
    business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid())
    AND (
        EXISTS (SELECT 1 FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
        OR EXISTS (SELECT 1 FROM businesses WHERE id = invitations.business_id AND owner_id = auth.uid())
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
);

-- Lead Notes Policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Lead Notes SELECT" ON lead_notes;
    DROP POLICY IF EXISTS "Lead Notes INSERT" ON lead_notes;
END $$;

CREATE POLICY "Lead Notes SELECT" ON lead_notes FOR SELECT USING (business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Lead Notes INSERT" ON lead_notes FOR INSERT WITH CHECK (business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()));

-- Lead Activities Policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Lead Activities SELECT" ON lead_activities;
END $$;

CREATE POLICY "Lead Activities SELECT" ON lead_activities FOR SELECT USING (business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()));

-- Notifications Policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Notifications SELECT" ON notifications;
    DROP POLICY IF EXISTS "Notifications UPDATE" ON notifications;
END $$;

CREATE POLICY "Notifications SELECT" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Notifications UPDATE" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- Refine Leads RLS
DROP POLICY IF EXISTS "Leads SELECT" ON leads;
DROP POLICY IF EXISTS "Leads ALL" ON leads;

CREATE POLICY "Leads SELECT" ON leads FOR SELECT USING (
  business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()) AND (
    get_user_role() IN ('owner', 'admin') 
    OR assigned_to = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
);

CREATE POLICY "Leads ALL" ON leads FOR ALL USING (
  business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()) AND (
    get_user_role() IN ('owner', 'admin') 
    OR assigned_to = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
);

-- Refine Messages RLS
DROP POLICY IF EXISTS "Messages SELECT" ON messages;
CREATE POLICY "Messages SELECT" ON messages FOR SELECT USING (
  business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()) AND (
    get_user_role() IN ('owner', 'admin')
    OR EXISTS (SELECT 1 FROM leads WHERE id = messages.lead_id AND (assigned_to = auth.uid()))
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
);

-- Refine Followups RLS
DROP POLICY IF EXISTS "Followups SELECT" ON followups;
CREATE POLICY "Followups SELECT" ON followups FOR SELECT USING (
  business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()) AND (
    get_user_role() IN ('owner', 'admin')
    OR EXISTS (SELECT 1 FROM leads WHERE id = followups.lead_id AND (assigned_to = auth.uid()))
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
);

-- ==========================================
-- 6. AUTOMATION (Lead Activity Log)
-- ==========================================

-- Function to log activity on lead update
CREATE OR REPLACE FUNCTION log_lead_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Log assignment change
    IF (OLD.assigned_to IS DISTINCT FROM NEW.assigned_to) THEN
        INSERT INTO lead_activities (business_id, lead_id, activity_type, description, metadata)
        VALUES (NEW.business_id, NEW.id, 'assignment', 
                CASE 
                    WHEN NEW.assigned_to IS NULL THEN 'Lead unassigned'
                    ELSE 'Lead assigned to ' || (SELECT full_name FROM profiles WHERE id = NEW.assigned_to)
                END,
                jsonb_build_object('old_assigned_to', OLD.assigned_to, 'new_assigned_to', NEW.assigned_to));
    END IF;

    -- Log stage change
    IF (OLD.pipeline_stage IS DISTINCT FROM NEW.pipeline_stage) THEN
        INSERT INTO lead_activities (business_id, lead_id, activity_type, description, metadata)
        VALUES (NEW.business_id, NEW.id, 'stage_change', 
                'Stage changed from ' || OLD.pipeline_stage || ' to ' || NEW.pipeline_stage,
                jsonb_build_object('old_stage', OLD.pipeline_stage, 'new_stage', NEW.pipeline_stage));
        NEW.pipeline_updated_at = NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_log_lead_activity ON leads;
CREATE TRIGGER tr_log_lead_activity
AFTER UPDATE ON leads
FOR EACH ROW EXECUTE PROCEDURE log_lead_activity();

-- ==========================================
-- 7. NOTIFICATIONS TRIGGERS
-- ==========================================

-- Trigger for notification on lead assignment
CREATE OR REPLACE FUNCTION notify_on_lead_assignment()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.assigned_to IS NOT NULL AND (OLD.assigned_to IS NULL OR OLD.assigned_to != NEW.assigned_to)) THEN
        INSERT INTO notifications (business_id, user_id, title, message, type, link)
        VALUES (
            NEW.business_id, 
            NEW.assigned_to, 
            'New Lead Assigned', 
            'Lead ' || NEW.name || ' has been assigned to you.', 
            'lead_assigned', 
            '/leads?id=' || NEW.id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_notify_on_lead_assignment ON leads;
CREATE TRIGGER tr_notify_on_lead_assignment
AFTER UPDATE ON leads
FOR EACH ROW EXECUTE PROCEDURE notify_on_lead_assignment();

-- Trigger for notification on new incoming message
CREATE OR REPLACE FUNCTION notify_on_new_message()
RETURNS TRIGGER AS $$
DECLARE
    v_assigned_to UUID;
    v_lead_name TEXT;
BEGIN
    IF (NEW.direction = 'incoming') THEN
        SELECT assigned_to, name INTO v_assigned_to, v_lead_name FROM leads WHERE id = NEW.lead_id;
        
        IF (v_assigned_to IS NOT NULL) THEN
            INSERT INTO notifications (business_id, user_id, title, message, type, link)
            VALUES (
                NEW.business_id, 
                v_assigned_to, 
                'New Message from ' || v_lead_name, 
                substring(NEW.content from 1 for 50), 
                'new_message', 
                '/leads?id=' || NEW.lead_id
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_notify_on_new_message ON messages;
CREATE TRIGGER tr_notify_on_new_message
AFTER INSERT ON messages
FOR EACH ROW EXECUTE PROCEDURE notify_on_new_message();
