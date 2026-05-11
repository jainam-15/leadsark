-- Migration: Add failure_reason to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS failure_reason TEXT;
