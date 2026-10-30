/**
 * FoodBridge Authentication Context
 * Manages user sessions, role-based access control, registration, and judge demo shortcuts.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Profile, Organization, UserRole, OrganizationType } from '../types';
import { store } from '../services/store';

interface AuthContextType {
  user: Profile | null;
  organization: Organization | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  quickLogin: (role: UserRole) => void;
  logout: () => void;
  register: (data: {
    fullName: string;
    email: string;
    password?: string;
    role: UserRole;
    organizationName: string;
    organizationType: OrganizationType;
    city: string;
    serviceArea: string;
    demoAddress: string;
    phone: string;
    description: string;
  }) => Promise<boolean>;
  refreshProfile: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'foodbridge_auth_user_id';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);

  const loadSession = () => {
    const savedUserId = localStorage.getItem(AUTH_USER_KEY);
    if (savedUserId) {
      const profiles = store.getProfiles();
      const matched = profiles.find((p) => p.id === savedUserId);
      if (matched) {
        setUser(matched);
        const org = store.getOrganizationByOwnerId(matched.id);
        setOrganization(org || null);
        return;
      }
    }
    // Default: initial demo session defaults to Donor for immediate exploration if not set
    quickLogin('DONOR');
  };

  useEffect(() => {
    loadSession();
    const unsub = store.subscribe(() => {
      if (user) {
        const updatedOrg = store.getOrganizationByOwnerId(user.id);
        setOrganization(updatedOrg || null);
      }
    });
    return unsub;
  }, []);

  const login = async (email: string, _password?: string): Promise<boolean> => {
    const profiles = store.getProfiles();
    const matched = profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      setUser(matched);
      localStorage.setItem(AUTH_USER_KEY, matched.id);
      const org = store.getOrganizationByOwnerId(matched.id);
      setOrganization(org || null);
      return true;
    }
    return false;
  };

  const quickLogin = (targetRole: UserRole) => {
    const profiles = store.getProfiles();
    let targetEmail = 'demo.donor@foodbridge.test';
    if (targetRole === 'RECIPIENT') targetEmail = 'demo.ngo@foodbridge.test';
    if (targetRole === 'ADMIN') targetEmail = 'demo.admin@foodbridge.test';

    const matched = profiles.find((p) => p.email.toLowerCase() === targetEmail.toLowerCase()) || profiles.find((p) => p.role === targetRole);
    if (matched) {
      setUser(matched);
      localStorage.setItem(AUTH_USER_KEY, matched.id);
      const org = store.getOrganizationByOwnerId(matched.id);
      setOrganization(org || null);
    }
  };

  const logout = () => {
    setUser(null);
    setOrganization(null);
    localStorage.removeItem(AUTH_USER_KEY);
  };

  const register = async (data: {
    fullName: string;
    email: string;
    password?: string;
    role: UserRole;
    organizationName: string;
    organizationType: OrganizationType;
    city: string;
    serviceArea: string;
    demoAddress: string;
    phone: string;
    description: string;
  }): Promise<boolean> => {
    // Prevent standard registration from assigning ADMIN
    const finalRole: UserRole = data.role === 'ADMIN' ? 'RECIPIENT' : data.role;

    const newUserId = 'usr_' + Math.random().toString(36).substring(2, 9);
    const newOrgId = 'org_' + Math.random().toString(36).substring(2, 9);
    const nowIso = new Date().toISOString();

    const newProfile: Profile = {
      id: newUserId,
      fullName: data.fullName,
      email: data.email,
      role: finalRole,
      phone: data.phone,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const newOrg: Organization = {
      id: newOrgId,
      ownerId: newUserId,
      organizationName: data.organizationName,
      organizationType: data.organizationType,
      description: data.description,
      city: data.city || 'Hyderabad',
      serviceArea: data.serviceArea || 'Central Hyderabad',
      demoAddress: data.demoAddress || 'Hyderabad, Telangana',
      verificationStatus: 'PENDING',
      contactPerson: data.fullName,
      phone: data.phone,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const existingProfiles = store.getProfiles();
    existingProfiles.push(newProfile);
    const existingOrgs = store.getOrganizations();
    existingOrgs.push(newOrg);

    // Save to localStorage
    localStorage.setItem('foodbridge_profiles', JSON.stringify(existingProfiles));
    localStorage.setItem('foodbridge_organizations', JSON.stringify(existingOrgs));

    setUser(newProfile);
    setOrganization(newOrg);
    localStorage.setItem(AUTH_USER_KEY, newUserId);

    return true;
  };

  const refreshProfile = () => {
    if (user) {
      const org = store.getOrganizationByOwnerId(user.id);
      setOrganization(org || null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        role: user ? user.role : null,
        isAuthenticated: !!user,
        login,
        quickLogin,
        logout,
        register,
        refreshProfile,
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
