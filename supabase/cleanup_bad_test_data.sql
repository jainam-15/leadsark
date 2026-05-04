-- Cleanup script for bad test data in LeadsArk
-- Run this to identify and optionally remove orphan/duplicate records

-- 1. Businesses with NULL owner_id
-- These are broken as every business must have an owner profile.
SELECT * FROM businesses WHERE owner_id IS NULL;

-- 2. Duplicate businesses for the same owner_id
-- Each user should have exactly one business in Phase 1.
SELECT owner_id, COUNT(*) 
FROM businesses 
GROUP BY owner_id 
HAVING COUNT(*) > 1;

-- 3. Subscriptions without business_id (Orphaned)
SELECT * FROM subscriptions WHERE business_id IS NULL;

-- 4. Profiles without business_id (Excluding Admins)
-- Note: Admins may not have a business_id if they only manage the system.
SELECT * FROM profiles WHERE business_id IS NULL AND role != 'admin';

-- ==========================================
-- OPTIONAL CLEANUP COMMANDS (COMMENTED OUT)
-- ==========================================

/*
-- Delete businesses with no owner
-- DELETE FROM businesses WHERE owner_id IS NULL;

-- Delete orphaned subscriptions
-- DELETE FROM subscriptions WHERE business_id IS NULL;

-- Delete orphaned settings
-- DELETE FROM settings WHERE business_id IS NULL;
*/
