import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '../components/ui/toast';
import { supabase } from '../services/supabase';

// 1. Data Type Interfaces

export interface Patient {
  id: string;
  tenant_id: string;
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  age: number;
  phone: string;
  email: string;
  address: string;
  emergency_contact: string;
  blood_group: string;
  allergies: string;
  history: string;
}

export interface Appointment {
  id: string;
  tenant_id: string;
  patient_id: string;
  patient_name: string;
  doctor_name: string;
  date: string;
  time: string;
  token: string;
  status: 'booked' | 'arrived' | 'completed' | 'cancelled';
}

export interface PrescriptionItem {
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  dispensed: boolean;
  price: number;
}

export interface DiagnosticOrder {
  test_name: string;
  result?: string;
  status: 'ordered' | 'completed';
  technician?: string;
  approved: boolean;
  price: number;
}

export interface EMR_Encounter {
  id: string;
  tenant_id: string;
  patient_id: string;
  patient_name: string;
  date: string;
  doctor_name: string;
  chief_complaint: string;
  vitals: {
    blood_pressure: string;
    pulse: string;
    temp: string;
  };
  soap_notes: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
  diagnosis: string;
  prescriptions: PrescriptionItem[];
  lab_orders: DiagnosticOrder[];
  radiology_orders: DiagnosticOrder[];
}

export interface InvoiceItem {
  label: string;
  price: number;
}

export interface Invoice {
  id: string;
  tenant_id: string;
  patient_id: string;
  patient_name: string;
  items: InvoiceItem[];
  amount: number;
  status: 'unpaid' | 'paid';
  date: string;
}

export interface InventoryItem {
  id: string;
  tenant_id: string;
  name: string;
  generic_name: string;
  category: 'tablet' | 'syrup' | 'injection' | 'consumable' | 'supplies';
  unit: string;
  purchase_price: number;
  selling_price: number;
  stock: number;
  reorder_level: number;
  supplier: string;
}

export interface Employee {
  id: string;
  tenant_id: string;
  name: string;
  role: string;
  department: string;
  salary: number;
  leave_balance: number;
  attendance_rate: number;
}

export interface Shift {
  id: string;
  tenant_id: string;
  employee_name: string;
  role: string;
  day: string;
  shift_time: 'Morning (08:00 - 16:00)' | 'Evening (16:00 - 00:00)' | 'Night (00:00 - 08:00)';
}

export interface LiveNotification {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  timestamp: string;
  read: boolean;
}

