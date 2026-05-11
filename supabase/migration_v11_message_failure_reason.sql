-- Migration: Add failure_reason to messages table and last_incoming_at to leads
ALTER TABLE messages ADD COLUMN IF NOT EXISTS failure_reason TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_incoming_at TIMESTAMPTZ;
