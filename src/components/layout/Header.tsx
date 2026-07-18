import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  Bell,
  CalendarDays,
  Command,
  FileText,
  Menu,
  Search,
  Shield,
  Users,
  X,
  Info,
  CheckCircle,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';

interface HeaderProps {
  onOpenNavigation: () => void;
  onNavigate: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNavigation, onNavigate }) => {
  const { profile, tenant, isMock } = useAuth();
  const { patients, appointments, invoices, notifications, markNotificationsAsRead } = useData();
  const [query, setQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const tenantPatients = patients.filter((patient) => patient.tenant_id === tenant?.id);
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return tenantPatients
      .filter((patient) => [patient.name, patient.phone, patient.email].some((value) => value.toLowerCase().includes(normalized)))
      .slice(0, 5);
  }, [query, tenantPatients]);

  const openInvoiceCount = invoices.filter((invoice) => invoice.tenant_id === tenant?.id && invoice.status === 'unpaid').length;
  const arrivingCount = appointments.filter((appointment) => appointment.tenant_id === tenant?.id && appointment.status === 'arrived').length;

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsSearchOpen(true);
        requestAnimationFrame(() => searchRef.current?.focus());
      }
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
        setIsNotificationsOpen(false);
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  if (!profile) return null;

  const fullName = `${profile.first_name} ${profile.last_name}`;

  const goTo = (tab: string) => {
    onNavigate(tab);
    setIsSearchOpen(false);
    setIsNotificationsOpen(false);
  };

  const handleToggleNotifications = () => {
    if (!isNotificationsOpen) {
      markNotificationsAsRead();
    }
    setIsNotificationsOpen(!isNotificationsOpen);
    setIsSearchOpen(false);
  };

  const getNotiIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="text-emerald-500 shrink-0" size={14} />;
      case 'warning': return <AlertTriangle className="text-amber-500 shrink-0" size={14} />;
      case 'error': return <AlertCircle className="text-rose-500 shrink-0" size={14} />;
      case 'info':
      default:
        return <Info className="text-sky-500 shrink-0" size={14} />;
    }
  };

  return (
    <header className="relative h-16 border-b border-border-main bg-bg-surface flex items-center justify-between px-4 md:px-6 shrink-0 gap-3">
      {/* Search / Context */}
      <div className="flex items-center gap-4">
        <button onClick={onOpenNavigation} className="md:hidden p-2 -ml-2 rounded-lg text-text-muted hover:bg-bg-surface-hover" aria-label="Open navigation">
          <Menu size={20} />
        </button>
        <div className="relative w-[min(52vw,320px)]">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-muted">
            <Search size={16} />
          </span>
          <input
            type="text"
            ref={searchRef}
            value={query}
            onFocus={() => setIsSearchOpen(true)}
            onChange={(event) => { setQuery(event.target.value); setIsSearchOpen(true); }}
            placeholder="Search patients..."
            className="w-full pl-9 pr-4 py-1.5 bg-bg-base border border-border-main rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/25 focus:border-brand-primary transition-all text-text-main"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-0.5 text-[10px] text-text-muted border border-border-main rounded px-1 py-0.5"><Command size={10} />K</span>
          {isSearchOpen && (
            <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-[min(92vw,420px)] overflow-hidden rounded-xl border border-border-main bg-bg-surface shadow-xl">
              <div className="px-3 py-2 border-b border-border-main text-[10px] uppercase tracking-wider font-bold text-text-muted">{query ? 'Patient results' : 'Quick access'}</div>
              {query && results.length === 0 ? <p className="px-3 py-4 text-sm text-text-muted">No matching patients found.</p> : null}
              {results.map((patient) => (
                <button key={patient.id} onClick={() => goTo('patients')} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-bg-surface-hover text-left">
                  <div className="h-8 w-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-xs">{patient.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div>
                  <div className="min-w-0"><p className="text-sm font-semibold text-text-heading truncate">{patient.name}</p><p className="text-xs text-text-muted truncate">{patient.phone} · {patient.blood_group}</p></div>
                </button>
              ))}
              {!query && <div className="p-1.5 space-y-0.5">
                <button onClick={() => goTo('patients')} className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-bg-surface-hover text-sm text-text-main"><Users size={16} className="text-brand-primary" />Patient records</button>
                <button onClick={() => goTo('queue')} className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-bg-surface-hover text-sm text-text-main"><CalendarDays size={16} className="text-brand-teal" />Today’s queue</button>
                <button onClick={() => goTo('billing')} className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-bg-surface-hover text-sm text-text-main"><FileText size={16} className="text-amber-500" />Billing desk</button>
              </div>}
            </div>
          )}
        </div>

        {isMock && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse">
            <Shield size={12} />
            Demo Sandbox
          </span>
        )}
      </div>

      {/* Profile & Notifications */}
      <div className="flex items-center gap-4">
        {/* Subdomain details */}
        <span className="text-xs text-text-muted hidden md:inline-block font-mono bg-bg-base border border-border-main px-2 py-1 rounded">
          {tenant?.subdomain ? `${tenant.subdomain}.caredesk.com` : 'caredesk.com'}
        </span>

        {/* Notifications Icon */}
        <button onClick={handleToggleNotifications} className="p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-bg-surface-hover transition-all relative cursor-pointer" aria-label="View notifications">
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 bg-rose-600 text-white font-bold text-[9px] rounded-full flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
        
        {isNotificationsOpen && (
          <div className="absolute right-4 md:right-24 top-14 z-50 w-80 rounded-xl border border-border-main bg-bg-surface shadow-xl overflow-hidden flex flex-col max-h-[480px]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-main shrink-0">
              <span className="font-bold text-sm text-text-heading">Operational alerts</span>
              <button onClick={() => setIsNotificationsOpen(false)} className="text-text-muted hover:text-text-main" aria-label="Close alerts">
                <X size={16} />
              </button>
            </div>
            
            {/* Quick action warnings */}
            <div className="shrink-0 border-b border-border-main bg-bg-base/40">
              <button onClick={() => goTo('queue')} className="w-full px-4 py-2.5 text-left hover:bg-bg-surface-hover flex justify-between items-center border-b border-border-main/50">
                <span className="text-xs font-semibold text-text-main">Patients awaiting care</span>
                <span className="bg-brand-primary/10 text-brand-primary font-bold px-2 py-0.5 rounded text-[10px]">{arrivingCount} arrived</span>
              </button>
              <button onClick={() => goTo('billing')} className="w-full px-4 py-2.5 text-left hover:bg-bg-surface-hover flex justify-between items-center">
                <span className="text-xs font-semibold text-text-main">Unpaid account invoices</span>
                <span className="bg-amber-500/10 text-amber-600 font-bold px-2 py-0.5 rounded text-[10px]">{openInvoiceCount} pending</span>
              </button>
            </div>

            {/* Simulated chronological log list */}
            <div className="flex-1 overflow-y-auto divide-y divide-border-main">
              <div className="px-4 py-2 bg-bg-surface-hover/30 text-[10px] font-bold text-text-muted uppercase tracking-wider sticky top-0 border-b border-border-main/40">
                Live Operations Stream
              </div>
              
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-text-muted flex flex-col items-center gap-1.5">
                  <Info size={20} className="text-text-muted/40" />
                  <p>Awaiting clinical events...</p>
                </div>
              ) : (
                notifications.map((noti) => (
                  <div key={noti.id} className="p-3 hover:bg-bg-surface-hover flex items-start gap-2.5 text-[11px] text-left">
                    <div className="mt-0.5">{getNotiIcon(noti.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-text-heading leading-tight break-words">{noti.message}</p>
                      <span className="text-[9px] text-text-muted block mt-1">{noti.timestamp}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="h-8 w-px bg-border-main"></div>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-sm font-semibold text-text-heading">{fullName}</span>
            <span className="text-xs text-text-muted capitalize">
              {profile.department || 'General Clinical'}
            </span>
          </div>
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={fullName}
              className="h-9 w-9 rounded-full object-cover border border-border-main"
            />
          ) : (
            <div className="h-9 w-9 bg-brand-primary text-white flex items-center justify-center font-bold rounded-full text-sm">
              {profile.first_name[0]}
              {profile.last_name[0]}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