// 2. Initial Seed Data (Enriched and structured logically)
const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'p-1',
    tenant_id: 't1-tenant-id-1111',
    name: 'John Doe',
    gender: 'Male',
    dob: '1981-06-15',
    age: 45,
    phone: '+1 (555) 304-2092',
    email: 'johndoe@email.com',
    address: '404 Oak Avenue, Chicago, IL',
    emergency_contact: 'Jane Doe (+1 555-304-2093)',
    blood_group: 'O-positive',
    allergies: 'Penicillin',
    history: 'Hypertension diagnosed in 2021.'
  },
  {
    id: 'p-2',
    tenant_id: 't1-tenant-id-1111',
    name: 'Alice Smith',
    gender: 'Female',
    dob: '1997-11-22',
    age: 28,
    phone: '+1 (555) 890-4411',
    email: 'alice.smith@email.com',
    address: '12 Maple Dr, Evanston, IL',
    emergency_contact: 'Bob Smith (+1 555-890-4412)',
    blood_group: 'A-positive',
    allergies: 'Peanuts',
    history: 'Asthma in childhood.'
  },
  {
    id: 'p-3',
    tenant_id: 't2-tenant-id-2222',
    name: 'Michael Brown',
    gender: 'Male',
    dob: '1992-03-10',
    age: 34,
    phone: '+1 (555) 902-8877',
    email: 'michael.b@email.com',
    address: '89 Main St, Boston, MA',
    emergency_contact: 'Helen Brown (+1 555-902-8878)',
    blood_group: 'B-positive',
    allergies: 'None',
    history: 'Routine dental scaling yearly.'
  },
  {
    id: 'p-4',
    tenant_id: 't1-tenant-id-1111',
    name: 'Robert Johnson',
    gender: 'Male',
    dob: '1964-08-19',
    age: 62,
    phone: '+1 (555) 432-8765',
    email: 'rjohnson@email.com',
    address: '156 Pine St, Chicago, IL',
    emergency_contact: 'Linda Johnson (+1 555-432-8760)',
    blood_group: 'B-negative',
    allergies: 'Sulfa Drugs',
    history: 'Type II Diabetes, Chronic Kidney Disease Stage II.'
  },
  {
    id: 'p-5',
    tenant_id: 't1-tenant-id-1111',
    name: 'Samantha Williams',
    gender: 'Female',
    dob: '1990-12-04',
    age: 35,
    phone: '+1 (555) 678-1234',
    email: 'samantha.w@email.com',
    address: '789 Elm St, Naperville, IL',
    emergency_contact: 'Marc Williams (+1 555-678-5678)',
    blood_group: 'O-negative',
    allergies: 'Shellfish',
    history: 'Migraine headaches since adolescence.'
  },
  {
    id: 'p-6',
    tenant_id: 't2-tenant-id-2222',
    name: 'Emily Davis',
    gender: 'Female',
    dob: '2001-05-14',
    age: 25,
    phone: '+1 (555) 789-9876',
    email: 'emily.davis@email.com',
    address: '100 Boylston St, Boston, MA',
    emergency_contact: 'Mark Davis (+1 555-789-9800)',
    blood_group: 'AB-positive',
    allergies: 'Aspirin',
    history: 'Orthodontic braces (completed).'
  }
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'a-1',
    tenant_id: 't1-tenant-id-1111',
    patient_id: 'p-1',
    patient_name: 'John Doe',
    doctor_name: 'Dr. Alexander House',
    date: new Date().toISOString().split('T')[0],
    time: '09:30 AM',
    token: 'T-101',
    status: 'booked'
  },
  {
    id: 'a-2',
    tenant_id: 't1-tenant-id-1111',
    patient_id: 'p-2',
    patient_name: 'Alice Smith',
    doctor_name: 'Dr. Alexander House',
    date: new Date().toISOString().split('T')[0],
    time: '10:45 AM',
    token: 'T-102',
    status: 'arrived'
  },
  {
    id: 'a-3',
    tenant_id: 't2-tenant-id-2222',
    patient_id: 'p-3',
    patient_name: 'Michael Brown',
    doctor_name: 'Dr. Apex Dentist',
    date: new Date().toISOString().split('T')[0],
    time: '02:00 PM',
    token: 'T-201',
    status: 'booked'
  },
  {
    id: 'a-4',
    tenant_id: 't1-tenant-id-1111',
    patient_id: 'p-4',
    patient_name: 'Robert Johnson',
    doctor_name: 'Dr. Alexander House',
    date: new Date().toISOString().split('T')[0],
    time: '11:30 AM',
    token: 'T-103',
    status: 'arrived'
  }
];

const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'i-1',
    tenant_id: 't1-tenant-id-1111',
    name: 'Amoxicillin 500mg',
    generic_name: 'Amoxicillin',
    category: 'tablet',
    unit: 'Box of 30',
    purchase_price: 150,
    selling_price: 250,
    stock: 50,
    reorder_level: 10,
    supplier: 'PharmaCorp Inc.'
  },
  {
    id: 'i-2',
    tenant_id: 't1-tenant-id-1111',
    name: 'Paracetamol 650mg',
    generic_name: 'Acetaminophen',
    category: 'tablet',
    unit: 'Strip of 10',
    purchase_price: 18,
    selling_price: 35,
    stock: 8,
    reorder_level: 15,
    supplier: 'MedLife Distributors'
  },
  {
    id: 'i-3',
    tenant_id: 't2-tenant-id-2222',
    name: 'Fluoride Gel 1.1%',
    generic_name: 'Sodium Fluoride',
    category: 'syrup',
    unit: 'Tube 56g',
    purchase_price: 60,
    selling_price: 120,
    stock: 20,
    reorder_level: 5,
    supplier: 'DentalDepot LLC'
  },
  {
    id: 'i-4',
    tenant_id: 't1-tenant-id-1111',
    name: 'Metformin 500mg',
    generic_name: 'Metformin Hydrochloride',
    category: 'tablet',
    unit: 'Box of 100',
    purchase_price: 220,
    selling_price: 450,
    stock: 12,
    reorder_level: 20,
    supplier: 'PharmaCorp Inc.'
  },
  {
    id: 'i-5',
    tenant_id: 't1-tenant-id-1111',
    name: 'Lisinopril 10mg',
    generic_name: 'Lisinopril',
    category: 'tablet',
    unit: 'Box of 90',
    purchase_price: 180,
    selling_price: 320,
    stock: 42,
    reorder_level: 10,
    supplier: 'AstraZeneca PLC'
  },
  {
    id: 'i-6',
    tenant_id: 't1-tenant-id-1111',
    name: 'Disposable Syringes 5ml',
    generic_name: 'N/A',
    category: 'consumable',
    unit: 'Box of 100',
    purchase_price: 90,
    selling_price: 150,
    stock: 150,
    reorder_level: 30,
    supplier: 'MedLife Distributors'
  }
];

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    tenant_id: 't1-tenant-id-1111',
    patient_id: 'p-1',
    patient_name: 'John Doe',
    items: [
      { label: 'Outpatient Consultation Fee', price: 500 }
    ],
    amount: 500,
    status: 'unpaid',
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: 'inv-2',
    tenant_id: 't1-tenant-id-1111',
    patient_id: 'p-4',
    patient_name: 'Robert Johnson',
    items: [
      { label: 'Outpatient Consultation Fee', price: 500 },
      { label: 'Laboratory Order: HbA1c Test', price: 400 }
    ],
    amount: 900,
    status: 'unpaid',
    date: new Date().toISOString().split('T')[0]
  }
];

