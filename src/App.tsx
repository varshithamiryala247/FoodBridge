/**
 * FoodBridge Application Router
 * Hackathon Problem ID: HACK-P197 (Food & Restaurant)
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { HowItWorksPage, FoodSafetyPage, AboutPage } from './pages/public/StaticPages';
import { LoginPage, RegisterPage } from './pages/auth/AuthPages';

// Donor Pages
import { DonorDashboard } from './pages/donor/DonorDashboard';
import { DonorListingsPage } from './pages/donor/DonorListingsPage';
import { DonorNewListing } from './pages/donor/DonorNewListing';
import { DonorListingDetail } from './pages/donor/DonorListingDetail';
import { DonorRequestsPage } from './pages/donor/DonorRequestsPage';
import { DonorHistoryPage, DonorProfilePage } from './pages/donor/DonorHistoryProfile';

// Recipient Pages
import { RecipientDashboard } from './pages/recipient/RecipientDashboard';
import { RecipientAvailableMarketplace } from './pages/recipient/RecipientAvailableMarketplace';
import { RecipientListingDetail } from './pages/recipient/RecipientListingDetail';
import { RecipientRequestsPage } from './pages/recipient/RecipientRequestsPage';
import { RecipientHistoryPage, RecipientProfilePage } from './pages/recipient/RecipientHistoryProfile';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import {
  AdminListingsPage,
  AdminOrganizationsPage,
  AdminReportsPage,
  AdminActivityPage
} from './pages/admin/AdminPages';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/food-safety" element={<FoodSafetyPage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* Donor Routes */}
          <Route path="/donor/dashboard" element={<DonorDashboard />} />
          <Route path="/donor/listings" element={<DonorListingsPage />} />
          <Route path="/donor/listings/new" element={<DonorNewListing />} />
          <Route path="/donor/listings/:id" element={<DonorListingDetail />} />
          <Route path="/donor/requests" element={<DonorRequestsPage />} />
          <Route path="/donor/history" element={<DonorHistoryPage />} />
          <Route path="/donor/profile" element={<DonorProfilePage />} />

          {/* Recipient Routes */}
          <Route path="/recipient/dashboard" element={<RecipientDashboard />} />
          <Route path="/recipient/available" element={<RecipientAvailableMarketplace />} />
          <Route path="/recipient/available/:id" element={<RecipientListingDetail />} />
          <Route path="/recipient/requests" element={<RecipientRequestsPage />} />
          <Route path="/recipient/history" element={<RecipientHistoryPage />} />
          <Route path="/recipient/profile" element={<RecipientProfilePage />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/listings" element={<AdminListingsPage />} />
          <Route path="/admin/organizations" element={<AdminOrganizationsPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
          <Route path="/admin/activity" element={<AdminActivityPage />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
