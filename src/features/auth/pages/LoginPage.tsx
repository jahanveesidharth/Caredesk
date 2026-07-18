import React, { useState, useEffect } from 'react';
import { useAuth, MOCK_USERS, getMockTenants } from '../../../context/AuthContext';
import { useToast } from '../../../components/ui/toast';
import { supabase } from '../../../services/supabase';
import {
  Eye,
  EyeOff,
  ShieldCheck,
  Stethoscope,
  Users,
  Building,
  Activity,
  KeyRound,
  HeartPulse,
  DollarSign,
  Package,
  FlaskConical,
  Mail,
  Lock,
  Calendar,
  Phone,
  MapPin,
  Globe,
  User,
  Sparkles
} from 'lucide-react';
import Button from '../../../components/ui/button';
import Input from '../../../components/ui/input';

export const LoginPage: React.FC = () => {
  const { login, signUpHospitalAdmin, signUpPatient } = useAuth();
  const { toast } = useToast();
  
  // View states
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [signupType, setSignupType] = useState<'provider' | 'patient'>('provider');
  const [mockTab, setMockTab] = useState<'staff' | 'patient'>('staff');

  // Sign In fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Facility Registration fields
  const [hName, setHName] = useState('');
  const [hSubdomain, setHSubdomain] = useState('');
  const [hAdminFirst, setHAdminFirst] = useState('');
  const [hAdminLast, setHAdminLast] = useState('');
  const [hEmail, setHEmail] = useState('');
  const [hPassword, setHPassword] = useState('');

  // Patient Registration fields
  const [pTenantId, setPTenantId] = useState('');
  const [pFirst, setPFirst] = useState('');
  const [pLast, setPLast] = useState('');
  const [pEmail, setPEmail] = useState('');
  const [pPassword, setPPassword] = useState('');
  const [pDob, setPDob] = useState('');
  const [pGender, setPGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [pPhone, setPPhone] = useState('');
  const [pAddress, setPAddress] = useState('');

  // Tenants catalog for Patient Signup Dropdown
  const [activeTenantsList, setActiveTenantsList] = useState<any[]>(Object.values(getMockTenants()));

  useEffect(() => {
    const fetchTenants = async () => {
      const hasSupabase = import.meta.env.VITE_SUPABASE_URL && 
                          import.meta.env.VITE_SUPABASE_ANON_KEY && 
                          !import.meta.env.VITE_SUPABASE_URL.includes('placeholder');
      
      const localTenants = Object.values(getMockTenants());
      if (hasSupabase) {
        try {
          const { data, error } = await supabase.from('tenants').select('*');
          if (data && !error) {
            const merged = [...localTenants];
            data.forEach((t: any) => {
              if (!merged.some(mt => mt.id === t.id || mt.subdomain === t.subdomain)) {
                merged.push(t);
              }
            });
            setActiveTenantsList(merged);
            return;
          }
        } catch (e) {
          console.warn('Could not fetch tenants from Supabase:', e);
        }
      }
      setActiveTenantsList(localTenants);
    };

    fetchTenants();
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast('Please enter both email and password', 'warning');
      return;
    }

    setIsSubmitting(true);
    const { error } = await login(email, password);
    setIsSubmitting(false);

    if (error) {
      toast(error.message, 'error');
    } else {
      toast('Logged in successfully!', 'success');
    }
  };

  const handleQuickLogin = async (mockUser: any) => {
    setIsSubmitting(true);
    const { error } = await login(mockUser.email, 'password', true);
    setIsSubmitting(false);

    if (error) {
      toast(error.message, 'error');
    } else {
      toast(`Signed in as ${mockUser.profile.first_name} (${mockUser.profile.role.replace('_', ' ')})`, 'success');
    }
  };

  const handleFacilityRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hName || !hSubdomain || !hAdminFirst || !hAdminLast || !hEmail || !hPassword) {
      toast('Please fill out all hospital registration fields', 'warning');
      return;
    }

    setIsSubmitting(true);
    const { error } = await signUpHospitalAdmin(hName, hSubdomain, hEmail, hPassword, hAdminFirst, hAdminLast);
    setIsSubmitting(false);

    if (error) {
      toast(error.message, 'error');
    } else {
      toast('Hospital setup completed. Seeding default clinic workspace...', 'success');
    }
  };

  const handlePatientRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pTenantId || !pFirst || !pLast || !pEmail || !pPassword || !pDob || !pPhone || !pAddress) {
      toast('Please fill out all patient registration fields', 'warning');
      return;
    }

    setIsSubmitting(true);
    const { error } = await signUpPatient(pTenantId, pEmail, pPassword, pFirst, pLast, pDob, pGender, pPhone, pAddress);
    setIsSubmitting(false);

    if (error) {
      toast(error.message, 'error');
    } else {
      toast('Patient account created. Accessing secure EMR timeline...', 'success');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin': return <ShieldCheck className="text-purple-500" size={16} />;
      case 'hospital_admin': return <Building className="text-blue-500" size={16} />;
      case 'doctor': return <Stethoscope className="text-teal-500" size={16} />;
      case 'nurse': return <Activity className="text-rose-500" size={16} />;
      case 'cashier': return <DollarSign className="text-amber-500" size={16} />;
      case 'pharmacist': return <Package className="text-emerald-500" size={16} />;
      case 'lab_technician': return <FlaskConical className="text-indigo-500" size={16} />;
      case 'radiologist': return <Activity className="text-cyan-500" size={16} />;
      case 'inventory_manager': return <Package className="text-orange-500" size={16} />;
      case 'hr': return <Users className="text-slate-500" size={16} />;
      case 'patient': return <HeartPulse className="text-rose-600" size={16} />;
      default: return <Users className="text-slate-500" size={16} />;
    }
  };

  // Split mock users
  const staffMockUsers = MOCK_USERS.filter((u: any) => u.profile.role !== 'patient');
  const patientMockUsers = MOCK_USERS.filter((u: any) => u.profile.role === 'patient');

  return (
    <div className="min-h-screen w-screen flex bg-bg-base overflow-hidden">
      {/* Left side: Premium Branding Column (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-12 flex-col justify-between text-white relative overflow-hidden">
        {/* Background Grid Pattern & Glows */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-brand-teal/10 rounded-full blur-3xl"></div>
        
        {/* Top Header Logo (Increased size and inlined for light/dark mode override) */}
        <div className="flex items-center gap-3 z-10">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 150" className="h-16 w-auto select-none">
            <defs>
              <linearGradient id="logoPrimaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>
              <linearGradient id="logoSecondaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2DD4BF" />
                <stop offset="100%" stopColor="#0D9488" />
              </linearGradient>
            </defs>

            <g transform="translate(20, 15)">
              <circle cx="60" cy="60" r="58" fill="none" stroke="#334155" strokeWidth="2" opacity="0.5"/>
              <path d="M 60 20 A 40 40 0 1 0 60 100 L 60 84 A 24 24 0 1 1 60 36 Z" fill="url(#logoPrimaryGrad)" />
              <path d="M 60 20 A 40 40 0 0 1 100 60 A 40 40 0 0 1 60 100 L 60 84 A 24 24 0 0 0 84 60 A 24 24 0 0 0 60 36 Z" fill="url(#logoSecondaryGrad)" opacity="0.9" />
              <path d="M 54 45 h 12 v 9 h 9 v 12 h -9 v 9 h -12 v -9 h -9 v -12 h 9 z" fill="#FFFFFF" />
            </g>

            <text x="160" y="75" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="48px" fill="#FFFFFF" letterSpacing="-0.5px">
              Care<tspan fill="#2DD4BF">Desk</tspan>
            </text>
            <text x="162" y="110" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="500" fontSize="16px" fill="#94A3B8" letterSpacing="1px">
              HOSPITAL MANAGEMENT &amp; SaaS
            </text>
          </svg>
        </div>

        {/* Branding & Visual Content */}
        <div className="space-y-6 z-10 max-w-lg my-auto py-4">
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight font-display">
              <span className="text-white">Clinical Workspaces.</span> <br/>
              <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-indigo-400 bg-clip-text text-transparent">
                Multi-Tenant Core.
              </span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed font-light max-w-md">
              Enterprise clinical workstation configured with strict logical tenant isolation, compliance audit cataloging, and responsive EHR records.
            </p>
          </div>

          {/* Premium Smart Hospital Image Showcase Card */}
          <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-teal-500/5 group w-full max-w-lg mt-6">
            <img 
              src="/hospital.png" 
              alt="CareDesk Smart Hospital" 
              className="w-full h-72 sm:h-80 object-cover object-center group-hover:scale-102 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs text-brand-teal font-semibold tracking-wider uppercase">CareDesk SaaS Core</span>
                <span className="text-sm font-bold text-white mt-0.5 font-display">St. Mary Medical Center</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-semibold text-white uppercase tracking-widest">
                  Online &amp; Secure
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Metadata Row & Footer */}
        <div className="z-10 w-full max-w-lg">
          <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-6 pb-6 w-full">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Security</span>
              <span className="text-xs font-semibold text-slate-200 mt-1">RLS Isolated</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Compliance</span>
              <span className="text-xs font-semibold text-slate-200 mt-1">HIPAA Audit</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Performance</span>
              <span className="text-xs font-semibold text-slate-200 mt-1">Sub-ms Queries</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 flex justify-between items-center border-t border-white/5 pt-4">
            <span>&copy; {new Date().getFullYear()} CareDesk SaaS Core.</span>
            <span>v1.5.0</span>
          </div>
        </div>
      </div>

      {/* Right side: Form Column */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-10 bg-bg-base relative overflow-y-auto">
        <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none space-y-6 relative overflow-hidden my-auto py-8">
          
          {/* Top border neon bar */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-primary via-brand-teal to-brand-primary"></div>

          {/* Mobile Logo Brand */}
          <div className="lg:hidden flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 150" className="h-8 w-auto">
              <defs>
                <linearGradient id="mLogoPrimaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#1D4ED8" />
                </linearGradient>
                <linearGradient id="mLogoSecondaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2DD4BF" />
                  <stop offset="100%" stopColor="#0D9488" />
                </linearGradient>
              </defs>

              <g transform="translate(20, 15)">
                <circle cx="60" cy="60" r="58" fill="none" stroke="#E2E8F0" strokeWidth="2" opacity="0.5"/>
                <path d="M 60 20 A 40 40 0 1 0 60 100 L 60 84 A 24 24 0 1 1 60 36 Z" fill="url(#mLogoPrimaryGrad)" />
                <path d="M 60 20 A 40 40 0 0 1 100 60 A 40 40 0 0 1 60 100 L 60 84 A 24 24 0 0 0 84 60 A 24 24 0 0 0 60 36 Z" fill="url(#mLogoSecondaryGrad)" opacity="0.9" />
                <path d="M 54 45 h 12 v 9 h 9 v 12 h -9 v 9 h -12 v -9 h -9 v -12 h 9 z" fill="#FFFFFF" />
              </g>

              <text x="160" y="75" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="48px" fill="currentColor" className="text-text-heading" letterSpacing="-0.5px">
                Care<tspan fill="#0D9488">Desk</tspan>
              </text>
            </svg>
          </div>

          {/* Sliding Toggle Switch */}
          <div className="flex bg-slate-100 dark:bg-slate-900/60 p-1 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-inner relative max-w-[280px] mx-auto">
            <button
              type="button"
              onClick={() => setAuthMode('signin')}
              className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition-all duration-300 cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-white dark:bg-slate-800 text-brand-primary dark:text-white shadow-md'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('signup')}
              className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition-all duration-300 cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-white dark:bg-slate-800 text-brand-primary dark:text-white shadow-md'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              Sign Up
            </button>
          </div>

          {authMode === 'signin' ? (
            /* ================= SIGN IN VIEW ================= */
            <>
              <div className="space-y-1.5 text-center">
                <h2 className="text-2xl font-extrabold text-text-heading tracking-tight">
                  Welcome Back
                </h2>
                <p className="text-xs text-text-muted max-w-xs mx-auto">
                  Enter credentials to access secure multi-tenant hospital workspace.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3.5 bottom-3 text-text-muted/65 z-10" size={16} />
                  <Input
                    label="Email Address"
                    placeholder="name@hospital.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    className="pl-10 h-10 rounded-xl"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3.5 bottom-3 text-text-muted/65 z-10" size={16} />
                  <Input
                    label="Password"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    className="pl-10 h-10 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 bottom-2 text-text-muted hover:text-text-main p-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full justify-center text-sm font-semibold h-10.5 rounded-xl cursor-pointer"
                  isLoading={isSubmitting}
                >
                  Sign In to Dashboard
                </Button>
              </form>

              {/* Quick Demo Sandbox Access */}
              <div>
                <div className="relative flex items-center justify-center my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                  </div>
                  <span className="relative px-3.5 bg-white dark:bg-slate-900 text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1">
                    <Sparkles size={11} className="text-amber-500" /> Sandbox Quick Access
                  </span>
                </div>

                {/* Sub Tab Switcher */}
                <div className="flex bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200 dark:border-slate-800 mb-4 max-w-[340px] mx-auto">
                  <button
                    type="button"
                    onClick={() => setMockTab('staff')}
                    className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      mockTab === 'staff'
                        ? 'bg-white dark:bg-slate-800 text-text-heading shadow-sm'
                        : 'text-text-muted hover:text-text-main'
                    }`}
                  >
                    Clinicians & Staff
                  </button>
                  <button
                    type="button"
                    onClick={() => setMockTab('patient')}
                    className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      mockTab === 'patient'
                        ? 'bg-white dark:bg-slate-800 text-text-heading shadow-sm'
                        : 'text-text-muted hover:text-text-main'
                    }`}
                  >
                    Patients
                  </button>
                </div>

                {/* Profile Grid list */}
                <div className="max-h-[220px] overflow-y-auto border border-slate-200 dark:border-slate-800/80 rounded-2xl p-3 bg-slate-50 dark:bg-slate-950/50 shadow-inner">
                  {mockTab === 'staff' ? (
                    <div className="grid grid-cols-2 gap-2">
                      {staffMockUsers.map((mockUser: any) => (
                        <button
                          key={mockUser.profile.id}
                          type="button"
                          onClick={() => handleQuickLogin(mockUser)}
                          disabled={isSubmitting}
                          className="flex items-center gap-2.5 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 hover:border-brand-primary/40 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-left transition-all duration-300 group cursor-pointer disabled:opacity-50"
                        >
                          <div className="relative shrink-0">
                            <img 
                              src={mockUser.profile.avatar_url} 
                              alt={mockUser.profile.first_name} 
                              className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-brand-primary/30 transition-all"
                            />
                            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 p-0.5 rounded-full shadow-xs border border-slate-100 dark:border-slate-900">
                              {getRoleIcon(mockUser.profile.role)}
                            </div>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-text-heading group-hover:text-brand-primary transition-colors truncate text-[11px] leading-tight">
                              {mockUser.profile.first_name} {mockUser.profile.last_name[0]}.
                            </span>
                            <span className="text-[9px] text-text-muted capitalize truncate mt-0.5 font-medium">
                              {mockUser.profile.role.replace('_', ' ')}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {patientMockUsers.map((mockUser: any) => (
                        <button
                          key={mockUser.profile.id}
                          type="button"
                          onClick={() => handleQuickLogin(mockUser)}
                          disabled={isSubmitting}
                          className="flex items-center gap-3 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 hover:border-brand-teal/40 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-left transition-all duration-300 group cursor-pointer disabled:opacity-50"
                        >
                          <div className="relative shrink-0">
                            <img 
                              src={mockUser.profile.avatar_url} 
                              alt={mockUser.profile.first_name} 
                              className="w-9 h-9 rounded-full object-cover ring-2 ring-transparent group-hover:ring-brand-teal/30 transition-all"
                            />
                            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 p-0.5 rounded-full shadow-xs border border-slate-100 dark:border-slate-900">
                              {getRoleIcon('patient')}
                            </div>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-text-heading group-hover:text-brand-teal transition-colors truncate text-xs leading-tight">
                              {mockUser.profile.first_name} {mockUser.profile.last_name}
                            </span>
                            <span className="text-[10px] text-text-muted truncate mt-0.5">
                              Access Secure EMR timeline, bills, &amp; prescriptions.
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center pt-1.5">
                <span className="text-[11px] text-text-muted flex items-center justify-center gap-1.5 font-medium">
                  <KeyRound size={11} className="shrink-0 text-amber-500" />
                  Pass-phrase for all profiles is <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-200 dark:border-slate-700 font-bold text-text-heading">password</code>
                </span>
              </div>
            </>
          ) : (
            /* ================= SIGN UP VIEW ================= */
            <>
              <div className="space-y-1.5 text-center">
                <h2 className="text-2xl font-extrabold text-text-heading tracking-tight">
                  Create Workspace Account
                </h2>
                <p className="text-xs text-text-muted max-w-xs mx-auto">
                  Select registration pathway to begin EMR clinic cluster setup.
                </p>
              </div>

              {/* Sub signup switch tabs */}
              <div className="flex bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200 dark:border-slate-800 max-w-[340px] mx-auto mb-2">
                <button
                  type="button"
                  onClick={() => setSignupType('provider')}
                  className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    signupType === 'provider'
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  Clinic Setup
                </button>
                <button
                  type="button"
                  onClick={() => setSignupType('patient')}
                  className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    signupType === 'patient'
                      ? 'bg-brand-teal text-white shadow-sm'
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  Patient Account
                </button>
              </div>

              {signupType === 'provider' ? (
                /* Facility/Tenant Signup Form */
                <form onSubmit={handleFacilityRegisterSubmit} className="space-y-4">
                  <div className="relative">
                    <Building className="absolute left-3.5 bottom-3 text-text-muted/65 z-10" size={16} />
                    <Input
                      label="Hospital / Clinic Name"
                      placeholder="e.g. Sacred Heart Clinic"
                      value={hName}
                      onChange={(e) => setHName(e.target.value)}
                      disabled={isSubmitting}
                      className="pl-10 h-10 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5 block">
                      Hospital Subdomain URL
                    </label>
                    <div className="flex items-center relative">
                      <Globe className="absolute left-3.5 text-text-muted/65" size={16} />
                      <input
                        type="text"
                        placeholder="subdomain"
                        value={hSubdomain}
                        onChange={(e) => setHSubdomain(e.target.value.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase())}
                        disabled={isSubmitting}
                        className="pl-10 pr-3 py-2 bg-bg-surface border border-border-main border-r-0 rounded-l-xl text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary w-1/2 h-10 transition-all"
                      />
                      <span className="px-3 py-2 bg-bg-surface-hover border border-border-main border-l-0 rounded-r-xl text-sm text-text-muted font-mono w-1/2 h-10 flex items-center justify-center">
                        .caredesk.com
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="relative">
                      <User className="absolute left-3.5 bottom-3 text-text-muted/65 z-10" size={16} />
                      <Input
                        label="Admin First Name"
                        placeholder="Amit"
                        value={hAdminFirst}
                        onChange={(e) => setHAdminFirst(e.target.value)}
                        disabled={isSubmitting}
                        className="pl-10 h-10 rounded-xl"
                      />
                    </div>
                    <div className="relative">
                      <User className="absolute left-3.5 bottom-3 text-text-muted/65 z-10" size={16} />
                      <Input
                        label="Admin Last Name"
                        placeholder="Sharma"
                        value={hAdminLast}
                        onChange={(e) => setHAdminLast(e.target.value)}
                        disabled={isSubmitting}
                        className="pl-10 h-10 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <Mail className="absolute left-3.5 bottom-3 text-text-muted/65 z-10" size={16} />
                    <Input
                      label="Administrator Email"
                      placeholder="admin@clinic.com"
                      type="email"
                      value={hEmail}
                      onChange={(e) => setHEmail(e.target.value)}
                      disabled={isSubmitting}
                      className="pl-10 h-10 rounded-xl"
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3.5 bottom-3 text-text-muted/65 z-10" size={16} />
                    <Input
                      label="Account Password"
                      placeholder="••••••••"
                      type="password"
                      value={hPassword}
                      onChange={(e) => setHPassword(e.target.value)}
                      disabled={isSubmitting}
                      className="pl-10 h-10 rounded-xl"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full justify-center text-sm font-semibold h-10.5 rounded-xl cursor-pointer"
                    isLoading={isSubmitting}
                  >
                    Setup Clinic Cluster
                  </Button>
                </form>
              ) : (
                /* Patient Signup Form */
                <form onSubmit={handlePatientRegisterSubmit} className="space-y-4">
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Select Healthcare Facility
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3.5 top-3 text-text-muted/65 z-10" size={16} />
                      <select
                        className="pl-10 pr-3 py-2 bg-bg-surface border border-border-main rounded-xl text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary w-full h-10 appearance-none cursor-pointer"
                        value={pTenantId}
                        onChange={(e) => setPTenantId(e.target.value)}
                        disabled={isSubmitting}
                      >
                        <option value="">-- Choose Hospital/Clinic --</option>
                        {activeTenantsList.map((tenant) => (
                          <option key={tenant.id} value={tenant.id}>
                            {tenant.name} ({tenant.subdomain}.caredesk.com)
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3.5 top-3 pointer-events-none text-text-muted/75 text-[10px]">
                        ▼
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="relative">
                      <User className="absolute left-3.5 bottom-3 text-text-muted/65 z-10" size={16} />
                      <Input
                        label="First Name"
                        placeholder="Priya"
                        value={pFirst}
                        onChange={(e) => setPFirst(e.target.value)}
                        disabled={isSubmitting}
                        className="pl-10 h-10 rounded-xl"
                      />
                    </div>
                    <div className="relative">
                      <User className="absolute left-3.5 bottom-3 text-text-muted/65 z-10" size={16} />
                      <Input
                        label="Last Name"
                        placeholder="Patel"
                        value={pLast}
                        onChange={(e) => setPLast(e.target.value)}
                        disabled={isSubmitting}
                        className="pl-10 h-10 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="relative">
                      <Calendar className="absolute left-3.5 bottom-3 text-text-muted/65 z-10" size={16} />
                      <Input
                        label="Date of Birth"
                        type="date"
                        value={pDob}
                        onChange={(e) => setPDob(e.target.value)}
                        disabled={isSubmitting}
                        className="pl-10 h-10 rounded-xl"
                      />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                        Gender at birth
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3 text-text-muted/65 z-10" size={16} />
                        <select
                          className="pl-10 pr-3 py-2 bg-bg-surface border border-border-main rounded-xl text-sm text-text-main focus:outline-none focus:ring-2 w-full h-10 appearance-none cursor-pointer"
                          value={pGender}
                          onChange={(e) => setPGender(e.target.value as any)}
                          disabled={isSubmitting}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                        <div className="absolute right-3.5 top-3 pointer-events-none text-text-muted/75 text-[10px]">
                          ▼
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <Phone className="absolute left-3.5 bottom-3 text-text-muted/65 z-10" size={16} />
                    <Input
                      label="Mobile Contact"
                      placeholder="+91 98765 43210"
                      value={pPhone}
                      onChange={(e) => setPPhone(e.target.value)}
                      disabled={isSubmitting}
                      className="pl-10 h-10 rounded-xl"
                    />
                  </div>

                  <div className="relative">
                    <MapPin className="absolute left-3.5 bottom-3 text-text-muted/65 z-10" size={16} />
                    <Input
                      label="Home Address"
                      placeholder="Street, City, State"
                      value={pAddress}
                      onChange={(e) => setPAddress(e.target.value)}
                      disabled={isSubmitting}
                      className="pl-10 h-10 rounded-xl"
                    />
                  </div>

                  <div className="relative">
                    <Mail className="absolute left-3.5 bottom-3 text-text-muted/65 z-10" size={16} />
                    <Input
                      label="Email Address"
                      placeholder="name@example.com"
                      type="email"
                      value={pEmail}
                      onChange={(e) => setPEmail(e.target.value)}
                      disabled={isSubmitting}
                      className="pl-10 h-10 rounded-xl"
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3.5 bottom-3 text-text-muted/65 z-10" size={16} />
                    <Input
                      label="Access Password"
                      placeholder="••••••••"
                      type="password"
                      value={pPassword}
                      onChange={(e) => setPPassword(e.target.value)}
                      disabled={isSubmitting}
                      className="pl-10 h-10 rounded-xl"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="secondary"
                    className="w-full justify-center text-sm font-semibold h-10.5 rounded-xl cursor-pointer"
                    isLoading={isSubmitting}
                  >
                    Confirm Patient Account
                  </Button>
                </form>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