const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'emp-1', tenant_id: 't1-tenant-id-1111', name: 'Dr. Alexander House', role: 'doctor', department: 'Cardiology', salary: 150000, leave_balance: 18, attendance_rate: 98 },
  { id: 'emp-2', tenant_id: 't1-tenant-id-1111', name: 'Emily Blunt', role: 'nurse', department: 'Emergency Room', salary: 65000, leave_balance: 12, attendance_rate: 96 },
  { id: 'emp-3', tenant_id: 't1-tenant-id-1111', name: 'Chloe Bennett', role: 'receptionist', department: 'Front Desk', salary: 38000, leave_balance: 14, attendance_rate: 99 },
  { id: 'emp-4', tenant_id: 't1-tenant-id-1111', name: 'David Miller', role: 'cashier', department: 'Finance & Billing', salary: 34000, leave_balance: 15, attendance_rate: 97 },
  { id: 'emp-5', tenant_id: 't1-tenant-id-1111', name: 'Linda Green', role: 'pharmacist', department: 'Pharmacy', salary: 55000, leave_balance: 11, attendance_rate: 95 }
];

const INITIAL_SHIFTS: Shift[] = [
  { id: 's-1', tenant_id: 't1-tenant-id-1111', employee_name: 'Emily Blunt', role: 'nurse', day: 'Monday', shift_time: 'Morning (08:00 - 16:00)' },
  { id: 's-2', tenant_id: 't1-tenant-id-1111', employee_name: 'Dr. Alexander House', role: 'doctor', day: 'Monday', shift_time: 'Morning (08:00 - 16:00)' },
  { id: 's-3', tenant_id: 't1-tenant-id-1111', employee_name: 'Chloe Bennett', role: 'receptionist', day: 'Monday', shift_time: 'Morning (08:00 - 16:00)' },
  { id: 's-4', tenant_id: 't1-tenant-id-1111', employee_name: 'David Miller', role: 'cashier', day: 'Monday', shift_time: 'Morning (08:00 - 16:00)' }
];

const INITIAL_ENCOUNTERS: EMR_Encounter[] = [
  {
    id: 'enc-1',
    tenant_id: 't1-tenant-id-1111',
    patient_id: 'p-1',
    patient_name: 'John Doe',
    date: '2026-07-10',
    doctor_name: 'Dr. Alexander House',
    chief_complaint: 'Mild chest pain and shortness of breath during exertion.',
    vitals: { blood_pressure: '142/90', pulse: '84', temp: '98.6°F' },
    soap_notes: {
      subjective: 'Patient reports tightness in chest while walking uphill. Relieved by rest.',
      objective: 'BP slightly elevated. Lungs clear to auscultation.',
      assessment: 'Suspected Angina or Hypertension flare-up.',
      plan: 'Ordered Electrocardiogram (ECG) and basic metabolic blood panels. Prescribed beta blockers.'
    },
    diagnosis: 'Mild Essential Hypertension',
    prescriptions: [
      { medicine_name: 'Amoxicillin 500mg', dosage: '1 tablet', frequency: 'Three times daily', duration: '7 days', dispensed: true, price: 250 }
    ],
    lab_orders: [
      { test_name: 'Lipid Panel Profile', result: 'Cholesterol: 240 mg/dL (High)', status: 'completed', technician: 'Sarah Jenkins', approved: true, price: 450 }
    ],
    radiology_orders: [
      { test_name: 'Chest X-Ray AP/PA', result: 'Cardiac silhouette within normal limits. Lung fields clear.', status: 'completed', technician: 'Radiology Team', approved: true, price: 850 }
    ]
  }
];

// 3. React Context Creation

interface DataContextType {
  patients: Patient[];
  appointments: Appointment[];
  encounters: EMR_Encounter[];
  invoices: Invoice[];
  inventory: InventoryItem[];
  employees: Employee[];
  shifts: Shift[];
  notifications: LiveNotification[];
  
