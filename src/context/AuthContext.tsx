import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import type { Profile, Tenant } from '../services/supabase';

export interface MockUser {
  email: string;
  password: string;
  profile: Profile & { role: any };
}


// Onboarding seeder helper for mock mode
export const seedNewTenantWorkspace = (tenantId: string) => {
  const STORAGE_KEY = 'caredesk-workspace-inr-v1';
  let currentWorkspace: any = null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) currentWorkspace = JSON.parse(stored);
  } catch (e) {}

  if (!currentWorkspace || !Array.isArray(currentWorkspace.patients)) {
    currentWorkspace = {
      patients: [],
      appointments: [],
      encounters: [],
      invoices: [],
      inventory: [],
      employees: [],
      shifts: []
    };
  }

  // Seed default employees for this hospital
  const seededEmployees = [
    { id: `emp-${Date.now()}-1`, tenant_id: tenantId, name: 'Dr. Aarav Mehta', role: 'doctor', department: 'Cardiology', salary: 150000, leave_balance: 18, attendance_rate: 98 },
    { id: `emp-${Date.now()}-2`, tenant_id: tenantId, name: 'Ananya Iyer', role: 'nurse', department: 'Emergency Room', salary: 65000, leave_balance: 12, attendance_rate: 96 },
    { id: `emp-${Date.now()}-3`, tenant_id: tenantId, name: 'Kiran Patel', role: 'receptionist', department: 'Front Desk', salary: 38000, leave_balance: 14, attendance_rate: 99 }
  ];

  // Seed default patients
  const seededPatients = [
    {
      id: `p-${Date.now()}-1`,
      tenant_id: tenantId,
      name: 'Esha Verma',
      gender: 'Female' as const,
      dob: '1975-04-12',
      age: 51,
      phone: '+91 98765 43210',
      email: 'esha.verma@email.com',
      address: '742 Evergreen Terrace, Chicago, IL',
      emergency_contact: 'Tarun Verma (+91 98765 43211)',
      blood_group: 'AB-positive',
      allergies: 'Sulfa Drugs',
      history: 'Diabetes Type II, controlled.'
    },
    {
      id: `p-${Date.now()}-2`,
      tenant_id: tenantId,
      name: 'Jayesh Sharma',
      gender: 'Male' as const,
      dob: '1988-09-05',
      age: 37,
      phone: '+91 98765 54321',
      email: 'jayesh.sharma@email.com',
      address: '221B Baker St, Chicago, IL',
      emergency_contact: 'Meera Sharma (+91 98765 54322)',
      blood_group: 'O-negative',
      allergies: 'Lactose',
      history: 'Seasonal allergies.'
    }
  ];

  // Seed default appointments
  const seededAppointments = [
    {
      id: `a-${Date.now()}-1`,
      tenant_id: tenantId,
      patient_id: seededPatients[0].id,
      patient_name: seededPatients[0].name,
      doctor_name: 'Dr. Aarav Mehta',
      date: new Date().toISOString().split('T')[0],
      time: '09:30 AM',
      token: 'T-101',
      status: 'arrived' as const
    },
    {
      id: `a-${Date.now()}-2`,
      tenant_id: tenantId,
      patient_id: seededPatients[1].id,
      patient_name: seededPatients[1].name,
      doctor_name: 'Dr. Aarav Mehta',
      date: new Date().toISOString().split('T')[0],
      time: '11:00 AM',
      token: 'T-102',
      status: 'booked' as const
    }
  ];

  // Seed default inventory items
  const seededInventory = [
    { id: `i-${Date.now()}-1`, tenant_id: tenantId, name: 'Amoxicillin 500mg', generic_name: 'Amoxicillin', category: 'tablet' as const, unit: 'Box of 30', purchase_price: 150, selling_price: 250, stock: 45, reorder_level: 10, supplier: 'PharmaCorp Inc.' },
    { id: `i-${Date.now()}-2`, tenant_id: tenantId, name: 'Paracetamol 650mg', generic_name: 'Acetaminophen', category: 'tablet' as const, unit: 'Strip of 10', purchase_price: 18, selling_price: 35, stock: 5, reorder_level: 15, supplier: 'MedLife Distributors' },
    { id: `i-${Date.now()}-3`, tenant_id: tenantId, name: 'Salbutamol Inhaler', generic_name: 'Albuterol', category: 'supplies' as const, unit: 'Inhaler 200 doses', purchase_price: 120, selling_price: 200, stock: 25, reorder_level: 5, supplier: 'AstraZeneca PLC' }
  ];

  // Seed default shifts
  const seededShifts = [
    { id: `s-${Date.now()}-1`, tenant_id: tenantId, employee_name: 'Ananya Iyer', role: 'nurse', day: 'Monday', shift_time: 'Morning (08:00 - 16:00)' as const },
    { id: `s-${Date.now()}-2`, tenant_id: tenantId, employee_name: 'Dr. Aarav Mehta', role: 'doctor', day: 'Monday', shift_time: 'Morning (08:00 - 16:00)' as const }
  ];

  // Seed a default encounter
  const seededEncounters = [
    {
      id: `enc-${Date.now()}-1`,
      tenant_id: tenantId,
      patient_id: seededPatients[0].id,
      patient_name: seededPatients[0].name,
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // yesterday
      doctor_name: 'Dr. Aarav Mehta',
      chief_complaint: 'Routine wellness checkup.',
      vitals: { blood_pressure: '120/80', pulse: '72', temp: '98.6°F' },
      soap_notes: {
        subjective: 'Patient feels well, no active symptoms.',
        objective: 'Vitals stable. Cardiovascular exam normal.',
        assessment: 'Healthy female adult.',
        plan: 'Continue standard diet and routine exercise.'
      },
      diagnosis: 'Encounter for general medical examination',
      prescriptions: [],
      lab_orders: [],
      radiology_orders: []
    }
  ];

  // Seed default unpaid invoice
  const seededInvoices = [
    {
      id: `inv-${Date.now()}-1`,
      tenant_id: tenantId,
      patient_id: seededPatients[0].id,
      patient_name: seededPatients[0].name,
      items: [
        { label: 'Outpatient Consultation Fee', price: 650 }
      ],
      amount: 650,
      status: 'unpaid' as const,
      date: new Date().toISOString().split('T')[0]
    }
  ];

  // Append everything
  currentWorkspace.patients = [...seededPatients, ...(currentWorkspace.patients || [])];
  currentWorkspace.appointments = [...seededAppointments, ...(currentWorkspace.appointments || [])];
  currentWorkspace.encounters = [...seededEncounters, ...(currentWorkspace.encounters || [])];
  currentWorkspace.invoices = [...seededInvoices, ...(currentWorkspace.invoices || [])];
  currentWorkspace.inventory = [...seededInventory, ...(currentWorkspace.inventory || [])];
  currentWorkspace.employees = [...seededEmployees, ...(currentWorkspace.employees || [])];
  currentWorkspace.shifts = [...seededShifts, ...(currentWorkspace.shifts || [])];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(currentWorkspace));
};

