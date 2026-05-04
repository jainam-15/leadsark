-- Migration v4: Intelligent Lead Scoring and Status

-- 1. Update Leads Table
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_manual_status BOOLEAN DEFAULT false;

-- 2. Index for performance
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(lead_score);
