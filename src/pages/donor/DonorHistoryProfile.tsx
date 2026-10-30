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

export const DonorHistoryPage: React.FC = () => {
  const { organization } = useAuth();
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const completedRequests = store
    .getRequests()
    .filter(
      (r) =>
        r.donorOrganizationId === organization?.id &&
        (r.status === 'COMPLETED' || r.status === 'CANCELLED' || r.status === 'REJECTED')
    );

  const totalPortionsRescued = completedRequests
    .filter((r) => r.status === 'COMPLETED')
    .reduce((sum, r) => sum + r.requestedQuantity, 0) + 120; // demo offset

  const handleExportCSV = () => {
    const headers = ['Request ID', 'Food Title', 'Recipient Org', 'Quantity', 'Unit', 'Status', 'Completed Timestamp'];
    const rows = completedRequests.map((r) => [
      r.id,
      `"${r.listingTitle}"`,
      `"${r.recipientName}"`,
      r.requestedQuantity,
      r.quantityUnit,
      r.status,
      r.completedAt || r.updatedAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `foodbridge_donations_${organization?.organizationName.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  return (
    <DashboardLayout
      title="Donation History & ESG Audit"
      subtitle="Complete chronological records of rescued surplus food and community handovers"
      requiredRole="DONOR"
      actions={
        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 bg-white text-stone-700 border border-stone-200 rounded-lg text-xs font-semibold hover:bg-stone-50 transition-colors flex items-center gap-2 shadow-xs"
        >
          <Download className="w-4 h-4 text-stone-500" />
          <span>Export Audit CSV</span>
        </button>
      }
    >
      <div className="space-y-6">
        {downloadSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Audit log exported to CSV successfully.</span>
          </div>
        )}

        {/* Impact Metric Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
            <span className="text-xs text-stone-500 font-medium">Total Portions Rescued</span>
            <div className="text-2xl font-bold text-emerald-800 tabular-nums mt-1">
              {totalPortionsRescued} portions
            </div>
            <span className="text-[11px] text-stone-600">Diverted from waste to shelters</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
            <span className="text-xs text-stone-500 font-medium">Estimated Emissions Avoided</span>
            <div className="text-2xl font-bold text-stone-900 tabular-nums mt-1">
              {(totalPortionsRescued * 0.42).toFixed(1)} kg CO₂e
            </div>
            <span className="text-[11px] text-stone-600">Calculated via landfill diversion factors</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
            <span className="text-xs text-stone-500 font-medium">Community Non-Profits Served</span>
            <div className="text-2xl font-bold text-stone-900 tabular-nums mt-1">
              3 Partners
            </div>
            <span className="text-[11px] text-stone-600">Hope Kitchen, Helping Hands, Sunrise Shelter</span>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-stone-200">
            <h3 className="text-sm font-bold text-stone-900">Historical Donation Log</h3>
            <p className="text-xs text-stone-500">Every donation records recipient, collector signature, and completion timestamp</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-700 uppercase tracking-wider text-[10px] font-semibold border-b border-stone-200">
                <tr>
                  <th className="px-5 py-3">Surplus Food</th>
                  <th className="px-5 py-3">Recipient Charity</th>
                  <th className="px-5 py-3 text-right">Volume Rescued</th>
                  <th className="px-5 py-3">Handover Timestamp</th>
                  <th className="px-5 py-3">Collector Details</th>
                  <th className="px-5 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {completedRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-stone-50/70">
                    <td className="px-5 py-3.5 font-bold text-stone-900">
                      {req.listingTitle}
                      <span className="block text-[10px] text-stone-400 font-mono">ID: {req.id}</span>
                    </td>
                    <td className="px-5 py-3.5 text-stone-700 font-medium">
                      {req.recipientName}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums font-bold text-emerald-800">
                      {req.requestedQuantity} {req.quantityUnit}
                    </td>
                    <td className="px-5 py-3.5 text-stone-600">
                      {req.completedAt ? new Date(req.completedAt).toLocaleString() : new Date(req.updatedAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-stone-600">
                      {req.collectorName || 'Representative Verified'}
                      {req.collectorNotes && (
                        <span className="block text-[10px] text-stone-600 italic">{req.collectorNotes}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${
                        req.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : req.status === 'CANCELLED'
                          ? 'bg-stone-100 text-stone-600'
                          : 'bg-rose-50 text-rose-800'
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

export const DonorProfilePage: React.FC = () => {
  const { organization, refreshProfile } = useAuth();
  const [organizationName, setOrganizationName] = useState(organization?.organizationName || '');
  const [description, setDescription] = useState(organization?.description || '');
  const [serviceArea, setServiceArea] = useState(organization?.serviceArea || '');
  const [demoAddress, setDemoAddress] = useState(organization?.demoAddress || '');
  const [phone, setPhone] = useState(organization?.phone || '');
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
    });

    refreshProfile();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <DashboardLayout
      title="Donor Organization Profile"
      subtitle="Manage your business verification, facility dispatch location, and contact parameters"
      requiredRole="DONOR"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Organization profile updated successfully.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Organization Name
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
                value={organization?.organizationType || 'RESTAURANT'}
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

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Service Area / Transit Corridor
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
              Premises Pickup Address
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
              Kitchen Dispatch Phone
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
              Organization Description & Surplus Philosophy
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
