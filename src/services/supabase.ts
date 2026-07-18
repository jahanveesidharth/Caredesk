import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    'CareDesk: Supabase environment variables VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY are missing. ' +
    'Falling back to placeholder credentials. Real authentication and queries might fail unless mock mode is active.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  status: 'active' | 'suspended' | 'pending';
  logo_url?: string;
  address?: string;
  contact_number?: string;
  billing_email?: string;
  created_at: string;
}

export interface Profile {
  id: string;
  tenant_id: string;
  first_name: string;
  last_name: string;
  role:
    | 'super_admin'
    | 'hospital_admin'
    | 'doctor'
    | 'nurse'
    | 'receptionist'
    | 'cashier'
    | 'pharmacist'
    | 'lab_technician'
    | 'radiologist'
    | 'inventory_manager'
    | 'hr'
    | 'patient';
  department?: string;
  is_active: boolean;
  avatar_url?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  tenant_id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}
