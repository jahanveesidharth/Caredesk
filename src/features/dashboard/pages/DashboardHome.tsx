import React, { useState } from 'react';
import { useAuth, MOCK_TENANTS } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import type { DiagnosticOrder } from '../../../context/DataContext';
import { useToast } from '../../../components/ui/toast';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '../../../components/ui/card';
import Button from '../../../components/ui/button';
import Input from '../../../components/ui/input';
import Badge from '../../../components/ui/badge';
import Dialog from '../../../components/ui/dialog';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '../../../components/ui/table';
import {
  Users,
  Activity,
  Calendar,
  DollarSign,
  Shield,
  Plus,
  CheckCircle,
  Stethoscope,
  Printer,
  FileText,
  Building,
  UserCheck,
  AlertTriangle,
  AlertCircle,
  Search
} from 'lucide-react';

interface DashboardHomeProps {
  activeTab: string;
}

const formatINR = (amount: number) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
}).format(amount);

export const DashboardHome: React.FC<DashboardHomeProps> = ({ activeTab }) => {
  const { profile, tenant, isMock } = useAuth();
  const { toast } = useToast();
  
  // Context states
  const {
    patients,
    appointments,
    encounters,
    invoices,
    inventory,
    employees,
    shifts,
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
    resetDemoWorkspace
  } = useData();

  // Tenant logical isolation filters
  const activeTenantId = tenant?.id;
  const filteredPatients = patients.filter(p => p.tenant_id === activeTenantId);
  const filteredAppointments = appointments.filter(a => a.tenant_id === activeTenantId);
  const filteredEncounters = encounters.filter(e => e.tenant_id === activeTenantId);
  const filteredInvoices = invoices.filter(i => i.tenant_id === activeTenantId);
  const filteredInventory = inventory.filter(inv => inv.tenant_id === activeTenantId);
  const filteredEmployees = employees.filter(emp => emp.tenant_id === activeTenantId);
  const filteredShifts = shifts.filter(s => s.tenant_id === activeTenantId);

  // Active detail selection states
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isConsultOpen, setIsConsultOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);

  // Active items for detail modals
  const [activeTestOrder, setActiveTestOrder] = useState<{ encounterId: string; testName: string; type: 'lab' | 'radiology' } | null>(null);

  // Form inputs states
  // 1. Patient Registration
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [allergies, setAllergies] = useState('');
  const [history, setHistory] = useState('');

  // 2. Booking Appointment
  const [appPatientId, setAppPatientId] = useState('');
  const [appDoctor, setAppDoctor] = useState('');
  const [appDate, setAppDate] = useState(new Date().toISOString().split('T')[0]);
  const [appTime, setAppTime] = useState('09:00 AM');

  // 3. Clinical Encounter
  const [cPatientId, setCPatientId] = useState('');
  const [cComplaint, setCComplaint] = useState('');
  const [cBp, setCBp] = useState('120/80');
  const [cPulse, setCPulse] = useState('72');
  const [cTemp, setCTemp] = useState('98.6');
  const [cSubj, setCSubj] = useState('');
  const [cObj, setCObj] = useState('');
  const [cAssess, setCAssess] = useState('');
  const [cPlan, setCPlan] = useState('');
  const [cDiagnosis, setCDiagnosis] = useState('');
  
  // Custom arrays for dynamic presc/lab additions in consultation form
  const [formPrescriptions, setFormPrescriptions] = useState<{ medicine_name: string; dosage: string; frequency: string; duration: string; price: number }[]>([]);
  const [formLabs, setFormLabs] = useState<{ test_name: string; price: number }[]>([]);
  const [formRadiology, setFormRadiology] = useState<{ test_name: string; price: number }[]>([]);

  const [newMedName, setNewMedName] = useState('Amoxicillin 500mg');
  const [newMedDose] = useState('1 pill');
  const [newMedFreq] = useState('Twice daily');
  const [newMedDur] = useState('5 days');

  const [newLabName, setNewLabName] = useState('CBC Blood Test');
  const [newRadName, setNewRadName] = useState('Chest X-Ray');

  // 4. Lab Technician Result input
  const [diagResultText, setDiagResultText] = useState('');

  // 5. Employee Shift assignment
  const [shiftEmpName, setShiftEmpName] = useState('');
  const [shiftDay, setShiftDay] = useState('Monday');
  const [shiftTime, setShiftTime] = useState<'Morning (08:00 - 16:00)' | 'Evening (16:00 - 00:00)' | 'Night (00:00 - 08:00)'>('Morning (08:00 - 16:00)');

  // 6. HR Employee Registration
  const [empName, setEmpName] = useState('');
  const [empRole, setEmpRole] = useState('nurse');
  const [empDept, setEmpDept] = useState('Emergency Room');
  const [empSalary, setEmpSalary] = useState('45000');

  // 7. Inventory Items additions
  const [invName, setInvName] = useState('');
  const [invGeneric, setInvGeneric] = useState('');
  const [invCat, setInvCat] = useState<'tablet' | 'syrup' | 'injection' | 'consumable' | 'supplies'>('tablet');
  const [invUnit, setInvUnit] = useState('Box of 100');
  const [invPurchase, setInvPurchase] = useState('100');
  const [invSelling, setInvSelling] = useState('200');
  const [invStock, setInvStock] = useState('100');
  const [invReorder, setInvReorder] = useState('15');
  const [invSupplier, setInvSupplier] = useState('PharmaCorp Inc.');

  // Hospital Admin inputs
  const [hospitalName, setHospitalName] = useState(tenant?.name || '');
  const [billingEmail, setBillingEmail] = useState(tenant?.billing_email || '');

  // Global search parameters
  const [searchQuery, setSearchQuery] = useState('');

  // Keep every hook above this guard: auth hydration can briefly leave profile empty.
  if (!profile || !tenant) return null;
  const role = profile.role as string;

  // Form submit handles
  const handleUpdateTenantSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast('Tenant profile settings updated successfully!', 'success');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dob || !phone || !email) {
      toast('Please enter name, DOB, phone and email address', 'warning');
      return;
    }
    const computedAge = new Date().getFullYear() - new Date(dob).getFullYear();
    const newPat = registerPatient({
      name,
      gender,
      dob,
      age: computedAge,
      phone,
      email,
      address,
      emergency_contact: emergencyContact,
      blood_group: bloodGroup,
      allergies,
      history
    });

    toast(`Registered patient: ${newPat.name}`, 'success');
    setName('');
    setDob('');
    setPhone('');
    setEmail('');
    setAddress('');
    setEmergencyContact('');
    setAllergies('');
    setHistory('');
    setIsRegisterOpen(false);
  };

  const handleBookApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appPatientId) {
      toast('Please select a registered patient', 'warning');
      return;
    }
    if (!appDoctor) {
      toast('Please select an assigned doctor', 'warning');
      return;
    }
    const app = bookAppointment(appPatientId, appDoctor, appDate, appTime);
    toast(`Appointment token generated: ${app.token}`, 'success');
    setAppPatientId('');
  };

  const handleConsultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cPatientId || !cComplaint || !cDiagnosis) {
      toast('Please select a patient, enter chief complaint, and diagnosis', 'warning');
      return;
    }

    createEncounter(
      cPatientId,
      cComplaint,
      { blood_pressure: cBp, pulse: cPulse, temp: cTemp },
      { subjective: cSubj, objective: cObj, assessment: cAssess, plan: cPlan },
      cDiagnosis,
      formPrescriptions,
      formLabs.map(l => ({ test_name: l.test_name, price: l.price })),
      formRadiology.map(r => ({ test_name: r.test_name, price: r.price }))
    );

    toast('EMR encounter record created. Central billing updated.', 'success');
    setIsConsultOpen(false);
    // Clear forms
    setCPatientId('');
    setCComplaint('');
    setCDiagnosis('');
    setCSubj('');
    setCObj('');
    setCAssess('');
    setCPlan('');
    setFormPrescriptions([]);
    setFormLabs([]);
    setFormRadiology([]);
  };

  const handleResultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTestOrder || !diagResultText) return;

    if (activeTestOrder.type === 'lab') {
      submitLabResult(activeTestOrder.encounterId, activeTestOrder.testName, diagResultText, `${profile.first_name} ${profile.last_name}`);
      toast('Lab test result recorded. Awaiting doctor clinical review.', 'success');
    } else {
      submitRadiologyResult(activeTestOrder.encounterId, activeTestOrder.testName, diagResultText, `${profile.first_name} ${profile.last_name}`);
      toast('Radiology scan result linked. Awaiting doctor approval.', 'success');
    }

    setDiagResultText('');
    setActiveTestOrder(null);
    setIsResultModalOpen(false);
  };

  const handleShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftEmpName) return;
    assignEmployeeShift({
      employee_name: shiftEmpName,
      role: 'staff',
      day: shiftDay,
      shift_time: shiftTime
    });
    toast(`Assigned shift for ${shiftEmpName}`, 'success');
    setIsShiftModalOpen(false);
    setShiftEmpName('');
  };

  const handleEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName) return;
    addNewEmployee({
      name: empName,
      role: empRole,
      department: empDept,
      salary: parseFloat(empSalary)
    });
    toast(`Registered staff member: ${empName}`, 'success');
    setIsEmployeeModalOpen(false);
    setEmpName('');
  };

  const handleInventorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invName) return;
    addNewInventoryItem({
      name: invName,
      generic_name: invGeneric,
      category: invCat,
      unit: invUnit,
      purchase_price: parseFloat(invPurchase),
      selling_price: parseFloat(invSelling),
      stock: parseInt(invStock),
      reorder_level: parseInt(invReorder),
      supplier: invSupplier
    });
    toast(`Added item: ${invName}`, 'success');
    setIsInventoryModalOpen(false);
    setInvName('');
    setInvGeneric('');
  };

  // Helper selectors
  const getPatientObj = (id: string) => filteredPatients.find(p => p.id === id);

  // ==========================================
  // RENDER BLOCKS FOR SPECIFIC TABS
  // ==========================================

  // 1. Unified Operations Dashboard (Staff Homepage)
  const renderOperationsDashboard = () => {
    // Generate role-specific homepage dashboard
    switch (role) {
      case 'super_admin':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card hoverable className="border-purple-500/10">
                <CardContent className="pt-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-semibold text-text-muted uppercase">Active SaaS Subdomains</p>
                      <h3 className="text-3xl font-black text-text-heading mt-1">2</h3>
                    </div>
                    <Building className="text-purple-500" size={32} />
                  </div>
                  <div className="mt-4 text-xs text-text-muted flex gap-2">
                    <span className="text-green-500 font-bold">stmary.caredesk</span>
                    <span className="text-indigo-500 font-bold">apexdental.caredesk</span>
                  </div>
                </CardContent>
              </Card>
              <Card hoverable>
                <CardContent className="pt-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-semibold text-text-muted uppercase">Platform Health</p>
                      <h3 className="text-3xl font-black text-emerald-600 mt-1">99.98%</h3>
                    </div>
                    <CheckCircle className="text-emerald-500" size={32} />
                  </div>
                  <div className="mt-4 text-xs text-text-muted">
                    Cluster API Response: <code className="font-mono text-[10px] bg-bg-surface-hover px-1 rounded">214ms</code>
                  </div>
                </CardContent>
              </Card>
              <Card hoverable>
                <CardContent className="pt-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-semibold text-text-muted uppercase">Clinical Privacy Isolation</p>
                      <h3 className="text-3xl font-black text-indigo-600 mt-1">Enforced</h3>
                    </div>
                    <Shield className="text-indigo-500" size={32} />
                  </div>
                  <div className="mt-4 text-xs text-indigo-600 font-bold">
                    Super Admins bypass patient-EMR data views (compliant HIPAA)
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Core Tenant Clusters status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border border-border-main rounded-xl bg-bg-surface-hover/50">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span className="font-bold text-sm text-text-heading">St. Mary General Hospital</span>
                      </div>
                      <Badge variant="success">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-border-main rounded-xl bg-bg-surface-hover/50">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span className="font-bold text-sm text-text-heading">Apex Dental Care</span>
                      </div>
                      <Badge variant="success">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>System Performance Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[10px] space-y-1 shadow-inner h-[140px] overflow-y-auto">
                    <div>[SYSTEM] 10:44:00 AM API-GATEWAY: Routing check ok.</div>
                    <div className="text-indigo-400">[SUPABASE] 10:44:02 AM postgres: Session app.current_tenant_id bound to tenant 't1'.</div>
                    <div className="text-emerald-400">[RLS] 10:44:03 AM query check: Filter applied for profiles SELECT. Returning 3 rows.</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'hospital_admin': {
        const paidRevenue = filteredInvoices.filter(i => i.status === 'paid').reduce((acc, c) => acc + c.amount, 0);
        const unpaidAR = filteredInvoices.filter(i => i.status === 'unpaid').reduce((acc, c) => acc + c.amount, 0);
        const lowStockCount = filteredInventory.filter(item => item.stock <= item.reorder_level).length;

        return (
          <div className="space-y-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card hoverable className="border-indigo-500/10">
                <CardContent className="pt-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-semibold text-text-muted uppercase">Hospital Revenue (Paid)</p>
                      <h3 className="text-2xl font-black text-emerald-600 mt-1">{formatINR(paidRevenue)}</h3>
                    </div>
                    <DollarSign className="text-emerald-500" size={28} />
                  </div>
                  <p className="text-[10px] text-text-muted mt-2">Cashflow collected directly in mock vault</p>
                </CardContent>
              </Card>

              <Card hoverable className="border-indigo-500/10">
                <CardContent className="pt-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-semibold text-text-muted uppercase">Accounts Receivable (AR)</p>
                      <h3 className="text-2xl font-black text-rose-500 mt-1">{formatINR(unpaidAR)}</h3>
                    </div>
                    <AlertCircle className="text-rose-500" size={28} />
                  </div>
                  <p className="text-[10px] text-text-muted mt-2">Outstanding client balances pending payment</p>
                </CardContent>
              </Card>

              <Card hoverable className="border-indigo-500/10">
                <CardContent className="pt-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-semibold text-text-muted uppercase">Total Registered Patients</p>
                      <h3 className="text-2xl font-black text-text-heading mt-1">{filteredPatients.length} Patients</h3>
                    </div>
                    <Users className="text-indigo-500" size={28} />
                  </div>
                  <p className="text-[10px] text-text-muted mt-2">Registered client directory files active</p>
                </CardContent>
              </Card>

              <Card hoverable className="border-indigo-500/10">
                <CardContent className="pt-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-semibold text-text-muted uppercase">Roster Staff size</p>
                      <h3 className="text-2xl font-black text-text-heading mt-1">{filteredEmployees.length} Clinicians</h3>
                    </div>
                    <Activity className="text-blue-500" size={28} />
                  </div>
                  <p className="text-[10px] text-text-muted mt-2">Active personnel assignments today</p>
                </CardContent>
              </Card>
            </div>

            {/* Middle Section: Recent Bookings Ledger & Low Stock Warning */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Daily appointments slot ledger */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Daily Outpatient Appointments</CardTitle>
                      <CardDescription>Hospital-wide clinical appointment listings</CardDescription>
                    </div>
                    <Badge variant="primary">{filteredAppointments.length} Booked</Badge>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Token</TableHead>
                          <TableHead>Patient Name</TableHead>
                          <TableHead>Date / Time</TableHead>
                          <TableHead>Doctor</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAppointments.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-text-muted py-6">No appointments booked today.</TableCell>
                          </TableRow>
                        ) : (
                          filteredAppointments.slice(0, 5).map(a => (
                            <TableRow key={a.id}>
                              <TableCell className="font-mono text-xs font-bold text-brand-primary">{a.token}</TableCell>
                              <TableCell className="font-bold text-text-heading">{a.patient_name}</TableCell>
                              <TableCell>{a.date} | {a.time}</TableCell>
                              <TableCell>{a.doctor_name}</TableCell>
                              <TableCell>
                                <Badge variant={a.status === 'arrived' ? 'warning' : a.status === 'completed' ? 'success' : 'primary'}>
                                  {a.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              {/* Low stock alerts & critical parameters */}
              <div className="space-y-6">
                <Card className="border-amber-500/20 bg-amber-500/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-amber-800 dark:text-amber-300 flex items-center gap-2 text-sm font-bold">
                      <AlertTriangle size={16} /> Critical Stock Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {lowStockCount === 0 ? (
                      <p className="text-xs text-amber-700 dark:text-amber-400">All medicine inventory levels healthy.</p>
                    ) : (
                      <div className="space-y-3">
                        {filteredInventory.filter(item => item.stock <= item.reorder_level).slice(0, 3).map(item => (
                          <div key={item.id} className="flex justify-between items-center bg-bg-surface p-2.5 border border-amber-500/10 rounded-lg text-xs">
                            <div>
                              <p className="font-bold text-text-heading">{item.name}</p>
                              <p className="text-text-muted text-[10px]">Current Stock: {item.stock} units</p>
                            </div>
                            <Badge variant="danger">Low Stock</Badge>
                          </div>
                        ))}
                        <p className="text-[10px] text-text-muted mt-2">There are {lowStockCount} items below safe stock reorder threshold.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Platform Compliance status */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Shield size={16} className="text-indigo-500" /> Compliance Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span>Data Isolation (Multi-tenant):</span>
                      <span className="text-emerald-600 font-bold">Enforced</span>
                    </div>
                    <div className="flex justify-between">
                      <span>HIPAA Privacy Logs:</span>
                      <span className="text-emerald-600 font-bold">Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Workspace status:</span>
                      <span className="text-indigo-600 font-bold">Demo Sandbox</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );
      }

      case 'doctor':
        // Doctor queue and diagnostic approvals
        const queueList = filteredAppointments.filter(a => a.status === 'arrived');
        const awaitingApprovals = filteredEncounters.filter(e =>
          e.lab_orders.some(o => o.status === 'completed' && !o.approved) ||
          e.radiology_orders.some(o => o.status === 'completed' && !o.approved)
        );

        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Doctor queue */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Checked-in OPD Patient Queue</CardTitle>
                      <CardDescription>Select patient to start consultation</CardDescription>
                    </div>
                    <Badge variant="primary">{queueList.length} Awaiting</Badge>
                  </CardHeader>
                  <CardContent>
                    {queueList.length === 0 ? (
                      <div className="text-center py-10 text-text-muted flex flex-col items-center gap-2">
                        <UserCheck size={36} className="text-text-muted/50" />
                        <p className="text-sm font-semibold">No checked-in patients in clinic queue.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {queueList.map(q => (
                          <div key={q.id} className="flex justify-between items-center p-3.5 border border-border-main bg-bg-surface-hover/30 rounded-xl hover:border-brand-primary/40 transition-all">
                            <div>
                              <p className="font-bold text-text-heading text-sm">{q.patient_name}</p>
                              <p className="text-xs text-text-muted">Token: <span className="font-mono font-bold text-brand-primary">{q.token}</span> | Doctor: {q.doctor_name}</p>
                            </div>
                            <Button size="sm" onClick={() => {
                              setCPatientId(q.patient_id);
                              setIsConsultOpen(true);
                            }}>
                              Start Consultation
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* EMR Encounters log */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Patient Encounters</CardTitle>
                    <CardDescription>Clinical documentation timeline</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredEncounters.map(e => (
                        <div key={e.id} className="p-4 border border-border-main rounded-xl space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-bold text-text-heading text-sm">{e.patient_name}</span>
                              <span className="text-xs text-text-muted block">{e.date} | Chief Complaint: "{e.chief_complaint}"</span>
                            </div>
                            <Badge variant="neutral">Encounter File</Badge>
                          </div>
                          <div className="text-xs text-text-main">
                            <span className="font-semibold text-text-heading">Diagnosis:</span> {e.diagnosis}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Doctor diagnostics sign off */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Clinical Lab/PACS Sign-off</CardTitle>
                    <CardDescription>Approve results before releasing to patient portal</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {awaitingApprovals.length === 0 ? (
                      <div className="text-center py-8 text-text-muted flex flex-col items-center gap-1.5">
                        <CheckCircle size={28} className="text-emerald-500" />
                        <p className="text-xs font-semibold">All orders signed off.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {awaitingApprovals.map(e => (
                          <div key={e.id} className="p-3 border border-border-main rounded-xl space-y-2 bg-bg-surface-hover/40">
                            <p className="font-bold text-xs text-text-heading">{e.patient_name}</p>
                            
                            {/* Labs check */}
                            {e.lab_orders.filter(l => l.status === 'completed' && !l.approved).map(l => (
                              <div key={l.test_name} className="flex justify-between items-center border-t border-border-main pt-2">
                                <div className="min-w-0 pr-2">
                                  <p className="text-[11px] font-semibold text-text-heading truncate">Lab: {l.test_name}</p>
                                  <p className="text-[10px] text-indigo-600 font-medium italic truncate">Res: {l.result}</p>
                                </div>
                                <Button size="sm" variant="secondary" className="px-2 py-1 h-7 text-[10px]" onClick={() => {
                                  approveDiagnostics(e.id, 'lab', l.test_name);
                                  toast('Lab results approved. Transferred to patient portal timeline.', 'success');
                                }}>
                                  Approve
                                </Button>
                              </div>
                            ))}

                            {/* Radiology check */}
                            {e.radiology_orders.filter(r => r.status === 'completed' && !r.approved).map(r => (
                              <div key={r.test_name} className="flex justify-between items-center border-t border-border-main pt-2">
                                <div className="min-w-0 pr-2">
                                  <p className="text-[11px] font-semibold text-text-heading truncate">Rad: {r.test_name}</p>
                                  <p className="text-[10px] text-cyan-600 font-medium italic truncate">Res: {r.result}</p>
                                </div>
                                <Button size="sm" variant="secondary" className="px-2 py-1 h-7 text-[10px]" onClick={() => {
                                  approveDiagnostics(e.id, 'radiology', r.test_name);
                                  toast('Radiology scan approved. Released to Patient EMR.', 'success');
                                }}>
                                  Approve
                                </Button>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

            </div>
          </div>
        );

      case 'nurse':
        // Bed management sensor
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Bed allocation */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Inpatient Ward Bed Allocations</CardTitle>
                    <CardDescription>Real-time census of General Medical Ward</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {['Bed A-101', 'Bed A-102', 'Bed B-201', 'Bed B-202', 'Bed C-301', 'Bed C-302'].map((bed, idx) => {
                        const occupied = idx < 3; // First 3 beds occupied in mock
                        return (
                          <div
                            key={bed}
                            className={`p-4 border rounded-xl flex flex-col justify-between h-28 transition-all ${
                              occupied
                                ? 'bg-rose-500/5 border-rose-500/20 text-rose-800 dark:text-rose-400'
                                : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-800 dark:text-emerald-400'
                            }`}
                          >
                            <span className="font-bold text-xs">{bed}</span>
                            <div className="flex flex-col">
                              <span className="text-lg font-black">{occupied ? 'Occupied' : 'Vacant'}</span>
                              <span className="text-[10px] text-text-muted mt-1">
                                {occupied ? (idx === 0 ? 'Aarav Sharma' : idx === 1 ? 'Diya Joshi' : 'Rahul Verma') : 'Ready for admissions'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Nurse Quick Actions */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Vitals Logging Portal</CardTitle>
                    <CardDescription>Log bedside stats for checked-in patient</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-xs text-text-muted">Currently Arrived in Queue:</p>
                      {filteredAppointments.filter(a => a.status === 'arrived').map(a => (
                        <div key={a.id} className="p-3 border border-border-main rounded-xl flex justify-between items-center bg-bg-surface-hover/30">
                          <div>
                            <span className="font-semibold text-xs text-text-heading block">{a.patient_name}</span>
                            <span className="text-[10px] text-text-muted font-mono">{a.token}</span>
                          </div>
                          <Button size="sm" onClick={() => {
                            setCPatientId(a.patient_id);
                            setIsConsultOpen(true);
                            toast(`Selected patient ${a.patient_name} for vitals recording`, 'info');
                          }}>
                            Log Vitals
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>
          </div>
        );

      case 'receptionist':
        // Patient registration form
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Daily appointments slot ledger */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Daily Outpatient Appointments</CardTitle>
                      <CardDescription>Track booked schedules, print tickets & check-in arrivals</CardDescription>
                    </div>
                    <Button variant="primary" size="sm" onClick={() => setIsRegisterOpen(true)}>
                      <Plus size={16} /> New Registration
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Token</TableHead>
                          <TableHead>Patient Name</TableHead>
                          <TableHead>Date / Time</TableHead>
                          <TableHead>Doctor</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAppointments.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-text-muted py-6">No appointments booked today.</TableCell>
                          </TableRow>
                        ) : (
                          filteredAppointments.map(a => (
                            <TableRow key={a.id}>
                              <TableCell className="font-mono text-xs font-bold text-brand-primary">{a.token}</TableCell>
                              <TableCell className="font-bold text-text-heading">{a.patient_name}</TableCell>
                              <TableCell>{a.date} | {a.time}</TableCell>
                              <TableCell>{a.doctor_name}</TableCell>
                              <TableCell>
                                <Badge variant={a.status === 'arrived' ? 'warning' : a.status === 'completed' ? 'success' : 'primary'}>
                                  {a.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {a.status === 'booked' && (
                                  <Button size="sm" onClick={() => {
                                    checkInAppointment(a.id);
                                    toast(`Checked in ${a.patient_name}. Assigned token: ${a.token}`, 'success');
                                  }}>
                                    Check In
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              {/* Book slot form */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Schedule Appointment</CardTitle>
                    <CardDescription>Book clinical slots for registered patients</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleBookApp} className="space-y-4">
                      <div className="flex flex-col space-y-1">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wide">Patient</label>
                        <select
                          className="px-3 py-2 bg-bg-surface border border-border-main rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                          value={appPatientId}
                          onChange={e => setAppPatientId(e.target.value)}
                        >
                          <option value="">-- Choose Registered Patient --</option>
                          {filteredPatients.map(p => (
                            <option key={p.id} value={p.id}>{p.name} (Age: {p.age})</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col space-y-1">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wide">Doctor Assignment</label>
                        <select
                          className="px-3 py-2 bg-bg-surface border border-border-main rounded-lg text-sm focus:outline-none focus:ring-2"
                          value={appDoctor}
                          onChange={e => setAppDoctor(e.target.value)}
                        >
                          <option value="">-- Choose Doctor --</option>
                          {filteredEmployees.filter(emp => emp.role === 'doctor').map(doc => (
                            <option key={doc.id} value={doc.name}>{doc.name} ({doc.department})</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          label="Date"
                          type="date"
                          value={appDate}
                          onChange={e => setAppDate(e.target.value)}
                        />
                        <Input
                          label="Time Slot"
                          placeholder="e.g. 10:30 AM"
                          value={appTime}
                          onChange={e => setAppTime(e.target.value)}
                        />
                      </div>

                      <Button type="submit" variant="primary" className="w-full justify-center">
                        Generate Booking Ticket
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

            </div>
          </div>
        );

      case 'cashier':
        // Cashier outstanding invoices list
        const unpaidBills = filteredInvoices.filter(i => i.status === 'unpaid');
        const paidBills = filteredInvoices.filter(i => i.status === 'paid');

        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Unpaid invoices */}
              <Card>
                <CardHeader>
                  <CardTitle>Unpaid Accounts Receivable</CardTitle>
                  <CardDescription>Collect payments and print receipts</CardDescription>
                </CardHeader>
                <CardContent>
                  {unpaidBills.length === 0 ? (
                    <div className="text-center py-10 text-text-muted flex flex-col items-center gap-1.5">
                      <CheckCircle size={28} className="text-emerald-500" />
                      <p className="text-sm font-semibold">All patient accounts fully settled!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {unpaidBills.map(inv => (
                        <div key={inv.id} className="p-4 border border-border-main rounded-xl space-y-3 bg-bg-surface-hover/30">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-bold text-text-heading text-sm">{inv.patient_name}</span>
                              <span className="text-xs text-text-muted block">Invoice ID: {inv.id}</span>
                            </div>
                            <span className="text-lg font-black text-rose-600">{formatINR(inv.amount)}</span>
                          </div>

                          {/* Line items list */}
                          <div className="text-xs text-text-muted border-t border-b border-border-main py-2 space-y-1">
                            {inv.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span>{item.label}</span>
                                <span>{formatINR(item.price)}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-2">
                            <Button size="sm" className="flex-1 justify-center" onClick={() => {
                              payInvoice(inv.id);
                              toast(`Collected payment of ${formatINR(inv.amount)} for ${inv.patient_name}`, 'success');
                            }}>
                              Collect Cash/Card
                            </Button>
                            <Button size="sm" variant="outline" className="px-2" onClick={() => toast('Sending billing slip to thermal printer...', 'info')}>
                              <Printer size={14} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Billing transaction ledger */}
              <Card>
                <CardHeader>
                  <CardTitle>Daily Transaction Ledger</CardTitle>
                  <CardDescription>Paid billing statements</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice ID</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paidBills.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-text-muted py-6">No transactions recorded today.</TableCell>
                        </TableRow>
                      ) : (
                        paidBills.map(inv => (
                          <TableRow key={inv.id}>
                            <TableCell className="font-mono text-xs">{inv.id.substring(0, 10)}...</TableCell>
                            <TableCell className="font-bold text-text-heading">{inv.patient_name}</TableCell>
                            <TableCell>{inv.date}</TableCell>
                            <TableCell className="font-bold text-emerald-600">{formatINR(inv.amount)}</TableCell>
                            <TableCell>
                              <Badge variant="success">Paid</Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

            </div>
          </div>
        );

      case 'pharmacist':
        // Pharmacist dispensations queue
        const activePrescEncounters = filteredEncounters.filter(e => e.prescriptions.some(p => !p.dispensed));
        const lowStockMedicines = filteredInventory.filter(item => item.category === 'tablet' && item.stock <= item.reorder_level);

        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Prescription dispensing list */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Rx Dispensing Queue</CardTitle>
                    <CardDescription>Medicines prescribed by clinicians awaiting distribution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {activePrescEncounters.length === 0 ? (
                      <div className="text-center py-10 text-text-muted flex flex-col items-center gap-2">
                        <CheckCircle size={32} className="text-emerald-500" />
                        <p className="text-sm font-semibold">Dispensing queue clear.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {activePrescEncounters.map(e => (
                          <div key={e.id} className="p-4 border border-border-main rounded-xl space-y-3 bg-bg-surface-hover/30">
                            <div>
                              <span className="font-bold text-text-heading text-sm">{e.patient_name}</span>
                              <span className="text-xs text-text-muted block">Prescribed by {e.doctor_name} | {e.date}</span>
                            </div>

                            {/* Medicines selection */}
                            <div className="space-y-2">
                              {e.prescriptions.filter(p => !p.dispensed).map(p => (
                                <div key={p.medicine_name} className="flex justify-between items-center p-2 bg-bg-surface border border-border-main rounded-lg text-xs">
                                  <div>
                                    <p className="font-bold text-text-heading">{p.medicine_name}</p>
                                    <p className="text-text-muted">Dosage: {p.dosage} | Frequency: {p.frequency} | Duration: {p.duration}</p>
                                  </div>
                                  <Button size="sm" variant="secondary" onClick={() => {
                                    dispensePrescription(e.id, p.medicine_name);
                                    toast(`Dispensed ${p.medicine_name} to ${e.patient_name}. Stock decremented.`, 'success');
                                  }}>
                                    Dispense
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Low stock indicators */}
              <div className="space-y-6">
                <Card className="border-amber-500/20 bg-amber-500/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-amber-800 dark:text-amber-300 flex items-center gap-2 text-sm font-bold">
                      <AlertTriangle size={16} /> Pharmacy Low Stock Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {lowStockMedicines.length === 0 ? (
                      <p className="text-xs text-amber-700 dark:text-amber-400">All medicine inventory levels healthy.</p>
                    ) : (
                      <div className="space-y-3">
                        {lowStockMedicines.map(item => (
                          <div key={item.id} className="flex justify-between items-center bg-bg-surface p-2 border border-amber-500/10 rounded-lg text-xs">
                            <div>
                              <p className="font-bold text-text-heading">{item.name}</p>
                              <p className="text-text-muted text-[10px]">Supplier: {item.supplier}</p>
                            </div>
                            <div className="text-right">
                              <span className="font-mono font-bold text-rose-600 block">{item.stock} / {item.reorder_level} units</span>
                              <Button size="sm" variant="outline" className="px-2 py-0.5 h-6 text-[10px] mt-1" onClick={() => {
                                addInventoryStock(item.id, 50);
                                toast(`Purchased 50 extra boxes of ${item.name}`, 'success');
                              }}>
                                Reorder
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

            </div>
          </div>
        );

      case 'lab_technician':
      case 'radiologist':
        // Technician diagnostic list
        const labPendingOrders: { eId: string; pName: string; order: DiagnosticOrder }[] = [];
        const radPendingOrders: { eId: string; pName: string; order: DiagnosticOrder }[] = [];

        filteredEncounters.forEach(e => {
          e.lab_orders.forEach(o => {
            if (o.status === 'ordered') {
              labPendingOrders.push({ eId: e.id, pName: e.patient_name, order: o });
            }
          });
          e.radiology_orders.forEach(o => {
            if (o.status === 'ordered') {
              radPendingOrders.push({ eId: e.id, pName: e.patient_name, order: o });
            }
          });
        });

        const activeOrderList = role === 'lab_technician' ? labPendingOrders : radPendingOrders;

        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Diagnostics Request Queue</CardTitle>
                <CardDescription>Select clinical items to log results and upload reports</CardDescription>
              </CardHeader>
              <CardContent>
                {activeOrderList.length === 0 ? (
                  <div className="text-center py-12 text-text-muted flex flex-col items-center gap-1.5">
                    <CheckCircle size={32} className="text-emerald-500" />
                    <p className="text-sm font-semibold">All diagnostic orders processed!</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient Name</TableHead>
                        <TableHead>Test / Procedure ordered</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeOrderList.map(item => (
                        <TableRow key={item.order.test_name}>
                          <TableCell className="font-bold text-text-heading">{item.pName}</TableCell>
                          <TableCell>{item.order.test_name}</TableCell>
                          <TableCell>
                            <Badge variant="warning">Ordered</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" onClick={() => {
                              setActiveTestOrder({ encounterId: item.eId, testName: item.order.test_name, type: role === 'lab_technician' ? 'lab' : 'radiology' });
                              setIsResultModalOpen(true);
                            }}>
                              Enter Findings
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'hr':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card hoverable>
                <CardContent className="pt-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-semibold text-text-muted uppercase">Staff Directory</p>
                      <h3 className="text-3xl font-black text-text-heading mt-1">{filteredEmployees.length}</h3>
                    </div>
                    <Users className="text-indigo-500" size={32} />
                  </div>
                </CardContent>
              </Card>
              <Card hoverable>
                <CardContent className="pt-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-semibold text-text-muted uppercase">Shift coverage today</p>
                      <h3 className="text-3xl font-black text-emerald-600 mt-1">100%</h3>
                    </div>
                    <Calendar className="text-emerald-500" size={32} />
                  </div>
                </CardContent>
              </Card>
              <Card hoverable>
                <CardContent className="pt-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-semibold text-text-muted uppercase">Payroll Total Monthly</p>
                      <h3 className="text-3xl font-black text-indigo-600 mt-1">₹25,30,000</h3>
                    </div>
                    <DollarSign className="text-indigo-500" size={32} />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Assigned Hospital Shifts Calendar</CardTitle>
                  <CardDescription>Shift scheduling and workforce allocations</CardDescription>
                </div>
                <Button size="sm" onClick={() => setIsShiftModalOpen(true)}>
                  <Plus size={16} /> Assign Shift
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Clinician / Employee Name</TableHead>
                      <TableHead>Day</TableHead>
                      <TableHead>Shift Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredShifts.map(s => (
                      <TableRow key={s.id}>
                        <TableCell className="font-bold text-text-heading">{s.employee_name}</TableCell>
                        <TableCell>{s.day}</TableCell>
                        <TableCell>
                          <Badge variant="primary">{s.shift_time}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div className="text-center py-20 text-text-muted">
            <Stethoscope size={40} className="mx-auto text-brand-primary mb-4" />
            <h3 className="text-lg font-bold">Workspace dashboard active</h3>
            <p className="text-xs">Role: {role.replace('_', ' ')}</p>
          </div>
        );
    }
  };

  // 2. Patient Portal Dashboard
  const renderPatientPortalDashboard = () => {
    // Current patient timeline EMR records
    const patientTimeline = filteredEncounters.filter(e => e.patient_id === profile.id);
    const unpaidPatientInvoices = filteredInvoices.filter(i => i.patient_id === profile.id && i.status === 'unpaid');
    const patientPrescriptions: any[] = [];

    patientTimeline.forEach(e => {
      e.prescriptions.forEach(p => {
        patientPrescriptions.push({ eId: e.id, doctor: e.doctor_name, date: e.date, ...p });
      });
    });

    switch (activeTab) {
      case 'patient_dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card hoverable className="border-rose-500/10">
                <CardContent className="pt-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-semibold text-text-muted uppercase">My Outstanding Bills</p>
                      <h3 className="text-3xl font-black text-rose-600 mt-1">{formatINR(unpaidPatientInvoices.reduce((acc, c) => acc + c.amount, 0))}</h3>
                    </div>
                    <DollarSign className="text-rose-500" size={32} />
                  </div>
                </CardContent>
              </Card>

              <Card hoverable>
                <CardContent className="pt-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-semibold text-text-muted uppercase">Clinical Timeline Events</p>
                      <h3 className="text-3xl font-black text-text-heading mt-1">{patientTimeline.length} Encounters</h3>
                    </div>
                    <Activity className="text-indigo-500" size={32} />
                  </div>
                </CardContent>
              </Card>

              <Card hoverable>
                <CardContent className="pt-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-semibold text-text-muted uppercase">My Medication Reminders</p>
                      <h3 className="text-3xl font-black text-text-heading mt-1">{patientPrescriptions.filter(p => !p.dispensed).length} Active</h3>
                    </div>
                    <FileText className="text-teal-500" size={32} />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming schedule */}
              <Card>
                <CardHeader>
                  <CardTitle>My Scheduled Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredAppointments.filter(a => a.patient_id === profile.id).length === 0 ? (
                    <p className="text-sm text-text-muted py-4">No appointments scheduled.</p>
                  ) : (
                    <div className="space-y-3">
                      {filteredAppointments.filter(a => a.patient_id === profile.id).map(a => (
                        <div key={a.id} className="flex justify-between items-center p-3 border border-border-main rounded-xl bg-bg-surface-hover/30 text-xs">
                          <div>
                            <p className="font-bold text-text-heading text-sm">{a.doctor_name}</p>
                            <p className="text-text-muted">{a.date} | {a.time} | Token: <span className="font-bold text-brand-primary">{a.token}</span></p>
                          </div>
                          <Badge variant="primary">{a.status}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Book quick appointment */}
              <Card>
                <CardHeader>
                  <CardTitle>Book Appointment Slot</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!appDoctor) {
                      toast('Please select a doctor to request appointment', 'warning');
                      return;
                    }
                    bookAppointment(profile.id, appDoctor, appDate, appTime);
                    toast('Appointment requested successfully!', 'success');
                  }} className="space-y-4">
                    <div className="flex flex-col space-y-1">
                      <label className="text-xs font-bold text-text-muted uppercase">Select Doctor</label>
                      <select
                        className="px-3 py-2 bg-bg-surface border border-border-main rounded-lg text-sm focus:outline-none focus:ring-2"
                        value={appDoctor}
                        onChange={e => setAppDoctor(e.target.value)}
                      >
                        <option value="">-- Select Doctor --</option>
                        {filteredEmployees.filter(emp => emp.role === 'doctor').map(doc => (
                          <option key={doc.id} value={doc.name}>{doc.name} ({doc.department})</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Date"
                        type="date"
                        value={appDate}
                        onChange={e => setAppDate(e.target.value)}
                      />
                      <Input
                        label="Time"
                        placeholder="e.g. 10:30 AM"
                        value={appTime}
                        onChange={e => setAppTime(e.target.value)}
                      />
                    </div>
                    <Button type="submit" variant="primary" className="w-full justify-center">
                      Confirm Appointment Booking
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'patient_timeline':
        return (
          <div className="space-y-6 max-w-3xl mx-auto">
            <h2 className="text-2xl font-black text-text-heading tracking-tight mb-2">My Chronological Medical History</h2>
            {patientTimeline.length === 0 ? (
              <div className="text-center py-12 border border-border-main rounded-xl bg-bg-surface text-text-muted">
                No EMR records logged in your timeline yet.
              </div>
            ) : (
              patientTimeline.map(e => (
                <Card key={e.id} className="border-l-4 border-l-indigo-500">
                  <CardHeader className="pb-3 flex flex-row justify-between items-start">
                    <div>
                      <CardTitle className="text-base font-bold text-indigo-700">{e.doctor_name}</CardTitle>
                      <CardDescription>Encounter Logged on {e.date}</CardDescription>
                    </div>
                    <Badge variant="success">Approved</Badge>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-text-main">
                    <div>
                      <span className="font-bold text-xs uppercase text-text-muted block">Chief Complaint</span>
                      <p className="mt-1 font-medium">"{e.chief_complaint}"</p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 bg-bg-surface-hover/30 p-3 rounded-lg border border-border-main text-xs">
                      <div><span className="font-bold text-text-muted block">Blood Pressure:</span> {e.vitals.blood_pressure}</div>
                      <div><span className="font-bold text-text-muted block">Heart Rate:</span> {e.vitals.pulse} bpm</div>
                      <div><span className="font-bold text-text-muted block">Temp:</span> {e.vitals.temp} °F</div>
                    </div>

                    <div>
                      <span className="font-bold text-xs uppercase text-text-muted block">Clinical Findings (SOAP)</span>
                      <p className="mt-1 text-xs leading-relaxed italic">
                        {e.soap_notes.subjective} {e.soap_notes.assessment}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-xs uppercase text-text-muted block">Diagnosis</span>
                      <p className="mt-1 font-bold text-text-heading">{e.diagnosis}</p>
                    </div>

                    {/* Labs check */}
                    {e.lab_orders.some(o => o.approved) && (
                      <div className="border-t border-border-main pt-3">
                        <span className="font-bold text-xs uppercase text-text-muted block">Laboratory test reports</span>
                        <div className="mt-2 space-y-1.5">
                          {e.lab_orders.filter(o => o.approved).map(o => (
                            <div key={o.test_name} className="flex justify-between items-center text-xs bg-indigo-500/5 p-2 rounded border border-indigo-500/10">
                              <span className="font-semibold text-text-heading">{o.test_name}</span>
                              <span className="font-mono text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded text-[10px]">{o.result}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Radiology check */}
                    {e.radiology_orders.some(o => o.approved) && (
                      <div className="border-t border-border-main pt-3">
                        <span className="font-bold text-xs uppercase text-text-muted block">Radiology & PACS Imaging Reports</span>
                        <div className="mt-2 space-y-1.5">
                          {e.radiology_orders.filter(o => o.approved).map(o => (
                            <div key={o.test_name} className="flex justify-between items-center text-xs bg-cyan-500/5 p-2 rounded border border-cyan-500/10">
                              <span className="font-semibold text-text-heading">{o.test_name}</span>
                              <span className="font-mono text-cyan-700 bg-cyan-100 px-2 py-0.5 rounded text-[10px]">{o.result}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </CardContent>
                </Card>
              ))
            )}
          </div>
        );

      case 'patient_prescriptions':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Prescribed Medications</CardTitle>
                <CardDescription>Medicines issued by hospital clinicians</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Medicine Name</TableHead>
                      <TableHead>Instructions & Dosage</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Pharmacy Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patientPrescriptions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-text-muted py-6">No prescriptions logged.</TableCell>
                      </TableRow>
                    ) : (
                      patientPrescriptions.map((p, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-mono text-xs">{p.date}</TableCell>
                          <TableCell className="font-bold text-text-heading">{p.medicine_name}</TableCell>
                          <TableCell>{p.dosage} | {p.frequency} ({p.duration})</TableCell>
                          <TableCell>{p.doctor}</TableCell>
                          <TableCell>
                            <Badge variant={p.dispensed ? 'success' : 'warning'}>
                              {p.dispensed ? 'Dispensed' : 'Awaiting Collection'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );

      case 'patient_billing':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing Statements & Invoices</CardTitle>
                <CardDescription>View charges and pay unpaid balances</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredInvoices.filter(inv => inv.patient_id === profile.id).map(inv => (
                    <div key={inv.id} className="p-4 border border-border-main rounded-xl space-y-3 bg-bg-surface shadow-xs">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-bold text-sm text-text-heading block">Invoice #{inv.id.substring(0, 8)}</span>
                          <span className="text-xs text-text-muted">{inv.date}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black text-text-heading block">{formatINR(inv.amount)}</span>
                          <Badge variant={inv.status === 'paid' ? 'success' : 'danger'}>{inv.status}</Badge>
                        </div>
                      </div>

                      <div className="text-xs text-text-muted border-t border-b border-border-main py-2 space-y-1">
                        {inv.items.map((item, index) => (
                          <div key={index} className="flex justify-between">
                            <span>{item.label}</span>
                            <span>{formatINR(item.price)}</span>
                          </div>
                        ))}
                      </div>

                      {inv.status === 'unpaid' && (
                        <div className="flex justify-end pt-2">
                          <Button size="sm" onClick={() => {
                            payInvoice(inv.id);
                            toast('Payment processed successfully. Receipt generated.', 'success');
                          }}>
                            Pay outstanding balance
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  // ==========================================
  // STAFF TABS DETAILED RENDERERS
  // ==========================================

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderOperationsDashboard();

      case 'tenants':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Multi-Tenant SaaS Accounts Manager</CardTitle>
                <CardDescription>Activate, suspend, or provision new database tenant clusters</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hospital / Clinic Name</TableHead>
                      <TableHead>Subdomain</TableHead>
                      <TableHead>UUID Connection Reference</TableHead>
                      <TableHead>Billing Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Platform Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.values(MOCK_TENANTS).map(t => (
                      <TableRow key={t.id}>
                        <TableCell className="font-bold text-text-heading flex items-center gap-3">
                          <img src={t.logo_url} className="h-6 w-6 rounded object-cover" alt="" />
                          {t.name}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{t.subdomain}.caredesk.com</TableCell>
                        <TableCell className="font-mono text-xs text-text-muted">{t.id}</TableCell>
                        <TableCell>{t.billing_email}</TableCell>
                        <TableCell>
                          <Badge variant={t.status === 'active' ? 'success' : 'warning'}>{t.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => toast(`Initiated tenant migration cluster check for ${t.name}`, 'info')}>
                            Re-sync DB
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );

      case 'platform_audit':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Platform Audit Engine</CardTitle>
              <CardDescription>Real-time immutable server logs and gateway triggers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-950 text-slate-100 p-5 rounded-xl font-mono text-xs space-y-2 h-[450px] overflow-y-auto shadow-inner">
                <div>[SYSTEM CHECK] 10:44:00 AM OK: postgres_pool running with 34 active connections.</div>
                <div className="text-indigo-400">[JWT JWT_DECODE] 10:44:01 AM: Extracted role="doctor", tenant="t1-tenant-id-1111" from claims.</div>
                <div className="text-teal-400">[RLS KERNEL] 10:44:02 AM: Query SELECT profiles filtered. 0 leaks blocked.</div>
                <div className="text-rose-400">[COMPLIANCE] 10:44:03 AM Audit Log recorded: action="select_records", user="Dr. Aarav Mehta".</div>
                <div className="text-indigo-400">[JWT JWT_DECODE] 10:44:05 AM: Extracted role="patient", tenant="t1-tenant-id-1111".</div>
                <div className="text-teal-400">[RLS KERNEL] 10:44:06 AM: Query SELECT EMR encounters filtered. Only records matching patient="p-1" returned.</div>
              </div>
            </CardContent>
          </Card>
        );

      case 'hospital_settings':
        return (
          <div className="max-w-xl space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hospital Configurations</CardTitle>
                <CardDescription>Configure provider subdomain details, name, and invoice parameters</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateTenantSettings} className="space-y-4">
                  <Input label="Hospital / Provider Name" value={hospitalName} onChange={e => setHospitalName(e.target.value)} />
                  <Input label="Subdomain ID" value={tenant.subdomain} disabled />
                  <Input label="Billing Contact Email" value={billingEmail} onChange={e => setBillingEmail(e.target.value)} />
                  <Input label="Clinic Physical Address" value={tenant.address || ''} disabled />
                  <Button type="submit" variant="secondary">Save Configuration</Button>
                </form>
              </CardContent>
            </Card>
            {isMock && (
              <Card className="border-amber-500/30">
                <CardHeader>
                  <CardTitle>Demo workspace</CardTitle>
                  <CardDescription>All demo activity is saved locally on this device. Reset only clears this browser’s sample data.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="danger" onClick={() => { resetDemoWorkspace(); toast('Demo workspace restored to its original records.', 'success'); }}>
                    Reset demo data
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'staff':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Staff Directory</CardTitle>
                  <CardDescription>Log employee registers, roles, and department rosters</CardDescription>
                </div>
                {role === 'hospital_admin' && (
                  <Button size="sm" onClick={() => setIsEmployeeModalOpen(true)}>
                    <Plus size={16} /> Add Employee
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee Name</TableHead>
                      <TableHead>Role Type</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Salary (Monthly)</TableHead>
                      <TableHead>Leave balance</TableHead>
                      <TableHead>Attendance rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.map(emp => (
                      <TableRow key={emp.id}>
                        <TableCell className="font-bold text-text-heading">{emp.name}</TableCell>
                        <TableCell className="capitalize">{emp.role.replace('_', ' ')}</TableCell>
                        <TableCell>{emp.department}</TableCell>
                        <TableCell className="font-mono text-xs font-semibold">{formatINR(emp.salary)}</TableCell>
                        <TableCell>{emp.leave_balance} Days</TableCell>
                        <TableCell>
                          <Badge variant="success">{emp.attendance_rate}%</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );

      case 'audit_logs':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Compliance HIPAA Logs</CardTitle>
              <CardDescription>Immutable transaction list for compliance auditing</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Action Logged</TableHead>
                    <TableHead>User ID / Executed by</TableHead>
                    <TableHead>API Boundary Check</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-xs">{new Date().toLocaleTimeString()}</TableCell>
                    <TableCell><Badge variant="primary">query_patient_emr</Badge></TableCell>
                    <TableCell className="font-semibold">{profile.first_name} {profile.last_name}</TableCell>
                    <TableCell className="font-mono text-xs text-green-600">tenant_id = '{tenant.id}'</TableCell>
                    <TableCell className="font-mono text-xs text-text-muted">192.168.1.104</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">10:32:11 AM</TableCell>
                    <TableCell><Badge variant="info">authenticate_user</Badge></TableCell>
                    <TableCell className="font-semibold">{profile.first_name} {profile.last_name}</TableCell>
                    <TableCell className="font-mono text-xs text-green-600">role = '{profile.role}'</TableCell>
                    <TableCell className="font-mono text-xs text-text-muted">192.168.1.104</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );

      case 'patients':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row justify-between items-center">
                <div>
                  <CardTitle>Patient Records Directory</CardTitle>
                  <CardDescription>Search patient profiles or review their chronological EMR folder</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative w-64">
                    <Search size={16} className="absolute left-3 top-2.5 text-text-muted" />
                    <input
                      placeholder="Search by name/phone..."
                      className="w-full pl-9 pr-4 py-1.5 bg-bg-surface-hover/40 border border-border-main rounded-lg text-xs text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button size="sm" onClick={() => setIsRegisterOpen(true)}>
                    <Plus size={16} /> Register Patient
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient Name</TableHead>
                      <TableHead>Age / Gender</TableHead>
                      <TableHead>Mobile Number</TableHead>
                      <TableHead>Allergies</TableHead>
                      <TableHead>Blood Group</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients
                      .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map(p => (
                        <TableRow key={p.id}>
                          <TableCell className="font-bold text-text-heading">{p.name}</TableCell>
                          <TableCell>{p.age} Yrs / {p.gender}</TableCell>
                          <TableCell>{p.phone}</TableCell>
                          <TableCell>
                            <span className="font-semibold text-rose-600">{p.allergies || 'None'}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="neutral">{p.blood_group}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline" onClick={() => setSelectedPatientId(p.id)}>
                              Open Patient File
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Selected Patient clinical timeline folder overlay */}
            {selectedPatientId && (
              <Dialog isOpen={!!selectedPatientId} onClose={() => setSelectedPatientId(null)} title={`EMR Folder: ${getPatientObj(selectedPatientId)?.name}`}>
                <div className="space-y-5">
                  <div className="bg-bg-surface-hover/30 p-3 rounded-lg border border-border-main text-xs space-y-1.5">
                    <div><span className="font-semibold text-text-muted">DOB:</span> {getPatientObj(selectedPatientId)?.dob}</div>
                    <div><span className="font-semibold text-text-muted">Phone:</span> {getPatientObj(selectedPatientId)?.phone}</div>
                    <div><span className="font-semibold text-text-muted">Allergies:</span> <span className="font-bold text-red-500">{getPatientObj(selectedPatientId)?.allergies || 'None'}</span></div>
                    <div><span className="font-semibold text-text-muted">Medical History:</span> {getPatientObj(selectedPatientId)?.history || 'None'}</div>
                  </div>

                  <div className="border-t border-border-main pt-3">
                    <span className="font-bold text-xs uppercase text-text-muted block mb-2.5">Clinical encounters</span>
                    {filteredEncounters.filter(e => e.patient_id === selectedPatientId).length === 0 ? (
                      <p className="text-xs text-text-muted">No encounters logged.</p>
                    ) : (
                      <div className="space-y-3">
                        {filteredEncounters.filter(e => e.patient_id === selectedPatientId).map(e => (
                          <div key={e.id} className="p-3 border border-border-main rounded-lg text-xs space-y-2">
                            <div className="flex justify-between font-semibold">
                              <span>Dr. Mehta | {e.date}</span>
                              <Badge variant="success">Completed</Badge>
                            </div>
                            <p><strong>Chief Complaint:</strong> "{e.chief_complaint}"</p>
                            <p><strong>Diagnosis:</strong> {e.diagnosis}</p>
                            
                            {/* Labs output */}
                            {e.lab_orders.length > 0 && (
                              <div className="bg-indigo-500/5 p-2 rounded mt-1.5">
                                <span className="font-bold text-[10px] text-indigo-700 block uppercase">Lab orders</span>
                                {e.lab_orders.map(l => (
                                  <div key={l.test_name} className="flex justify-between items-center text-[10px] mt-1 text-indigo-900">
                                    <span>{l.test_name}</span>
                                    <span className="font-bold">{l.status === 'completed' ? (l.approved ? `Approved: ${l.result}` : 'Pending Doctor Sign-off') : 'Awaiting results'}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Radiology output */}
                            {e.radiology_orders.length > 0 && (
                              <div className="bg-cyan-500/5 p-2 rounded mt-1.5">
                                <span className="font-bold text-[10px] text-cyan-700 block uppercase">Radiology scans</span>
                                {e.radiology_orders.map(r => (
                                  <div key={r.test_name} className="flex justify-between items-center text-[10px] mt-1 text-cyan-900">
                                    <span>{r.test_name}</span>
                                    <span className="font-bold">{r.status === 'completed' ? (r.approved ? `Approved: ${r.result}` : 'Awaiting Approval') : 'Awaiting results'}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Dialog>
            )}
          </div>
        );

      case 'prescriptions':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* EMR Prescriptions */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Prescription Logs & Dispensations</CardTitle>
                    <CardDescription>Prescriptions status logs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Patient</TableHead>
                          <TableHead>Medicine Name</TableHead>
                          <TableHead>Dosage</TableHead>
                          <TableHead>Doctor</TableHead>
                          <TableHead>Dispensed Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEncounters.map(e =>
                          e.prescriptions.map((p, idx) => (
                            <TableRow key={`${e.id}-${idx}`}>
                              <TableCell className="font-bold text-text-heading">{e.patient_name}</TableCell>
                              <TableCell>{p.medicine_name}</TableCell>
                              <TableCell>{p.dosage} | {p.frequency}</TableCell>
                              <TableCell>{e.doctor_name}</TableCell>
                              <TableCell>
                                <Badge variant={p.dispensed ? 'success' : 'warning'}>
                                  {p.dispensed ? 'Dispensed' : 'Pending Pharmacy'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Prescription Creator Form (for Doctor) */}
              {role === 'doctor' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Log EMR Clinical Prescription</CardTitle>
                      <CardDescription>Creates pharmacy and invoicing links</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-xs">
                        <p className="text-text-muted">Select patient in "Start Consultation" queue from Operations Dashboard to write prescriptions.</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

            </div>
          </div>
        );

      case 'diagnostics':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Diagnostic Orders Log (Lab & Radiology)</CardTitle>
                <CardDescription>Track all orders requested, technician logs, and results</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Test / Procedure</TableHead>
                      <TableHead>Findings / Results</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Approval</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEncounters.map(e => (
                      <React.Fragment key={e.id}>
                        {/* Labs rows */}
                        {e.lab_orders.map(l => (
                          <TableRow key={`lab-${l.test_name}`}>
                            <TableCell className="font-bold text-text-heading">{e.patient_name}</TableCell>
                            <TableCell><Badge variant="info">Lab</Badge></TableCell>
                            <TableCell>{l.test_name}</TableCell>
                            <TableCell className="font-mono text-xs">{l.result || 'Pending...'}</TableCell>
                            <TableCell className="capitalize">{l.status}</TableCell>
                            <TableCell>
                              <Badge variant={l.approved ? 'success' : 'neutral'}>
                                {l.approved ? 'Approved' : 'Awaiting doctor sign-off'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                        {/* Radiology rows */}
                        {e.radiology_orders.map(r => (
                          <TableRow key={`rad-${r.test_name}`}>
                            <TableCell className="font-bold text-text-heading">{e.patient_name}</TableCell>
                            <TableCell><Badge variant="primary">Radiology</Badge></TableCell>
                            <TableCell>{r.test_name}</TableCell>
                            <TableCell className="font-mono text-xs">{r.result || 'Pending...'}</TableCell>
                            <TableCell className="capitalize">{r.status}</TableCell>
                            <TableCell>
                              <Badge variant={r.approved ? 'success' : 'neutral'}>
                                {r.approved ? 'Approved' : 'Awaiting sign-off'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );

      case 'beds':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Inpatient Admissions & Ward Census</CardTitle>
                <CardDescription>Allocate patient beds and ward segments</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ward / Bed ID</TableHead>
                      <TableHead>Admitted Patient</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-bold text-text-heading">Ward A - Bed A-101</TableCell>
                      <TableCell>Aarav Sharma</TableCell>
                      <TableCell>45</TableCell>
                      <TableCell><Badge variant="danger">Occupied</Badge></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-bold text-text-heading">Ward A - Bed A-102</TableCell>
                      <TableCell>Diya Joshi</TableCell>
                      <TableCell>28</TableCell>
                      <TableCell><Badge variant="danger">Occupied</Badge></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-bold text-text-heading">Ward B - Bed B-201</TableCell>
                      <TableCell>Rahul Verma</TableCell>
                      <TableCell>62</TableCell>
                      <TableCell><Badge variant="danger">Occupied</Badge></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-bold text-text-heading">Ward B - Bed B-202</TableCell>
                      <TableCell>-- Vacant --</TableCell>
                      <TableCell>--</TableCell>
                      <TableCell><Badge variant="success">Vacant</Badge></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Centralized Invoice Hub</CardTitle>
                <CardDescription>Unified billing statement tracker</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice ID</TableHead>
                      <TableHead>Patient Name</TableHead>
                      <TableHead>Statement Date</TableHead>
                      <TableHead>Line Items Count</TableHead>
                      <TableHead>Amount Total</TableHead>
                      <TableHead>Payment Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map(inv => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-mono text-xs">{inv.id}</TableCell>
                        <TableCell className="font-bold text-text-heading">{inv.patient_name}</TableCell>
                        <TableCell>{inv.date}</TableCell>
                        <TableCell>{inv.items.length} Items</TableCell>
                        <TableCell className="font-bold text-text-heading">{formatINR(inv.amount)}</TableCell>
                        <TableCell>
                          <Badge variant={inv.status === 'paid' ? 'success' : 'danger'}>{inv.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );

      case 'queue':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Patient Clinic Queue Management</CardTitle>
                <CardDescription>Track daily walk-ins and consultation tokens</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Token Reference</TableHead>
                      <TableHead>Patient Name</TableHead>
                      <TableHead>Assigned Doctor</TableHead>
                      <TableHead>Arrival State</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAppointments.map(a => (
                      <TableRow key={a.id}>
                        <TableCell className="font-mono font-bold text-brand-primary text-xs">{a.token}</TableCell>
                        <TableCell className="font-bold text-text-heading">{a.patient_name}</TableCell>
                        <TableCell>{a.doctor_name}</TableCell>
                        <TableCell>
                          <Badge variant={a.status === 'completed' ? 'success' : a.status === 'arrived' ? 'warning' : 'primary'}>
                            {a.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );

      case 'inventory':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row justify-between items-center">
                <div>
                  <CardTitle>Inventory & Stock Catalog</CardTitle>
                  <CardDescription>Track medicine stock, consumable supplies, and supplier history</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setIsInventoryModalOpen(true)}>
                    <Plus size={16} /> Add Inventory Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Generic Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Unit Selling Price</TableHead>
                      <TableHead>Reorder Threshold</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-bold text-text-heading">{item.name}</TableCell>
                        <TableCell className="italic">{item.generic_name}</TableCell>
                        <TableCell className="capitalize">{item.category}</TableCell>
                        <TableCell>
                          <span className={`font-mono font-bold ${item.stock <= item.reorder_level ? 'text-red-600' : ''}`}>
                            {item.stock} {item.unit.split(' ')[0]}s
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-xs font-semibold">{formatINR(item.selling_price)}</TableCell>
                        <TableCell>{item.reorder_level}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => {
                            addInventoryStock(item.id, 20);
                            toast(`Added 20 units to ${item.name}`, 'success');
                          }}>
                            +20 Stock
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );

      case 'shifts':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row justify-between items-center">
                <div>
                  <CardTitle>Shift Schedule Calendar</CardTitle>
                  <CardDescription>Assign employee shift calendar slots</CardDescription>
                </div>
                <Button size="sm" onClick={() => setIsShiftModalOpen(true)}>
                  <Plus size={16} /> Assign Shift
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee Name</TableHead>
                      <TableHead>Day</TableHead>
                      <TableHead>Shift Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredShifts.map(s => (
                      <TableRow key={s.id}>
                        <TableCell className="font-bold text-text-heading">{s.employee_name}</TableCell>
                        <TableCell>{s.day}</TableCell>
                        <TableCell>
                          <Badge variant="primary">{s.shift_time}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );

      case 'payroll':
        return (
          <Card>
            <CardHeader>
              <CardTitle>HR Payroll Configuration Panel</CardTitle>
              <CardDescription>Compute staff monthly salary structures and run bank exports</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Monthly Salary</TableHead>
                    <TableHead>Leave balance</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map(emp => (
                    <TableRow key={emp.id}>
                      <TableCell className="font-bold text-text-heading">{emp.name}</TableCell>
                      <TableCell>{emp.department}</TableCell>
                        <TableCell className="font-mono text-xs font-semibold">{formatINR(emp.salary)}</TableCell>
                      <TableCell>{emp.leave_balance} Days</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" onClick={() => {
                          logLeaveRequest(emp.id, 1);
                          toast(`Deducted 1 day from leave balance of ${emp.name}`, 'success');
                        }}>
                          Deduct Leave
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  // Render Portal Core Switch
  return (
    <div className="space-y-6">
      
      {/* Header bar banner */}
      {role !== 'patient' && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-text-heading tracking-tight mb-1">
              Operations Dashboard
            </h1>
            <p className="text-xs text-text-muted">
              Managing <span className="font-bold text-text-heading">{tenant.name}</span> in {isMock ? 'Demo Sandbox' : 'Database Connection'}.
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="primary" className="py-1 px-3">
              Role: {role.replace('_', ' ')}
            </Badge>
            <Badge variant={tenant.status === 'active' ? 'success' : 'warning'} className="py-1 px-3">
              Cluster: {tenant.status}
            </Badge>
          </div>
        </div>
      )}

      {/* Main views router split */}
      {role === 'patient' ? renderPatientPortalDashboard() : renderActiveTabContent()}

      {/* ==========================================
          MODALS AND DOCK OVERLAYS (CONNECTED LOGIC)
          ========================================== */}

      {/* 1. Patient Registration Modal */}
      <Dialog isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} title="Register New Patient Profile">
        <form onSubmit={handleRegister} className="space-y-4">
          <Input label="Full Name" placeholder="Aarav Sharma" value={name} onChange={e => setName(e.target.value)} />
          
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col space-y-1">
              <label className="text-xs font-semibold text-text-muted uppercase">Gender</label>
              <select
                className="px-3 py-2 bg-bg-surface border border-border-main rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                value={gender}
                onChange={e => setGender(e.target.value as any)}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <Input label="Date of Birth" type="date" value={dob} onChange={e => setDob(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Mobile Phone" placeholder="+91..." value={phone} onChange={e => setPhone(e.target.value)} />
            <Input label="Email Address" placeholder="name@email.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <Input label="Address" placeholder="100 Main St" value={address} onChange={e => setAddress(e.target.value)} />
          <Input label="Emergency Contact" placeholder="Name (Phone)" value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)} />
          
          <div className="grid grid-cols-2 gap-3">
            <Input label="Blood Group" placeholder="O-positive" value={bloodGroup} onChange={e => setBloodGroup(e.target.value)} />
            <Input label="Known Allergies" placeholder="Penicillin, etc." value={allergies} onChange={e => setAllergies(e.target.value)} />
          </div>

          <Input label="Medical History Summary" placeholder="Hypertension, Asthma, etc." value={history} onChange={e => setHistory(e.target.value)} />

          <Button type="submit" variant="primary" className="w-full justify-center">
            Register and Save Profile
          </Button>
        </form>
      </Dialog>

      {/* 2. Start Consultation Modal (Doctor's EMR encounter worksheet) */}
      <Dialog isOpen={isConsultOpen} onClose={() => setIsConsultOpen(false)} title={`EMR Encounter: Clinical Consult`}>
        <form onSubmit={handleConsultSubmit} className="space-y-4">
          <div className="bg-bg-surface-hover/40 p-3 rounded-lg border border-border-main text-xs space-y-1.5 mb-2">
            <div><span className="font-semibold text-text-muted">Active Patient:</span> {getPatientObj(cPatientId)?.name}</div>
            <div><span className="font-semibold text-text-muted">Allergies:</span> <span className="font-bold text-red-500">{getPatientObj(cPatientId)?.allergies || 'None'}</span></div>
          </div>

          <Input label="Chief Complaint" placeholder="e.g. Coughing, chest pain" value={cComplaint} onChange={e => setCComplaint(e.target.value)} />
          
          <div className="grid grid-cols-3 gap-3">
            <Input label="BP Vitals" placeholder="120/80" value={cBp} onChange={e => setCBp(e.target.value)} />
            <Input label="Pulse Vitals" placeholder="72" value={cPulse} onChange={e => setCPulse(e.target.value)} />
            <Input label="Temp Vitals" placeholder="98.6" value={cTemp} onChange={e => setCTemp(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Subjective (S)" placeholder="Patient reports..." value={cSubj} onChange={e => setCSubj(e.target.value)} />
            <Input label="Objective (O)" placeholder="Clinician observed..." value={cObj} onChange={e => setCObj(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Assessment (A)" placeholder="Possible infection..." value={cAssess} onChange={e => setCAssess(e.target.value)} />
            <Input label="Plan (P)" placeholder="Follow-up diagnostics..." value={cPlan} onChange={e => setCPlan(e.target.value)} />
          </div>

          <Input label="Primary Diagnosis" placeholder="e.g. Viral Bronchitis" value={cDiagnosis} onChange={e => setCDiagnosis(e.target.value)} />

          {/* Connected components builder */}
          <div className="border-t border-border-main pt-3 space-y-3">
            <h4 className="font-bold text-xs uppercase text-text-muted">Order Prescriptions & Diagnostic tests</h4>
            
            {/* Prescriptions add */}
            <div className="flex gap-2">
              <select
                className="flex-1 px-3 py-1.5 bg-bg-surface border border-border-main rounded-lg text-xs"
                value={newMedName}
                onChange={e => setNewMedName(e.target.value)}
              >
                <option value="Amoxicillin 500mg">Amoxicillin 500mg (₹250)</option>
                <option value="Paracetamol 650mg">Paracetamol 650mg (₹35)</option>
              </select>
              <Button type="button" size="sm" variant="outline" onClick={() => {
                const medPrice = newMedName === 'Amoxicillin 500mg' ? 250 : 35;
                setFormPrescriptions([...formPrescriptions, { medicine_name: newMedName, dosage: newMedDose, frequency: newMedFreq, duration: newMedDur, price: medPrice }]);
                toast(`Added Rx prescription: ${newMedName}`, 'info');
              }}>
                Add Med
              </Button>
            </div>

            {/* Diagnostics lists */}
            <div className="flex gap-2">
              <select
                className="flex-1 px-3 py-1.5 bg-bg-surface border border-border-main rounded-lg text-xs"
                value={newLabName}
                onChange={e => setNewLabName(e.target.value)}
              >
                <option value="CBC Blood Test">CBC Blood Test (₹400)</option>
                <option value="Lipid Panel Profile">Lipid Panel Profile (₹450)</option>
              </select>
              <Button type="button" size="sm" variant="outline" onClick={() => {
                setFormLabs([...formLabs, { test_name: newLabName, price: newLabName === 'CBC Blood Test' ? 400 : 450 }]);
                toast(`Added Lab test: ${newLabName}`, 'info');
              }}>
                Add Lab Test
              </Button>
            </div>

            <div className="flex gap-2">
              <select
                className="flex-1 px-3 py-1.5 bg-bg-surface border border-border-main rounded-lg text-xs"
                value={newRadName}
                onChange={e => setNewRadName(e.target.value)}
              >
                <option value="Chest X-Ray">Chest X-Ray (₹850)</option>
                <option value="Panoramic Dental Scan">Panoramic Dental Scan (₹1,100)</option>
              </select>
              <Button type="button" size="sm" variant="outline" onClick={() => {
                const radPrice = newRadName === 'Chest X-Ray' ? 850 : 1100;
                setFormRadiology([...formRadiology, { test_name: newRadName, price: radPrice }]);
                toast(`Added Radiology Order: ${newRadName}`, 'info');
              }}>
                Add Radiology Scan
              </Button>
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full justify-center">
            Sign & Release Encounter File
          </Button>
        </form>
      </Dialog>

      {/* 3. Diagnostic Results input Modal (Lab tech / Radiologist) */}
      <Dialog isOpen={isResultModalOpen} onClose={() => setIsResultModalOpen(false)} title={`Log Test Findings: ${activeTestOrder?.testName}`}>
        <form onSubmit={handleResultSubmit} className="space-y-4">
          <Input
            label="Diagnostic Findings / Values"
            placeholder="e.g. Hemoglobin: 14.2 g/dL (Normal)"
            value={diagResultText}
            onChange={e => setDiagResultText(e.target.value)}
          />
          <Button type="submit" variant="primary" className="w-full justify-center">
            Submit Findings to Doctor
          </Button>
        </form>
      </Dialog>

      {/* 4. Shift Allocation Modal */}
      <Dialog isOpen={isShiftModalOpen} onClose={() => setIsShiftModalOpen(false)} title="Assign Employee Shift">
        <form onSubmit={handleShiftSubmit} className="space-y-4">
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold text-text-muted uppercase">Select Employee</label>
            <select
              className="px-3 py-2 bg-bg-surface border border-border-main rounded-lg text-sm focus:outline-none focus:ring-2"
              value={shiftEmpName}
              onChange={e => setShiftEmpName(e.target.value)}
            >
              <option value="">-- Choose employee --</option>
              {filteredEmployees.map(emp => (
                <option key={emp.id} value={emp.name}>{emp.name} ({emp.role})</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold text-text-muted uppercase">Day of the Week</label>
            <select
              className="px-3 py-2 bg-bg-surface border border-border-main rounded-lg text-sm focus:outline-none focus:ring-2"
              value={shiftDay}
              onChange={e => setShiftDay(e.target.value)}
            >
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold text-text-muted uppercase">Shift Hours</label>
            <select
              className="px-3 py-2 bg-bg-surface border border-border-main rounded-lg text-sm focus:outline-none focus:ring-2"
              value={shiftTime}
              onChange={e => setShiftTime(e.target.value as any)}
            >
              <option value="Morning (08:00 - 16:00)">Morning (08:00 - 16:00)</option>
              <option value="Evening (16:00 - 00:00)">Evening (16:00 - 00:00)</option>
              <option value="Night (00:00 - 08:00)">Night (00:00 - 08:00)</option>
            </select>
          </div>

          <Button type="submit" variant="primary" className="w-full justify-center">
            Assign Shift schedule
          </Button>
        </form>
      </Dialog>

      {/* 5. Employee Addition Modal */}
      <Dialog isOpen={isEmployeeModalOpen} onClose={() => setIsEmployeeModalOpen(false)} title="Register New Employee">
        <form onSubmit={handleEmployeeSubmit} className="space-y-4">
          <Input label="Full Name" placeholder="Full name" value={empName} onChange={e => setEmpName(e.target.value)} />
          
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col space-y-1">
              <label className="text-xs font-semibold text-text-muted uppercase">Role</label>
              <select
                className="px-3 py-2 bg-bg-surface border border-border-main rounded-lg text-sm focus:outline-none"
                value={empRole}
                onChange={e => setEmpRole(e.target.value)}
              >
                <option value="doctor">doctor</option>
                <option value="nurse">nurse</option>
                <option value="receptionist">receptionist</option>
                <option value="cashier">cashier</option>
                <option value="pharmacist">pharmacist</option>
                <option value="lab_technician">lab technician</option>
                <option value="radiologist">radiologist</option>
                <option value="hr">hr</option>
              </select>
            </div>
            <Input label="Department" placeholder="Cardiology, Emergency..." value={empDept} onChange={e => setEmpDept(e.target.value)} />
          </div>

          <Input label="Monthly salary (₹)" placeholder="e.g. 45000" value={empSalary} onChange={e => setEmpSalary(e.target.value)} />

          <Button type="submit" variant="primary" className="w-full justify-center">
            Save Employee File
          </Button>
        </form>
      </Dialog>

      {/* 6. Inventory Addition Modal */}
      <Dialog isOpen={isInventoryModalOpen} onClose={() => setIsInventoryModalOpen(false)} title="Add Inventory Item">
        <form onSubmit={handleInventorySubmit} className="space-y-4">
          <Input label="Item / Medicine Name" placeholder="Amoxicillin..." value={invName} onChange={e => setInvName(e.target.value)} />
          <Input label="Generic Name" placeholder="Chemical name" value={invGeneric} onChange={e => setInvGeneric(e.target.value)} />
          
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col space-y-1">
              <label className="text-xs font-semibold text-text-muted uppercase">Category</label>
              <select
                className="px-3 py-2 bg-bg-surface border border-border-main rounded-lg text-sm focus:outline-none"
                value={invCat}
                onChange={e => setInvCat(e.target.value as any)}
              >
                <option value="tablet">tablet</option>
                <option value="syrup">syrup</option>
                <option value="injection">injection</option>
                <option value="consumable">consumable</option>
                <option value="supplies">supplies</option>
              </select>
            </div>
            <Input label="Packaging Unit" placeholder="Box of 30, Tube..." value={invUnit} onChange={e => setInvUnit(e.target.value)} />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Input label="Purchase Cost" value={invPurchase} onChange={e => setInvPurchase(e.target.value)} />
            <Input label="Selling Price" value={invSelling} onChange={e => setInvSelling(e.target.value)} />
            <Input label="Stock count" value={invStock} onChange={e => setInvStock(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Reorder Level" value={invReorder} onChange={e => setInvReorder(e.target.value)} />
            <Input label="Supplier Name" value={invSupplier} onChange={e => setInvSupplier(e.target.value)} />
          </div>

          <Button type="submit" variant="primary" className="w-full justify-center">
            Save Item to Inventory
          </Button>
        </form>
      </Dialog>

    </div>
  );
};
export default DashboardHome;
