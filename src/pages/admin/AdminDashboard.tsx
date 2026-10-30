import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  UtensilsCrossed,
  Flag,
  Inbox,
  CheckCircle2,
  AlertTriangle,
  Activity,
  ArrowRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { DashboardLayout } from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { store } from '../../services/store';

const ADMIN_CHART_DATA = [
  { day: 'Mon', donations: 12, portions: 240 },
  { day: 'Tue', donations: 18, portions: 380 },
  { day: 'Wed', donations: 14, portions: 290 },
  { day: 'Thu', donations: 22, portions: 490 },
  { day: 'Fri', donations: 28, portions: 610 },
  { day: 'Sat', donations: 32, portions: 780 },
  { day: 'Sun', donations: 24, portions: 520 },
];

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const organizations = store.getOrganizations();
  const donors = organizations.filter((o) =>
    ['RESTAURANT', 'HOTEL', 'BAKERY', 'CATERER', 'GROCERY', 'COMMUNITY_KITCHEN'].includes(o.organizationType)
  );
  const recipients = organizations.filter((o) =>
    ['NGO', 'SHELTER', 'CHARITY', 'COMMUNITY_ORG'].includes(o.organizationType)
  );

  const listings = store.getListings();
  const activeListings = listings.filter((l) => l.status === 'AVAILABLE' || l.status === 'RESERVED');
  const requests = store.getRequests();
  const pendingRequests = requests.filter((r) => r.status === 'PENDING');
  const completedDonations = requests.filter((r) => r.status === 'COMPLETED');
  const reports = store.getReports();
  const openReports = reports.filter((r) => r.status === 'OPEN' || r.status === 'UNDER_REVIEW');
  const events = store.getEvents().slice(0, 6);

  return (
    <DashboardLayout
      title="Platform Governance Console"
      subtitle={`Administrator: ${user?.fullName} · System Compliance & Moderation`}
      requiredRole="ADMIN"
    >
      <div className="space-y-6">
        {/* 6 Platform Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
            <span className="text-[11px] text-stone-500 font-medium">Food Donors</span>
            <div className="text-xl font-bold text-stone-900 tabular-nums mt-1">{donors.length}</div>
            <span className="text-[10px] text-stone-600">Active businesses</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
            <span className="text-[11px] text-stone-500 font-medium">Recipient NGOs</span>
            <div className="text-xl font-bold text-stone-900 tabular-nums mt-1">{recipients.length}</div>
            <span className="text-[10px] text-stone-600">Shelters & charities</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
            <span className="text-[11px] text-stone-500 font-medium">Active Listings</span>
            <div className="text-xl font-bold text-emerald-800 tabular-nums mt-1">{activeListings.length}</div>
            <span className="text-[10px] text-stone-600">Surplus in window</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
            <span className="text-[11px] text-stone-500 font-medium">Pending Claims</span>
            <div className="text-xl font-bold text-amber-800 tabular-nums mt-1">{pendingRequests.length}</div>
            <span className="text-[10px] text-stone-600">Awaiting donor sign-off</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
            <span className="text-[11px] text-stone-500 font-medium">Completed Pickups</span>
            <div className="text-xl font-bold text-stone-900 tabular-nums mt-1">{completedDonations.length}</div>
            <span className="text-[10px] text-stone-600">Verified handovers</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
            <span className="text-[11px] text-stone-500 font-medium">Open Reports</span>
            <div className="text-xl font-bold text-rose-800 tabular-nums mt-1">{openReports.length}</div>
            <span className="text-[10px] text-stone-600">Require moderation</span>
          </div>
        </div>

        {/* Platform Rescue Chart & Quick Moderation Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart */}
          <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-stone-900">City-Wide Food Rescue Activity</h3>
                <p className="text-xs text-stone-500">Portions diverted across all Hyderabad partner corridors</p>
              </div>
              <span className="text-xs font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded">
                Weekly Total: 3,310 meals
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ADMIN_CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#6B7280" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1C1917',
                      color: '#FFF',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="portions" fill="#14532D" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Open Moderation Items */}
          <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-stone-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-stone-900">Moderation Priority Queue</h3>
                <Link to="/admin/reports" className="text-xs font-semibold text-emerald-800 hover:underline">
                  View All Reports
                </Link>
              </div>

              {openReports.length === 0 ? (
                <div className="py-10 text-center text-xs text-stone-500">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  No open reports. All listings verified compliant.
                </div>
              ) : (
                <div className="space-y-3">
                  {openReports.slice(0, 3).map((rep) => (
                    <div
                      key={rep.id}
                      className="p-3.5 rounded-lg border border-stone-200 bg-rose-50/40 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900">{rep.reason}</span>
                        <span className="text-[10px] font-semibold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                          {rep.status}
                        </span>
                      </div>
                      <p className="text-stone-700 font-medium">Listing: {rep.listingTitle}</p>
                      <p className="text-stone-500 line-clamp-1 italic">"{rep.description}"</p>
                      <div className="pt-2 flex justify-end">
                        <Link
                          to="/admin/reports"
                          className="text-[11px] font-semibold text-emerald-800 hover:underline"
                        >
                          Review & Resolve →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <span>Hyderabad Central Moderator</span>
              <span className="font-mono text-emerald-800">RBAC Enforced</span>
            </div>
          </div>
        </div>

        {/* Audit Log */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Real-Time Platform Audit Events</h3>
              <p className="text-xs text-stone-500">Immutable ledger of requests, reservations, cancellations, and moderations</p>
            </div>
            <Link to="/admin/activity" className="text-xs font-semibold text-emerald-800 hover:underline">
              Full Activity Ledger
            </Link>
          </div>

          <div className="space-y-2.5">
            {events.map((evt) => (
              <div key={evt.id} className="p-2.5 rounded-lg border border-stone-100 hover:bg-stone-50/60 flex items-center justify-between text-xs gap-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>
                  <span className="font-semibold text-stone-900 shrink-0">{evt.actorName}</span>
                  <span className="text-stone-600 truncate">{evt.description}</span>
                </div>
                <span className="text-[10px] text-stone-600 font-mono shrink-0">
                  {new Date(evt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
