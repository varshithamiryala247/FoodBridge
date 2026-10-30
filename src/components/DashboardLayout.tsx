import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  PlusCircle,
  Inbox,
  History,
  Building2,
  LogOut,
  Menu,
  X,
  Search,
  ShieldCheck,
  Users,
  Flag,
  Activity,
  RotateCcw,
  UserCheck,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { store } from '../services/store';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: number;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  requiredRole?: UserRole;
  actions?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  subtitle,
  requiredRole,
  actions,
}) => {
  const { user, organization, role, logout, quickLogin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Protected Route Check
  if (requiredRole && role !== requiredRole) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-6 rounded-xl border border-stone-200 shadow-xs text-center">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-stone-900 mb-2">Restricted Access Area</h2>
          <p className="text-sm text-stone-600 mb-6">
            This dashboard is restricted to <strong>{requiredRole}</strong> accounts. You are currently logged in as a <strong>{role || 'Guest'}</strong>.
          </p>
          <div className="space-y-2">
            <button
              onClick={() => {
                quickLogin(requiredRole);
                navigate(
                  requiredRole === 'DONOR'
                    ? '/donor/dashboard'
                    : requiredRole === 'RECIPIENT'
                    ? '/recipient/dashboard'
                    : '/admin/dashboard'
                );
              }}
              className="w-full py-2.5 px-4 bg-emerald-800 text-white rounded-lg text-sm font-semibold hover:bg-emerald-900 transition-colors"
            >
              Switch to Demo {requiredRole}
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-2 px-4 border border-stone-200 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Define sidebar navigation items based on current role
  let navItems: NavItem[] = [];

  if (role === 'DONOR') {
    const pendingReqCount = store
      .getRequests()
      .filter((r) => r.donorOrganizationId === organization?.id && r.status === 'PENDING').length;

    navItems = [
      { label: 'Overview', path: '/donor/dashboard', icon: LayoutDashboard },
      { label: 'My Food Listings', path: '/donor/listings', icon: UtensilsCrossed },
      { label: 'Create New Listing', path: '/donor/listings/new', icon: PlusCircle },
      { label: 'Incoming Requests', path: '/donor/requests', icon: Inbox, badge: pendingReqCount },
      { label: 'Donation History', path: '/donor/history', icon: History },
      { label: 'Organization Profile', path: '/donor/profile', icon: Building2 },
    ];
  } else if (role === 'RECIPIENT') {
    const acceptedCount = store
      .getRequests()
      .filter(
        (r) =>
          r.recipientOrganizationId === organization?.id &&
          (r.status === 'ACCEPTED' || r.status === 'READY_FOR_PICKUP')
      ).length;

    navItems = [
      { label: 'Overview', path: '/recipient/dashboard', icon: LayoutDashboard },
      { label: 'Find Food Marketplace', path: '/recipient/available', icon: Search },
      { label: 'My Requests & Pickups', path: '/recipient/requests', icon: Inbox, badge: acceptedCount },
      { label: 'Completed History', path: '/recipient/history', icon: History },
      { label: 'Organization Profile', path: '/recipient/profile', icon: Building2 },
    ];
  } else if (role === 'ADMIN') {
    const openReportsCount = store.getReports().filter((r) => r.status === 'OPEN').length;

    navItems = [
      { label: 'Admin Overview', path: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Manage Food Listings', path: '/admin/listings', icon: UtensilsCrossed },
      { label: 'Organizations & Approvals', path: '/admin/organizations', icon: Users },
      { label: 'Listing Reports & Moderation', path: '/admin/reports', icon: Flag, badge: openReportsCount },
      { label: 'Platform Activity Audit', path: '/admin/activity', icon: Activity },
    ];
  }

  const handleResetData = () => {
    store.resetToDemo();
    setShowResetConfirm(false);
    setToastMessage('Demonstration database reset to initial Hyderabad seed state.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAF7] flex flex-col md:flex-row">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-stone-900 text-white px-4 py-3 rounded-lg shadow-lg text-sm flex items-center gap-2 border border-stone-800 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <Link to="/" className="flex items-center gap-2 font-bold text-emerald-900">
          <div className="w-7 h-7 bg-emerald-800 text-amber-300 rounded flex items-center justify-center text-xs">
            FB
          </div>
          <span className="text-base">FoodBridge</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-md text-stone-600 hover:bg-stone-100"
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-stone-200 flex flex-col transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-screen md:sticky md:top-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-stone-200">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center text-amber-300 font-bold text-sm shadow-xs">
              FB
            </div>
            <div>
              <span className="font-bold text-base text-emerald-950 block leading-tight">FoodBridge</span>
              <span className="text-[10px] text-stone-600 font-medium tracking-wider uppercase block">
                {role === 'DONOR' ? 'Donor Portal' : role === 'RECIPIENT' ? 'NGO Portal' : 'Admin Console'}
              </span>
            </div>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-stone-400 hover:text-stone-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Org / User card */}
        <div className="p-4 border-b border-stone-100 bg-stone-50/70">
          <div className="text-xs font-semibold text-stone-900 truncate">
            {organization?.organizationName || user?.fullName}
          </div>
          <div className="text-[11px] text-stone-600 truncate flex items-center gap-1 mt-0.5">
            <span>{user?.email}</span>
          </div>
          {organization && (
            <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              <span>{organization.city} · {organization.serviceArea}</span>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-300' : 'text-stone-500'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded-full tabular-nums ${
                      isActive ? 'bg-amber-400 text-emerald-950' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Demo Switcher for Judges */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 space-y-2">
          <div className="text-[10px] font-semibold text-stone-600 uppercase tracking-wider flex items-center justify-between">
            <span>Judge Demo Switcher</span>
            <span className="text-emerald-700 font-mono">HACK-P197</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => {
                quickLogin('DONOR');
                navigate('/donor/dashboard');
              }}
              className={`py-1 text-[11px] font-medium rounded border transition-colors ${
                role === 'DONOR'
                  ? 'bg-emerald-800 text-white border-emerald-800'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
              title="Green Plate Kitchen (Donor)"
            >
              Donor
            </button>
            <button
              onClick={() => {
                quickLogin('RECIPIENT');
                navigate('/recipient/dashboard');
              }}
              className={`py-1 text-[11px] font-medium rounded border transition-colors ${
                role === 'RECIPIENT'
                  ? 'bg-emerald-800 text-white border-emerald-800'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
              title="Hope Community Kitchen (NGO)"
            >
              NGO
            </button>
            <button
              onClick={() => {
                quickLogin('ADMIN');
                navigate('/admin/dashboard');
              }}
              className={`py-1 text-[11px] font-medium rounded border transition-colors ${
                role === 'ADMIN'
                  ? 'bg-emerald-800 text-white border-emerald-800'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
              title="Dr. Suresh Reddy (Admin)"
            >
              Admin
            </button>
          </div>

          <div className="pt-1 flex items-center justify-between text-xs">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="text-[11px] text-stone-600 hover:text-stone-900 flex items-center gap-1 transition-colors"
              title="Reset all listings & requests to initial seed state"
            >
              <RotateCcw className="w-3 h-3 text-stone-600" />
              <span>Reset Data</span>
            </button>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="text-[11px] text-stone-600 hover:text-rose-600 flex items-center gap-1 transition-colors"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-stone-600 flex items-center gap-1.5 mb-0.5">
              <span>FoodBridge</span>
              <span aria-hidden="true">/</span>
              <span className="capitalize">{role?.toLowerCase()}</span>
              <span aria-hidden="true">/</span>
              <span className="text-stone-800 font-medium">{title}</span>
            </div>
            <h1 className="text-xl font-bold text-stone-900 tracking-tight">{title}</h1>
            {subtitle && <p className="text-xs text-stone-600 mt-0.5">{subtitle}</p>}
          </div>

          {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
        </header>

        {/* Page Content Container */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-stone-200 shadow-xl">
            <h3 className="text-base font-bold text-stone-900 mb-2">Reset Database to Demo Seed?</h3>
            <p className="text-xs text-stone-600 mb-6 leading-relaxed">
              This will restore all 10 food listings, 7 sample requests, audit events, and moderation reports back to their initial Hyderabad demonstration state. Any newly created listings or requests will be reverted.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetData}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
