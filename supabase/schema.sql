-- SQL Schema for CareDesk Multi-Tenant Healthcare SaaS Platform

-- Enums
CREATE TYPE user_role AS ENUM (
  'super_admin',
  'hospital_admin',
  'doctor',
  'nurse',
  'receptionist',
  'cashier',
  'pharmacist',
  'lab_technician',
  'radiologist',
  'inventory_manager',
  'hr',
  'patient'
);

-- Safe when upgrading a database created by an earlier CareDesk migration.
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'patient';

CREATE TYPE tenant_status AS ENUM (
  'active',
  'suspended',
  'pending'
);

-- 1. tenants Table
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(63) UNIQUE,
  status tenant_status NOT NULL DEFAULT 'pending',
  logo_url TEXT,
  address TEXT,
  contact_number VARCHAR(20),
  billing_email VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tenants_status ON public.tenants(status);

-- 2. profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE RESTRICT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role user_role NOT NULL,
  department VARCHAR(100),
  is_active BOOLEAN NOT NULL DEFAULT true,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_tenant ON public.profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 3. audit_logs Table (Compliance auditing)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE RESTRICT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON public.audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper functions for JWT claims extraction
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
  SELECT COALESCE(
    (current_setting('app.current_tenant_id', true))::uuid,
    (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role AS $$
  SELECT (auth.jwt() -> 'app_metadata' ->> 'role')::user_role;
$$ LANGUAGE sql SECURITY DEFINER;

-- RLS Policies

-- Tenants
CREATE POLICY "Super Admins can read/write all tenants" ON public.tenants
  FOR ALL TO authenticated
  USING (get_current_user_role() = 'super_admin');

CREATE POLICY "Users can view their own tenant profile" ON public.tenants
  FOR SELECT TO authenticated
  USING (id = get_current_tenant_id());

CREATE POLICY "Hospital Admins can update their own tenant settings" ON public.tenants
  FOR UPDATE TO authenticated
  USING (id = get_current_tenant_id() AND get_current_user_role() = 'hospital_admin');

-- Profiles
CREATE POLICY "Super Admins can read all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (get_current_user_role() = 'super_admin');

CREATE POLICY "Tenant isolation for profiles" ON public.profiles
  FOR ALL TO authenticated
  USING (tenant_id = get_current_tenant_id());

-- Audit Logs
CREATE POLICY "Tenant isolation for audit logs" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Write policy for audit logs" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = get_current_tenant_id());

-- Automatically insert profile row when a user is created via Supabase Auth
CREATE OR REPLACE FUNCTION handle_new_user_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, tenant_id, first_name, last_name, role, is_active)
  VALUES (
    new.id,
    (new.raw_app_meta_data ->> 'tenant_id')::uuid,
    COALESCE(new.raw_user_meta_data ->> 'first_name', 'First'),
    COALESCE(new.raw_user_meta_data ->> 'last_name', 'Last'),
    COALESCE((new.raw_app_meta_data ->> 'role')::user_role, 'hospital_admin'),
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger linking
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_signup();

-- CareDesk clinical and operations domain
-- Every operational record is tenant-scoped; never expose a cross-tenant query to the client.
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  medical_record_number TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  sex_at_birth TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  emergency_contact JSONB NOT NULL DEFAULT '{}'::jsonb,
  clinical_alerts JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, medical_record_number)
);

CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
  clinician_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'booked' CHECK (status IN ('booked', 'arrived', 'in_progress', 'completed', 'cancelled', 'no_show')),
  token_number TEXT,
  reason_for_visit TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.encounters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  clinician_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  encounter_type TEXT NOT NULL DEFAULT 'outpatient',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'signed', 'amended')),
  chief_complaint TEXT,
  vitals JSONB NOT NULL DEFAULT '{}'::jsonb,
  soap_notes JSONB NOT NULL DEFAULT '{}'::jsonb,
  diagnosis JSONB NOT NULL DEFAULT '[]'::jsonb,
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.diagnostic_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  encounter_id UUID NOT NULL REFERENCES public.encounters(id) ON DELETE RESTRICT,
  order_type TEXT NOT NULL CHECK (order_type IN ('lab', 'radiology')),
  test_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ordered' CHECK (status IN ('ordered', 'collected', 'in_progress', 'completed', 'cancelled')),
  result_text TEXT,
  report_url TEXT,
  performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  encounter_id UUID NOT NULL REFERENCES public.encounters(id) ON DELETE RESTRICT,
  medicine_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT,
  status TEXT NOT NULL DEFAULT 'prescribed' CHECK (status IN ('prescribed', 'dispensed', 'cancelled')),
  dispensed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  dispensed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
  invoice_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('draft', 'unpaid', 'partially_paid', 'paid', 'void')),
  due_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, invoice_number)
);

CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  generic_name TEXT,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  purchase_price NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (purchase_price >= 0),
  selling_price NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (selling_price >= 0),
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  reorder_level INTEGER NOT NULL DEFAULT 0 CHECK (reorder_level >= 0),
  supplier TEXT,
  UNIQUE (tenant_id, name)
);

CREATE INDEX IF NOT EXISTS idx_patients_tenant_name ON public.patients (tenant_id, last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_appointments_tenant_start ON public.appointments (tenant_id, starts_at);
CREATE INDEX IF NOT EXISTS idx_encounters_tenant_patient ON public.encounters (tenant_id, patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_diagnostic_orders_tenant_status ON public.diagnostic_orders (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_tenant_patient ON public.invoices (tenant_id, patient_id, created_at DESC);

-- Baseline RLS for the domain. Patient-specific access should be added through a
-- verified profile-to-patient link before enabling a public patient portal in production.
DO $$
DECLARE table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['patients', 'appointments', 'encounters', 'diagnostic_orders', 'prescriptions', 'invoices', 'invoice_items', 'inventory_items']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'tenant_staff_isolation_' || table_name, table_name);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (tenant_id = get_current_tenant_id() AND get_current_user_role() <> ''patient'') WITH CHECK (tenant_id = get_current_tenant_id() AND get_current_user_role() <> ''patient'')', 'tenant_staff_isolation_' || table_name, table_name);
  END LOOP;
END $$;
