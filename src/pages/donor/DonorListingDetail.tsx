import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle,
  Package,
  Calendar,
  AlertTriangle,
  FileText,
  User,
  Inbox
} from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { store } from '../../services/store';
import { CountdownBadge } from '../../components/CountdownBadge';
import { StatusBadge } from '../../components/StatusBadge';

export const DonorListingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { organization, user } = useAuth();
  const navigate = useNavigate();
  const [, setTick] = useState(0);

  const listing = id ? store.getListingById(id) : undefined;
  const requests = id ? store.getRequests().filter((r) => r.listingId === id) : [];
  const events = id ? store.getEvents(id) : [];

  if (!listing) {
    return (
      <DashboardLayout title="Listing Details" requiredRole="DONOR">
        <div className="bg-white p-8 rounded-xl border border-stone-200 text-center">
          <p className="text-sm text-stone-600 mb-4">Listing not found or has been removed.</p>
          <Link
            to="/donor/listings"
            className="px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-semibold"
          >
            Back to Listings
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const handleAcceptRequest = (requestId: string) => {
    if (!user) return;
    try {
      store.acceptRequest(requestId, user);
      setTick((t) => t + 1);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleMarkReady = (requestId: string) => {
    if (!user) return;
    try {
      store.markReadyForPickup(requestId, user);
      setTick((t) => t + 1);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRejectRequest = (requestId: string) => {
    if (!user) return;
    const reason = window.prompt('Please provide a reason for declining this request:') || undefined;
    try {
      store.rejectRequest(requestId, user, reason);
      setTick((t) => t + 1);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <DashboardLayout
      title={listing.title}
      subtitle={`Created on ${new Date(listing.createdAt).toLocaleDateString()} · ${listing.donorName}`}
      requiredRole="DONOR"
      actions={
        <div className="flex items-center gap-2">
          <Link
            to="/donor/listings"
            className="px-3 py-1.5 text-xs text-stone-700 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Listings</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Main Details Card */}
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
            {/* Image Col */}
            <div className="md:col-span-5 h-64 md:h-auto relative bg-stone-100">
              <img
                src={listing.imageUrl}
                alt={listing.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4">
                <StatusBadge status={listing.status} />
              </div>
            </div>

            {/* Content Col */}
            <div className="md:col-span-7 p-6 space-y-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                  <span>{listing.category.replace('_', ' ')}</span>
                  <span>·</span>
                  <span className="font-semibold text-stone-700">{listing.dietaryType.replace('_', ' ')}</span>
                </div>
                <h2 className="text-xl font-bold text-stone-900">{listing.title}</h2>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">{listing.description}</p>
              </div>

              {/* Quantity & Countdown Bar */}
              <div className="grid grid-cols-2 gap-4 p-3.5 rounded-lg bg-stone-50 border border-stone-200/80">
                <div>
                  <span className="text-[10px] text-stone-500 uppercase tracking-wider block">Remaining Inventory</span>
                  <span className="text-lg font-bold text-emerald-800 tabular-nums">
                    {listing.quantityAvailable}
                  </span>
                  <span className="text-xs text-stone-600"> / {listing.quantityTotal} {listing.quantityUnit}</span>
                </div>

                <div>
                  <span className="text-[10px] text-stone-500 uppercase tracking-wider block">Pickup Window</span>
                  <div className="mt-1">
                    <CountdownBadge deadline={listing.pickupDeadline} status={listing.status} />
                  </div>
                </div>
              </div>

              {/* Food Safety & Pickup Details */}
              <div className="space-y-2 text-xs text-stone-600 border-t border-stone-100 pt-3">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 mt-0.5 shrink-0" />
                  <span><strong>Pickup Address:</strong> {listing.pickupAddress} ({listing.pickupArea})</span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-stone-400 mt-0.5 shrink-0" />
                  <span><strong>Prepared:</strong> {new Date(listing.preparationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · <strong>Use-By Cutoff:</strong> {new Date(listing.useByTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-stone-400 mt-0.5 shrink-0" />
                  <span><strong>Storage:</strong> {listing.storageInstructions}</span>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-stone-400 mt-0.5 shrink-0" />
                  <span><strong>Allergens:</strong> {listing.allergenInformation}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Linked Requests Section */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-stone-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Requests on this Batch ({requests.length})
              </h3>
              <p className="text-xs text-stone-500">
                Accepting reserves portion inventory automatically with zero double-booking risk
              </p>
            </div>
          </div>

          {requests.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-500">
              No NGO requests submitted for this listing yet.
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {requests.map((req) => (
                <div key={req.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 text-sm">{req.recipientName}</span>
                      <StatusBadge status={req.status} />
                    </div>
                    <div className="text-stone-600">
                      Requested: <strong className="text-emerald-800">{req.requestedQuantity} {req.quantityUnit}</strong>
                    </div>
                    {req.recipientNotes && (
                      <p className="text-stone-500 italic">Notes: "{req.recipientNotes}"</p>
                    )}
                    {req.recipientContact && (
                      <p className="text-[11px] text-stone-600">Contact: {req.recipientContact}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {req.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleAcceptRequest(req.id)}
                          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs transition-colors"
                        >
                          Accept & Reserve ({req.requestedQuantity} {req.quantityUnit})
                        </button>
                        <button
                          onClick={() => handleRejectRequest(req.id)}
                          className="px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {req.status === 'ACCEPTED' && (
                      <button
                        onClick={() => handleMarkReady(req.id)}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg shadow-xs transition-colors"
                      >
                        Mark Ready for Dispatch
                      </button>
                    )}

                    {req.status === 'READY_FOR_PICKUP' && (
                      <span className="text-xs text-indigo-900 font-medium bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200">
                        Awaiting NGO Van Arrival & Collection Confirmation
                      </span>
                    )}

                    {req.status === 'COMPLETED' && (
                      <span className="text-xs text-emerald-900 font-medium bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                        Handover Confirmed by {req.collectorName || 'NGO Representative'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Audit Log for this listing */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <h3 className="text-sm font-bold text-stone-900 mb-3">Audit Timeline for this Listing</h3>
          <div className="space-y-3">
            {events.map((evt) => (
              <div key={evt.id} className="flex items-start gap-3 text-xs text-stone-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 mt-1.5 shrink-0"></span>
                <div className="flex-1">
                  <span className="font-semibold text-stone-800">{evt.actorName}:</span>{' '}
                  {evt.description}
                </div>
                <span className="text-[10px] text-stone-400 font-mono">
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
