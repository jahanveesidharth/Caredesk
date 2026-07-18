-- RLS Verification Script for CareDesk Multi-Tenant Platform

-- 1. Setup Mock Tenants
INSERT INTO public.tenants (id, name, subdomain, status)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'St. Mary General Hospital', 'stmary', 'active'),
  ('22222222-2222-2222-2222-222222222222', 'Apex Dental Care', 'apexdental', 'active')
ON CONFLICT (subdomain) DO NOTHING;

-- 2. Setup Mock Auth Users
-- Since auth.users is managed by GoTrue, we can mock user insertion in standard setups for test suites:
INSERT INTO auth.users (id, email, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'doctor@stmary.com', '{"tenant_id": "11111111-1111-1111-1111-111111111111", "role": "doctor"}', '{"first_name": "Alexander", "last_name": "House"}'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'doctor@apexdental.com', '{"tenant_id": "22222222-2222-2222-2222-222222222222", "role": "doctor"}', '{"first_name": "Apex", "last_name": "Dentist"}')
ON CONFLICT (id) DO NOTHING;

-- NOTE: The handle_new_user_signup trigger on auth.users will automatically 
-- create corresponding records inside public.profiles with the appropriate tenant_id and role!

-- 3. Verify public.profiles isolation
-- Let's simulate Dr. House (Tenant 1) making a select request:
-- In Supabase/Postgres, we simulate JWT claim extraction by setting config options in the transaction:
BEGIN;
  -- Set transaction settings to simulate St. Mary General Hospital doctor:
  SET LOCAL app.current_tenant_id = '11111111-1111-1111-1111-111111111111';
  SET LOCAL role = 'authenticated';
  
  -- We query profiles:
  SELECT 'Profile query (Tenant 1)' AS test_run, id, first_name, role FROM public.profiles;
  -- Should only return profiles where tenant_id = '11111111-1111-1111-1111-111111111111'
COMMIT;

BEGIN;
  -- Set transaction settings to simulate Apex Dental Care doctor:
  SET LOCAL app.current_tenant_id = '22222222-2222-2222-2222-222222222222';
  SET LOCAL role = 'authenticated';
  
  -- We query profiles:
  SELECT 'Profile query (Tenant 2)' AS test_run, id, first_name, role FROM public.profiles;
  -- Should only return profiles where tenant_id = '22222222-2222-2222-2222-222222222222'
COMMIT;