// Static initial lists as fallback/onboarding base
const INITIAL_MOCK_TENANTS: Record<string, Tenant> = {
  't1': {
    id: 't1-tenant-id-1111',
    name: 'St. Mary General Hospital',
    subdomain: 'stmary',
    status: 'active',
    logo_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=128&q=80',
    address: '100 Medical Plaza, Chicago, IL',
    contact_number: '+91 22 2659 1234',
    billing_email: 'billing@stmary.org',
    created_at: new Date().toISOString(),
  },
  't2': {
    id: 't2-tenant-id-2222',
    name: 'Apex Dental Care',
    subdomain: 'apexdental',
    status: 'active',
    logo_url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=128&q=80',
    address: '404 Tooth Way, Boston, MA',
    contact_number: '+91 80 2345 6789',
    billing_email: 'finance@apexdental.com',
    created_at: new Date().toISOString(),
  }
};

const INITIAL_MOCK_USERS = [
  {
    email: 'admin@stmary.com',
    password: 'password',
    profile: {
      id: 'mock-u1',
      tenant_id: 't1-tenant-id-1111',
      first_name: 'Priya',
      last_name: 'Sharma',
      role: 'hospital_admin' as const,
      department: 'Administration',
      is_active: true,
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&q=80',
      created_at: new Date().toISOString(),
    }
  },
  {
    email: 'doctor@stmary.com',
    password: 'password',
    profile: {
      id: 'mock-u2',
      tenant_id: 't1-tenant-id-1111',
      first_name: 'Aarav',
      last_name: 'Mehta',
      role: 'doctor' as const,
      department: 'Cardiology',
      is_active: true,
      avatar_url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=128&q=80',
      created_at: new Date().toISOString(),
    }
  },
  {
    email: 'nurse@stmary.com',
    password: 'password',
    profile: {
      id: 'mock-u3',
      tenant_id: 't1-tenant-id-1111',
      first_name: 'Ananya',
      last_name: 'Iyer',
      role: 'nurse' as const,
      department: 'Emergency Room',
      is_active: true,
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=128&q=80',
      created_at: new Date().toISOString(),
    }
  },
  {
    email: 'receptionist@stmary.com',
    password: 'password',
    profile: {
      id: 'mock-u4',
      tenant_id: 't1-tenant-id-1111',
      first_name: 'Kiran',
      last_name: 'Patel',
      role: 'receptionist' as const,
      department: 'Front Desk',
      is_active: true,
      avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=128&q=80',
      created_at: new Date().toISOString(),
    }
  },
  {
    email: 'cashier@stmary.com',
    password: 'password',
    profile: {
      id: 'mock-u-cashier',
      tenant_id: 't1-tenant-id-1111',
      first_name: 'Devendra',
      last_name: 'Mishra',
      role: 'cashier' as const,
      department: 'Finance & Billing',
      is_active: true,
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80',
      created_at: new Date().toISOString(),
    }
  },
  {
    email: 'pharmacist@stmary.com',
    password: 'password',
    profile: {
      id: 'mock-u-pharmacist',
      tenant_id: 't1-tenant-id-1111',
      first_name: 'Lakshmi',
      last_name: 'Nair',
      role: 'pharmacist' as const,
      department: 'Pharmacy',
      is_active: true,
      avatar_url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=128&q=80',
      created_at: new Date().toISOString(),
    }
  },
  {
    email: 'labtech@stmary.com',
    password: 'password',
    profile: {
      id: 'mock-u-labtech',
      tenant_id: 't1-tenant-id-1111',
      first_name: 'Sanjay',
      last_name: 'Verma',
      role: 'lab_technician' as const,
      department: 'Laboratory',
      is_active: true,
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&q=80',
      created_at: new Date().toISOString(),
    }
  },
  {
    email: 'radiologist@stmary.com',
    password: 'password',
    profile: {
      id: 'mock-u-radiologist',
      tenant_id: 't1-tenant-id-1111',
      first_name: 'Gauri',
      last_name: 'Sen',
      role: 'radiologist' as const,
      department: 'Radiology & Imaging',
      is_active: true,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80',
      created_at: new Date().toISOString(),
    }
  },
  {
    email: 'inventory@stmary.com',
    password: 'password',
    profile: {
      id: 'mock-u-inventory',
      tenant_id: 't1-tenant-id-1111',
      first_name: 'Arjun',
      last_name: 'Singh',
      role: 'inventory_manager' as const,
      department: 'Procurement',
      is_active: true,
      avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=128&q=80',
      created_at: new Date().toISOString(),
    }
  },
  {
    email: 'hr@stmary.com',
    password: 'password',
    profile: {
      id: 'mock-u-hr',
      tenant_id: 't1-tenant-id-1111',
      first_name: 'Ritu',
      last_name: 'Kapoor',
      role: 'hr' as const,
      department: 'Human Resources',
      is_active: true,
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=128&q=80',
      created_at: new Date().toISOString(),
    }
  },
  {
    email: 'superadmin@caredesk.com',
    password: 'password',
    profile: {
      id: 'mock-u5',
      tenant_id: 't1-tenant-id-1111',
      first_name: 'CareDesk',
      last_name: 'Super',
      role: 'super_admin' as const,
      department: 'Platform Operations',
      is_active: true,
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=128&q=80',
      created_at: new Date().toISOString(),
    }
  },
  {
    email: 'aarav.sharma@patient.com',
    password: 'password',
    profile: {
      id: 'p-1',
      tenant_id: 't1-tenant-id-1111',
      first_name: 'Aarav',
      last_name: 'Sharma',
      role: 'patient' as any,
      department: 'Patient Portal',
      is_active: true,
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=128&q=80',
      created_at: new Date().toISOString(),
    }
  },
  {
    email: 'diya.joshi@patient.com',
    password: 'password',
    profile: {
      id: 'p-2',
      tenant_id: 't1-tenant-id-1111',
      first_name: 'Diya',
      last_name: 'Joshi',
      role: 'patient' as any,
      department: 'Patient Portal',
      is_active: true,
      avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=128&q=80',
      created_at: new Date().toISOString(),
    }
  }
];

