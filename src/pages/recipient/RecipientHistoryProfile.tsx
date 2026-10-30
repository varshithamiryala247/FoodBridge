import React, { useState } from 'react';
import {
  History,
  Download,
  CheckCircle2,
  Package,
  Calendar,
  Building2,
  ExternalLink
} from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { store } from '../../services/store';

export const RecipientHistoryPage: React.FC = () => {
  const { organization } = useAuth();
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const completedPickups = store
    .getRequests()
    .filter(
      (r) =>
        r.recipientOrganizationId === organization?.id &&
        (r.status === 'COMPLETED' || r.status === 'CANCELLED')
    );

  const totalPortionsReceived =
    completedPickups
      .filter((r) => r.status === 'COMPLETED')
      .reduce((sum, r) => sum + r.requestedQuantity, 0) + 145; // baseline demo offset

  const handleExportCSV = () => {
    const headers = ['Request ID', 'Food Title', 'Donor Org', 'Quantity Received', 'Unit', 'Status', 'Handover Timestamp'];
    const rows = completedPickups.map((r) => [
      r.id,
      `"${r.listingTitle}"`,
      `"${r.donorName}"`,
      r.requestedQuantity,
      r.quantityUnit,
      r.status,
      r.completedAt || r.updatedAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `foodbridge_received_${organization?.organizationName.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  return (
    <DashboardLayout
      title="Completed Donations & Feeding History"
      subtitle="Complete chronological receipts of collected surplus food across Hyderabad"
      requiredRole="RECIPIENT"
      actions={
        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 bg-white text-stone-700 border border-stone-200 rounded-lg text-xs font-semibold hover:bg-stone-50 transition-colors flex items-center gap-2 shadow-xs"
        >
          <Download className="w-4 h-4 text-stone-500" />
          <span>Export Receipts CSV</span>
        </button>
      }
    >
      <div className="space-y-6">
        {downloadSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Completed receipts exported to CSV successfully.</span>
          </div>
        )}

        {/* Impact Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
            <span className="text-xs text-stone-500 font-medium">Portions Received & Distributed</span>
            <div className="text-2xl font-bold text-emerald-800 tabular-nums mt-1">
              {totalPortionsReceived} portions
            </div>
            <span className="text-[11px] text-stone-600">Nutritious meals provided to beneficiaries</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
            <span className="text-xs text-stone-500 font-medium">Estimated Sourcing Savings</span>
            <div className="text-2xl font-bold text-stone-900 tabular-nums mt-1">
              ₹{(totalPortionsReceived * 55).toLocaleString()}
            </div>
            <span className="text-[11px] text-stone-600">Charity budget saved for healthcare & shelter</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
            <span className="text-xs text-stone-500 font-medium">Partner Food Donors Rescued From</span>
            <div className="text-2xl font-bold text-stone-900 tabular-nums mt-1">
              4 Commercial Donors
            </div>
            <span className="text-[11px] text-stone-600">Green Plate, Sunrise Bakery, City Grocers, Community Feast</span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-stone-200">
            <h3 className="text-sm font-bold text-stone-900">Distribution Receipts</h3>
            <p className="text-xs text-stone-500">Includes donor facility address, collector signatures, and verification notes</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-700 uppercase tracking-wider text-[10px] font-semibold border-b border-stone-200">
                <tr>
                  <th className="px-5 py-3">Rescued Food</th>
                  <th className="px-5 py-3">Donor Organization</th>
                  <th className="px-5 py-3 text-right">Quantity</th>
                  <th className="px-5 py-3">Collection Timestamp</th>
                  <th className="px-5 py-3">Pickup Location</th>
                  <th className="px-5 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {completedPickups.map((req) => (
                  <tr key={req.id} className="hover:bg-stone-50/70">
                    <td className="px-5 py-3.5 font-bold text-stone-900">
                      {req.listingTitle}
                      <span className="block text-[10px] text-stone-600 font-mono">ID: {req.id}</span>
                    </td>
                    <td className="px-5 py-3.5 text-stone-700 font-medium">
                      {req.donorName}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums font-bold text-emerald-800">
                      {req.requestedQuantity} {req.quantityUnit}
                    </td>
                    <td className="px-5 py-3.5 text-stone-600">
                      {req.completedAt ? new Date(req.completedAt).toLocaleString() : new Date(req.updatedAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-stone-600">
                      {req.pickupAddress}
                      {req.collectorName && (
                        <span className="block text-[10px] text-stone-600">
                          Collected by: {req.collectorName}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${
                        req.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-stone-100 text-stone-600'
                      }`}>
                        {req.status}
                      </span>
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

export const RecipientProfilePage: React.FC = () => {
  const { organization, refreshProfile } = useAuth();
  const [organizationName, setOrganizationName] = useState(organization?.organizationName || '');
  const [description, setDescription] = useState(organization?.description || '');
  const [serviceArea, setServiceArea] = useState(organization?.serviceArea || '');
  const [demoAddress, setDemoAddress] = useState(organization?.demoAddress || '');
  const [phone, setPhone] = useState(organization?.phone || '');
  const [capacity, setCapacity] = useState<number>(organization?.typicalCapacityPortions || 150);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;

    store.updateOrganization(organization.id, {
      organizationName,
      description,
      serviceArea,
      demoAddress,
      phone,
      typicalCapacityPortions: Number(capacity),
    });

    refreshProfile();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <DashboardLayout
      title="Recipient Organization Profile"
      subtitle="Manage your non-profit registration, service area, and feeding capacity parameters"
      requiredRole="RECIPIENT"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Recipient profile updated successfully.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Charity / Shelter Name
            </label>
            <input
              type="text"
              required
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Organization Category
              </label>
              <input
                type="text"
                disabled
                value={organization?.organizationType || 'NGO'}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-stone-200 bg-stone-50 text-stone-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Verification Status
              </label>
              <input
                type="text"
                disabled
                value={organization?.verificationStatus || 'VERIFIED'}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Distribution Service Corridor
              </label>
              <input
                type="text"
                required
                value={serviceArea}
                onChange={(e) => setServiceArea(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Typical Meal Capacity (Portions)
              </label>
              <input
                type="number"
                required
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Shelter Facility / Kitchen Address
            </label>
            <input
              type="text"
              required
              value={demoAddress}
              onChange={(e) => setDemoAddress(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Direct Contact Phone
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Community Mission & Beneficiaries Served
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900 transition-colors shadow-xs"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};
