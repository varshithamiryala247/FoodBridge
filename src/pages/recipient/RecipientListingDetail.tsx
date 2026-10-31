import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Flag,
  Scale,
  Send,
  Building
} from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { store } from '../../services/store';
import { CountdownBadge } from '../../components/CountdownBadge';
import { StatusBadge } from '../../components/StatusBadge';
import { SafeImage } from '../../components/SafeImage';
import { ReportReason } from '../../types';

export const RecipientListingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { organization, user } = useAuth();
  const navigate = useNavigate();

  const listing = id ? store.getListingById(id) : undefined;
  const match = listing ? store.calculateMatch(listing, organization || undefined) : null;

  const [requestedQuantity, setRequestedQuantity] = useState<number>(
    listing ? Math.min(listing.quantityAvailable, 20) : 10
  );
  const [recipientNotes, setRecipientNotes] = useState('');
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestSuccess, setRequestSuccess] = useState(false);

  // Reporting State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason>('Inaccurate information');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  if (!listing) {
    return (
      <DashboardLayout title="Food Listing" requiredRole="RECIPIENT">
        <div className="bg-white p-8 rounded-xl border border-stone-200 text-center">
          <p className="text-sm text-stone-600 mb-4">Listing not found or expired.</p>
          <Link
            to="/recipient/available"
            className="px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-semibold"
          >
            Back to Marketplace
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRequestError(null);

    if (!organization || !user) {
      setRequestError('Active organization session required to request food.');
      return;
    }

    if (requestedQuantity <= 0) {
      setRequestError('Requested quantity must be greater than zero.');
      return;
    }

    if (requestedQuantity > listing.quantityAvailable) {
      setRequestError(`Cannot request more than the available ${listing.quantityAvailable} ${listing.quantityUnit}.`);
      return;
    }

    try {
      store.createRequest(
        organization,
        user,
        listing.id,
        requestedQuantity,
        recipientNotes || `Pickup requested by ${organization.organizationName}`
      );
      setRequestSuccess(true);
      setTimeout(() => {
        navigate('/recipient/requests');
      }, 1500);
    } catch (err: any) {
      setRequestError(err.message || 'Failed to submit request');
    }
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    store.fileReport(user, listing.id, reportReason, reportDescription);
    setReportSuccess(true);
    setTimeout(() => {
      setShowReportModal(false);
      setReportSuccess(false);
      setReportDescription('');
    }, 2000);
  };

  return (
    <DashboardLayout
      title={listing.title}
      subtitle={`Donated by ${listing.donorName} (${listing.pickupArea})`}
      requiredRole="RECIPIENT"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowReportModal(true)}
            className="px-3 py-1.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 flex items-center gap-1.5 transition-colors"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Report Listing</span>
          </button>
          <Link
            to="/recipient/available"
            className="px-3 py-1.5 text-xs text-stone-700 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Marketplace</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {requestSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <strong>Request Submitted Successfully!</strong> Donor notified in real-time. Redirecting to your requests tracker...
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Listing Details & Safety */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
              <div className="h-64 relative bg-stone-100">
                <SafeImage
                  src={listing.imageUrl}
                  alt={listing.title}
                  fallbackCategory={listing.category.replace('_', ' ')}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-900 bg-white/95 px-2.5 py-1 rounded shadow-xs">
                    {listing.dietaryType.replace('_', ' ')}
                  </span>
                  <StatusBadge status={listing.status} />
                </div>
                <div className="absolute bottom-4 right-4">
                  <CountdownBadge deadline={listing.pickupDeadline} />
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                    <span>{listing.category.replace('_', ' ')}</span>
                    <span>·</span>
                    <span className="font-semibold text-stone-700">{listing.donorName}</span>
                  </div>
                  <h2 className="text-xl font-bold text-stone-900">{listing.title}</h2>
                  <p className="text-xs text-stone-600 mt-2 leading-relaxed">{listing.description}</p>
                </div>

                {/* Transparent Match Reasons Card */}
                {match && (
                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>Recommended Match Compatibility: {match.score}%</span>
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-emerald-800 bg-white px-2 py-0.5 rounded">
                        {match.urgencyLevel}
                      </span>
                    </div>
                    <ul className="space-y-1 text-xs text-emerald-900">
                      {match.reasons.map((r, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-700 font-bold shrink-0">✓</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Food Safety & Pickup Details */}
                <div className="space-y-2.5 text-xs text-stone-700 border-t border-stone-100 pt-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
                    <span><strong>Pickup Address:</strong> {listing.pickupAddress} ({listing.pickupArea})</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
                    <span><strong>Preparation:</strong> {new Date(listing.preparationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · <strong>Use-By Cutoff:</strong> {new Date(listing.useByTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
                    <span><strong>Safe Storage Guidelines:</strong> {listing.storageInstructions}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
                    <span><strong>Allergen Declaration:</strong> {listing.allergenInformation}</span>
                  </div>
                  {listing.additionalInstructions && (
                    <div className="flex items-start gap-2">
                      <Building className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
                      <span><strong>Driver Instructions:</strong> {listing.additionalInstructions}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Request Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-5">
              <div>
                <h3 className="text-base font-bold text-stone-900">Request Meal Portions</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Specify how many portions your shelter can distribute.
                </p>
              </div>

              {/* Inventory status pill */}
              <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-500 block uppercase">Currently Available</span>
                  <span className="text-lg font-bold text-emerald-800 tabular-nums">
                    {listing.quantityAvailable}
                  </span>
                  <span className="text-xs text-stone-600"> / {listing.quantityTotal} {listing.quantityUnit}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-stone-500 block uppercase">Pickup Closes</span>
                  <CountdownBadge deadline={listing.pickupDeadline} compact />
                </div>
              </div>

              {requestError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{requestError}</span>
                </div>
              )}

              <form onSubmit={handleRequestSubmit} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-stone-700">
                      Quantity Required ({listing.quantityUnit}) *
                    </label>
                    <button
                      type="button"
                      onClick={() => setRequestedQuantity(listing.quantityAvailable)}
                      className="text-[11px] text-emerald-800 hover:underline font-semibold"
                    >
                      Claim All ({listing.quantityAvailable})
                    </button>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max={listing.quantityAvailable}
                    required
                    value={requestedQuantity}
                    onChange={(e) => setRequestedQuantity(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 tabular-nums font-bold text-stone-800"
                  />
                  <span className="text-[11px] text-stone-500 mt-1 block">
                    You can request partial portions so other NGOs can claim the rest.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Pickup Coordination & Vehicle Notes
                  </label>
                  <textarea
                    rows={3}
                    value={recipientNotes}
                    onChange={(e) => setRecipientNotes(e.target.value)}
                    placeholder="e.g. Mobile van arriving in 45 mins. Thermal boxes ready. Contact: driver Suresh (+91 98490 12345)"
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div className="p-3 bg-stone-50 rounded-lg text-[11px] text-stone-600 space-y-1">
                  <div className="font-semibold text-stone-800 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Atomic Reservation Protocol</span>
                  </div>
                  <p>
                    Submitting places your request in <strong>PENDING</strong> status. When the donor accepts, this quantity will be locked for your pickup.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={listing.quantityAvailable <= 0 || requestSuccess}
                  className="w-full py-3 px-4 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900 disabled:opacity-50 transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Donation Request</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Report Listing Modal */}
        {showReportModal && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 border border-stone-200 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-stone-900">Report Food Listing</h3>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-stone-400 hover:text-stone-600 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              {reportSuccess ? (
                <div className="p-4 bg-emerald-50 text-emerald-900 rounded-lg text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Report filed. Platform administrators will review promptly.</span>
                </div>
              ) : (
                <form onSubmit={handleReportSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Reason for Report *
                    </label>
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value as ReportReason)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    >
                      <option value="Inaccurate information">Inaccurate information</option>
                      <option value="Unsafe handling concerns">Unsafe handling concerns</option>
                      <option value="Suspicious listing">Suspicious listing</option>
                      <option value="Inappropriate content">Inappropriate content</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Description of Concern *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      placeholder="Please provide details regarding food freshness, quantities, or pickup safety issues..."
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowReportModal(false)}
                      className="px-3 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg shadow-xs"
                    >
                      Submit Report
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