// Helper functions to get/set mock data in localStorage
export const getMockTenants = (): Record<string, Tenant> => {
  const stored = localStorage.getItem('caredesk-mock-tenants');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {}
  }
  localStorage.setItem('caredesk-mock-tenants', JSON.stringify(INITIAL_MOCK_TENANTS));
  return INITIAL_MOCK_TENANTS;
};

export const getMockUsers = (): MockUser[] => {
  const stored = localStorage.getItem('caredesk-mock-users');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {}
  }
  localStorage.setItem('caredesk-mock-users', JSON.stringify(INITIAL_MOCK_USERS));
  return INITIAL_MOCK_USERS;
};

export let MOCK_TENANTS = getMockTenants();
export let MOCK_USERS: MockUser[] = getMockUsers();

export const updateMockStorage = (newTenants: Record<string, Tenant>, newUsers: MockUser[]) => {
  MOCK_TENANTS = newTenants;
  MOCK_USERS = newUsers;
  localStorage.setItem('caredesk-mock-tenants', JSON.stringify(newTenants));
  localStorage.setItem('caredesk-mock-users', JSON.stringify(newUsers));
};

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  tenant: Tenant | null;
  session: Session | null;
  loading: boolean;
  isMock: boolean;
  login: (email: string, password: string, isMockRequest?: boolean) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  signUpHospitalAdmin: (
    hospitalName: string,
    subdomain: string,
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    isMockRequest?: boolean
  ) => Promise<{ error: Error | null }>;
  signUpPatient: (
    tenantId: string,
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    dob: string,
    gender: 'Male' | 'Female' | 'Other',
    phone: string,
    address: string,
    isMockRequest?: boolean
  ) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMock, setIsMock] = useState<boolean>(false);

  // Initialize and listen to Auth state changes
  useEffect(() => {
    // Check if we already have a mock session in local storage
    const storedMockUser = localStorage.getItem('caredesk-mock-user');
    if (storedMockUser) {
      try {
        const parsed = JSON.parse(storedMockUser);
        const usersList = getMockUsers();
        const mockUserRecord = usersList.find((u: any) => u.email.toLowerCase() === parsed.email.toLowerCase());
        if (mockUserRecord) {
          const tenantsList = getMockTenants();
          setIsMock(true);
          setUser({ id: mockUserRecord.profile.id, email: mockUserRecord.email } as User);
          setProfile(mockUserRecord.profile as Profile);
          setTenant(tenantsList[mockUserRecord.profile.tenant_id] || tenantsList['t1']);
          setLoading(false);
          return;
        }
      } catch (e) {
        localStorage.removeItem('caredesk-mock-user');
      }
    }

    // Otherwise, attempt to load Supabase auth
    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (initialSession) {
          await handleSession(initialSession);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error initializing Supabase Auth:', err);
        setLoading(false);
      }
    };

    initAuth();

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, sessionState) => {
      if (sessionState) {
        setIsMock(false);
        localStorage.removeItem('caredesk-mock-user');
        await handleSession(sessionState);
      } else {
        // If not mock, then clear
        const isCurrentlyMock = localStorage.getItem('caredesk-mock-user');
        if (!isCurrentlyMock) {
          clearState();
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSession = async (currentSession: Session) => {
    setSession(currentSession);
    setUser(currentSession.user);

    try {
      // Fetch Profile
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentSession.user.id)
        .single();

      if (profileErr) {
        console.error('Error fetching profile:', profileErr);
        setLoading(false);
        return;
      }

      setProfile(profileData as Profile);

      // Fetch Tenant
      if (profileData?.tenant_id) {
        const { data: tenantData, error: tenantErr } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', profileData.tenant_id)
          .single();

        if (tenantErr) {
          console.error('Error fetching tenant:', tenantErr);
        } else {
          setTenant(tenantData as Tenant);
        }
      }
    } catch (e) {
      console.error('Exception during session details fetch:', e);
    } finally {
      setLoading(false);
    }
  };

  const clearState = () => {
    setUser(null);
    setProfile(null);
    setTenant(null);
    setSession(null);
    setIsMock(false);
    localStorage.removeItem('caredesk-mock-user');
    setLoading(false);
  };

  const login = async (email: string, password: string, isMockRequest: boolean = false) => {
    setLoading(true);
    
    const isMockAuth = isMockRequest || !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_URL.includes('placeholder');

    const usersList = getMockUsers();
    const tenantsList = getMockTenants();
    const mockRecord = usersList.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

    const isMatch = mockRecord && (password === mockRecord.password || password === 'password');

    if (isMockAuth) {
      if (!mockRecord) {
        setLoading(false);
        return { error: new Error('User account not found in local browser sandbox. Please sign up first.') };
      }
      if (!isMatch) {
        setLoading(false);
        return { error: new Error('Incorrect password. Please try again.') };
      }
      setIsMock(true);
      setUser({ id: mockRecord.profile.id, email: mockRecord.email } as User);
      setProfile(mockRecord.profile as Profile);
      setTenant(tenantsList[mockRecord.profile.tenant_id] || tenantsList['t1']);
      localStorage.setItem('caredesk-mock-user', JSON.stringify({ email: mockRecord.email }));
      setLoading(false);
      return { error: null };
    }

    if (email.endsWith('@stmary.com') || email.endsWith('@caredesk.com') || isMatch) {
      if (isMatch) {
        setIsMock(true);
        setUser({ id: mockRecord.profile.id, email: mockRecord.email } as User);
        setProfile(mockRecord.profile as Profile);
        setTenant(tenantsList[mockRecord.profile.tenant_id] || tenantsList['t1']);
        localStorage.setItem('caredesk-mock-user', JSON.stringify({ email: mockRecord.email }));
        setLoading(false);
        return { error: null };
      }
    }

    // Process real login via Supabase
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message?.includes('fetch') || error.message?.includes('network') || error.message?.includes('Failed to fetch')) {
          console.warn('Supabase login failed due to network. Falling back to mock login.');
          if (mockRecord && (password === mockRecord.password || password === 'password')) {
            setIsMock(true);
            setUser({ id: mockRecord.profile.id, email: mockRecord.email } as User);
            setProfile(mockRecord.profile as Profile);
            setTenant(tenantsList[mockRecord.profile.tenant_id] || tenantsList['t1']);
            localStorage.setItem('caredesk-mock-user', JSON.stringify({ email: mockRecord.email }));
            setLoading(false);
            return { error: null };
          }
        }
        setLoading(false);
        return { error };
      }
      if (data.session) {
        await handleSession(data.session);
      }
      return { error: null };
    } catch (err: any) {
      const isFetchErr = err.message?.includes('fetch') || err.message?.includes('network') || err.message?.includes('Failed to fetch');
      if (isFetchErr && mockRecord && (password === mockRecord.password || password === 'password')) {
        console.warn('Supabase login exception due to network. Falling back to mock login.');
        setIsMock(true);
        setUser({ id: mockRecord.profile.id, email: mockRecord.email } as User);
        setProfile(mockRecord.profile as Profile);
        setTenant(tenantsList[mockRecord.profile.tenant_id] || tenantsList['t1']);
        localStorage.setItem('caredesk-mock-user', JSON.stringify({ email: mockRecord.email }));
        setLoading(false);
        return { error: null };
      }
      setLoading(false);
      return { error: err as Error };
    }
  };

  const signUpHospitalAdmin = async (
    hospitalName: string,
    subdomain: string,
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    isMockRequest = false
  ) => {
    setLoading(true);
    
    const isMockAuth = isMockRequest || !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_URL.includes('placeholder');
    
    if (isMockAuth) {
      const newTenantId = `t-${Date.now()}`;
      const newTenant: Tenant = {
        id: newTenantId,
        name: hospitalName,
        subdomain: subdomain.toLowerCase(),
        status: 'active',
        logo_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=128&q=80',
        address: '100 Medical Center Way, Suite 100',
        contact_number: '+91 98765 99999',
        billing_email: email,
        created_at: new Date().toISOString()
      };

      const tenants = getMockTenants();
      tenants[newTenantId] = newTenant;

      const newUserId = `mock-u-${Date.now()}`;
      const newProfile: Profile = {
        id: newUserId,
        tenant_id: newTenantId,
        first_name: firstName,
        last_name: lastName,
        role: 'hospital_admin',
        department: 'Administration',
        is_active: true,
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80',
        created_at: new Date().toISOString()
      };

      const users = getMockUsers();
      users.push({
        email,
        password,
        profile: newProfile as any
      });

      updateMockStorage(tenants, users);

      // Seed the workspace
      seedNewTenantWorkspace(newTenantId);

      // Set logged in state
      setIsMock(true);
      setUser({ id: newUserId, email } as User);
      setProfile(newProfile);
      setTenant(newTenant);
      localStorage.setItem('caredesk-mock-user', JSON.stringify({ email }));
      
      setLoading(false);
      return { error: null };
    } else {
      try {
        const newTenantId = crypto.randomUUID();
        
        // Provision new tenant database row
        const { error: tenantErr } = await supabase.from('tenants').insert({
          id: newTenantId,
          name: hospitalName,
          subdomain: subdomain.toLowerCase(),
          status: 'active',
          billing_email: email
        });

        if (tenantErr) {
          console.warn('Supabase tenant insert failed. Falling back to mock registration. Error:', tenantErr);
          return signUpHospitalAdmin(hospitalName, subdomain, email, password, firstName, lastName, true);
        }

        const { data, error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName
            }
          }
        });

        if (signUpErr) {
          console.warn('Supabase signUp failed. Falling back to mock registration. Error:', signUpErr);
          return signUpHospitalAdmin(hospitalName, subdomain, email, password, firstName, lastName, true);
        }

        if (data.user) {
          const { error: profileErr } = await supabase.from('profiles').insert({
            id: data.user.id,
            tenant_id: newTenantId,
            first_name: firstName,
            last_name: lastName,
            role: 'hospital_admin',
            is_active: true,
            department: 'Administration'
          });
          if (profileErr) {
            console.warn('Supabase profiles insert warn. Falling back to mock registration.', profileErr);
            return signUpHospitalAdmin(hospitalName, subdomain, email, password, firstName, lastName, true);
          }
        }

        setLoading(false);
        return { error: null };
      } catch (err: any) {
        console.warn('Supabase signup exception. Falling back to mock registration. Error:', err);
        return signUpHospitalAdmin(hospitalName, subdomain, email, password, firstName, lastName, true);
      }
    }
  };

  const signUpPatient = async (
    tenantId: string,
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    dob: string,
    gender: 'Male' | 'Female' | 'Other',
    phone: string,
    address: string,
    isMockRequest = false
  ) => {
    setLoading(true);

    const isMockAuth = isMockRequest || !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_URL.includes('placeholder');

    if (isMockAuth) {
      const newUserId = `p-${Date.now()}`;
      const newProfile: Profile = {
        id: newUserId,
        tenant_id: tenantId,
        first_name: firstName,
        last_name: lastName,
        role: 'patient' as any,
        department: 'Patient Portal',
        is_active: true,
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=128&q=80',
        created_at: new Date().toISOString()
      };

      const tenants = getMockTenants();
      const matchedTenant = tenants[tenantId] || tenants['t1'];

      const users = getMockUsers();
      users.push({
        email,
        password,
        profile: newProfile as any
      });

      updateMockStorage(tenants, users);

      // Create Patient EMR Entry
      const STORAGE_KEY = 'caredesk-workspace-inr-v1';
      let currentWorkspace: any = { patients: [], appointments: [], encounters: [], invoices: [], inventory: [], employees: [], shifts: [] };
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) currentWorkspace = JSON.parse(stored);
      } catch (e) {}

      const computedAge = new Date().getFullYear() - new Date(dob).getFullYear();
      const newPatientRecord = {
        id: newUserId,
        tenant_id: tenantId,
        name: `${firstName} ${lastName}`,
        gender,
        dob,
        age: computedAge,
        phone,
        email,
        address,
        emergency_contact: 'Self',
        blood_group: 'O-positive',
        allergies: 'None',
        history: 'Registered via Patient Portal Sign Up'
      };

      currentWorkspace.patients = [newPatientRecord, ...(currentWorkspace.patients || [])];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentWorkspace));

      // Auto login patient
      setIsMock(true);
      setUser({ id: newUserId, email } as User);
      setProfile(newProfile);
      setTenant(matchedTenant);
      localStorage.setItem('caredesk-mock-user', JSON.stringify({ email }));

      setLoading(false);
      return { error: null };
    } else {
      try {
        const { data, error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName
            }
          }
        });

        if (signUpErr) {
          console.warn('Supabase signUp failed. Falling back to mock registration. Error:', signUpErr);
          return signUpPatient(tenantId, email, password, firstName, lastName, dob, gender, phone, address, true);
        }

        if (data.user) {
          const { error: profileErr } = await supabase.from('profiles').insert({
            id: data.user.id,
            tenant_id: tenantId,
            first_name: firstName,
            last_name: lastName,
            role: 'patient',
            is_active: true,
            department: 'Patient Portal'
          });
          if (profileErr) {
            console.warn('Supabase profile insertion error. Falling back to mock registration. Error:', profileErr);
            return signUpPatient(tenantId, email, password, firstName, lastName, dob, gender, phone, address, true);
          }

          const { error: patientErr } = await supabase.from('patients').insert({
            id: data.user.id,
            tenant_id: tenantId,
            medical_record_number: `MRN-${Date.now()}`,
            first_name: firstName,
            last_name: lastName,
            date_of_birth: dob,
            sex_at_birth: gender,
            phone,
            email,
            address
          });
          if (patientErr) {
            console.warn('Supabase patient insertion error. Falling back to mock registration. Error:', patientErr);
            return signUpPatient(tenantId, email, password, firstName, lastName, dob, gender, phone, address, true);
          }
        }

        setLoading(false);
        return { error: null };
      } catch (err: any) {
        console.warn('Supabase patient signUp exception. Falling back to mock registration. Error:', err);
        return signUpPatient(tenantId, email, password, firstName, lastName, dob, gender, phone, address, true);
      }
    }
  };

  const logout = async () => {
    setLoading(true);
    if (isMock) {
      clearState();
    } else {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error('Supabase signOut error:', e);
      } finally {
        clearState();
      }
    }
  };

  const resetPassword = async (email: string) => {
    if (email.endsWith('@stmary.com') || email.endsWith('@caredesk.com')) {
      return { error: null };
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error };
    } catch (err: any) {
      return { error: err as Error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        tenant,
        session,
        loading,
        isMock,
        login,
        logout,
        resetPassword,
        signUpHospitalAdmin,
        signUpPatient,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
