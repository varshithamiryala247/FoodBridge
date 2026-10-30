import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox,
  CheckCircle2,
  XCircle,
  PackageCheck,
  Clock,
  AlertTriangle,
  Scale
} from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { store } from '../../services/store';
import { StatusBadge } from '../../components/StatusBadge';
import { CountdownBadge } from '../../components/CountdownBadge';

export const DonorRequestsPage: React.FC = () => {
  const { organization, user } = useAuth();
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'READY_FOR_PICKUP'>('ALL');
  const [, setTick] = useState(0);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const allRequests = store
    .getRequests()
    .filter((r) => r.donorOrganizationId === organization?.id);

  const filtered = allRequests.filter((r) => {
    if (filter === 'ALL') return true;
    return r.status === filter;
  });

  const handleAccept = (requestId: string) => {
    if (!user) return;
    try {
      const res = store.acceptRequest(requestId, user);
      setActionSuccess(
        `Successfully accepted request! ${res.request.requestedQuantity} ${res.request.quantityUnit} reserved atomically. Remaining available: ${res.listing.quantityAvailable} ${res.request.quantityUnit}.`
      );
      setTick((t) => t + 1);
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err: any) {
      alert(`Could not accept request: ${err.message}`);
    }
  };

  const handleMarkReady = (requestId: string) => {
    if (!user) return;
    try {
      store.markReadyForPickup(requestId, user);
      setActionSuccess('Marked food ready for pickup at dispatch bay.');
      setTick((t) => t + 1);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReject = (requestId: string) => {
    if (!user) return;
    const reason = window.prompt('Reason for declining this request (e.g. storage window expired or vehicle conflict):') || undefined;
    try {
      store.rejectRequest(requestId, user, reason);
      setActionSuccess('Request rejected.');
      setTick((t) => t + 1);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <DashboardLayout
      title="Incoming NGO Requests"
      subtitle="Accept requests, atomically reserve inventory, and prepare orders for pickup handover"
      requiredRole="DONOR"
    >
      <div className="space-y-6">
        {/* Double-Booking Guarantee Notice */}
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3">
          <Scale className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Double-Booking Prevention Active:</strong> Pending requests do not reduce available food until you click <strong>Accept</strong>. When accepted, portions are reserved atomically. If available quantity reaches zero, further requests are blocked.
          </div>
        </div>

        {actionSuccess && (
          <div className="p-4 rounded-xl bg-stone-900 text-white text-xs flex items-center gap-2 border border-stone-800 shadow-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === 'ALL'
                ? 'bg-emerald-800 text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            All Requests ({allRequests.length})
          </button>
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === 'PENDING'
                ? 'bg-amber-600 text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Pending Review ({allRequests.filter((r) => r.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setFilter('ACCEPTED')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === 'ACCEPTED'
                ? 'bg-blue-600 text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Accepted ({allRequests.filter((r) => r.status === 'ACCEPTED').length})
          </button>
          <button
            onClick={() => setFilter('READY_FOR_PICKUP')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === 'READY_FOR_PICKUP'
                ? 'bg-indigo-600 text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Ready for Pickup ({allRequests.filter((r) => r.status === 'READY_FOR_PICKUP').length})
          </button>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-stone-200 text-center">
              <Inbox className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-stone-700">No requests in this category</p>
            </div>
          ) : (
            filtered.map((req) => {
              const listing = store.getListingById(req.listingId);
              return (
                <div
                  key={req.id}
                  className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 text-base">{req.recipientName}</span>
                      <StatusBadge status={req.status} />
                      <span className="text-xs text-stone-600 font-mono">ID: {req.id}</span>
                    </div>

                    <div className="text-xs text-stone-700">
                      Surplus Meal:{' '}
                      <Link
                        to={`/donor/listings/${req.listingId}`}
                        className="font-bold text-emerald-800 hover:underline"
                      >
                        {req.listingTitle}
                      </Link>{' '}
                      · Claiming:{' '}
                      <strong className="text-stone-900 tabular-nums">
                        {req.requestedQuantity} {req.quantityUnit}
                      </strong>{' '}
                      {listing && (
                        <span className="text-stone-600">
                          (Current available on batch: {listing.quantityAvailable} {listing.quantityUnit})
                        </span>
                      )}
                    </div>

                    {req.recipientNotes && (
                      <div className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                        <span className="font-medium text-stone-700">Recipient Notes:</span> {req.recipientNotes}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600 pt-1">
                      <span>Contact: {req.recipientContact || 'NGO Dispatch'}</span>
                      <span>·</span>
                      <CountdownBadge deadline={req.pickupDeadline} status={req.status} compact />
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
                    {req.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleAccept(req.id)}
                          className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs transition-colors"
                        >
                          Accept & Reserve
                        </button>
                        <button
                          onClick={() => handleReject(req.id)}
                          className="w-full sm:w-auto px-3.5 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {req.status === 'ACCEPTED' && (
                      <button
                        onClick={() => handleMarkReady(req.id)}
                        className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <PackageCheck className="w-4 h-4" />
                        <span>Mark Ready for Pickup</span>
                      </button>
                    )}

                    {req.status === 'READY_FOR_PICKUP' && (
                      <div className="text-right">
                        <span className="inline-block text-xs font-medium text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200">
                          Staged for Collection
                        </span>
                        <span className="block text-[10px] text-stone-600 mt-1">
                          Awaiting recipient handover confirmation
                        </span>
                      </div>
                    )}

                    {req.status === 'COMPLETED' && (
                      <div className="text-right text-xs text-emerald-800 font-medium">
                        Completed at {new Date(req.completedAt || '').toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
