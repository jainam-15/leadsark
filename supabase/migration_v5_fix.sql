-- Migration v5.1: Fix Followups table mismatch
-- Rename columns if they exist from the old schema

DO $$ 
BEGIN
    -- Rename due_date to scheduled_at
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'followups' AND column_name = 'due_date') THEN
        ALTER TABLE followups RENAME COLUMN due_date TO scheduled_at;
    END IF;

    -- Rename completed to status (with conversion)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'followups' AND column_name = 'completed') THEN
        ALTER TABLE followups ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
        UPDATE followups SET status = 'sent' WHERE completed = true;
        UPDATE followups SET status = 'pending' WHERE completed = false;
        ALTER TABLE followups DROP COLUMN completed;
    END IF;

    -- Add message_template_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'followups' AND column_name = 'message_template_id') THEN
        ALTER TABLE followups ADD COLUMN message_template_id UUID REFERENCES message_templates(id) ON DELETE SET NULL;
    END IF;

    -- Add sent_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'followups' AND column_name = 'sent_at') THEN
        ALTER TABLE followups ADD COLUMN sent_at TIMESTAMPTZ;
    END IF;

    -- Remove 'task' column if it exists (we use templates now)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'followups' AND column_name = 'task') THEN
        ALTER TABLE followups DROP COLUMN task;
    END IF;
END $$;
