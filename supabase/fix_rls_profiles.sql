-- Fix RLS Recursion for Profiles
-- Run this in Supabase SQL Editor

-- 1. Drop existing recursive policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Profiles SELECT" ON profiles;
    DROP POLICY IF EXISTS "Profiles SELECT OWN" ON profiles;
    DROP POLICY IF EXISTS "Profiles SELECT BUSINESS" ON profiles;
    DROP POLICY IF EXISTS "Profiles SELECT ADMIN" ON profiles;
    DROP POLICY IF EXISTS "Profiles INSERT" ON profiles;
    DROP POLICY IF EXISTS "Profiles UPDATE" ON profiles;
END $$;

-- 2. Create ultra-simple, non-recursive policies
-- Users can only see/edit THEIR OWN row on the frontend
CREATE POLICY "Profiles SELECT SELF" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Profiles INSERT SELF" ON profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "Profiles UPDATE SELF" ON profiles FOR UPDATE USING (id = auth.uid());

-- 3. Update helper functions to be safer
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN AS $$
  -- This query bypasses RLS because it's SECURITY DEFINER
  SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION get_user_business_id() 
RETURNS UUID AS $$
  -- This query bypasses RLS because it's SECURITY DEFINER
  SELECT business_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;
