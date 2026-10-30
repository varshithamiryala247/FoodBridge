import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed,
  Inbox,
  CheckCircle2,
  Package,
  PlusCircle,
  ArrowRight,
  Clock,
  AlertTriangle,
  Building2,
  Calendar,
  Sparkles
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
import { CountdownBadge } from '../../components/CountdownBadge';
import { StatusBadge } from '../../components/StatusBadge';

const CHART_DATA = [
  { day: 'Mon', portions: 45 },
  { day: 'Tue', portions: 70 },
  { day: 'Wed', portions: 35 },
  { day: 'Thu', portions: 90 },
  { day: 'Fri', portions: 120 },
  { day: 'Sat', portions: 140 },
  { day: 'Sun', portions: 95 },
];

export const DonorDashboard: React.FC = () => {
  const { organization, user } = useAuth();
  const navigate = useNavigate();

  const allListings = store.getListings().filter((l) => l.donorOrganizationId === organization?.id);
  const activeListings = allListings.filter((l) => l.status === 'AVAILABLE' || l.status === 'RESERVED');
  const allRequests = store.getRequests().filter((r) => r.donorOrganizationId === organization?.id);
  const pendingRequests = allRequests.filter((r) => r.status === 'PENDING');
  const completedDonations = allRequests.filter((r) => r.status === 'COMPLETED');
  const recentEvents = store.getEvents().slice(0, 5);

  const totalPortionsDonated = completedDonations.reduce((sum, r) => sum + r.requestedQuantity, 0) + 120; // baseline demo offset

  return (
    <DashboardLayout
      title="Donor Operations Overview"
      subtitle={`Welcome back, ${user?.fullName} · ${organization?.organizationName}`}
      requiredRole="DONOR"
      actions={
        <Link
          to="/donor/listings/new"
          className="px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900 transition-colors flex items-center gap-2 shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Surplus Listing</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Verification Status Warning if pending */}
        {organization?.verificationStatus === 'PENDING' && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Organization Verification Under Review:</strong> Platform administrators are reviewing your FSSAI license documentation. You can still create and manage listings in demonstration mode.
            </div>
          </div>
        )}

        {/* 4 KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between text-stone-600 mb-2">
              <span className="text-xs font-medium">Active Food Listings</span>
              <UtensilsCrossed className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-2xl font-bold text-stone-900 tabular-nums">
              {activeListings.length}
            </div>
            <div className="text-[11px] text-stone-600 mt-1">Available for NGO requests</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between text-stone-600 mb-2">
              <span className="text-xs font-medium">Pending NGO Requests</span>
              <Inbox className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-900 tabular-nums">
              {pendingRequests.length}
            </div>
            <div className="text-[11px] text-stone-600 mt-1">Requires your acceptance</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between text-stone-600 mb-2">
              <span className="text-xs font-medium">Completed Donations</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-2xl font-bold text-stone-900 tabular-nums">
              {completedDonations.length}
            </div>
            <div className="text-[11px] text-stone-600 mt-1">Successfully collected</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between text-stone-600 mb-2">
              <span className="text-xs font-medium">Total Portions Rescued</span>
              <Package className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-2xl font-bold text-emerald-900 tabular-nums">
              {totalPortionsDonated}
            </div>
            <div className="text-[11px] text-stone-600 mt-1">Meals served to community</div>
          </div>
        </div>

        {/* Charts & Urgent Incoming Requests Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart View */}
          <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-stone-900">Weekly Meal Rescue Trend</h3>
                <p className="text-xs text-stone-500">Portions distributed over the past 7 days</p>
              </div>
              <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-1 rounded">
                +18% vs last week
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  <Bar dataKey="portions" fill="#166534" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pending Requests Requiring Donor Action */}
          <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-stone-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-stone-900">Incoming Requests ({pendingRequests.length})</h3>
                <Link to="/donor/requests" className="text-xs font-semibold text-emerald-800 hover:underline">
                  Manage All
                </Link>
              </div>

              {pendingRequests.length === 0 ? (
                <div className="py-12 text-center text-stone-400">
                  <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-stone-600">No pending requests right now.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.slice(0, 3).map((req) => (
                    <div
                      key={req.id}
                      className="p-3.5 rounded-lg border border-stone-200 bg-stone-50/50 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900">{req.recipientName}</span>
                        <span className="font-semibold text-emerald-800 tabular-nums">
                          {req.requestedQuantity} {req.quantityUnit}
                        </span>
                      </div>
                      <p className="text-stone-600 line-clamp-1">{req.listingTitle}</p>
                      {req.recipientNotes && (
                        <p className="text-stone-500 italic line-clamp-1">"{req.recipientNotes}"</p>
                      )}
                      <div className="pt-2 flex items-center justify-between border-t border-stone-200/60">
                        <CountdownBadge deadline={req.pickupDeadline} compact />
                        <Link
                          to="/donor/requests"
                          className="px-2.5 py-1 text-[11px] font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded"
                        >
                          Review & Accept
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <span>Atomic double-booking prevention active</span>
              <span className="text-emerald-700 font-medium">Safe Handover</span>
            </div>
          </div>
        </div>

        {/* Latest Listings Table */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-stone-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Your Recent Surplus Listings</h3>
              <p className="text-xs text-stone-500">Monitor quantities, status transitions, and pickup windows</p>
            </div>
            <Link
              to="/donor/listings"
              className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-1"
            >
              <span>View all ({allListings.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-700 uppercase tracking-wider text-[10px] font-semibold border-b border-stone-200">
                <tr>
                  <th className="px-5 py-3">Food Listing</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3 text-right">Available / Total</th>
                  <th className="px-5 py-3">Pickup Deadline</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {allListings.slice(0, 5).map((listing) => (
                  <tr key={listing.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-stone-900">
                      <Link to={`/donor/listings/${listing.id}`} className="hover:underline">
                        {listing.title}
                      </Link>
                      <span className="block text-[11px] text-stone-600">{listing.pickupArea}</span>
                    </td>
                    <td className="px-5 py-3.5 text-stone-600">
                      {listing.category.replace('_', ' ')} · {listing.dietaryType}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums font-semibold text-stone-800">
                      <span className="text-emerald-800 font-bold">{listing.quantityAvailable}</span> / {listing.quantityTotal} {listing.quantityUnit}
                    </td>
                    <td className="px-5 py-3.5">
                      <CountdownBadge deadline={listing.pickupDeadline} status={listing.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={listing.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        to={`/donor/listings/${listing.id}`}
                        className="text-emerald-800 hover:text-emerald-950 font-semibold"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Platform Activity Timeline */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <h3 className="text-sm font-bold text-stone-900 mb-3">Recent Platform Audit Log</h3>
          <div className="space-y-3">
            {recentEvents.map((evt) => (
              <div key={evt.id} className="flex items-start gap-3 text-xs text-stone-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 mt-1.5 shrink-0"></span>
                <div className="flex-1">
                  <span className="font-semibold text-stone-800">{evt.actorName}:</span>{' '}
                  {evt.description}
                </div>
                <span className="text-[10px] text-stone-600 shrink-0 font-mono">
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