  // Actions
  registerPatient: (patient: Omit<Patient, 'id' | 'tenant_id'>) => Patient;
  bookAppointment: (patientId: string, doctorName: string, date: string, time: string) => Appointment;
  checkInAppointment: (appointmentId: string) => void;
  createEncounter: (
    patientId: string,
    complaint: string,
    vitals: { blood_pressure: string; pulse: string; temp: string },
    soap: { subjective: string; objective: string; assessment: string; plan: string },
    diagnosis: string,
    prescriptions: Omit<PrescriptionItem, 'dispensed'>[],
    labTests: Omit<DiagnosticOrder, 'status' | 'approved'>[],
    radiologyTests: Omit<DiagnosticOrder, 'status' | 'approved'>[]
  ) => EMR_Encounter;
  submitLabResult: (encounterId: string, testName: string, result: string, techName: string) => void;
  submitRadiologyResult: (encounterId: string, imageName: string, result: string, radioName: string) => void;
  approveDiagnostics: (encounterId: string, orderType: 'lab' | 'radiology', testName: string) => void;
  dispensePrescription: (encounterId: string, medicineName: string) => void;
  payInvoice: (invoiceId: string) => void;
  addInventoryStock: (itemId: string, qty: number) => void;
  addNewInventoryItem: (item: Omit<InventoryItem, 'id' | 'tenant_id'>) => void;
  addNewEmployee: (emp: Omit<Employee, 'id' | 'tenant_id' | 'leave_balance' | 'attendance_rate'>) => void;
  logLeaveRequest: (employeeId: string, days: number) => void;
  assignEmployeeShift: (shift: Omit<Shift, 'id' | 'tenant_id'>) => void;
  resetDemoWorkspace: () => void;
  addNotification: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  markNotificationsAsRead: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEY = 'caredesk-workspace-inr-v1';

type WorkspaceSnapshot = Pick<
  DataContextType,
  'patients' | 'appointments' | 'encounters' | 'invoices' | 'inventory' | 'employees' | 'shifts'
>;

const loadWorkspace = (): WorkspaceSnapshot | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as WorkspaceSnapshot;
    return Array.isArray(parsed.patients) && Array.isArray(parsed.appointments) &&
      Array.isArray(parsed.encounters) && Array.isArray(parsed.invoices) &&
      Array.isArray(parsed.inventory) && Array.isArray(parsed.employees) && Array.isArray(parsed.shifts)
      ? parsed
      : null;
  } catch {
    return null;
  }
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { tenant, isMock } = useAuth();
  const { toast } = useToast();
  const activeTenantId = tenant?.id || 't1-tenant-id-1111';

  // State caches
  const [workspace] = useState<WorkspaceSnapshot | null>(loadWorkspace);
  const [patients, setPatients] = useState<Patient[]>(workspace?.patients ?? INITIAL_PATIENTS);
  const [appointments, setAppointments] = useState<Appointment[]>(workspace?.appointments ?? INITIAL_APPOINTMENTS);
  const [encounters, setEncounters] = useState<EMR_Encounter[]>(workspace?.encounters ?? INITIAL_ENCOUNTERS);
  const [invoices, setInvoices] = useState<Invoice[]>(workspace?.invoices ?? INITIAL_INVOICES);
  const [inventory, setInventory] = useState<InventoryItem[]>(workspace?.inventory ?? INITIAL_INVENTORY);
  const [employees, setEmployees] = useState<Employee[]>(workspace?.employees ?? INITIAL_EMPLOYEES);
  const [shifts, setShifts] = useState<Shift[]>(workspace?.shifts ?? INITIAL_SHIFTS);
  const [notifications, setNotifications] = useState<LiveNotification[]>([]);

  // Sync state if mock
  useEffect(() => {
    const snapshot: WorkspaceSnapshot = { patients, appointments, encounters, invoices, inventory, employees, shifts };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  }, [patients, appointments, encounters, invoices, inventory, employees, shifts]);

  // Sync state from LocalStorage on tenant/session updates (critical for onboarding fresh signup loads)
  useEffect(() => {
    const freshWorkspace = loadWorkspace();
    if (freshWorkspace) {
      if (freshWorkspace.patients.length > 0) setPatients(freshWorkspace.patients);
      if (freshWorkspace.appointments.length > 0) setAppointments(freshWorkspace.appointments);
      if (freshWorkspace.encounters.length > 0) setEncounters(freshWorkspace.encounters);
      if (freshWorkspace.invoices.length > 0) setInvoices(freshWorkspace.invoices);
      if (freshWorkspace.inventory.length > 0) setInventory(freshWorkspace.inventory);
      if (freshWorkspace.employees.length > 0) setEmployees(freshWorkspace.employees);
      if (freshWorkspace.shifts.length > 0) setShifts(freshWorkspace.shifts);
    }
  }, [tenant]);

  // Supabase Real-Time Subscriptions
  useEffect(() => {
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) return;
    if (isMock || !activeTenantId) return;

    const channel = supabase
      .channel(`realtime-tenant-${activeTenantId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patients', filter: `tenant_id=eq.${activeTenantId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const fresh = payload.new as Patient;
          setPatients(prev => [fresh, ...prev]);
          addNotification(`New Patient Registered: ${fresh.name}`, 'info');
        } else if (payload.eventType === 'UPDATE') {
          setPatients(prev => prev.map(p => p.id === payload.new.id ? payload.new as Patient : p));
        } else if (payload.eventType === 'DELETE') {
          setPatients(prev => prev.filter(p => p.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `tenant_id=eq.${activeTenantId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const fresh = payload.new as Appointment;
          setAppointments(prev => [fresh, ...prev]);
          addNotification(`New Appointment Scheduled for patient: ${fresh.patient_name}`, 'info');
        } else if (payload.eventType === 'UPDATE') {
          const fresh = payload.new as Appointment;
          setAppointments(prev => prev.map(a => a.id === fresh.id ? fresh : a));
          if (fresh.status === 'arrived') {
            addNotification(`Patient checked-in: ${fresh.patient_name} (Token: ${fresh.token})`, 'success');
          }
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'encounters', filter: `tenant_id=eq.${activeTenantId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const fresh = payload.new as EMR_Encounter;
          setEncounters(prev => [fresh, ...prev]);
          addNotification(`EMR Clinical Encounter created for ${fresh.patient_name}`, 'success');
        } else if (payload.eventType === 'UPDATE') {
          setEncounters(prev => prev.map(e => e.id === payload.new.id ? payload.new as EMR_Encounter : e));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices', filter: `tenant_id=eq.${activeTenantId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const fresh = payload.new as Invoice;
          setInvoices(prev => [fresh, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          const fresh = payload.new as Invoice;
          setInvoices(prev => prev.map(i => i.id === fresh.id ? fresh : i));
          if (fresh.status === 'paid') {
            addNotification(`Invoice #${fresh.id.substring(0,6)} paid by ${fresh.patient_name}`, 'success');
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTenantId, isMock]);

  // Notification actions
  const addNotification = (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    const id = `noti-${Date.now()}`;
    const newNoti: LiveNotification = {
      id,
      message,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      read: false
    };
    setNotifications(prev => [newNoti, ...prev].slice(0, 30));
    toast(message, type);
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Real-Time Simulator background engine
  useEffect(() => {
    if (!isMock || !tenant || tenant.id === 'superadmin-tenant-id') return;

    const interval = setInterval(() => {
      const eventTypes = ['patient_arrival', 'lab_complete', 'invoice_settlement'];
      const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];

      switch (randomEvent) {
        case 'patient_arrival': {
          const firsts = ['Lucas', 'Emma', 'Ethan', 'Isabella', 'Mason', 'Sophia', 'Oliver', 'Charlotte'];
          const lasts = ['Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson'];
          const randomFirst = firsts[Math.floor(Math.random() * firsts.length)];
          const randomLast = lasts[Math.floor(Math.random() * lasts.length)];
          const patientName = `${randomFirst} ${randomLast}`;
          const dobDate = new Date(Date.now() - (Math.random() * 45 + 18) * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

          // Register
          const newPat: Patient = {
            id: `p-${Date.now()}`,
            tenant_id: activeTenantId,
            name: patientName,
            gender: Math.random() > 0.5 ? 'Male' : 'Female',
            dob: dobDate,
            age: new Date().getFullYear() - new Date(dobDate).getFullYear(),
            phone: `+1 (555) 700-${Math.floor(Math.random() * 9000 + 1000)}`,
            email: `${randomFirst.toLowerCase()}@email.com`,
            address: '100 Medical Plaza Drive',
            emergency_contact: 'Spouse (+1 555-700-1111)',
            blood_group: 'O-positive',
            allergies: 'None',
            history: 'Auto simulation check-in'
          };
          setPatients(prev => [newPat, ...prev]);

          // Book
          const app: Appointment = {
            id: `a-${Date.now()}`,
            tenant_id: activeTenantId,
            patient_id: newPat.id,
            patient_name: newPat.name,
            doctor_name: 'Dr. Alexander House',
            date: new Date().toISOString().split('T')[0],
            time: `${Math.floor(Math.random() * 3 + 1)}:${['00', '30'][Math.floor(Math.random() * 2)]} PM`,
            token: `T-${100 + appointments.length + 1}`,
            status: 'arrived'
          };
          setAppointments(prev => [app, ...prev]);
          addNotification(`Front Desk: Patient ${newPat.name} checked in. Assigned Token: ${app.token}`, 'success');
          break;
        }

        case 'lab_complete': {
          setEncounters(prev => {
            const pending: { encounterId: string; testName: string; patientName: string }[] = [];
            prev.forEach(e => {
              e.lab_orders.forEach(l => {
                if (l.status === 'ordered') {
                  pending.push({ encounterId: e.id, testName: l.test_name, patientName: e.patient_name });
                }
              });
            });

            if (pending.length === 0) return prev;

            const chosen = pending[Math.floor(Math.random() * pending.length)];
            addNotification(`Laboratory: Completed blood test profile for ${chosen.patientName}`, 'success');

            return prev.map(e => {
              if (e.id !== chosen.encounterId) return e;
              return {
                ...e,
                lab_orders: e.lab_orders.map(l =>
                  l.test_name === chosen.testName
                    ? { ...l, result: 'Values: Cholesterol: 198 mg/dL (Normal)', status: 'completed' as const, technician: 'Simulation Lab Engine' }
                    : l
                )
              };
            });
          });
          break;
        }

        case 'invoice_settlement': {
          setInvoices(prev => {
            const unpaid = prev.filter(inv => inv.status === 'unpaid' && inv.tenant_id === activeTenantId);
            if (unpaid.length === 0) return prev;

            const chosen = unpaid[Math.floor(Math.random() * unpaid.length)];
            addNotification(`Central Desk: Collected ₹${chosen.amount} billing settlement from ${chosen.patient_name}`, 'success');
            return prev.map(i => i.id === chosen.id ? { ...i, status: 'paid' as const } : i);
          });
          break;
        }
      }
    }, 30000); // Ticker updates every 30 seconds

    return () => clearInterval(interval);
  }, [isMock, tenant, activeTenantId, appointments.length]);

  // Actions implementations

  // 1. Patient Registration
  const registerPatient = (patientData: Omit<Patient, 'id' | 'tenant_id'>) => {
    const newPatient: Patient = {
      ...patientData,
      id: `p-${Date.now()}`,
      tenant_id: activeTenantId
    };
    setPatients(prev => [newPatient, ...prev]);
    addNotification(`Registered Patient: ${newPatient.name}`, 'success');
    return newPatient;
  };

  // 2. Book Appointment
  const bookAppointment = (patientId: string, doctorName: string, date: string, time: string) => {
    const patientObj = patients.find(p => p.id === patientId);
    const newAppointment: Appointment = {
      id: `a-${Date.now()}`,
      tenant_id: activeTenantId,
      patient_id: patientId,
      patient_name: patientObj?.name || 'Walk-in Patient',
      doctor_name: doctorName,
      date,
      time,
      token: `T-${100 + appointments.length + 1}`,
      status: 'booked'
    };
    setAppointments(prev => [newAppointment, ...prev]);
    addNotification(`Appointment booked: ${newAppointment.patient_name} with ${newAppointment.doctor_name}`, 'info');
    return newAppointment;
  };

  // 3. Receptionist Check-in
  const checkInAppointment = (appointmentId: string) => {
    setAppointments(prev =>
      prev.map(a => {
        if (a.id === appointmentId) {
          addNotification(`Patient checked-in: ${a.patient_name} (Token: ${a.token})`, 'success');
          return { ...a, status: 'arrived' as const };
        }
        return a;
      })
    );
  };

  // 4. Clinical Encounter creation by Doctor
  const createEncounter = (
    patientId: string,
    complaint: string,
    vitals: { blood_pressure: string; pulse: string; temp: string },
    soap: { subjective: string; objective: string; assessment: string; plan: string },
    diagnosis: string,
    prescriptions: Omit<PrescriptionItem, 'dispensed'>[],
    labTests: Omit<DiagnosticOrder, 'status' | 'approved'>[],
    radiologyTests: Omit<DiagnosticOrder, 'status' | 'approved'>[]
  ) => {
    const patientObj = patients.find(p => p.id === patientId);
    
    // Construct orders lists
    const labOrdersList: DiagnosticOrder[] = labTests.map(t => ({
      ...t,
      status: 'ordered',
      approved: false
    }));

    const radOrdersList: DiagnosticOrder[] = radiologyTests.map(t => ({
      ...t,
      status: 'ordered',
      approved: false
    }));

    const encounterId = `enc-${Date.now()}`;
    const newEncounter: EMR_Encounter = {
      id: encounterId,
      tenant_id: activeTenantId,
      patient_id: patientId,
      patient_name: patientObj?.name || 'Unknown Patient',
      date: new Date().toISOString().split('T')[0],
      doctor_name: 'Dr. Alexander House',
      chief_complaint: complaint,
      vitals,
      soap_notes: soap,
      diagnosis,
      prescriptions: prescriptions.map(p => ({ ...p, dispensed: false })),
      lab_orders: labOrdersList,
      radiology_orders: radOrdersList
    };

    setEncounters(prev => [newEncounter, ...prev]);

    // Also auto-generate initial billing invoice for Consultation
    const invoiceItems: InvoiceItem[] = [{ label: 'Outpatient Consultation Fee', price: 650 }];
    
    labOrdersList.forEach(l => {
      invoiceItems.push({ label: `Laboratory Order: ${l.test_name}`, price: l.price });
    });
    
    radOrdersList.forEach(r => {
      invoiceItems.push({ label: `Radiology Order: ${r.test_name}`, price: r.price });
    });

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      tenant_id: activeTenantId,
      patient_id: patientId,
      patient_name: patientObj?.name || 'Unknown Patient',
      items: invoiceItems,
      amount: invoiceItems.reduce((acc, curr) => acc + curr.price, 0),
      status: 'unpaid',
      date: new Date().toISOString().split('T')[0]
    };

    setInvoices(prev => [newInvoice, ...prev]);

    // Update appointment status to completed if matched
    setAppointments(prev =>
      prev.map(a =>
        a.patient_id === patientId && a.status === 'arrived'
          ? { ...a, status: 'completed' as const }
          : a
      )
    );

    addNotification(`Clinical record completed for ${newEncounter.patient_name}. Billing slip released.`, 'success');
    return newEncounter;
  };

  // 5. Diagnostic Test result submitting by Lab Technician
  const submitLabResult = (encounterId: string, testName: string, result: string, techName: string) => {
    setEncounters(prev =>
      prev.map(e => {
        if (e.id !== encounterId) return e;
        addNotification(`Diagnostics: Lab findings logged for ${e.patient_name}`, 'info');
        return {
          ...e,
          lab_orders: e.lab_orders.map(o =>
            o.test_name === testName
              ? { ...o, result, status: 'completed' as const, technician: techName }
              : o
          )
        };
      })
    );
  };

  // 6. Radiology result logging
  const submitRadiologyResult = (encounterId: string, imageName: string, result: string, radioName: string) => {
    setEncounters(prev =>
      prev.map(e => {
        if (e.id !== encounterId) return e;
        addNotification(`Diagnostics: PACS radiology scan findings logged for ${e.patient_name}`, 'info');
        return {
          ...e,
          radiology_orders: e.radiology_orders.map(o =>
            o.test_name === imageName
              ? { ...o, result, status: 'completed' as const, technician: radioName }
              : o
          )
        };
      })
    );
  };

  // 7. Diagnostics Approval by Doctor (Clinical sign-off)
  const approveDiagnostics = (encounterId: string, orderType: 'lab' | 'radiology', testName: string) => {
    setEncounters(prev =>
      prev.map(e => {
        if (e.id !== encounterId) return e;
        if (orderType === 'lab') {
          addNotification(`Sign-off: Doctor approved lab results for ${e.patient_name}`, 'success');
          return {
            ...e,
            lab_orders: e.lab_orders.map(o =>
              o.test_name === testName ? { ...o, approved: true } : o
            )
          };
        } else {
          addNotification(`Sign-off: Doctor approved radiology scans for ${e.patient_name}`, 'success');
          return {
            ...e,
            radiology_orders: e.radiology_orders.map(o =>
              o.test_name === testName ? { ...o, approved: true } : o
            )
          };
        }
      })
    );
  };

  // 8. Pharmacy Medicine Dispensing
  const dispensePrescription = (encounterId: string, medicineName: string) => {
    let matchedPrice = 0;
    let patientId = '';
    let patientName = '';

    setEncounters(prev =>
      prev.map(e => {
        if (e.id !== encounterId) return e;
        patientId = e.patient_id;
        patientName = e.patient_name;
        return {
          ...e,
          prescriptions: e.prescriptions.map(p => {
            if (p.medicine_name === medicineName) {
              matchedPrice = p.price;
              return { ...p, dispensed: true };
            }
            return p;
          })
        };
      })
    );

    // Decrement stock
    setInventory(prev =>
      prev.map(item =>
        item.name === medicineName && item.tenant_id === activeTenantId
          ? { ...item, stock: Math.max(0, item.stock - 1) }
          : item
      )
    );

    if (matchedPrice > 0 && patientId) {
      setInvoices(prev => {
        const patientUnpaidInv = prev.find(inv => inv.patient_id === patientId && inv.status === 'unpaid');
        if (patientUnpaidInv) {
          addNotification(`Pharmacy: Dispensed Rx ${medicineName} to ${patientName}`, 'success');
          return prev.map(inv => {
            if (inv.id !== patientUnpaidInv.id) return inv;
            const updatedItems = [...inv.items, { label: `Dispensed Rx: ${medicineName}`, price: matchedPrice }];
            return {
              ...inv,
              items: updatedItems,
              amount: updatedItems.reduce((acc, curr) => acc + curr.price, 0)
            };
          });
        } else {
          const newInvoice: Invoice = {
            id: `inv-${Date.now()}`,
            tenant_id: activeTenantId,
            patient_id: patientId,
            patient_name: patientName,
            items: [{ label: `Dispensed Rx: ${medicineName}`, price: matchedPrice }],
            amount: matchedPrice,
            status: 'unpaid',
            date: new Date().toISOString().split('T')[0]
          };
          addNotification(`Pharmacy: Dispensed Rx ${medicineName} to ${patientName}`, 'success');
          return [newInvoice, ...prev];
        }
      });
    }
  };

  // 9. Payment Collection
  const payInvoice = (invoiceId: string) => {
    setInvoices(prev =>
      prev.map(inv => {
        if (inv.id === invoiceId) {
          addNotification(`Collect: Received payment of ₹${inv.amount} from ${inv.patient_name}`, 'success');
          return { ...inv, status: 'paid' as const };
        }
        return inv;
      })
    );
  };

  // 10. Inventory Operations
  const addInventoryStock = (itemId: string, qty: number) => {
    setInventory(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          addNotification(`Procurement: restocked ${qty} units of ${item.name}`, 'info');
          return { ...item, stock: item.stock + qty };
        }
        return item;
      })
    );
  };

  const addNewInventoryItem = (item: Omit<InventoryItem, 'id' | 'tenant_id'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: `i-${Date.now()}`,
      tenant_id: activeTenantId
    };
    setInventory(prev => [...prev, newItem]);
    addNotification(`Procurement: Added stock catalog listing: ${newItem.name}`, 'success');
  };

  // 11. HR employee additions
  const addNewEmployee = (emp: Omit<Employee, 'id' | 'tenant_id' | 'leave_balance' | 'attendance_rate'>) => {
    const newEmp: Employee = {
      ...emp,
      id: `emp-${Date.now()}`,
      tenant_id: activeTenantId,
      leave_balance: 15,
      attendance_rate: 100
    };
    setEmployees(prev => [...prev, newEmp]);
    addNotification(`HR Directory: Registered employee file: ${newEmp.name} (${newEmp.role})`, 'success');
  };

  // 12. Log leave logs
  const logLeaveRequest = (employeeId: string, days: number) => {
    setEmployees(prev =>
      prev.map(e => {
        if (e.id === employeeId) {
          addNotification(`HR Payroll: Leave approved for ${e.name} (${days} days)`, 'warning');
          return { ...e, leave_balance: Math.max(0, e.leave_balance - days) };
        }
        return e;
      })
    );
  };

  // 13. Assign shift
  const assignEmployeeShift = (shift: Omit<Shift, 'id' | 'tenant_id'>) => {
    const newShift: Shift = {
      ...shift,
      id: `s-${Date.now()}`,
      tenant_id: activeTenantId
    };
    setShifts(prev => [...prev, newShift]);
    addNotification(`Shift schedule: Assigned shift for ${newShift.employee_name} on ${newShift.day}`, 'info');
  };

  const resetDemoWorkspace = () => {
    localStorage.removeItem(STORAGE_KEY);
    setPatients(INITIAL_PATIENTS);
    setAppointments(INITIAL_APPOINTMENTS);
    setEncounters(INITIAL_ENCOUNTERS);
    setInvoices(INITIAL_INVOICES);
    setInventory(INITIAL_INVENTORY);
    setEmployees(INITIAL_EMPLOYEES);
    setShifts(INITIAL_SHIFTS);
    addNotification('Sandbox restored to initial database seed arrays.', 'warning');
  };

  return (
    <DataContext.Provider
      value={{
        patients,
        appointments,
        encounters,
        invoices,
        inventory,
        employees,
        shifts,
        notifications,
        
        // Actions
        registerPatient,
        bookAppointment,
        checkInAppointment,
        createEncounter,
        submitLabResult,
        submitRadiologyResult,
        approveDiagnostics,
        dispensePrescription,
        payInvoice,
        addInventoryStock,
        addNewInventoryItem,
        addNewEmployee,
        logLeaveRequest,
        assignEmployeeShift,
        resetDemoWorkspace,
        addNotification,
        markNotificationsAsRead
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
export default DataContext;
