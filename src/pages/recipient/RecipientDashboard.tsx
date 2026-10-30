import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Inbox,
  CheckCircle2,
  Package,
  Clock,
  ArrowRight,
  Sparkles,
  MapPin,
  TrendingUp,
  AlertTriangle
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

const RECIPIENT_CHART_DATA = [
  { day: 'Mon', portions: 30 },
  { day: 'Tue', portions: 65 },
  { day: 'Wed', portions: 50 },
  { day: 'Thu', portions: 75 },
  { day: 'Fri', portions: 110 },
  { day: 'Sat', portions: 135 },
  { day: 'Sun', portions: 80 },
];

export const RecipientDashboard: React.FC = () => {
  const { organization, user } = useAuth();
  const navigate = useNavigate();

  const allAvailableListings = store
    .getListings()
    .filter((l) => l.status === 'AVAILABLE' && l.quantityAvailable > 0);

  const myRequests = store
    .getRequests()
    .filter((r) => r.recipientOrganizationId === organization?.id);

  const pendingRequests = myRequests.filter((r) => r.status === 'PENDING');
  const acceptedRequests = myRequests.filter((r) => r.status === 'ACCEPTED' || r.status === 'READY_FOR_PICKUP');
  const completedPickups = myRequests.filter((r) => r.status === 'COMPLETED');

  const totalPortionsReceived =
    completedPickups.reduce((sum, r) => sum + r.requestedQuantity, 0) + 145; // baseline demo offset

  // Top recommended listings scored by transparent matching engine
  const recommendedListings = allAvailableListings
    .map((l) => ({
      listing: l,
      match: store.calculateMatch(l, organization || undefined),
    }))
    .sort((a, b) => b.match.score - a.match.score)
    .slice(0, 3);

  return (
    <DashboardLayout
      title="Recipient Operations Overview"
      subtitle={`Welcome, ${user?.fullName} · ${organization?.organizationName}`}
      requiredRole="RECIPIENT"
      actions={
        <Link
          to="/recipient/available"
          className="px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900 transition-colors flex items-center gap-2 shadow-xs"
        >
          <Search className="w-4 h-4" />
          <span>Find Available Food</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Verification Status Banner */}
        {organization?.verificationStatus === 'PENDING' && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Shelter Verification Pending:</strong> Your organization documents are being verified by administrators. Demonstration access is active so you can browse, request, and simulate collections immediately.
            </div>
          </div>
        )}

        {/* 5 Summary KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
            <span className="text-[11px] text-stone-500 font-medium">Available Surplus</span>
            <div className="text-2xl font-bold text-stone-900 tabular-nums mt-1">
              {allAvailableListings.length}
            </div>
            <span className="text-[10px] text-stone-600">Listings ready for rescue</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
            <span className="text-[11px] text-stone-500 font-medium">Pending Requests</span>
            <div className="text-2xl font-bold text-amber-800 tabular-nums mt-1">
              {pendingRequests.length}
            </div>
            <span className="text-[10px] text-stone-600">Awaiting donor acceptance</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
            <span className="text-[11px] text-stone-500 font-medium">Accepted Pickups</span>
            <div className="text-2xl font-bold text-blue-800 tabular-nums mt-1">
              {acceptedRequests.length}
            </div>
            <span className="text-[10px] text-stone-600">Ready or reserved for you</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
            <span className="text-[11px] text-stone-500 font-medium">Completed Pickups</span>
            <div className="text-2xl font-bold text-emerald-800 tabular-nums mt-1">
              {completedPickups.length}
            </div>
            <span className="text-[10px] text-stone-600">Successfully distributed</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs col-span-2 sm:col-span-1">
            <span className="text-[11px] text-stone-500 font-medium">Portions Received</span>
            <div className="text-2xl font-bold text-emerald-900 tabular-nums mt-1">
              {totalPortionsReceived}
            </div>
            <span className="text-[10px] text-stone-600">Community meals served</span>
          </div>
        </div>

        {/* Smart Recommended Matches Section */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Smart Donation Matching Algorithm</span>
              </div>
              <h3 className="text-base font-bold text-stone-900 mt-0.5">
                Recommended For {organization?.organizationName}
              </h3>
              <p className="text-xs text-stone-500">
                Transparent deterministic scoring based on transit corridor, dietary compatibility, and capacity fit
              </p>
            </div>
            <Link
              to="/recipient/available"
              className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-1"
            >
              <span>Explore All ({allAvailableListings.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recommendedListings.map(({ listing, match }) => (
              <div
                key={listing.id}
                className="rounded-xl border border-stone-200 p-4 bg-stone-50/50 flex flex-col justify-between hover:border-emerald-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                      Match: {match.score}%
                    </span>
                    <CountdownBadge deadline={listing.pickupDeadline} compact />
                  </div>

                  <h4 className="font-bold text-stone-900 text-sm line-clamp-1">{listing.title}</h4>
                  <div className="text-xs text-stone-500 mt-0.5">
                    {listing.donorName} · {listing.pickupArea}
                  </div>

                  {/* Match reasons */}
                  <div className="mt-3 space-y-1 text-[11px] text-stone-600">
                    {match.reasons.slice(0, 2).map((r, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-700 font-bold shrink-0">✓</span>
                        <span className="line-clamp-1">{r}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-600 block">Available</span>
                    <span className="text-xs font-bold text-stone-800 tabular-nums">
                      {listing.quantityAvailable} {listing.quantityUnit}
                    </span>
                  </div>
                  <Link
                    to={`/recipient/available/${listing.id}`}
                    className="px-3 py-1.5 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900 transition-colors"
                  >
                    Request Food
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Upcoming Pickups & Chart Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Active Pickups requiring driver coordination */}
          <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-stone-900">
                  Active Pickups in Progress ({acceptedRequests.length})
                </h3>
                <p className="text-xs text-stone-500">Coordinate vehicle arrival and confirm collection</p>
              </div>
              <Link to="/recipient/requests" className="text-xs font-semibold text-emerald-800 hover:underline">
                View All
              </Link>
            </div>

            {acceptedRequests.length === 0 ? (
              <div className="py-12 text-center text-stone-400">
                <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs text-stone-600">No pickups currently accepted or staged.</p>
                <Link
                  to="/recipient/available"
                  className="mt-3 inline-block text-xs font-semibold text-emerald-800 hover:underline"
                >
                  Browse available listings →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {acceptedRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-sm">{req.listingTitle}</span>
                        <StatusBadge status={req.status} />
                      </div>
                      <div className="text-stone-600">
                        From: <strong>{req.donorName}</strong> · Pickup Address: {req.pickupAddress}
                      </div>
                      <div className="text-stone-700 font-medium">
                        Reserved Quantity:{' '}
                        <span className="text-emerald-800 tabular-nums">
                          {req.requestedQuantity} {req.quantityUnit}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                      <CountdownBadge deadline={req.pickupDeadline} compact />
                      <Link
                        to="/recipient/requests"
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs transition-colors"
                      >
                        Confirm Collection
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weekly Distribution Chart */}
          <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-stone-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-stone-900">Meals Distributed</h3>
                <span className="text-xs text-stone-500 font-mono">Past 7 Days</span>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={RECIPIENT_CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    <Bar dataKey="portions" fill="#15803D" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 text-xs text-stone-500 flex items-center justify-between">
              <span>Hyderabad Community Food Bank</span>
              <span className="text-emerald-800 font-semibold">Active Pipeline</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
