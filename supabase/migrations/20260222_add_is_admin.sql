-- =========================================================
-- HeartPath: Add is_admin column & set admin user
-- Run this in Supabase Dashboard → SQL Editor
-- =========================================================

-- 1. Add is_admin column to profiles (safe, idempotent)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Grant admin to cenk.yakinlar@hotmail.com
UPDATE public.profiles
SET is_admin = TRUE
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'cenk.yakinlar@hotmail.com'
);

-- 3. Verify result
SELECT p.id, u.email, p.full_name, p.role, p.is_admin
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email IN ('cenk.yakinlar@hotmail.com', 'info@voon.fi');
