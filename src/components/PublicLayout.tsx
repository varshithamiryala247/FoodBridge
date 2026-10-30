import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartHandshake, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const PublicHeader: React.FC = () => {
  const { isAuthenticated, role, quickLogin, logout } = useAuth();
  const navigate = useNavigate();

  const handleDashboardRedirect = () => {
    if (role === 'DONOR') navigate('/donor/dashboard');
    else if (role === 'RECIPIENT') navigate('/recipient/dashboard');
    else if (role === 'ADMIN') navigate('/admin/dashboard');
    else navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <Link to="/" className="flex items-center gap-2.5 text-emerald-900 whitespace-nowrap shrink-0 group">
          <div className="w-9 h-9 rounded-lg bg-emerald-800 flex items-center justify-center text-white shadow-xs group-hover:bg-emerald-900 transition-colors">
            <HeartHandshake className="w-5 h-5 text-amber-300" />
          </div>
          <span className="text-xl font-bold tracking-tight text-emerald-950">FoodBridge</span>
        </Link>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
          <Link to="/how-it-works" className="hover:text-emerald-900 transition-colors whitespace-nowrap shrink-0">
            How It Works
          </Link>
          <Link to="/food-safety" className="hover:text-emerald-900 transition-colors whitespace-nowrap shrink-0">
            Food Safety
          </Link>
          <Link to="/about" className="hover:text-emerald-900 transition-colors whitespace-nowrap shrink-0">
            About & Impact
          </Link>
          <Link to="/recipient/available" className="hover:text-emerald-900 transition-colors whitespace-nowrap shrink-0">
            Browse Food
          </Link>
        </nav>

        {/* Zone 3: Primary Action & Quick Demo */}
        <div className="flex items-center gap-3 shrink-0">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleDashboardRedirect}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
              >
                Go to {role === 'DONOR' ? 'Donor' : role === 'RECIPIENT' ? 'NGO' : 'Admin'} Dashboard
              </button>
              <button
                onClick={logout}
                className="px-2.5 py-1.5 text-xs text-stone-500 hover:text-stone-800 transition-colors"
                title="Log out"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/login"
                className="px-3.5 py-2 text-xs font-medium text-stone-700 hover:text-emerald-900 transition-colors whitespace-nowrap shrink-0"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 py-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 text-white mb-3">
            <div className="w-8 h-8 rounded-md bg-emerald-700 flex items-center justify-center text-white">
              <HeartHandshake className="w-4 h-4 text-amber-300" />
            </div>
            <span className="text-lg font-bold">FoodBridge</span>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed mb-4">
            “Rescue Food. Feed Hope.” Connecting surplus food donors with verified charities and shelters to end hunger and eliminate food waste.
          </p>
          <span className="text-xs text-stone-400">Hyderabad Metro Region Demonstration</span>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-stone-100 uppercase tracking-wider mb-3">Platform</h4>
          <ul className="space-y-2 text-xs text-stone-400">
            <li><Link to="/how-it-works" className="hover:text-white transition-colors">Three-Step Rescue Flow</Link></li>
            <li><Link to="/recipient/available" className="hover:text-white transition-colors">Available Surplus Food</Link></li>
            <li><Link to="/food-safety" className="hover:text-white transition-colors">FSSAI & Hygiene Guidelines</Link></li>
            <li><Link to="/about" className="hover:text-white transition-colors">Impact & Technology</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-stone-100 uppercase tracking-wider mb-3">Target Stakeholders</h4>
          <ul className="space-y-2 text-xs text-stone-400">
            <li><Link to="/login" className="hover:text-white transition-colors">Restaurants & Hotels</Link></li>
            <li><Link to="/login" className="hover:text-white transition-colors">Bakeries & Caterers</Link></li>
            <li><Link to="/login" className="hover:text-white transition-colors">Shelters & NGOs</Link></li>
            <li><Link to="/login" className="hover:text-white transition-colors">Community Kitchens</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-stone-100 uppercase tracking-wider mb-3">Demo Notice</h4>
          <p className="text-xs text-stone-400 leading-relaxed">
            Hackathon Problem ID: HACK-P197 (Food & Restaurant). All donor and recipient addresses shown in seed data are fictional demonstration entities.
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs text-stone-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted Session & RLS Protection</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-6 border-t border-stone-800 text-center text-xs text-stone-400">
        FoodBridge Open Source Prototype © 2026. Built for hackathon demonstration.
      </div>
    </footer>
  );
};
