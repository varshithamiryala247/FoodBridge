import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  Users,
  Flag,
  Activity,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Check,
  Filter
} from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { store } from '../../services/store';
import { StatusBadge } from '../../components/StatusBadge';
import { CountdownBadge } from '../../components/CountdownBadge';
import { FoodListing, ListingReport, Organization } from '../../types';

export const AdminListingsPage: React.FC = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [, setTick] = useState(0);

  const listings = store.getListings();

  const filtered = listings.filter((l) => {
    const matchesSearch =
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.donorName.toLowerCase().includes(search.toLowerCase()) ||
      l.pickupArea.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRemove = (listing: FoodListing) => {
    if (!user) return;
    const reason = window.prompt(
      `Moderation action: Specify reason for removing "${listing.title}" from FoodBridge:`,
      'Inaccurate quantity declaration or non-compliance with hygiene standard'
    );
    if (!reason) return;

    store.removeListing(listing.id, user, reason);
    setTick((t) => t + 1);
  };

  return (
    <DashboardLayout
      title="Platform Food Listings Moderation"
      subtitle="Inspect active surplus inventory, enforce food safety compliance, and remove non-compliant batches"
      requiredRole="ADMIN"
    >
      <div className="space-y-6">
        {/* Controls */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, donor, area..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="RESERVED">Reserved</option>
              <option value="COMPLETED">Completed</option>
              <option value="EXPIRED">Expired</option>
              <option value="REMOVED">Removed</option>
            </select>
          </div>
        </div>

        {/* Listings Table */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-700 uppercase tracking-wider text-[10px] font-semibold border-b border-stone-200">
                <tr>
                  <th className="px-5 py-3">Listing Title & Donor</th>
                  <th className="px-5 py-3">Category & Diet</th>
                  <th className="px-5 py-3 text-right">Available / Total</th>
                  <th className="px-5 py-3">Pickup Window</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((l) => (
                  <tr key={l.id} className="hover:bg-stone-50/70">
                    <td className="px-5 py-3.5 font-bold text-stone-900">
                      {l.title}
                      <span className="block text-[11px] text-stone-500 font-normal">
                        {l.donorName} · {l.pickupArea}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-stone-600">
                      {l.category.replace('_', ' ')} · {l.dietaryType}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums font-bold">
                      <span className="text-emerald-800">{l.quantityAvailable}</span> / {l.quantityTotal} {l.quantityUnit}
                    </td>
                    <td className="px-5 py-3.5">
                      <CountdownBadge deadline={l.pickupDeadline} status={l.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={l.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {l.status !== 'REMOVED' ? (
                        <button
                          onClick={() => handleRemove(l)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded transition-colors"
                        >
                          Remove from Feed
                        </button>
                      ) : (
                        <span className="text-[11px] text-stone-400 italic">Removed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export const AdminOrganizationsPage: React.FC = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING'>('ALL');
  const [, setTick] = useState(0);

  const orgs = store.getOrganizations();
  const filtered = orgs.filter((o) => {
    if (filter === 'ALL') return true;
    return o.verificationStatus === filter;
  });

  const handleVerify = (org: Organization, status: 'APPROVED' | 'REJECTED') => {
    if (!user) return;
    const notes = window.prompt(
      `Enter verification audit notes for ${org.organizationName}:`,
      status === 'APPROVED' ? 'FSSAI License / NGO Darpan ID documentation checked and compliant.' : 'Documentation insufficient or license expired.'
    );
    if (!notes) return;

    store.verifyOrganization(org.id, user, status, notes);
    setTick((t) => t + 1);
  };

  return (
    <DashboardLayout
      title="Organization Verification & Compliance"
      subtitle="Audit commercial food donors and recipient charities against city regulatory registrations"
      requiredRole="ADMIN"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === 'ALL' ? 'bg-emerald-800 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            All Organizations ({orgs.length})
          </button>
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === 'PENDING' ? 'bg-amber-600 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Pending Verification ({orgs.filter((o) => o.verificationStatus === 'PENDING').length})
          </button>
          <button
            onClick={() => setFilter('VERIFIED')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === 'VERIFIED' ? 'bg-emerald-700 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Verified ({orgs.filter((o) => o.verificationStatus === 'VERIFIED').length})
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((org) => (
            <div key={org.id} className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">{org.organizationName}</h3>
                  <div className="text-xs text-stone-500">
                    {org.organizationType.replace('_', ' ')} · {org.city} ({org.serviceArea})
                  </div>
                </div>
                <StatusBadge status={org.verificationStatus} />
              </div>

              <p className="text-xs text-stone-600 leading-relaxed line-clamp-2">
                {org.description}
              </p>

              <div className="text-[11px] text-stone-500 space-y-0.5 border-t border-stone-100 pt-2">
                <div>Address: {org.demoAddress}</div>
                <div>Contact: {org.contactPerson || 'Office'} · {org.phone || 'Phone not listed'}</div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
                {org.verificationStatus === 'PENDING' ? (
                  <>
                    <button
                      onClick={() => handleVerify(org, 'APPROVED')}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs"
                    >
                      Approve Verification
                    </button>
                    <button
                      onClick={() => handleVerify(org, 'REJECTED')}
                      className="px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg"
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Audit Status Verified</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export const AdminReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'RESOLVED'>('ALL');
  const [, setTick] = useState(0);

  const reports = store.getReports();
  const filtered = reports.filter((r) => {
    if (filter === 'ALL') return true;
    if (filter === 'OPEN') return r.status === 'OPEN' || r.status === 'UNDER_REVIEW';
    if (filter === 'RESOLVED') return r.status === 'RESOLVED';
    return true;
  });

  const handleResolve = (report: ListingReport) => {
    if (!user) return;
    const notes = window.prompt(
      `Enter admin resolution notes for report on "${report.listingTitle}":`,
      'Investigated with donor; packaging details adjusted and food verified compliant.'
    );
    if (!notes) return;

    store.resolveReport(report.id, user, 'RESOLVED', notes);
    setTick((t) => t + 1);
  };

  const handleUnderReview = (report: ListingReport) => {
    if (!user) return;
    store.resolveReport(report.id, user, 'UNDER_REVIEW', 'Assigned to field inspector for direct donor inquiry.');
    setTick((t) => t + 1);
  };

  return (
    <DashboardLayout
      title="Listing Reports & Safety Flag Moderation"
      subtitle="Audit reported listings, investigate food freshness concerns, and enforce safety standards"
      requiredRole="ADMIN"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === 'ALL' ? 'bg-emerald-800 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            All Reports ({reports.length})
          </button>
          <button
            onClick={() => setFilter('OPEN')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === 'OPEN' ? 'bg-rose-700 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Open / Under Review ({reports.filter((r) => r.status !== 'RESOLVED').length})
          </button>
          <button
            onClick={() => setFilter('RESOLVED')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === 'RESOLVED' ? 'bg-emerald-700 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Resolved ({reports.filter((r) => r.status === 'RESOLVED').length})
          </button>
        </div>

        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-stone-200 text-center text-xs text-stone-500">
              No reports in this category.
            </div>
          ) : (
            filtered.map((rep) => (
              <div key={rep.id} className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 text-sm">{rep.reason}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      rep.status === 'OPEN'
                        ? 'bg-rose-100 text-rose-900'
                        : rep.status === 'UNDER_REVIEW'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-emerald-100 text-emerald-900'
                    }`}>
                      {rep.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-400 font-mono">
                    {new Date(rep.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="text-xs text-stone-700">
                  Listing:{' '}
                  <strong className="text-stone-900">{rep.listingTitle}</strong> · Reported by:{' '}
                  <span className="text-stone-600">{rep.reporterName}</span>
                </div>

                <div className="p-3 bg-stone-50 rounded-lg border border-stone-100 text-xs text-stone-700 italic">
                  "{rep.description}"
                </div>

                {rep.resolutionNotes && (
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-950 space-y-1">
                    <div className="font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Resolution Recorded by {rep.reviewedBy}:</span>
                    </div>
                    <p>{rep.resolutionNotes}</p>
                  </div>
                )}

                {rep.status !== 'RESOLVED' && (
                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
                    {rep.status === 'OPEN' && (
                      <button
                        onClick={() => handleUnderReview(rep)}
                        className="px-3 py-1.5 text-xs font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg"
                      >
                        Mark Under Review
                      </button>
                    )}
                    <button
                      onClick={() => handleResolve(rep)}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs"
                    >
                      Resolve & Record Notes
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export const AdminActivityPage: React.FC = () => {
  const events = store.getEvents(undefined, 100);

  return (
    <DashboardLayout
      title="Platform Activity & Audit Ledger"
      subtitle="Immutable chronological ledger of listings, requests, reservations, cancellations, and moderations"
      requiredRole="ADMIN"
    >
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-stone-900">Audit Trail Events ({events.length})</h3>
            <p className="text-xs text-stone-500">Structured audit records supporting compliance and food traceability</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-700 uppercase tracking-wider text-[10px] font-semibold border-b border-stone-200">
              <tr>
                <th className="px-5 py-3">Event Type</th>
                <th className="px-5 py-3">Actor / Entity</th>
                <th className="px-5 py-3">Description</th>
                <th className="px-5 py-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {events.map((evt) => (
                <tr key={evt.id} className="hover:bg-stone-50/70">
                  <td className="px-5 py-3 font-mono font-bold text-emerald-900">
                    <span className="bg-stone-100 px-2 py-0.5 rounded text-[10px]">
                      {evt.eventType}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-semibold text-stone-900">
                    {evt.actorName}
                  </td>
                  <td className="px-5 py-3 text-stone-700 leading-relaxed">
                    {evt.description}
                  </td>
                  <td className="px-5 py-3 text-right text-stone-600 font-mono text-[11px] whitespace-nowrap">
                    {new Date(evt.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};
