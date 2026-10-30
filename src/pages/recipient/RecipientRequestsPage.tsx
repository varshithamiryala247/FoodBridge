import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox,
  CheckCircle2,
  PackageCheck,
  Clock,
  MapPin,
  AlertTriangle,
  RotateCcw,
  Ban,
  Check,
  Building
} from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { store } from '../../services/store';
import { StatusBadge } from '../../components/StatusBadge';
import { CountdownBadge } from '../../components/CountdownBadge';
import { DonationRequest } from '../../types';

export const RecipientRequestsPage: React.FC = () => {
  const { organization, user } = useAuth();
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'COMPLETED'>('ALL');
  const [, setTick] = useState(0);

  // Modal State for Confirm Pickup Handover
  const [confirmingRequest, setConfirmingRequest] = useState<DonationRequest | null>(null);
  const [collectorName, setCollectorName] = useState(user?.fullName || 'Volunteer Driver');
  const [collectorNotes, setCollectorNotes] = useState('Inspected containers. Temperature verified. Packed in clean crates.');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const allRequests = store
    .getRequests()
    .filter((r) => r.recipientOrganizationId === organization?.id);

  const filtered = allRequests.filter((r) => {
    if (filter === 'ALL') return true;
    if (filter === 'ACTIVE') return r.status === 'ACCEPTED' || r.status === 'READY_FOR_PICKUP';
    if (filter === 'PENDING') return r.status === 'PENDING';
    if (filter === 'COMPLETED') return r.status === 'COMPLETED';
    return true;
  });

  const handleConfirmPickup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmingRequest || !user) return;

    try {
      store.confirmCollection(confirmingRequest.id, user, collectorName, collectorNotes);
      setSuccessNotice(`Collection confirmed for ${confirmingRequest.requestedQuantity} ${confirmingRequest.quantityUnit} of ${confirmingRequest.listingTitle}! Thank you for feeding hope.`);
      setConfirmingRequest(null);
      setTick((t) => t + 1);
      setTimeout(() => setSuccessNotice(null), 6000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCancelRequest = (requestId: string, title: string) => {
    if (!user) return;
    const reason = window.prompt('Please provide a reason for cancelling this request (e.g. transport issue):') || undefined;
    try {
      const res = store.cancelRequest(requestId, user, reason);
      setSuccessNotice(
        `Request cancelled.${res.restoredQuantity > 0 ? ` Restored ${res.restoredQuantity} portions back to available inventory.` : ''}`
      );
      setTick((t) => t + 1);
      setTimeout(() => setSuccessNotice(null), 5000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <DashboardLayout
      title="My Requests & Pickup Coordination"
      subtitle="Track donor approvals, manage collection van dispatch, and confirm completed handovers"
      requiredRole="RECIPIENT"
      actions={
        <Link
          to="/recipient/available"
          className="px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900 transition-colors shadow-xs"
        >
          Discover More Surplus
        </Link>
      }
    >
      <div className="space-y-6">
        {successNotice && (
          <div className="p-4 bg-emerald-900 text-white rounded-xl text-xs flex items-center gap-3 border border-emerald-800 shadow-md">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <strong>Action Successful:</strong> {successNotice}
            </div>
          </div>
        )}

        {/* Filter Navigation */}
        <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === 'ALL'
                ? 'bg-emerald-800 text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            All ({allRequests.length})
          </button>
          <button
            onClick={() => setFilter('ACTIVE')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === 'ACTIVE'
                ? 'bg-blue-600 text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Active Pickups ({allRequests.filter((r) => r.status === 'ACCEPTED' || r.status === 'READY_FOR_PICKUP').length})
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
            onClick={() => setFilter('COMPLETED')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === 'COMPLETED'
                ? 'bg-emerald-700 text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Completed ({allRequests.filter((r) => r.status === 'COMPLETED').length})
          </button>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-stone-200 text-center space-y-3">
              <Inbox className="w-8 h-8 text-stone-300 mx-auto" />
              <p className="text-sm font-semibold text-stone-700">No requests found</p>
              <Link
                to="/recipient/available"
                className="inline-block px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900 transition-colors"
              >
                Browse Available Food
              </Link>
            </div>
          ) : (
            filtered.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 text-base">{req.listingTitle}</span>
                    <StatusBadge status={req.status} />
                    <span className="text-[11px] text-stone-600 font-mono">#{req.id}</span>
                  </div>

                  <div className="text-xs text-stone-700 flex flex-wrap items-center gap-3">
                    <span>
                      Donor: <strong>{req.donorName}</strong>
                    </span>
                    <span>·</span>
                    <span>
                      Claimed:{' '}
                      <strong className="text-emerald-800 tabular-nums">
                        {req.requestedQuantity} {req.quantityUnit}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-start gap-1.5 text-xs text-stone-600">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 mt-0.5 shrink-0" />
                    <span>{req.pickupAddress}</span>
                  </div>

                  {req.recipientNotes && (
                    <div className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                      <span className="font-medium text-stone-700">Your Pickup Notes:</span> {req.recipientNotes}
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-1 text-xs">
                    <CountdownBadge deadline={req.pickupDeadline} status={req.status} compact />
                    <span className="text-stone-600 text-[11px]">
                      Requested at {new Date(req.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Handover & Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
                  {(req.status === 'ACCEPTED' || req.status === 'READY_FOR_PICKUP') && (
                    <>
                      <button
                        onClick={() => {
                          setConfirmingRequest(req);
                          setCollectorName(user?.fullName || 'NGO Driver');
                        }}
                        className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-amber-300" />
                        <span>Confirm Collection</span>
                      </button>

                      <button
                        onClick={() => handleCancelRequest(req.id, req.listingTitle)}
                        className="w-full sm:w-auto px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
                      >
                        Cancel Pickup
                      </button>
                    </>
                  )}

                  {req.status === 'PENDING' && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                        Awaiting Donor Acceptance
                      </span>
                      <button
                        onClick={() => handleCancelRequest(req.id, req.listingTitle)}
                        className="px-2.5 py-1.5 text-xs text-stone-500 hover:text-rose-700"
                        title="Cancel this pending request"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {req.status === 'COMPLETED' && (
                    <div className="text-right text-xs">
                      <span className="text-emerald-800 font-semibold block">Pickup Sealed</span>
                      <span className="text-[11px] text-stone-600 block">
                        Verified by {req.collectorName || 'Representative'}
                      </span>
                    </div>
                  )}

                  {req.status === 'CANCELLED' && (
                    <span className="text-xs text-stone-600 bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200">
                      Cancelled
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pickup Collection Handover Modal */}
        {confirmingRequest && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-stone-200 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <PackageCheck className="w-5 h-5 text-emerald-800" />
                  <h3 className="text-base font-bold text-stone-900">Confirm Food Collection Handover</h3>
                </div>
                <button
                  onClick={() => setConfirmingRequest(null)}
                  className="text-stone-400 hover:text-stone-600 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Handover Details Summary */}
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-stone-500">Donation ID:</span>
                  <span className="font-mono font-bold text-stone-900">{confirmingRequest.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Donor Organization:</span>
                  <span className="font-semibold text-stone-900">{confirmingRequest.donorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Food Description:</span>
                  <span className="font-semibold text-stone-900">{confirmingRequest.listingTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Reserved Volume:</span>
                  <span className="font-bold text-emerald-800">
                    {confirmingRequest.requestedQuantity} {confirmingRequest.quantityUnit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Pickup Location:</span>
                  <span className="text-stone-800">{confirmingRequest.pickupAddress}</span>
                </div>
              </div>

              <form onSubmit={handleConfirmPickup} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Collector / Driver Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={collectorName}
                    onChange={(e) => setCollectorName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar (Van Driver)"
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Handover Inspection Notes
                  </label>
                  <textarea
                    rows={2}
                    value={collectorNotes}
                    onChange={(e) => setCollectorNotes(e.target.value)}
                    placeholder="Food temperature checked, packaging sealed, hygiene verified..."
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900">
                  <strong>Verification Statement:</strong> Clicking confirm verifies that your vehicle representative has inspected and physically received the specified surplus food in good condition.
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setConfirmingRequest(null)}
                    className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900 shadow-xs flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4 text-amber-300" />
                    <span>Confirm Collection</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
