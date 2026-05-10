-- Migration: Fix RLS for Message Templates and Followups
-- These tables were created/updated but policies were missing, blocking all access.

-- 1. Message Templates Policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Templates SELECT" ON message_templates;
    DROP POLICY IF EXISTS "Templates ALL" ON message_templates;
END $$;

CREATE POLICY "Templates SELECT" ON message_templates FOR SELECT USING (business_id = get_user_business_id() OR is_admin());
CREATE POLICY "Templates ALL" ON message_templates FOR ALL USING (business_id = get_user_business_id() OR is_admin());

-- 2. Followups Policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Followups SELECT" ON followups;
    DROP POLICY IF EXISTS "Followups ALL" ON followups;
END $$;

CREATE POLICY "Followups SELECT" ON followups FOR SELECT USING (business_id = get_user_business_id() OR is_admin());
CREATE POLICY "Followups ALL" ON followups FOR ALL USING (business_id = get_user_business_id() OR is_admin());

-- 3. Notes Policies (if missing)
DO $$ BEGIN
    DROP POLICY IF EXISTS "Notes SELECT" ON notes;
    DROP POLICY IF EXISTS "Notes ALL" ON notes;
END $$;

CREATE POLICY "Notes SELECT" ON notes FOR SELECT USING (business_id = get_user_business_id() OR is_admin());
CREATE POLICY "Notes ALL" ON notes FOR ALL USING (business_id = get_user_business_id() OR is_admin());
