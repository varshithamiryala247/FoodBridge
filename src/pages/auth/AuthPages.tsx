import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HeartHandshake,
  ShieldCheck,
  Building,
  Soup,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PublicHeader, PublicFooter } from '../../components/PublicLayout';
import { OrganizationType, UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError('Please provide an email address.');
      return;
    }
    const ok = await login(email, password);
    if (ok) {
      navigate('/');
    } else {
      setError('No registered profile matches this email. You can register or use Judge Quick-Login below.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF7] flex flex-col">
      <PublicHeader />
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl border border-stone-200 p-8 shadow-xs">
          <div className="text-center mb-6">
            <div className="w-10 h-10 bg-emerald-800 text-amber-300 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-xs">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Sign In to FoodBridge</h1>
            <p className="text-xs text-stone-600 mt-1">
              Access your donation management or food rescue dashboard.
            </p>
          </div>

          {/* Quick Demo Login Box for Hackathon Judges */}
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                Judge Quick Login
              </span>
              <span className="text-[10px] text-emerald-800 font-medium">1-Click Access</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  quickLogin('DONOR');
                  navigate('/donor/dashboard');
                }}
                className="py-2 px-2 text-xs font-semibold text-emerald-900 bg-white border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors text-center"
              >
                Donor
                <span className="block text-[10px] font-normal text-emerald-700">Green Plate</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  quickLogin('RECIPIENT');
                  navigate('/recipient/dashboard');
                }}
                className="py-2 px-2 text-xs font-semibold text-emerald-900 bg-white border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors text-center"
              >
                Recipient
                <span className="block text-[10px] font-normal text-emerald-700">Hope Kitchen</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  quickLogin('ADMIN');
                  navigate('/admin/dashboard');
                }}
                className="py-2 px-2 text-xs font-semibold text-emerald-900 bg-white border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors text-center"
              >
                Admin
                <span className="block text-[10px] font-normal text-emerald-700">Dr. Suresh</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. demo.donor@foodbridge.test"
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-stone-700">
                  Password
                </label>
                <span className="text-[11px] text-stone-400">Demo password optional</span>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900 transition-colors shadow-xs"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-stone-100 text-center text-xs text-stone-600">
            Don't have an organization account?{' '}
            <Link to="/register" className="font-semibold text-emerald-800 hover:underline">
              Register now
            </Link>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
};

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<UserRole>('DONOR');
  const [fullName, setFullName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [organizationType, setOrganizationType] = useState<OrganizationType>('RESTAURANT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('Hyderabad');
  const [serviceArea, setServiceArea] = useState('Jubilee Hills');
  const [demoAddress, setDemoAddress] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'DONOR') {
      setOrganizationType('RESTAURANT');
    } else {
      setOrganizationType('NGO');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName || !organizationName || !email || !description) {
      setError('Please fill in all required fields (Name, Org Name, Email, Description).');
      return;
    }

    try {
      await register({
        fullName,
        organizationName,
        role,
        organizationType,
        email,
        password,
        city,
        serviceArea,
        demoAddress: demoAddress || `${serviceArea}, ${city}, Telangana`,
        phone,
        description,
      });

      if (role === 'DONOR') {
        navigate('/donor/dashboard');
      } else {
        navigate('/recipient/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF7] flex flex-col">
      <PublicHeader />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-12">
        <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-xs">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Create FoodBridge Account</h1>
            <p className="text-xs text-stone-600 mt-1">
              Join the Hyderabad surplus rescue network as a donor or community recipient.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Role Selector Tabs */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-stone-700 mb-2">
              Select Your Organization Purpose *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleChange('DONOR')}
                className={`p-4 rounded-xl border text-left transition-colors flex items-start gap-3 ${
                  role === 'DONOR'
                    ? 'border-emerald-800 bg-emerald-50/50 ring-1 ring-emerald-800'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <div className={`p-2 rounded-lg ${role === 'DONOR' ? 'bg-emerald-800 text-white' : 'bg-stone-100 text-stone-600'}`}>
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-stone-900">Food Donor</span>
                  <span className="text-[11px] text-stone-500">Restaurant, Bakery, Hotel, Caterer, Grocery</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('RECIPIENT')}
                className={`p-4 rounded-xl border text-left transition-colors flex items-start gap-3 ${
                  role === 'RECIPIENT'
                    ? 'border-emerald-800 bg-emerald-50/50 ring-1 ring-emerald-800'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <div className={`p-2 rounded-lg ${role === 'RECIPIENT' ? 'bg-emerald-800 text-white' : 'bg-stone-100 text-stone-600'}`}>
                  <Soup className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-stone-900">Recipient Org</span>
                  <span className="text-[11px] text-stone-500">NGO, Shelter, Charity, Community Kitchen</span>
                </div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Contact Person Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Varma"
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Work Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. ramesh@restaurant.com"
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Organization / Entity Name *
                </label>
                <input
                  type="text"
                  required
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="e.g. Deccan Spice Kitchen"
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Organization Category *
                </label>
                <select
                  value={organizationType}
                  onChange={(e) => setOrganizationType(e.target.value as OrganizationType)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                >
                  {role === 'DONOR' ? (
                    <>
                      <option value="RESTAURANT">Restaurant</option>
                      <option value="HOTEL">Hotel / Hospitality</option>
                      <option value="BAKERY">Bakery & Confectionery</option>
                      <option value="CATERER">Catering Service</option>
                      <option value="GROCERY">Grocery / Supermarket</option>
                      <option value="COMMUNITY_KITCHEN">Central Kitchen</option>
                    </>
                  ) : (
                    <>
                      <option value="NGO">Non-Governmental Org (NGO)</option>
                      <option value="SHELTER">Homeless / Youth Shelter</option>
                      <option value="CHARITY">Charitable Trust</option>
                      <option value="COMMUNITY_ORG">Community Food Pantry</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Service Area / Zone
                </label>
                <input
                  type="text"
                  value={serviceArea}
                  onChange={(e) => setServiceArea(e.target.value)}
                  placeholder="e.g. Banjara Hills"
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98490 00000"
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Premises / Dispatch Address
              </label>
              <input
                type="text"
                value={demoAddress}
                onChange={(e) => setDemoAddress(e.target.value)}
                placeholder="e.g. Road No. 36, Jubilee Hills, Hyderabad"
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Organization Description & Mission *
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe your food preparation volume, vehicle capacity, or distribution goals..."
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900 transition-colors shadow-xs"
              >
                Complete Registration
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-stone-100 text-center text-xs text-stone-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-emerald-800 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
};
