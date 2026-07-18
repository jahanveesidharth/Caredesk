import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard,
  Users,
  Building,
  Activity,
  FileText,
  Calendar,
  DollarSign,
  Package,
  ShieldAlert,
  LogOut,
  Moon,
  Sun,
  UserCheck,
  FlaskConical,
  HeartPulse
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const { profile, tenant, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (!profile) return null;

  const role = profile.role as string;

  const menuItems = [
    // General Staff Dashboard
    { id: 'dashboard', label: 'Operations Dashboard', icon: LayoutDashboard, roles: ['super_admin', 'hospital_admin', 'doctor', 'nurse', 'receptionist', 'cashier', 'pharmacist', 'lab_technician', 'radiologist', 'inventory_manager', 'hr'] },
    
    // Patient Portal Views
    { id: 'patient_dashboard', label: 'My Health Portal', icon: HeartPulse, roles: ['patient'] },
    { id: 'patient_timeline', label: 'Medical History', icon: Activity, roles: ['patient'] },
    { id: 'patient_prescriptions', label: 'Prescriptions', icon: FileText, roles: ['patient'] },
    { id: 'patient_billing', label: 'Bills & Payments', icon: DollarSign, roles: ['patient'] },

    // Super Admin view
    { id: 'tenants', label: 'Tenants Catalog', icon: Building, roles: ['super_admin'] },
    { id: 'platform_audit', label: 'System Logs', icon: ShieldAlert, roles: ['super_admin'] },
    
    // Hospital Admin view
    { id: 'hospital_settings', label: 'Hospital Settings', icon: Building, roles: ['hospital_admin'] },
    { id: 'staff', label: 'Staff Directory', icon: Users, roles: ['hospital_admin', 'hr'] },
    { id: 'audit_logs', label: 'Compliance Audit', icon: ShieldAlert, roles: ['hospital_admin'] },
    
    // Clinical views
    { id: 'patients', label: 'EMR Records', icon: Activity, roles: ['doctor', 'nurse', 'receptionist', 'hospital_admin'] },
    { id: 'prescriptions', label: 'Prescriptions & Rx', icon: FileText, roles: ['doctor', 'pharmacist'] },
    { id: 'diagnostics', label: 'Diagnostics & PACS', icon: FlaskConical, roles: ['doctor', 'lab_technician', 'radiologist'] },
    { id: 'beds', label: 'Bed & Admissions', icon: Building, roles: ['nurse', 'hospital_admin'] },

    // Business Operations
    { id: 'billing', label: 'Central Billing', icon: DollarSign, roles: ['cashier', 'receptionist', 'hospital_admin'] },
    { id: 'queue', label: 'Patient Queue', icon: UserCheck, roles: ['receptionist', 'nurse', 'doctor'] },
    { id: 'inventory', label: 'Inventory & Stock', icon: Package, roles: ['inventory_manager', 'pharmacist', 'hospital_admin'] },
    
    // HR ERP
    { id: 'shifts', label: 'Shift Scheduler', icon: Calendar, roles: ['hr', 'doctor', 'nurse', 'receptionist', 'hospital_admin'] },
    { id: 'payroll', label: 'Payroll & HR', icon: DollarSign, roles: ['hr', 'hospital_admin'] },
  ];

  // Adjust default selection if patient
  const filteredItems = menuItems.filter(
    (item) => item.roles.includes('*') || item.roles.includes(role)
  );

  return (
    <aside className="w-64 border-r border-border-main bg-bg-surface flex flex-col h-full shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-border-main flex items-center gap-3">
        {tenant?.logo_url ? (
          <img src={tenant.logo_url} alt={tenant.name} className="h-9 w-9 rounded-lg object-cover" />
        ) : (
          <div className="h-9 w-9 bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold rounded-lg text-lg">
            CD
          </div>
        )}
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-sm text-text-heading truncate">
            {role === 'patient' ? 'CareDesk Patient' : (tenant?.name || 'CareDesk SaaS')}
          </span>
          <span className="text-xs text-text-muted capitalize truncate font-medium">
            {role.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-brand-primary text-white shadow-xs shadow-brand-primary/30'
                  : 'text-text-muted hover:text-text-main hover:bg-bg-surface-hover'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer controls */}
      <div className="p-4 border-t border-border-main space-y-2">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-muted hover:text-text-main hover:bg-bg-surface-hover transition-all cursor-pointer"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-500/10 hover:text-red-700 transition-all cursor-pointer"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;
